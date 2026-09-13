'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  createDemoQuote,
  createDemoBooking,
  formatGbp,
  TRACKING_LABELS,
  trackingStepIndex,
} from '@/lib/quotes';
import { JOB_STATUS_LABELS } from '@/lib/job-state-machine';
import type { JobStatus } from '@/types';
import { ArrowLeft, Check } from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = String(params?.id ?? 'job-demo');

  const quote = useMemo(() => createDemoQuote({ jobId }), [jobId]);
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState<JobStatus>('QUOTE_RECEIVED');
  const booking = useMemo(
    () =>
      createDemoBooking({
        jobId,
        status: accepted ? status : 'BOOKED',
      }),
    [jobId, accepted, status]
  );

  const step = trackingStepIndex(status);

  function acceptQuote() {
    setAccepted(true);
    setStatus('BOOKED');
  }

  function advanceDemo() {
    const order: JobStatus[] = [
      'BOOKED',
      'PROVIDER_EN_ROUTE',
      'ARRIVED',
      'IN_PROGRESS',
      'COMPLETED',
      'CUSTOMER_CONFIRMED',
    ];
    const i = order.indexOf(status);
    if (i >= 0 && i < order.length - 1) {
      setStatus(order[i + 1]);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link href="/request" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-sm font-medium text-slate-900">Job</span>
          <Badge variant="secondary" className="ml-auto">
            {JOB_STATUS_LABELS[status] ?? status}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        {!accepted && (
          <Card>
            <CardHeader>
              <CardTitle>Quote from professional</CardTitle>
              <CardDescription>
                Review the breakdown before booking. Payment is authorised on accept
                (Stripe — Phase 5).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-slate-700">{quote.notes}</p>
              <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Labour</span>
                  <span>{formatGbp(quote.labour)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Materials</span>
                  <span>{formatGbp(quote.materials)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Call-out</span>
                  <span>{formatGbp(quote.callOutFee)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold">
                  <span>Total</span>
                  <span>{formatGbp(quote.total)}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Valid until {new Date(quote.validUntil).toLocaleString('en-GB')}
              </p>
              <Button className="w-full" size="lg" onClick={acceptQuote}>
                Accept quote & book
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Message professional (soon)
              </Button>
            </CardContent>
          </Card>
        )}

        {accepted && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Booking confirmed</CardTitle>
                <CardDescription>
                  Reference <strong>{booking.reference}</strong> ·{' '}
                  {formatGbp(booking.price)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {TRACKING_LABELS.map((item, i) => {
                    const done = i <= step;
                    const current = i === step;
                    return (
                      <li key={item.status} className="flex items-center gap-3 text-sm">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                            done
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                        </span>
                        <span
                          className={
                            current
                              ? 'font-semibold text-slate-900'
                              : done
                                ? 'text-slate-700'
                                : 'text-slate-400'
                          }
                        >
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                {status !== 'CUSTOMER_CONFIRMED' && (
                  <Button
                    variant="outline"
                    className="mt-6 w-full"
                    onClick={advanceDemo}
                  >
                    Simulate next status (demo)
                  </Button>
                )}
                {status === 'COMPLETED' && (
                  <Button
                    className="mt-3 w-full"
                    onClick={() => setStatus('CUSTOMER_CONFIRMED')}
                  >
                    Confirm job complete
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                <p>{booking.address.addressLine1}</p>
                <p>
                  {booking.address.city} {booking.address.postcode}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
