'use client';

import { useState, useMemo, useCallback } from 'react';
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
import { ProviderCard } from '@/components/provider-card';
import { SERVICE_CATEGORIES } from '@/constants/services';
import { classifyRequest, runMatchingPipeline } from '@/matching/engine';
import { jobRequestStep1Schema } from '@/validation/job';
import type { UrgencyLevel, JobRequest, Location } from '@/types';
import { buildDemoProviders } from '@/features/customer/demo-providers';
import {
  toServiceCategories,
  toServiceKeywords,
  rankedToCard,
  URGENCY_OPTIONS,
} from '@/features/customer/request-helpers';
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';

type Step = 'describe' | 'classify' | 'details' | 'matching' | 'results' | 'no_match';

export default function RequestPage() {
  const [step, setStep] = useState<Step>('describe');
  const [description, setDescription] = useState('');
  const [postcode, setPostcode] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('today');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState(0);
  const [matchedTerms, setMatchedTerms] = useState<string[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ReturnType<typeof rankedToCard>[]>([]);

  const categories = useMemo(() => toServiceCategories(), []);
  const keywords = useMemo(() => toServiceKeywords(), []);
  const providers = useMemo(() => buildDemoProviders(), []);

  const serviceName = useMemo(() => {
    if (!serviceId) return null;
    return SERVICE_CATEGORIES.find((c) => c.id === serviceId)?.name ?? serviceId;
  }, [serviceId]);

  const onDescribe = useCallback(() => {
    setErrors({});
    const parsed = jobRequestStep1Schema.safeParse({
      description: description.trim(),
      postcode: postcode.trim().toUpperCase(),
      urgency,
    });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        fe[String(i.path[0] ?? 'form')] = i.message;
      });
      setErrors(fe);
      return;
    }
    const r = classifyRequest(parsed.data.description, categories, keywords);
    setConfidence(r.confidence);
    setMatchedTerms(r.matchedTerms);
    setServiceId(r.serviceId);
    setStep('classify');
  }, [description, postcode, urgency, categories, keywords]);

  const runMatch = useCallback(async () => {
    if (!serviceId) return;
    setStep('matching');
    setProgress(0);
    for (const p of [25, 50, 75, 100]) {
      await new Promise((r) => setTimeout(r, 350));
      setProgress(p);
    }
    const location: Location = {
      postcode: postcode.trim().toUpperCase(),
      city: 'Manchester',
      country: 'GB',
      geo: { latitude: 53.4808, longitude: -2.2426 },
    };
    const job: JobRequest = {
      id: 'job-demo',
      customerId: 'customer-demo',
      description: description.trim(),
      classifiedServiceId: serviceId,
      customerConfirmedService: true,
      location,
      urgency,
      photos: [],
      status: 'MATCHING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const pipeline = runMatchingPipeline({
      job,
      providers,
      categories,
      keywords,
      initialRadiusMiles: 20,
      batchSize: 5,
    });
    if (pipeline.eligibleCount === 0) {
      setResults([]);
      setStep('no_match');
      return;
    }
    setResults(pipeline.ranked.map(rankedToCard));
    setStep('results');
  }, [serviceId, postcode, description, urgency, providers, categories, keywords]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link href="/" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-sm font-medium text-slate-900">Request a professional</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {step === 'describe' && (
          <Card>
            <CardHeader>
              <CardTitle>What do you need?</CardTitle>
              <CardDescription>
                Describe the job. We'll identify the service and find available professionals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={4}
                placeholder='"My kitchen pipe has burst and water is everywhere."'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium">Postcode</label>
                <Input
                  placeholder="e.g. M1 1AE"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                />
                {errors.postcode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
                )}
              </div>
              <div className="space-y-2">
                {URGENCY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                      urgency === opt.value
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      checked={urgency === opt.value}
                      onChange={() => setUrgency(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <Button className="w-full" size="lg" onClick={onDescribe}>
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'classify' && (
          <Card>
            <CardHeader>
              <CardTitle>We think you need</CardTitle>
              <CardDescription>Confirm so we match the right professionals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceName ? (
                <div className="rounded-lg border bg-slate-50 p-4">
                  <p className="text-lg font-semibold">{serviceName}</p>
                  {confidence > 0 && (
                    <p className="text-sm text-slate-500">
                      Confidence: {Math.round(confidence * 100)}%
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {matchedTerms.slice(0, 6).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Choose a service below.
                </div>
              )}
              {serviceId && (
                <Button className="w-full" onClick={() => setStep('details')}>
                  <Check className="h-4 w-4" /> Yes, that's correct
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => setServiceId(null)}>
                Change service
              </Button>
              {!serviceId && (
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="rounded-lg border px-3 py-2 text-left text-sm font-medium hover:bg-slate-50"
                      onClick={() => {
                        setServiceId(c.id);
                        setStep('details');
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm and search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Service: <strong>{serviceName}</strong>
              </p>
              <p>
                Location: <strong>{postcode.toUpperCase()}</strong>
              </p>
              <p>
                Urgency:{' '}
                <strong>{URGENCY_OPTIONS.find((o) => o.value === urgency)?.label}</strong>
              </p>
              {urgency === 'emergency' && serviceId === 'electrical' && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
                  If there is fire, smoke or exposed live wiring, contact emergency services.
                  This platform does not replace 999.
                </p>
              )}
              <Button className="w-full" size="lg" onClick={runMatch}>
                Find available professionals
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep('classify')}>
                Back
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'matching' && (
          <Card>
            <CardHeader>
              <CardTitle>Finding available professionals near you</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-slate-900 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking availability and ranking matches…
              </p>
            </CardContent>
          </Card>
        )}

        {step === 'results' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">
                {results.length} professional{results.length !== 1 ? 's' : ''} available
              </h2>
              <p className="text-sm text-slate-600">
                {serviceName} near {postcode.toUpperCase()}
              </p>
            </div>
            {results.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                onRequest={(id) => alert(`Request sent (demo): ${id}`)}
              />
            ))}
            <Button variant="outline" className="w-full" onClick={() => setStep('describe')}>
              New request
            </Button>
          </div>
        )}

        {step === 'no_match' && (
          <Card>
            <CardHeader>
              <CardTitle>No available professional right now</CardTitle>
              <CardDescription>
                Try expanding the search or adjusting your request.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={runMatch}>
                Try again
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep('describe')}>
                Adjust details
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
