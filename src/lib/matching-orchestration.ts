/**
 * Matching orchestration for Cloud Functions (onJobSubmitted) and tests.
 * No external AI APIs.
 */

import {
  classifyRequest,
  runMatchingPipeline,
  type RankedProvider,
} from '@/matching/engine';
import type {
  JobRequest,
  ProviderProfile,
  ServiceCategory,
  ServiceKeyword,
  Match,
  MatchStatus,
  UrgencyLevel,
} from '@/types';

export function responseDeadlineMinutes(urgency: UrgencyLevel): number {
  switch (urgency) {
    case 'emergency':
      return 15;
    case 'today':
      return 60;
    case 'within_24h':
      return 180;
    case 'this_week':
      return 720;
    case 'flexible':
    default:
      return 1440;
  }
}

export function batchSizeForUrgency(urgency: UrgencyLevel): number {
  switch (urgency) {
    case 'emergency':
    case 'today':
      return 5;
    case 'within_24h':
      return 8;
    default:
      return 10;
  }
}

export type OrchestrationInput = {
  job: JobRequest;
  providers: ProviderProfile[];
  categories: ServiceCategory[];
  keywords: ServiceKeyword[];
};

export type OrchestrationResult = {
  classifiedServiceId: string | null;
  confidence: number;
  ranked: RankedProvider[];
  matchDrafts: Omit<Match, 'id'>[];
  noMatch: boolean;
};

export function orchestrateMatching(input: OrchestrationInput): OrchestrationResult {
  const { job, providers, categories, keywords } = input;

  let serviceId = job.classifiedServiceId ?? null;
  let confidence = 1;

  if (!serviceId && job.description) {
    const classified = classifyRequest(job.description, categories, keywords);
    serviceId = classified.serviceId;
    confidence = classified.confidence;
  }

  const jobForPipeline: JobRequest = {
    ...job,
    classifiedServiceId: serviceId ?? job.classifiedServiceId,
  };

  const pipeline = runMatchingPipeline({
    job: jobForPipeline,
    providers,
    categories,
    keywords,
    initialRadiusMiles: 20,
    batchSize: batchSizeForUrgency(job.urgency),
  });

  const now = new Date();
  const responseDeadline = new Date(
    now.getTime() + responseDeadlineMinutes(job.urgency) * 60 * 1000
  ).toISOString();

  const matchDrafts: Omit<Match, 'id'>[] = pipeline.ranked.map((r) => ({
    jobId: job.id,
    providerId: r.provider.id,
    score: r.scoreBreakdown.total,
    scoreBreakdown: r.scoreBreakdown,
    distanceMiles: r.distanceMiles,
    estimatedEtaMinutes: r.estimatedEtaMinutes,
    status: 'notified' as MatchStatus,
    notifiedAt: now.toISOString(),
    responseDeadline,
    createdAt: now.toISOString(),
  }));

  return {
    classifiedServiceId: serviceId,
    confidence,
    ranked: pipeline.ranked,
    matchDrafts,
    noMatch: pipeline.eligibleCount === 0,
  };
}
