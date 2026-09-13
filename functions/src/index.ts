/**
 * SwiftMatch UK Cloud Functions
 * - Atomic job accept (race-safe)
 * - Registration with server-side role
 * - Admin verification
 * - Match expiry timers
 * - Stripe PaymentIntent (amount from quote doc only)
 */

import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

admin.initializeApp();
const db = admin.firestore();

function assertAuth(request: { auth?: { uid: string } }) {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }
  return request.auth.uid;
}

export const acceptJob = onCall(async (request) => {
  const uid = assertAuth(request);
  const { jobId, matchId } = request.data as { jobId?: string; matchId?: string };
  if (!jobId || !matchId) {
    throw new HttpsError('invalid-argument', 'jobId and matchId are required.');
  }

  await db.runTransaction(async (tx) => {
    const jobRef = db.collection('jobs').doc(jobId);
    const matchRef = db.collection('matches').doc(matchId);
    const jobSnap = await tx.get(jobRef);
    const matchSnap = await tx.get(matchRef);

    if (!jobSnap.exists) throw new HttpsError('not-found', 'Job not found.');
    if (!matchSnap.exists) throw new HttpsError('not-found', 'Match not found.');

    const job = jobSnap.data()!;
    const match = matchSnap.data()!;

    if (match.providerId !== uid) {
      throw new HttpsError('permission-denied', 'Not your match.');
    }
    if (
      ['PROVIDER_ACCEPTED', 'BOOKED', 'CUSTOMER_SELECTED', 'IN_PROGRESS'].includes(job.status)
    ) {
      throw new HttpsError('failed-precondition', 'This job has already been accepted.');
    }
    if (match.status === 'expired' || match.status === 'declined') {
      throw new HttpsError('failed-precondition', 'This match is no longer valid.');
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    tx.update(matchRef, { status: 'accepted', respondedAt: now });
    tx.update(jobRef, {
      status: 'PROVIDER_ACCEPTED',
      acceptedProviderId: uid,
      updatedAt: now,
    });

    const siblings = await db
      .collection('matches')
      .where('jobId', '==', jobId)
      .where('status', 'in', ['pending', 'notified'])
      .get();

    siblings.docs.forEach((doc) => {
      if (doc.id !== matchId) tx.update(doc.ref, { status: 'expired' });
    });
  });

  return { success: true, jobId };
});

export const onJobSubmitted = onDocumentCreated('jobs/{jobId}', async (event) => {
  const snap = event.data;
  if (!snap) return;
  const job = snap.data();
  if (job.status !== 'SUBMITTED' && job.status !== 'MATCHING') return;
  console.log(`[onJobSubmitted] job ${event.params.jobId} ready for matching`);
});

export const expireStaleMatches = onSchedule('every 1 minutes', async () => {
  const now = admin.firestore.Timestamp.now();
  const expiredMatches = await db
    .collection('matches')
    .where('status', '==', 'notified')
    .where('responseDeadline', '<', now)
    .limit(50)
    .get();
  const batch = db.batch();
  expiredMatches.docs.forEach((doc) => batch.update(doc.ref, { status: 'expired' }));
  await batch.commit();
});

export const completeRegistration = onCall(async (request) => {
  const uid = assertAuth(request);
  const { role, displayName, email } = request.data as {
    role?: string;
    displayName?: string;
    email?: string;
  };
  if (role !== 'customer' && role !== 'provider') {
    throw new HttpsError('invalid-argument', 'role must be customer or provider.');
  }
  const userRef = db.collection('users').doc(uid);
  if ((await userRef.get()).exists) {
    throw new HttpsError('already-exists', 'Profile already exists.');
  }
  const now = admin.firestore.FieldValue.serverTimestamp();
  await userRef.set({
    id: uid,
    email: email || request.auth?.token.email || '',
    displayName: displayName || '',
    role,
    emailVerified: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      jobAlerts: true,
      messages: true,
      bookingUpdates: true,
      paymentNotifications: true,
    },
  });
  if (role === 'provider') {
    await db.collection('providers').doc(uid).set({
      id: uid,
      status: 'incomplete_onboarding',
      verificationStatus: 'not_started',
      availabilityStatus: 'offline',
      onboardingStep: 0,
      onboardingCompleted: false,
      serviceIds: [],
      subServiceIds: [],
      serviceAreas: [],
      rating: 0,
      reviewCount: 0,
      completedJobs: 0,
      responseRate: 0,
      createdAt: now,
      updatedAt: now,
    });
  }
  return { success: true, role };
});

export const setProviderVerification = onCall(async (request) => {
  const uid = assertAuth(request);
  const adminDoc = await db.collection('users').doc(uid).get();
  const adminRole = adminDoc.data()?.role;
  if (!['admin', 'super_admin', 'verification_staff'].includes(adminRole)) {
    throw new HttpsError('permission-denied', 'Admin access required.');
  }
  const { providerId, status, reason } = request.data as {
    providerId?: string;
    status?: string;
    reason?: string;
  };
  if (
    !providerId ||
    !['verified', 'rejected', 'documents_required', 'under_review'].includes(status || '')
  ) {
    throw new HttpsError('invalid-argument', 'Invalid providerId or status.');
  }
  const providerRef = db.collection('providers').doc(providerId);
  const before = (await providerRef.get()).data();
  await providerRef.update({
    verificationStatus: status === 'verified' ? 'approved' : status,
    status:
      status === 'verified'
        ? 'verified'
        : status === 'rejected'
          ? 'rejected'
          : 'under_review',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection('adminLogs').add({
    actorId: uid,
    action: 'set_provider_verification',
    targetType: 'provider',
    targetId: providerId,
    before: { status: before?.status, verificationStatus: before?.verificationStatus },
    after: { status },
    reason: reason || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true };
});

/** Amount is read from the quote document — never trust client amounts. */
export const createPaymentIntent = onCall(async (request) => {
  const uid = assertAuth(request);
  const { quoteId, jobId } = request.data as { quoteId?: string; jobId?: string };
  if (!quoteId || !jobId) {
    throw new HttpsError('invalid-argument', 'quoteId and jobId are required.');
  }

  const quoteSnap = await db.collection('quotes').doc(quoteId).get();
  if (!quoteSnap.exists) {
    throw new HttpsError('not-found', 'Quote not found.');
  }
  const quote = quoteSnap.data()!;
  if (quote.customerId !== uid) {
    throw new HttpsError('permission-denied', 'Not your quote.');
  }
  if (quote.status !== 'pending') {
    throw new HttpsError('failed-precondition', 'Quote is not actionable.');
  }

  // Production: Stripe PaymentIntent capture_method manual + metadata
  throw new HttpsError(
    'failed-precondition',
    'Stripe is not configured. Set STRIPE_SECRET_KEY and enable PaymentIntent creation.'
  );
});
