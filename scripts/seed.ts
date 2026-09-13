/**
 * Seed demo providers for emulator / controlled environments.
 *
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npx tsx scripts/seed.ts
 *
 * Refuses production unless ALLOW_PRODUCTION_SEED=true
 * Requires: npm i -D firebase-admin
 */

import { initializeApp, cert, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

const USE_EMULATOR = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const ALLOW_PRODUCTION_SEED = process.env.ALLOW_PRODUCTION_SEED === 'true';

function initAdmin() {
  if (getApps().length) return;
  if (USE_EMULATOR) {
    initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'swiftmatch-uk' });
    return;
  }
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    return;
  }
  try {
    initializeApp({ credential: applicationDefault() });
  } catch {
    console.error('No Admin credentials. Set FIREBASE_ADMIN_* or FIRESTORE_EMULATOR_HOST');
    process.exit(1);
  }
}

const providers = [
  {
    id: 'seed-prov-manchester-plumbing',
    displayName: 'James Okafor',
    businessName: 'Northern Flow Plumbing',
    email: 'james.seed@swiftmatch.local',
    serviceIds: ['plumbing'],
    city: 'Manchester',
    postcode: 'M1 1AE',
    lat: 53.4808,
    lng: -2.2426,
    radiusMiles: 12,
    yearsExperience: 12,
    rating: 4.8,
    reviewCount: 64,
    completedJobs: 210,
    responseRate: 0.94,
    emergencyAvailable: true,
    availabilityStatus: 'available_now',
  },
  {
    id: 'seed-prov-manchester-electrical',
    displayName: 'Priya Shah',
    businessName: 'Bright Circuit Electrical',
    email: 'priya.seed@swiftmatch.local',
    serviceIds: ['electrical'],
    city: 'Manchester',
    postcode: 'M2 3AW',
    lat: 53.483,
    lng: -2.244,
    radiusMiles: 15,
    yearsExperience: 9,
    rating: 4.9,
    reviewCount: 41,
    completedJobs: 130,
    responseRate: 0.91,
    emergencyAvailable: true,
    availabilityStatus: 'available_now',
  },
  {
    id: 'seed-prov-leeds-plumbing',
    displayName: 'Alex Turner',
    businessName: 'Northern Pipe Solutions',
    email: 'alex.seed@swiftmatch.local',
    serviceIds: ['plumbing', 'drainage'],
    city: 'Leeds',
    postcode: 'LS1 1BA',
    lat: 53.8008,
    lng: -1.5491,
    radiusMiles: 15,
    yearsExperience: 8,
    rating: 4.6,
    reviewCount: 28,
    completedJobs: 90,
    responseRate: 0.88,
    emergencyAvailable: true,
    availabilityStatus: 'available_now',
  },
  {
    id: 'seed-prov-busy',
    displayName: 'Busy Demo',
    businessName: 'Unavailable Trades Ltd',
    email: 'busy.seed@swiftmatch.local',
    serviceIds: ['plumbing'],
    city: 'Manchester',
    postcode: 'M3 1AA',
    lat: 53.485,
    lng: -2.25,
    radiusMiles: 10,
    yearsExperience: 5,
    rating: 4.2,
    reviewCount: 12,
    completedJobs: 40,
    responseRate: 0.7,
    emergencyAvailable: false,
    availabilityStatus: 'busy',
  },
];

async function main() {
  if (!USE_EMULATOR && !ALLOW_PRODUCTION_SEED) {
    console.error('Refusing non-emulator seed. Set FIRESTORE_EMULATOR_HOST or ALLOW_PRODUCTION_SEED=true');
    process.exit(1);
  }
  initAdmin();
  const db = getFirestore();
  const now = FieldValue.serverTimestamp();
  console.log(USE_EMULATOR ? `Seeding emulator ${process.env.FIRESTORE_EMULATOR_HOST}` : 'Seeding project');

  for (const p of providers) {
    await db.collection('users').doc(p.id).set(
      {
        id: p.id,
        email: p.email,
        displayName: p.displayName,
        role: 'provider',
        emailVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        notificationPreferences: {
          email: true, push: true, sms: false, marketing: false,
          jobAlerts: true, messages: true, bookingUpdates: true, paymentNotifications: true,
        },
      },
      { merge: true }
    );
    await db.collection('providers').doc(p.id).set(
      {
        id: p.id,
        displayName: p.displayName,
        businessName: p.businessName,
        email: p.email,
        role: 'provider',
        status: 'verified',
        verificationStatus: 'approved',
        availabilityStatus: p.availabilityStatus,
        onboardingCompleted: true,
        serviceIds: p.serviceIds,
        subServiceIds: [],
        serviceAreas: [{
          id: `${p.id}-area-1`,
          providerId: p.id,
          radiusMiles: p.radiusMiles,
          center: { latitude: p.lat, longitude: p.lng },
          cities: [p.city],
          postcodes: [p.postcode],
          active: true,
        }],
        yearsExperience: p.yearsExperience,
        rating: p.rating,
        reviewCount: p.reviewCount,
        completedJobs: p.completedJobs,
        responseRate: p.responseRate,
        emergencyAvailable: p.emergencyAvailable,
        isActive: true,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
    console.log(`  provider ${p.businessName}`);
  }
  await db.collection('_meta').doc('seed').set({
    lastSeedAt: Timestamp.now(),
    providerCount: providers.length,
  });
  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
