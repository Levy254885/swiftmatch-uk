/**
 * Client-side auth helpers.
 * Roles are NEVER written from the client — only via completeRegistration CF.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  isFirebaseConfigured,
  getClientAuth,
  getClientDb,
  getClientFunctions,
} from './firebase';
import type { UserRole } from '@/types';

export { isFirebaseConfigured };

export type AuthProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole | null;
};

export async function registerWithEmail(params: {
  email: string;
  password: string;
  displayName: string;
  role: 'customer' | 'provider';
}): Promise<{ uid: string; role: 'customer' | 'provider' }> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* keys to .env.local'
    );
  }

  const cred = await createUserWithEmailAndPassword(
    getClientAuth(),
    params.email,
    params.password
  );

  try {
    const completeRegistration = httpsCallable(
      getClientFunctions(),
      'completeRegistration'
    );
    await completeRegistration({
      role: params.role,
      displayName: params.displayName,
      email: params.email,
    });
  } catch (err) {
    console.error('completeRegistration failed', err);
    throw new Error(
      'Account created but profile setup failed. Ensure Cloud Functions are deployed.'
    );
  }

  return { uid: cred.user.uid, role: params.role };
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthProfile> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* keys to .env.local'
    );
  }

  const cred = await signInWithEmailAndPassword(getClientAuth(), email, password);
  const profile = await loadUserProfile(cred.user.uid);
  return {
    uid: cred.user.uid,
    email: cred.user.email,
    displayName: profile?.displayName ?? cred.user.displayName,
    role: profile?.role ?? null,
  };
}

export async function loadUserProfile(
  uid: string
): Promise<{ role: UserRole; displayName?: string } | null> {
  const snap = await getDoc(doc(getClientDb(), 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    role: data.role as UserRole,
    displayName: data.displayName,
  };
}

export async function signOut(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await firebaseSignOut(getClientAuth());
}

export function subscribeToAuth(
  callback: (user: FirebaseUser | null) => void
): () => void {
  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(getClientAuth(), callback);
}

export function mapAuthError(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: string }).code)
      : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 8 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email or password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      if (error instanceof Error && error.message) return error.message;
      return 'Something went wrong. Please try again.';
  }
}

export function redirectPathForRole(role: UserRole | null | undefined): string {
  switch (role) {
    case 'provider':
      return '/provider/dashboard';
    case 'admin':
    case 'super_admin':
    case 'verification_staff':
      return '/admin';
    case 'customer':
    default:
      return '/request';
  }
}
