/**
 * SwiftMatch Intelligent Matching Engine
 *
 * Deterministic, no external LLM dependency.
 * Combines service taxonomy, keywords, synonyms, geospatial,
 * availability, ratings and performance metrics.
 */

import type {
  JobRequest,
  ProviderProfile,
  MatchScoreBreakdown,
  MatchWeights,
  UrgencyLevel,
  ServiceCategory,
  ServiceKeyword,
  GeoPoint,
  Match,
} from '@/types';

// ============================================================================
// Scoring Weights (dynamic by urgency)
// ============================================================================

const BASE_WEIGHTS: MatchWeights = {
  serviceMatch: 0.30,
  availability: 0.20,
  distance: 0.15,
  experience: 0.10,
  rating: 0.10,
  completedJobs: 0.05,
  responseRate: 0.05,
  price: 0.05,
};

const EMERGENCY_WEIGHTS: MatchWeights = {
  serviceMatch: 0.25,
  availability: 0.30,
  distance: 0.20,
  experience: 0.08,
  rating: 0.07,
  completedJobs: 0.04,
  responseRate: 0.04,
  price: 0.02,
};

const SCHEDULED_WEIGHTS: MatchWeights = {
  serviceMatch: 0.28,
  availability: 0.12,
  distance: 0.12,
  experience: 0.12,
  rating: 0.14,
  completedJobs: 0.08,
  responseRate: 0.06,
  price: 0.08,
};

export function getWeightsForUrgency(urgency: UrgencyLevel): MatchWeights {
  switch (urgency) {
    case 'emergency':
      return EMERGENCY_WEIGHTS;
    case 'today':
    case 'within_24h':
      return { ...BASE_WEIGHTS, availability: 0.25, distance: 0.18 };
    case 'this_week':
    case 'flexible':
      return SCHEDULED_WEIGHTS;
    default:
      return BASE_WEIGHTS;
  }
}

// ============================================================================
// Text Normalization & Keyword Matching
// ============================================================================

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter((t) => t.length > 1);
}

/**
 * Simple stemming for common UK service terms (lightweight, no external lib).
 */
export function stem(token: string): string {
  const rules: [RegExp, string][] = [
    [/ies$/, 'y'],
    [/ves$/, 'f'],
    [/s$/, ''],
    [/ing$/, ''],
    [/ed$/, ''],
    [/er$/, ''],
  ];
  let result = token;
  for (const [re, rep] of rules) {
    if (re.test(result) && result.length > 4) {
      result = result.replace(re, rep);
      break;
    }
  }
  return result;
}

export function classifyRequest(
  description: string,
  categories: ServiceCategory[],
  keywords: ServiceKeyword[]
): {
  serviceId: string | null;
  subcategoryId: string | null;
  confidence: number;
  matchedTerms: string[];
} {
  const tokens = tokenize(description);
  const stemmed = tokens.map(stem);
  const allTerms = new Set([...tokens, ...stemmed]);

  const scores = new Map<string, { score: number; terms: string[]; subId?: string }>();

  for (const kw of keywords) {
    if (!kw.active) continue;
    const termNorm = normalizeText(kw.term);
    const aliases = [termNorm, ...kw.aliases.map(normalizeText)];

    let hit = false;
    const matched: string[] = [];

    for (const alias of aliases) {
      if (allTerms.has(alias) || description.toLowerCase().includes(alias)) {
        hit = true;
        matched.push(alias);
      }
      // partial / multi-word
      if (alias.includes(' ') && normalizeText(description).includes(alias)) {
        hit = true;
        matched.push(alias);
      }
    }

    if (hit) {
      const existing = scores.get(kw.serviceId) || { score: 0, terms: [], subId: kw.subcategoryId };
      existing.score += kw.weight;
      existing.terms.push(...matched);
      if (kw.subcategoryId) existing.subId = kw.subcategoryId;
      scores.set(kw.serviceId, existing);
    }
  }

  // Also score category names / synonyms
  for (const cat of categories) {
    if (!cat.active) continue;
    const nameNorm = normalizeText(cat.name);
    const catTerms = [nameNorm, ...cat.keywords.map(normalizeText), ...cat.synonyms.map(normalizeText)];
    let catScore = 0;
    const matched: string[] = [];
    for (const t of catTerms) {
      if (allTerms.has(t) || normalizeText(description).includes(t)) {
        catScore += 1.5;
        matched.push(t);
      }
    }
    if (catScore > 0) {
      const existing = scores.get(cat.id) || { score: 0, terms: [] };
      existing.score += catScore;
      existing.terms.push(...matched);
      scores.set(cat.id, existing);
    }
  }

  if (scores.size === 0) {
    return { serviceId: null, subcategoryId: null, confidence: 0, matchedTerms: [] };
  }

  let bestId = '';
  let bestScore = -1;
  let bestTerms: string[] = [];
  let bestSub: string | undefined;

  for (const [id, data] of scores) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestId = id;
      bestTerms = [...new Set(data.terms)];
      bestSub = data.subId;
    }
  }

  // Confidence heuristic (0-1)
  const confidence = Math.min(1, bestScore / 8);

  return {
    serviceId: bestId || null,
    subcategoryId: bestSub || null,
    confidence,
    matchedTerms: bestTerms,
  };
}

