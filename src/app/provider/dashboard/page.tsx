import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function ProviderDashboardPage() {
  const demoStats = {
    newRequests: 0,
    activeJobs: 0,
    completedThisMonth: 0,
    rating: null as number | null,
    status: 'pending_verification' as const,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold text-slate-900">
            SwiftMatch <span className="font-normal text-slate-500">Provider</span>
          </Link>
          <nav className="hidden gap-4 text-sm text-slate-600 sm:flex">
            <span className="font-medium text-slate-900">Overview</span>
            <span className="cursor-not-allowed opacity-50">Requests</span>
            <span className="cursor-not-allowed opacity-50">Jobs</span>
            <span className="cursor-not-allowed opacity-50">Availability</span>
            <span className="cursor-not-allowed opacity-50">Earnings</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600">
              Overview of requests, jobs and performance
            </p>
          </div>
          <Badge variant="warning">Verification pending</Badge>
        </div>

        {demoStats.status === 'pending_verification' && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4 text-sm text-amber-900">
              Your account is pending verification. You will not receive live job
              matches until an admin approves your profile.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>New requests</CardDescription>
              <CardTitle className="text-2xl">{demoStats.newRequests}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active jobs</CardDescription>
              <CardTitle className="text-2xl">{demoStats.activeJobs}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed (month)</CardDescription>
              <CardTitle className="text-2xl">
                {demoStats.completedThisMonth}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rating</CardDescription>
              <CardTitle className="text-2xl">
                {demoStats.rating != null ? demoStats.rating.toFixed(1) : '—'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Incoming requests</CardTitle>
              <CardDescription>
                Matched jobs appear here when you are verified and available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">No requests yet.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/provider/onboarding">
                <Button variant="outline" className="w-full justify-start">
                  Continue / edit onboarding
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                Set availability (soon)
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Upload verification documents (soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
