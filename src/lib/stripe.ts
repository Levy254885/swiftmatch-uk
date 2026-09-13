/**
 * Stripe client scaffolding (UK marketplace).
 *
 * - Secret key and webhook secret: Cloud Functions / server only
 * - Publishable key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 * - Never create PaymentIntents from the browser with the secret key
 *
 * Flow:
 * 1. Customer accepts quote → callable createPaymentIntent
 * 2. Client confirms with Stripe.js using clientSecret
 * 3. Webhook payment_intent.succeeded → update booking
 */

export function isStripeConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export const DEFAULT_PLATFORM_FEE_RATE = 0.15;

export function splitPayment(totalGbp: number, feeRate = DEFAULT_PLATFORM_FEE_RATE) {
  const platformFee = Math.round(totalGbp * feeRate * 100) / 100;
  const providerPayout = Math.round((totalGbp - platformFee) * 100) / 100;
  return { platformFee, providerPayout, total: totalGbp };
}

export type CreatePaymentIntentRequest = {
  quoteId: string;
  jobId: string;
  bookingId?: string;
};

export type CreatePaymentIntentResponse = {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: 'gbp';
};

export async function requestPaymentIntent(
  _payload: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse | null> {
  if (!isStripeConfigured()) {
    return null;
  }
  throw new Error(
    'Stripe Functions not wired yet. Deploy createPaymentIntent and set publishable key.'
  );
}