// ============================================================================
// Geospatial
// ============================================================================

const EARTH_RADIUS_MILES = 3958.8;

export function haversineDistanceMiles(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

/**
 * Rough geohash-like prefix for bounding box pre-filter.
 * For production scale, use proper geohash library or Firestore geo queries.
 */
export function getBoundingBox(center: GeoPoint, radiusMiles: number) {
  const latDelta = radiusMiles / 69;
  const lonDelta = radiusMiles / (Math.cos((center.latitude * Math.PI) / 180) * 69);
  return {
    minLat: center.latitude - latDelta,
    maxLat: center.latitude + latDelta,
    minLon: center.longitude - lonDelta,
    maxLon: center.longitude + lonDelta,
  };
}

// ============================================================================
// Hard Filters
// ============================================================================

export interface EligibleProviderInput {
  provider: ProviderProfile;
  job: JobRequest;
  requiredServiceId: string;
  maxDistanceMiles: number;
}

export function passesHardFilters(input: EligibleProviderInput): boolean {
  const { provider, job, requiredServiceId, maxDistanceMiles } = input;

  // Must be active & verified (or controlled new-provider exposure)
  if (!provider.isActive) return false;
  if (provider.status === 'suspended' || provider.status === 'rejected') return false;
  if (provider.status !== 'verified' && provider.status !== 'pending_verification') return false;

  // Must offer the service
  if (!provider.serviceIds.includes(requiredServiceId) && !provider.subServiceIds.includes(requiredServiceId)) {
    return false;
  }

  // Availability for urgency
  if (job.urgency === 'emergency') {
    if (!provider.emergencyAvailable) return false;
    if (provider.availabilityStatus !== 'available_now') return false;
  } else if (job.urgency === 'today' || job.urgency === 'within_24h') {
    if (provider.availabilityStatus === 'offline' || provider.availabilityStatus === 'busy') return false;
  }

  // Distance (using service areas)
  if (provider.serviceAreas.length === 0) return false;

  let withinArea = false;
  for (const area of provider.serviceAreas) {
    if (!area.active) continue;
    const dist = haversineDistanceMiles(job.location.geo, area.center);
    if (dist <= Math.min(area.radiusMiles, maxDistanceMiles)) {
      withinArea = true;
      break;
    }
  }
  if (!withinArea) return false;

  // Max travel preference
  if (provider.maxTravelMiles) {
    const distToJob = haversineDistanceMiles(job.location.geo, provider.serviceAreas[0].center);
    if (distToJob > provider.maxTravelMiles) return false;
  }

  return true;
}

// ============================================================================
// Soft Scoring
// ============================================================================

export function calculateServiceMatchScore(
  provider: ProviderProfile,
  serviceId: string,
  subServiceId?: string | null
): number {
  let score = 0;
  if (provider.serviceIds.includes(serviceId)) score += 0.7;
  if (subServiceId && provider.subServiceIds.includes(subServiceId)) score += 0.3;
  // Partial credit for related
  if (score === 0 && provider.serviceIds.length > 0) score = 0.2;
  return Math.min(1, score);
}

export function calculateAvailabilityScore(provider: ProviderProfile, urgency: UrgencyLevel): number {
  switch (provider.availabilityStatus) {
    case 'available_now':
      return urgency === 'emergency' || urgency === 'today' ? 1 : 0.9;
    case 'available_later':
      return urgency === 'flexible' || urgency === 'this_week' ? 0.8 : 0.4;
    case 'busy':
      return 0.1;
    case 'offline':
      return 0;
    default:
      return 0.3;
  }
}

export function calculateDistanceScore(distanceMiles: number, maxRadius: number): number {
  if (distanceMiles <= 0) return 1;
  if (distanceMiles >= maxRadius) return 0;
  // Linear decay with slight preference for closer
  return Math.max(0, 1 - distanceMiles / maxRadius);
}

export function calculateExperienceScore(years: number, completedJobs: number): number {
  const yearScore = Math.min(1, years / 15);
  const jobScore = Math.min(1, completedJobs / 200);
  return yearScore * 0.4 + jobScore * 0.6;
}

export function calculateRatingScore(rating: number, reviewCount: number): number {
  if (reviewCount < 3) return 0.5; // neutral for new providers
  return Math.min(1, rating / 5);
}

export function calculateCompletedJobsScore(count: number): number {
  return Math.min(1, count / 150);
}

export function calculateResponseRateScore(rate: number): number {
  return Math.min(1, Math.max(0, rate));
}

export function calculatePriceScore(
  provider: ProviderProfile,
  budgetMin?: number,
  budgetMax?: number
): number {
  // Without a concrete quote we use soft preference
  if (!budgetMax && !budgetMin) return 0.7;
  const estimated = provider.pricing.callOutFee || provider.pricing.hourlyRate || 80;
  if (budgetMax && estimated > budgetMax * 1.3) return 0.2;
  if (budgetMin && estimated < budgetMin * 0.5) return 0.6; // possibly too cheap / quality concern
  return 0.85;
}

export function calculateTotalScore(
  provider: ProviderProfile,
  job: JobRequest,
  distanceMiles: number,
  serviceId: string,
  subServiceId: string | null,
  maxRadius: number
): MatchScoreBreakdown {
  const weights = getWeightsForUrgency(job.urgency);

  const serviceMatch = calculateServiceMatchScore(provider, serviceId, subServiceId);
  const availability = calculateAvailabilityScore(provider, job.urgency);
  const distance = calculateDistanceScore(distanceMiles, maxRadius);
  const experience = calculateExperienceScore(provider.yearsExperience, provider.completedJobs);
  const rating = calculateRatingScore(provider.rating, provider.reviewCount);
  const completedJobs = calculateCompletedJobsScore(provider.completedJobs);
  const responseRate = calculateResponseRateScore(provider.responseRate);
  const price = calculatePriceScore(provider, job.budgetMin, job.budgetMax);

  const total =
    serviceMatch * weights.serviceMatch +
    availability * weights.availability +
    distance * weights.distance +
    experience * weights.experience +
    rating * weights.rating +
    completedJobs * weights.completedJobs +
    responseRate * weights.responseRate +
    price * weights.price;

  return {
    serviceMatch,
    availability,
    distance,
    experience,
    rating,
    completedJobs,
    responseRate,
    price,
    total,
    weightsUsed: weights,
  };
}

// ============================================================================
// Ranking & Match Creation
// ============================================================================

export interface RankedProvider {
  provider: ProviderProfile;
  distanceMiles: number;
  scoreBreakdown: MatchScoreBreakdown;
  estimatedEtaMinutes?: number;
}

export function rankProviders(
  eligible: RankedProvider[]
): RankedProvider[] {
  return [...eligible].sort((a, b) => b.scoreBreakdown.total - a.scoreBreakdown.total);
}

/**
 * Controlled number of providers to notify (cascading).
 */
export function selectProvidersToNotify(
  ranked: RankedProvider[],
  batchSize = 5,
  offset = 0
): RankedProvider[] {
  return ranked.slice(offset, offset + batchSize);
}

/**
 * Fair matching: give new verified providers a controlled boost opportunity.
 */
export function applyNewProviderBoost(ranked: RankedProvider[]): RankedProvider[] {
  return ranked.map((r) => {
    if (r.provider.completedJobs < 5 && r.provider.status === 'verified') {
      // mild boost so they appear in consideration
      const boosted = { ...r };
      boosted.scoreBreakdown = {
        ...r.scoreBreakdown,
        total: Math.min(1, r.scoreBreakdown.total + 0.05),
      };
      return boosted;
    }
    return r;
  });
}

// ============================================================================
// High-level matching pipeline
// ============================================================================

export interface MatchingResult {
  classified: ReturnType<typeof classifyRequest>;
  eligibleCount: number;
  ranked: RankedProvider[];
  toNotify: RankedProvider[];
}

export function runMatchingPipeline(params: {
  job: JobRequest;
  providers: ProviderProfile[];
  categories: ServiceCategory[];
  keywords: ServiceKeyword[];
  initialRadiusMiles?: number;
  batchSize?: number;
}): MatchingResult {
  const {
    job,
    providers,
    categories,
    keywords,
    initialRadiusMiles = 15,
    batchSize = 5,
  } = params;

  const classified = classifyRequest(job.description, categories, keywords);
  const serviceId = classified.serviceId || job.classifiedServiceId;
  if (!serviceId) {
    return { classified, eligibleCount: 0, ranked: [], toNotify: [] };
  }

  const ranked: RankedProvider[] = [];

  for (const provider of providers) {
    if (
      !passesHardFilters({
        provider,
        job,
        requiredServiceId: serviceId,
        maxDistanceMiles: initialRadiusMiles,
      })
    ) {
      continue;
    }

    // Approximate distance from first active service area
    const area = provider.serviceAreas.find((a) => a.active) || provider.serviceAreas[0];
    const distanceMiles = haversineDistanceMiles(job.location.geo, area.center);

    const scoreBreakdown = calculateTotalScore(
      provider,
      job,
      distanceMiles,
      serviceId,
      classified.subcategoryId,
      initialRadiusMiles
    );

    // Rough ETA: 2 min + 1.5 min per mile (urban UK estimate)
    const estimatedEtaMinutes = Math.round(2 + distanceMiles * 1.5);

    ranked.push({
      provider,
      distanceMiles,
      scoreBreakdown,
      estimatedEtaMinutes,
    });
  }

  const withBoost = applyNewProviderBoost(ranked);
  const sorted = rankProviders(withBoost);
  const toNotify = selectProvidersToNotify(sorted, batchSize);

  return {
    classified,
    eligibleCount: sorted.length,
    ranked: sorted,
    toNotify,
  };
}

export function expandSearchRadius(
  currentRadius: number,
  maxRadius = 40
): number {
  return Math.min(maxRadius, currentRadius * 1.6);
}
