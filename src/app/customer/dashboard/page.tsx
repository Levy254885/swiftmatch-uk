import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function CustomerDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold text-slate-900">
            SwiftMatch
          </Link>
          <nav className="flex gap-4 text-sm text-slate-600">
            <span className="font-medium text-slate-900">My jobs</span>
            <Link href="/request" className="hover:text-slate-900">
              New request
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Your jobs</h1>
            <p className="text-sm text-slate-600">
              Active requests, quotes and bookings
            </p>
          </div>
          <Link href="/request">
            <Button>Request a professional</Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active</CardTitle>
              <CardDescription>
                Production lists jobs from Firestore for the signed-in customer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">No active jobs yet.</p>
              <Link
                href="/jobs/job-demo"
                className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
              >
                Open demo job (quote → track) →
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Past</CardTitle>
              <CardDescription>Completed and cancelled jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">None yet.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
