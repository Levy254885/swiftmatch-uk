'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { SERVICE_CATEGORIES } from '@/constants/services';
import { ArrowLeft, Check } from 'lucide-react';

const STEPS = [
  'Business',
  'Services',
  'Areas',
  'Experience',
  'Availability',
  'Review',
] as const;

type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;

export default function ProviderOnboardingPage() {
  const [step, setStep] = useState<StepIndex>(0);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('sole_trader');
  const [description, setDescription] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [postcode, setPostcode] = useState('');
  const [radiusMiles, setRadiusMiles] = useState('15');
  const [yearsExperience, setYearsExperience] = useState('');
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function next() {
    if (step < 5) setStep((step + 1) as StepIndex);
  }

  function back() {
    if (step > 0) setStep((step - 1) as StepIndex);
  }

  function handleSubmit() {
    // Production: write profile with status pending_verification via Cloud Function
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Application submitted</CardTitle>
            <CardDescription>
              Your profile is pending verification. Verified status is only set by
              platform staff after review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="warning">Verification pending</Badge>
            <Link href="/provider/dashboard">
              <Button className="w-full">Go to dashboard</Button>
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
          <span className="text-sm font-medium text-slate-900">
            Professional onboarding
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i <= step && setStep(i as StepIndex)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                i === step
                  ? 'bg-slate-900 text-white'
                  : i < step
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i < step && <Check className="mr-1 inline h-3 w-3" />}
              {label}
            </button>
          ))}
        </div>

        <Card>
          {step === 0 && (
            <>
              <CardHeader>
                <CardTitle>Business information</CardTitle>
                <CardDescription>
                  How customers will see your business on SwiftMatch.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Business name</label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. John's Heating Services"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Business type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  >
                    <option value="individual">Individual professional</option>
                    <option value="sole_trader">Sole trader</option>
                    <option value="limited_company">Limited company</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Description</label>
                  <Textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your services and specialisms…"
                  />
                </div>
                <Button className="w-full" onClick={next} disabled={!businessName.trim()}>
                  Continue
                </Button>
              </CardContent>
            </>
          )}

          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Services you offer</CardTitle>
                <CardDescription>Select all that apply. This drives matching.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_CATEGORIES.map((cat) => {
                    const selected = selectedServices.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleService(cat.id)}
                        className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium ${
                          selected
                            ? 'border-slate-900 bg-slate-50 text-slate-900'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={back}>Back</Button>
                  <Button className="flex-1" onClick={next} disabled={selectedServices.length === 0}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Service areas</CardTitle>
                <CardDescription>Postcode and radius for matching.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Base postcode</label>
                  <Input value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="e.g. M1 1AE" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Coverage radius (miles)</label>
                  <Input type="number" min={1} max={50} value={radiusMiles} onChange={(e) => setRadiusMiles(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={back}>Back</Button>
                  <Button className="flex-1" onClick={next} disabled={postcode.trim().length < 5}>Continue</Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
                <CardDescription>Helps ranking and customer trust.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Years of experience</label>
                  <Input type="number" min={0} max={60} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} placeholder="e.g. 8" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={back}>Back</Button>
                  <Button className="flex-1" onClick={next}>Continue</Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>Real availability drives matching.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-3">
                  <input type="checkbox" checked={emergencyAvailable} onChange={(e) => setEmergencyAvailable(e.target.checked)} className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Accept emergency jobs</p>
                    <p className="text-xs text-slate-500">Urgent requests with a short response window</p>
                  </div>
                </label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={back}>Back</Button>
                  <Button className="flex-1" onClick={next}>Continue</Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 5 && (
            <>
              <CardHeader>
                <CardTitle>Review and submit</CardTitle>
                <CardDescription>
                  Status will be <strong>pending verification</strong>. Only staff can set verified.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><span className="text-slate-500">Business:</span> <strong>{businessName}</strong></p>
                <p>
                  <span className="text-slate-500">Services:</span>{' '}
                  {selectedServices.map((id) => SERVICE_CATEGORIES.find((c) => c.id === id)?.name ?? id).join(', ')}
                </p>
                <p><span className="text-slate-500">Area:</span> {postcode.toUpperCase()} · {radiusMiles} miles</p>
                <p><span className="text-slate-500">Experience:</span> {yearsExperience || '—'} years</p>
                <p><span className="text-slate-500">Emergency:</span> {emergencyAvailable ? 'Yes' : 'No'}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={back}>Back</Button>
                  <Button className="flex-1" onClick={handleSubmit}>Submit for verification</Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
