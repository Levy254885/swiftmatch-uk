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

type DisputeRow = {
  id: string;
  jobRef: string;
  reason: string;
  openedBy: string;
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  amount: string;
  openedAt: string;
};

const DEMO: DisputeRow[] = [
  {
    id: 'disp-1',
    jobRef: 'JOB-UK-8F4A29',
    reason: 'Work incomplete — customer disputes charge',
    openedBy: 'customer',
    status: 'open',
    amount: '£95.00',
    openedAt: '2026-09-12',
  },
  {
    id: 'disp-2',
    jobRef: 'JOB-UK-1A2B3C',
    reason: 'No-show claim by customer',
    openedBy: 'customer',
    status: 'under_review',
    amount: '£60.00',
    openedAt: '2026-09-10',
  },
];

export default function AdminDisputesPage() {
  const [rows, setRows] = useState(DEMO);
  const [msg, setMsg] = useState('');

  function resolve(id: string, outcome: 'customer' | 'provider') {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'resolved' as const } : r))
    );
    setMsg(`Dispute ${id} resolved in favour of ${outcome} (demo).`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-900">
            Admin
          </Link>
          <span className="text-sm font-medium text-slate-900">Disputes</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-xl font-semibold text-slate-900">Disputes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Outcomes must be written server-side in production.
        </p>
        {msg && (
          <p className="mt-4 rounded-lg border bg-white px-3 py-2 text-sm">{msg}</p>
        )}
        <div className="mt-6 space-y-4">
          {rows.map((d) => (
            <Card key={d.id}>
              <CardHeader>
                <CardTitle className="text-base">{d.jobRef}</CardTitle>
                <CardDescription>
                  {d.reason} · {d.openedBy} · {d.openedAt}
                </CardDescription>
                <div className="mt-2 flex gap-2">
                  <Badge variant={d.status === 'open' ? 'warning' : 'secondary'}>
                    {d.status}
                  </Badge>
                  <Badge variant="secondary">{d.amount}</Badge>
                </div>
              </CardHeader>
              {d.status !== 'resolved' && (
                <CardContent className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => resolve(d.id, 'customer')}>
                    Resolve for customer
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => resolve(d.id, 'provider')}>
                    Resolve for provider
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
