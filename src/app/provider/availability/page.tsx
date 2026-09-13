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
import type { AvailabilityStatus } from '@/types';

const STATUS_OPTIONS: {
  value: AvailabilityStatus;
  label: string;
  hint: string;
}[] = [
  { value: 'available_now', label: 'Available now', hint: 'You can receive matches immediately' },
  { value: 'available_later', label: 'Available later today', hint: 'Shown for non-emergency jobs' },
  { value: 'busy', label: 'Busy', hint: 'You will not receive new matches' },
  { value: 'offline', label: 'Offline', hint: 'Fully unavailable until you change status' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type DayHours = { enabled: boolean; start: string; end: string };

const defaultWeek = (): Record<(typeof DAYS)[number], DayHours> => ({
  Mon: { enabled: true, start: '08:00', end: '18:00' },
  Tue: { enabled: true, start: '08:00', end: '18:00' },
  Wed: { enabled: true, start: '08:00', end: '18:00' },
  Thu: { enabled: true, start: '08:00', end: '18:00' },
  Fri: { enabled: true, start: '08:00', end: '17:00' },
  Sat: { enabled: true, start: '09:00', end: '13:00' },
  Sun: { enabled: false, start: '09:00', end: '13:00' },
});

export default function ProviderAvailabilityPage() {
  const [status, setStatus] = useState<AvailabilityStatus>('available_now');
  const [emergency, setEmergency] = useState(true);
  const [week, setWeek] = useState(defaultWeek);
  const [saved, setSaved] = useState(false);

  function toggleDay(day: (typeof DAYS)[number]) {
    setWeek((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
    setSaved(false);
  }

  function setHours(day: (typeof DAYS)[number], field: 'start' | 'end', value: string) {
    setWeek((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setSaved(false);
  }

  function save() {
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/provider/dashboard" className="text-sm font-semibold text-slate-900">
            SwiftMatch <span className="font-normal text-slate-500">Provider</span>
          </Link>
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link href="/provider/dashboard" className="hover:text-slate-900">Overview</Link>
            <Link href="/provider/requests" className="hover:text-slate-900">Requests</Link>
            <span className="font-medium text-slate-900">Availability</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Availability</h1>
          <p className="text-sm text-slate-600">
            Matching only notifies you when this is accurate.
          </p>
        </div>

        {saved && (
          <p className="rounded-lg border bg-white px-3 py-2 text-sm">Saved (demo).</p>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current status</CardTitle>
            <CardDescription>Used by hard filters in matching.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setStatus(opt.value); setSaved(false); }}
                className={`flex w-full items-start justify-between rounded-lg border px-3 py-3 text-left text-sm ${
                  status === opt.value ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                }`}
              >
                <div>
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-xs text-slate-500">{opt.hint}</p>
                </div>
                {status === opt.value && <Badge>Active</Badge>}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={emergency}
                onChange={(e) => { setEmergency(e.target.checked); setSaved(false); }}
              />
              Accept emergency / same-day urgent requests
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usual working hours</CardTitle>
            <CardDescription>Live status still overrides schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DAYS.map((day) => (
              <div key={day} className="flex flex-wrap items-center gap-2 text-sm">
                <label className="flex w-14 items-center gap-2">
                  <input type="checkbox" checked={week[day].enabled} onChange={() => toggleDay(day)} />
                  {day}
                </label>
                <input
                  type="time"
                  disabled={!week[day].enabled}
                  value={week[day].start}
                  onChange={(e) => setHours(day, 'start', e.target.value)}
                  className="rounded border border-slate-200 px-2 py-1 disabled:opacity-40"
                />
                <span className="text-slate-400">–</span>
                <input
                  type="time"
                  disabled={!week[day].enabled}
                  value={week[day].end}
                  onChange={(e) => setHours(day, 'end', e.target.value)}
                  className="rounded border border-slate-200 px-2 py-1 disabled:opacity-40"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Button className="w-full" size="lg" onClick={save}>Save availability</Button>
      </main>
    </div>
  );
}
