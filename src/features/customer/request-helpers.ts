import { SERVICE_CATEGORIES, SAMPLE_KEYWORDS } from '@/constants/services';
import type { RankedProvider } from '@/matching/engine';
import type { ServiceCategory, ServiceKeyword } from '@/types';
import type { ProviderCardData } from '@/components/provider-card';

export function toServiceCategories(): ServiceCategory[] {
  return SERVICE_CATEGORIES.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    isEmergencyEligible: c.isEmergencyEligible,
    sortOrder: c.sortOrder,
    defaultRadiusMiles: c.defaultRadiusMiles,
    // Mutable copies — constants use `as const` readonly arrays
    keywords: [...c.keywords],
    synonyms: [...c.synonyms],
    active: true,
    parentId: null,
  }));
}

export function toServiceKeywords(): ServiceKeyword[] {
  return SAMPLE_KEYWORDS.map((k, i) => ({
    id: `kw-${i}`,
    term: k.term,
    aliases: [...k.aliases],
    serviceId: k.serviceId,
    weight: k.weight,
    active: true,
  }));
}

export function rankedToCard(r: RankedProvider): ProviderCardData {
  const p = r.provider;
  const reasons: string[] = [];
  if (p.serviceIds.length) {
    reasons.push(
      `Offers ${p.serviceIds.map((id) => id.replace(/-/g, ' ')).join(', ')}`
    );
  }
  if (p.availabilityStatus === 'available_now') reasons.push('Available now');
  if (r.distanceMiles < 5) {
    reasons.push(`Only ${r.distanceMiles.toFixed(1)} miles away`);
  }
  if (p.completedJobs > 50) {
    reasons.push(`Completed ${p.completedJobs} similar jobs`);
  }
  if (p.rating >= 4.5) {
    reasons.push(`Highly rated (${p.rating.toFixed(1)})`);
  }

  return {
    id: p.id,
    businessName: p.businessName,
    rating: p.rating,
    reviewCount: p.reviewCount,
    completedJobs: p.completedJobs,
    distanceMiles: r.distanceMiles,
    estimatedEtaMinutes: r.estimatedEtaMinutes,
    availabilityStatus: p.availabilityStatus,
    verified: p.status === 'verified',
    services: p.serviceIds.map((id) => {
      const cat = SERVICE_CATEGORIES.find((c) => c.id === id);
      return cat?.name ?? id;
    }),
    priceEstimateMin: p.pricing?.callOutFee ?? 50,
    priceEstimateMax: p.pricing?.hourlyRate
      ? p.pricing.hourlyRate * 2 + (p.pricing.callOutFee || 0)
      : 150,
    responseRate: p.responseRate,
    matchReasons: reasons,
  };
}

export const URGENCY_OPTIONS = [
  { value: 'emergency' as const, label: 'Emergency — I need help now' },
  { value: 'today' as const, label: 'Today' },
  { value: 'within_24h' as const, label: 'Within 24 hours' },
  { value: 'this_week' as const, label: 'This week' },
  { value: 'flexible' as const, label: 'Flexible' },
];
