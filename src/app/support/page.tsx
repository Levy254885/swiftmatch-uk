'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const TOPICS = [
  { value: 'job', label: 'Issue with a job' },
  { value: 'payment', label: 'Payment or refund' },
  { value: 'provider', label: 'Problem with a professional' },
  { value: 'account', label: 'Account or login' },
  { value: 'other', label: 'Something else' },
] as const;

export default function SupportPage() {
  const [topic, setTopic] = useState('job');
  const [jobRef, setJobRef] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Request received</CardTitle>
            <CardDescription>
              Our team will respond by email. For emergencies involving danger, call 999.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Back to home</Button>
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
          <Link href="/" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-sm font-medium text-slate-900">Help &amp; support</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact support</CardTitle>
            <CardDescription>
              UK help for customers and professionals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Topic</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  {TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Job reference (optional)</label>
                <Input value={jobRef} onChange={(e) => setJobRef(e.target.value)} placeholder="e.g. JOB-UK-8F4A29" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Message</label>
                <Textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the issue clearly…" maxLength={2000} />
              </div>
              <Button type="submit" className="w-full">Send request</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
