import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatGBP } from '@/lib/utils';
import { Star, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export interface ProviderCardData {
  id: string;
  businessName: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  distanceMiles: number;
  estimatedEtaMinutes?: number;
  availabilityStatus: 'available_now' | 'available_later' | 'busy' | 'offline';
  verified: boolean;
  services: string[];
  priceEstimateMin?: number;
  priceEstimateMax?: number;
  responseRate?: number;
  matchReasons?: string[];
}

interface ProviderCardProps {
  provider: ProviderCardData;
  onRequest?: (providerId: string) => void;
  onViewProfile?: (providerId: string) => void;
}

export function ProviderCard({ provider, onRequest, onViewProfile }: ProviderCardProps) {
  const availabilityLabel =
    provider.availabilityStatus === 'available_now'
      ? 'Available now'
      : provider.availabilityStatus === 'available_later'
        ? 'Available later'
        : provider.availabilityStatus === 'busy'
          ? 'Busy'
          : 'Offline';

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-slate-900">
                {provider.businessName}
              </h3>
              {provider.verified && (
                <Badge variant="verified" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-slate-900">{provider.rating.toFixed(1)}</span>
                <span className="text-slate-400">({provider.reviewCount})</span>
              </span>
              <span>{provider.completedJobs} jobs</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {provider.distanceMiles.toFixed(1)} miles
          </span>
          {provider.estimatedEtaMinutes != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              ~{provider.estimatedEtaMinutes} min
            </span>
          )}
          <Badge
            variant={
              provider.availabilityStatus === 'available_now' ? 'success' : 'secondary'
            }
          >
            {availabilityLabel}
          </Badge>
        </div>

        {provider.services.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {provider.services.slice(0, 4).map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
        )}

        {provider.matchReasons && provider.matchReasons.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-slate-600">
            {provider.matchReasons.slice(0, 4).map((reason) => (
              <li key={reason} className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                {reason}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm">
            {provider.priceEstimateMin != null && provider.priceEstimateMax != null ? (
              <span className="font-medium text-slate-900">
                {formatGBP(provider.priceEstimateMin)}–{formatGBP(provider.priceEstimateMax)}
              </span>
            ) : (
              <span className="text-slate-500">Quote on request</span>
            )}
          </div>
          <div className="flex gap-2">
            {onViewProfile && (
              <Button variant="outline" size="sm" onClick={() => onViewProfile(provider.id)}>
                Profile
              </Button>
            )}
            {onRequest && (
              <Button size="sm" onClick={() => onRequest(provider.id)}>
                Request
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
