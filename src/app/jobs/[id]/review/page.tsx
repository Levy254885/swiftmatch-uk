'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Star } from 'lucide-react';

const DIMENSIONS = [
  { key: 'overall', label: 'Overall' },
  { key: 'quality', label: 'Quality of work' },
  { key: 'communication', label: 'Communication' },
  { key: 'punctuality', label: 'Punctuality' },
  { key: 'value', label: 'Value for money' },
] as const;

type DimKey = (typeof DIMENSIONS)[number]['key'];

function StarRow({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label={`${label} ${n} stars`}
          >
            <Star
              className={`h-5 w-5 ${
                n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function JobReviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params?.id ?? 'job-demo');

  const [scores, setScores] = useState<Record<DimKey, number>>({
    overall: 0,
    quality: 0,
    communication: 0,
    punctuality: 0,
    value: 0,
  });
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function setScore(key: DimKey, n: number) {
    setScores((prev) => ({ ...prev, [key]: n }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (scores.overall < 1) {
      setError('Please give an overall rating.');
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Thank you</CardTitle>
            <CardDescription>
              Your review helps other customers find reliable professionals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/customer/dashboard">
              <Button className="w-full">Back to my jobs</Button>
            </Link>
            <Link href="/request">
              <Button variant="outline" className="w-full">
                Request another professional
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link href={`/jobs/${jobId}`} className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-sm font-medium text-slate-900">Leave a review</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>How was the job?</CardTitle>
            <CardDescription>
              Rate the professional for job {jobId}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {DIMENSIONS.map((d) => (
                <StarRow
                  key={d.key}
                  label={d.label}
                  value={scores[d.key]}
                  onChange={(n) => setScore(d.key, n)}
                />
              ))}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Comment (optional)
                </label>
                <Textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What went well? Anything to improve?"
                  maxLength={1000}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" size="lg">
                Submit review
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push(`/jobs/${jobId}`)}
              >
                Skip for now
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
