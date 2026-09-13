/**
 * Quote + booking helpers (client-safe shapes).
 * Money-moving and exclusive status changes must go through Cloud Functions.
 */

import type { Quote, QuoteStatus, Booking, JobStatus, Location } from '@/types';

export function formatGbp(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function quoteIsActionable(status: QuoteStatus): boolean {
  return status === 'pending';
}

export function createDemoQuote(overrides?: Partial<Quote>): Quote {
  const now = new Date().toISOString();
  return {
    id: 'quote-demo-1',
    jobId: 'job-demo',
    matchId: 'match-demo-1',
    providerId: 'prov-1',
    customerId: 'customer-demo',
    labour: 75,
    materials: 12,
    callOutFee: 8,
    additionalCharges: 0,
    total: 95,
    currency: 'GBP',
    estimatedDurationMinutes: 90,
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    notes:
      'Emergency call-out, locate and repair burst pipe under kitchen sink. Includes first hour labour.',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const DEMO_ADDRESS: Location = {
  postcode: 'M1 1AE',
  city: 'Manchester',
  country: 'GB',
  addressLine1: '12 Example Street',
  geo: { latitude: 53.4808, longitude: -2.2426 },
};

export function createDemoBooking(overrides?: Partial<Booking>): Booking {
  const now = new Date().toISOString();
  return {
    id: 'booking-demo-1',
    reference: 'JOB-UK-8F4A29',
    jobId: 'job-demo',
    customerId: 'customer-demo',
    providerId: 'prov-1',
    quoteId: 'quote-demo-1',
    serviceId: 'plumbing',
    description: 'Emergency pipe repair under kitchen sink',
    address: DEMO_ADDRESS,
    scheduledAt: now,
    price: 95,
    currency: 'GBP',
    platformFee: 14.25,
    providerPayout: 80.75,
    paymentStatus: 'authorized',
    status: 'BOOKED',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export const TRACKING_LABELS: { status: JobStatus; label: string }[] = [
  { status: 'BOOKED', label: 'Booked' },
  { status: 'PROVIDER_EN_ROUTE', label: 'On the way' },
  { status: 'ARRIVED', label: 'Arrived' },
  { status: 'IN_PROGRESS', label: 'Work in progress' },
  { status: 'COMPLETED', label: 'Job completed' },
  { status: 'CUSTOMER_CONFIRMED', label: 'Confirmed' },
];

export function trackingStepIndex(status: JobStatus): number {
  const i = TRACKING_LABELS.findIndex((s) => s.status === status);
  return i >= 0 ? i : 0;
}
