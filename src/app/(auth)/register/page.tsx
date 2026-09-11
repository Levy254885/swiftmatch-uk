'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

type AccountType = 'customer' | 'provider';

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>('customer');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      // Production: createUserWithEmailAndPassword then server sets role
      await new Promise((r) => setTimeout(r, 600));
      setError(
        'Firebase Auth is not configured yet. Add NEXT_PUBLIC_FIREBASE_* keys to .env.local'
      );
    } catch {
      setError('Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-xl font-semibold text-slate-900">
            SwiftMatch <span className="text-sm font-normal text-slate-500">UK</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Join as a customer or as a professional offering services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountType('customer')}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${
                  accountType === 'customer'
                    ? 'border-slate-900 bg-slate-50 text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                I need a professional
              </button>
              <button
                type="button"
                onClick={() => setAccountType('provider')}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${
                  accountType === 'provider'
                    ? 'border-slate-900 bg-slate-50 text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                I offer services
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {accountType === 'provider' ? 'Your name' : 'Full name'}
                </label>
                <Input
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? 'Creating account…'
                  : accountType === 'provider'
                    ? 'Continue to professional setup'
                    : 'Create customer account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-slate-900 hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
