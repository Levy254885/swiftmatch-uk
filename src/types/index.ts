/**
 * SwiftMatch UK — Core TypeScript Types
 * Production types for the marketplace.
 */

// ============================================================================
// Enums & Constants
// ============================================================================

export type UserRole = 'customer' | 'provider' | 'admin' | 'super_admin' | 'verification_staff' | 'support_staff' | 'finance_staff';

export type ProviderStatus =
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'suspended'
  | 'under_review'
  | 'incomplete_onboarding';

export type AvailabilityStatus = 'available_now' | 'available_later' | 'busy' | 'offline';

export type UrgencyLevel = 'emergency' | 'today' | 'within_24h' | 'this_week' | 'flexible';

export type JobStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'MATCHING'
  | 'MATCHED'
  | 'AWAITING_PROVIDER'
  | 'PROVIDER_ACCEPTED'
  | 'QUOTE_RECEIVED'
  | 'CUSTOMER_SELECTED'
  | 'BOOKED'
  | 'PROVIDER_EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CUSTOMER_CONFIRMED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'EXPIRED';

export type MatchStatus = 'pending' | 'notified' | 'accepted' | 'declined' | 'expired' | 'selected';

export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'disputed';

export type VerificationStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'documents_required';

export type BusinessType = 'individual' | 'sole_trader' | 'limited_company' | 'partnership' | 'other';

// ============================================================================
// Geo & Location
// ============================================================================

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Location {
  postcode: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  county?: string;
  region?: string;
  country: 'GB';
  geo: GeoPoint;
  /** Approximate location for privacy (e.g. postcode centroid) */
  approximateGeo?: GeoPoint;
}

export interface ServiceArea {
  id: string;
  providerId: string;
  postcodes?: string[];
  cities?: string[];
  radiusMiles: number;
  center: GeoPoint;
  active: boolean;
}

// ============================================================================
// Users
// ============================================================================

export interface BaseUser {
  id: string;
  email: string;
  phone?: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string; // ISO
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  phoneVerified?: boolean;
  isActive: boolean;
  notificationPreferences: NotificationPreferences;
}

export interface CustomerProfile extends BaseUser {
  role: 'customer';
  defaultLocation?: Location;
  savedProviderIds: string[];
}

export interface ProviderProfile extends BaseUser {
  role: 'provider';
  businessName: string;
  businessType: BusinessType;
  description: string;
  status: ProviderStatus;
  verificationStatus: VerificationStatus;
  availabilityStatus: AvailabilityStatus;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseRate: number; // 0-1
  averageResponseTimeSeconds: number;
  acceptanceRate: number;
  cancellationRate: number;
  insuranceVerified: boolean;
  qualifications: string[];
  certifications: string[];
  portfolioImageIds: string[];
  serviceIds: string[];
  subServiceIds: string[];
  pricing: ProviderPricing;
  serviceAreas: ServiceArea[];
  workingHours: WorkingHours;
  emergencyAvailable: boolean;
  minimumJobValue?: number;
  maxTravelMiles?: number;
  stripeAccountId?: string;
  onboardingStep: number;
  onboardingCompleted: boolean;
}

export interface AdminProfile extends BaseUser {
  role: 'admin' | 'super_admin' | 'verification_staff' | 'support_staff' | 'finance_staff';
  permissions: string[];
}

export type User = CustomerProfile | ProviderProfile | AdminProfile;

// ============================================================================
// Services Taxonomy
// ============================================================================

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  parentId?: string | null;
  isEmergencyEligible: boolean;
  sortOrder: number;
  active: boolean;
  keywords: string[];
  synonyms: string[];
  requiredQualifications?: string[];
  defaultRadiusMiles: number;
}

export interface ServiceSubcategory extends ServiceCategory {
  parentId: string;
}

export interface ServiceKeyword {
  id: string;
  term: string; // normalized
  aliases: string[];
  serviceId: string;
  subcategoryId?: string;
  weight: number;
  active: boolean;
}

