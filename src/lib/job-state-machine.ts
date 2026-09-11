/**
 * Job lifecycle state machine.
 * Server-side validation must enforce these transitions.
 * Client UI may use helpers for display only.
 */

import type { JobStatus } from '@/types';

/** Allowed transitions: from → to[] */
export const JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['MATCHING', 'CANCELLED', 'EXPIRED'],
  MATCHING: ['MATCHED', 'AWAITING_PROVIDER', 'CANCELLED', 'EXPIRED'],
  MATCHED: ['AWAITING_PROVIDER', 'QUOTE_RECEIVED', 'PROVIDER_ACCEPTED', 'CANCELLED', 'EXPIRED'],
  AWAITING_PROVIDER: ['PROVIDER_ACCEPTED', 'QUOTE_RECEIVED', 'CANCELLED', 'EXPIRED'],
  PROVIDER_ACCEPTED: ['QUOTE_RECEIVED', 'CUSTOMER_SELECTED', 'BOOKED', 'CANCELLED'],
  QUOTE_RECEIVED: ['CUSTOMER_SELECTED', 'QUOTE_RECEIVED', 'CANCELLED', 'EXPIRED'],
  CUSTOMER_SELECTED: ['BOOKED', 'CANCELLED'],
  BOOKED: ['PROVIDER_EN_ROUTE', 'CANCELLED', 'DISPUTED'],
  PROVIDER_EN_ROUTE: ['ARRIVED', 'CANCELLED', 'DISPUTED'],
  ARRIVED: ['IN_PROGRESS', 'CANCELLED', 'DISPUTED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED', 'DISPUTED'],
  COMPLETED: ['CUSTOMER_CONFIRMED', 'DISPUTED'],
  CUSTOMER_CONFIRMED: [],
  CANCELLED: [],
  DISPUTED: ['COMPLETED', 'CANCELLED', 'CUSTOMER_CONFIRMED'],
  EXPIRED: [],
};

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return JOB_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: JobStatus, to: JobStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid job status transition: ${from} → ${to}`);
  }
}

export const TERMINAL_STATUSES: JobStatus[] = [
  'CUSTOMER_CONFIRMED',
  'CANCELLED',
  'EXPIRED',
];

export function isTerminal(status: JobStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  MATCHING: 'Finding professionals',
  MATCHED: 'Matched',
  AWAITING_PROVIDER: 'Waiting for provider',
  PROVIDER_ACCEPTED: 'Provider accepted',
  QUOTE_RECEIVED: 'Quote received',
  CUSTOMER_SELECTED: 'Provider selected',
  BOOKED: 'Booked',
  PROVIDER_EN_ROUTE: 'Provider en route',
  ARRIVED: 'Provider arrived',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CUSTOMER_CONFIRMED: 'Confirmed complete',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
  EXPIRED: 'Expired',
};

export const CUSTOMER_TRACKING_STEPS: JobStatus[] = [
  'BOOKED',
  'PROVIDER_EN_ROUTE',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CUSTOMER_CONFIRMED',
];
