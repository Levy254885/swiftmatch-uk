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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Production: Firebase Auth signInWithEmailAndPassword
      // Role is read from users/{uid} after sign-in — never set client-side
      await new Promise((r) => setTimeout(r, 600));
      setError(
        'Firebase Auth is not configured yet. Add NEXT_PUBLIC_FIREBASE_* keys to .env.local'
      );
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-xl font-semibold text-slate-900">
            SwiftMatch <span className="text-sm font-normal text-slate-500">UK</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <CardDescription>
              Access your customer or professional account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Log in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-slate-900 hover:underline">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
