import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function AdminDashboardPage() {
  const stats = {
    pendingVerification: 0,
    jobsToday: 0,
    activeProviders: 0,
    openDisputes: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-sm font-semibold text-slate-900">
            SwiftMatch <span className="font-normal text-slate-500">Admin</span>
          </span>
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link href="/admin" className="font-medium text-slate-900">
              Dashboard
            </Link>
            <Link href="/admin/providers" className="hover:text-slate-900">
              Providers
            </Link>
            <span className="cursor-not-allowed opacity-50">Jobs</span>
            <span className="cursor-not-allowed opacity-50">Payments</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-xl font-semibold text-slate-900">Operations</h1>
        <p className="mt-1 text-sm text-slate-600">
          Marketplace health and verification queue
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending verification</CardDescription>
              <CardTitle className="text-2xl">{stats.pendingVerification}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Jobs today</CardDescription>
              <CardTitle className="text-2xl">{stats.jobsToday}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active providers</CardDescription>
              <CardTitle className="text-2xl">{stats.activeProviders}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Open disputes</CardDescription>
              <CardTitle className="text-2xl">{stats.openDisputes}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification queue</CardTitle>
              <CardDescription>
                Approve or reject providers. Status changes only via server.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/providers"
                className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
              >
                Open provider verification →
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Matching health</CardTitle>
              <CardDescription>
                Unmatched requests and coverage gaps for ops.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">No data yet (wire Firestore).</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
