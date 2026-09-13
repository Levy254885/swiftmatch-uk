'use client';

import { useState } from 'react';
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

const DEMO_QUEUE = [
  {
    id: 'prov-pending-1',
    businessName: 'Northern Pipe Solutions',
    displayName: 'Alex Turner',
    services: ['Plumbing', 'Drainage'],
    postcode: 'LS1 1BA',
    submittedAt: '2026-09-12',
  },
  {
    id: 'prov-pending-2',
    businessName: 'Bright Spark Electrical',
    displayName: 'Priya Sharma',
    services: ['Electrical'],
    postcode: 'B1 1BB',
    submittedAt: '2026-09-11',
  },
];

type QueueItem = (typeof DEMO_QUEUE)[number];

export default function AdminProvidersPage() {
  const [queue, setQueue] = useState<QueueItem[]>(DEMO_QUEUE);
  const [message, setMessage] = useState('');

  function handleAction(
    id: string,
    action: 'verified' | 'rejected' | 'documents_required'
  ) {
    setQueue((prev) => prev.filter((p) => p.id !== id));
    setMessage(
      action === 'verified'
        ? `Provider ${id} marked verified (demo — use Cloud Function in production).`
        : action === 'rejected'
          ? `Provider ${id} rejected (demo).`
          : `Documents required for ${id} (demo).`
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-900">
            Admin
          </Link>
          <span className="text-sm font-medium text-slate-900">Provider verification</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-xl font-semibold text-slate-900">Verification queue</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review applications. Never trust client-side verified flags.
        </p>

        {message && (
          <p className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            {message}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {queue.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-slate-500">
                Queue is empty.
              </CardContent>
            </Card>
          ) : (
            queue.map((p) => (
              <Card key={p.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle className="text-base">{p.businessName}</CardTitle>
                    <CardDescription>
                      {p.displayName} · {p.postcode} · Submitted {p.submittedAt}
                    </CardDescription>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.services.map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleAction(p.id, 'verified')}>
                    Approve verified
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(p.id, 'documents_required')}
                  >
                    Request documents
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction(p.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