// ============================================================================
// Jobs & Matching
// ============================================================================

export interface JobRequest {
  id: string;
  customerId: string;
  description: string;
  classifiedServiceId?: string;
  classifiedSubServiceId?: string;
  classificationConfidence?: number;
  customerConfirmedService: boolean;
  location: Location;
  urgency: UrgencyLevel;
  photos: string[]; // storage paths or Cloudinary IDs
  videos?: string[];
  preferredTimeWindow?: {
    start: string;
    end: string;
  };
  budgetMin?: number;
  budgetMax?: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  matchingStartedAt?: string;
  matchedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface Match {
  id: string;
  jobId: string;
  providerId: string;
  score: number;
  scoreBreakdown: MatchScoreBreakdown;
  distanceMiles: number;
  estimatedEtaMinutes?: number;
  status: MatchStatus;
  notifiedAt?: string;
  respondedAt?: string;
  responseDeadline?: string;
  createdAt: string;
}

export interface MatchScoreBreakdown {
  serviceMatch: number;
  availability: number;
  distance: number;
  experience: number;
  rating: number;
  completedJobs: number;
  responseRate: number;
  price: number;
  total: number;
  weightsUsed: MatchWeights;
}

export interface MatchWeights {
  serviceMatch: number;
  availability: number;
  distance: number;
  experience: number;
  rating: number;
  completedJobs: number;
  responseRate: number;
  price: number;
}

// ============================================================================
// Quotes, Bookings, Payments
// ============================================================================

export interface Quote {
  id: string;
  jobId: string;
  matchId: string;
  providerId: string;
  customerId: string;
  labour: number;
  materials: number;
  callOutFee: number;
  additionalCharges: number;
  total: number;
  currency: 'GBP';
  estimatedDurationMinutes?: number;
  validUntil: string;
  notes?: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  reference: string; // e.g. JOB-UK-8F4A29
  jobId: string;
  customerId: string;
  providerId: string;
  quoteId?: string;
  serviceId: string;
  description: string;
  address: Location; // full address revealed after acceptance
  scheduledAt?: string;
  price: number;
  currency: 'GBP';
  platformFee: number;
  providerPayout: number;
  paymentStatus: PaymentStatus;
  status: JobStatus;
  cancellationPolicy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: 'GBP';
  status: PaymentStatus;
  platformFee: number;
  providerPayout: number;
  refundedAmount?: number;
  createdAt: string;
  updatedAt: string;
  webhookEvents?: string[];
}

// ============================================================================
// Messaging, Reviews, Notifications
// ============================================================================

export interface Message {
  id: string;
  conversationId: string;
  jobId?: string;
  bookingId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: string[];
  readAt?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: 'customer' | 'provider';
  overall: number; // 1-5
  quality?: number;
  communication?: number;
  punctuality?: number;
  value?: number;
  comment?: string;
  createdAt: string;
  isVisible: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  jobAlerts: boolean;
  messages: boolean;
  bookingUpdates: boolean;
  paymentNotifications: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
}

// ============================================================================
// Provider Supporting
// ============================================================================

export interface ProviderPricing {
  callOutFee?: number;
  hourlyRate?: number;
  minimumCharge?: number;
  emergencyMultiplier?: number;
  currency: 'GBP';
  pricingModel: 'fixed' | 'hourly' | 'quote_only' | 'mixed';
}

export interface WorkingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
  timezone: string; // e.g. Europe/London
}

export interface DayHours {
  open: string; // HH:mm
  close: string;
  closed?: boolean;
}

export interface VerificationDocument {
  id: string;
  providerId: string;
  type: 'identity' | 'business_registration' | 'insurance' | 'qualification' | 'address' | 'other';
  filePath: string; // secure storage path
  status: VerificationStatus;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

// ============================================================================
// Admin & System
// ============================================================================

export interface AdminLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  role: UserRole;
  subject: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  raisedBy: string;
  against: string;
  reason: string;
  evidence?: string[];
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: string;
  refundAmount?: number;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
