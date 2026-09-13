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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatGbp } from '@/lib/quotes';

type InboxItem = {
  matchId: string;
  jobId: string;
  serviceName: string;
  description: string;
  postcode: string;
  urgency: string;
  distanceMiles: number;
  score: number;
  deadlineLabel: string;
  status: 'notified' | 'accepted' | 'declined' | 'expired';
};

const DEMO_INBOX: InboxItem[] = [
  {
    matchId: 'match-1',
    jobId: 'job-demo',
    serviceName: 'Plumbing',
    description:
      'Kitchen pipe has burst under the sink. Water is pooling on the floor. Need someone today.',
    postcode: 'M1 1AE',
    urgency: 'Emergency',
    distanceMiles: 2.4,
    score: 0.91,
    deadlineLabel: 'Respond within 15 min',
    status: 'notified',
  },
  {
    matchId: 'match-2',
    jobId: 'job-demo-2',
    serviceName: 'Plumbing',
    description: 'Tap dripping in bathroom, flexible timing this week.',
    postcode: 'M2 3AW',
    urgency: 'This week',
    distanceMiles: 4.1,
    score: 0.78,
    deadlineLabel: 'Respond within 2 hours',
    status: 'notified',
  },
];

export default function ProviderRequestsPage() {
  const [items, setItems] = useState<InboxItem[]>(DEMO_INBOX);
  const [quoteFor, setQuoteFor] = useState<string | null>(null);
  const [labour, setLabour] = useState('75');
  const [materials, setMaterials] = useState('12');
  const [callOut, setCallOut] = useState('8');
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState('');

  function decline(matchId: string) {
    setItems((prev) =>
      prev.map((i) => (i.matchId === matchId ? { ...i, status: 'declined' } : i))
    );
    setToast('Request declined.');
  }

  function acceptAndQuote(matchId: string) {
    setItems((prev) =>
      prev.map((i) => (i.matchId === matchId ? { ...i, status: 'accepted' } : i))
    );
    setQuoteFor(null);
    setToast(
      'Accepted (demo). Production runs acceptJob transaction, then creates a quote.'
    );
  }

  const open = items.filter((i) => i.status === 'notified');
  const closed = items.filter((i) => i.status !== 'notified');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/provider/dashboard" className="text-sm font-semibold text-slate-900">
            SwiftMatch <span className="font-normal text-slate-500">Provider</span>
          </Link>
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link href="/provider/dashboard" className="hover:text-slate-900">
              Overview
            </Link>
            <span className="font-medium text-slate-900">Requests</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Incoming requests</h1>
          <p className="text-sm text-slate-600">
            Matched jobs while you are available. Respond before the deadline.
          </p>
        </div>

        {toast && (
          <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            {toast}
          </p>
        )}

        {open.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-slate-500">
              No open requests. Stay available and verified to receive matches.
            </CardContent>
          </Card>
        )}

        {open.map((item) => (
          <Card key={item.matchId}>
            <CardHeader className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">{item.serviceName}</CardTitle>
                <Badge variant="warning">{item.urgency}</Badge>
                <Badge variant="secondary">{item.distanceMiles.toFixed(1)} mi</Badge>
                <Badge variant="secondary">Score {(item.score * 100).toFixed(0)}%</Badge>
              </div>
              <CardDescription>
                {item.postcode} · {item.deadlineLabel}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700">{item.description}</p>

              {quoteFor === item.matchId ? (
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium">Send a quote (GBP)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-slate-500">Labour</label>
                      <Input type="number" min={0} value={labour} onChange={(e) => setLabour(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Materials</label>
                      <Input type="number" min={0} value={materials} onChange={(e) => setMaterials(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Call-out</label>
                      <Input type="number" min={0} value={callOut} onChange={(e) => setCallOut(e.target.value)} />
                    </div>
                  </div>
                  <Textarea rows={2} placeholder="Notes for the customer…" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <p className="text-sm font-semibold">
                    Total:{' '}
                    {formatGbp(Number(labour || 0) + Number(materials || 0) + Number(callOut || 0))}
                  </p>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => acceptAndQuote(item.matchId)}>
                      Accept & send quote
                    </Button>
                    <Button variant="outline" onClick={() => setQuoteFor(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setQuoteFor(item.matchId)}>
                    Accept & quote
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => decline(item.matchId)}>
                    Decline
                  </Button>
                  <Link href={`/jobs/${item.jobId}/chat`}>
                    <Button size="sm" variant="ghost">
                      Message
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {closed.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-slate-500">Responded</h2>
            {closed.map((item) => (
              <Card key={item.matchId}>
                <CardContent className="flex items-center justify-between p-4 text-sm">
                  <span className="text-slate-700">
                    {item.serviceName} · {item.postcode}
                  </span>
                  <Badge variant={item.status === 'accepted' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
