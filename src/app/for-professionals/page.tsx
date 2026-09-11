import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ForProfessionalsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            SwiftMatch{' '}
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
              UK
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Log in
            </Link>
            <Link href="/register">
              <Button size="sm">Join as a professional</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Get matched with customers who need you now
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Set your services, areas and availability. Receive relevant job requests
            in real time — without competing in a noisy directory.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg">Create professional account</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-xl font-semibold">How it works for professionals</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              1
            </div>
            <h3 className="mt-4 font-medium">Complete your profile</h3>
            <p className="mt-2 text-sm text-slate-600">
              Services, coverage areas, qualifications, insurance and availability.
              Verification is reviewed by our team.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              2
            </div>
            <h3 className="mt-4 font-medium">Receive matched requests</h3>
            <p className="mt-2 text-sm text-slate-600">
              Only jobs that fit your skills, area and availability. Urgent jobs
              include a response window so customers get help quickly.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              3
            </div>
            <h3 className="mt-4 font-medium">Accept, quote and complete</h3>
            <p className="mt-2 text-sm text-slate-600">
              Chat with the customer, send a clear quote, and manage the job through
              to completion and payment.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-xl font-semibold">Ready to get started?</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-300">
            Join verified professionals across the UK who receive relevant work
            without the wait.
          </p>
          <Link href="/register" className="mt-6 inline-block">
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100"
            >
              Join as a professional
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
