import { z } from 'zod';

export const urgencySchema = z.enum([
  'emergency',
  'today',
  'within_24h',
  'this_week',
  'flexible',
]);

export const jobDescriptionSchema = z
  .string()
  .min(10, 'Please describe the job in a bit more detail (at least 10 characters).')
  .max(2000, 'Description is too long (max 2000 characters).');

export const ukPostcodeSchema = z
  .string()
  .trim()
  .min(5, 'Enter a valid UK postcode.')
  .max(10)
  .regex(
    /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
    'Enter a valid UK postcode (e.g. M1 1AE or SW1A 1AA).'
  );

export const jobRequestStep1Schema = z.object({
  description: jobDescriptionSchema,
  postcode: ukPostcodeSchema,
  urgency: urgencySchema,
});

export const jobRequestStep2Schema = z.object({
  serviceId: z.string().min(1, 'Please confirm or select a service.'),
  customerConfirmedService: z.boolean(),
});

export type JobRequestStep1 = z.infer<typeof jobRequestStep1Schema>;
export type JobRequestStep2 = z.infer<typeof jobRequestStep2Schema>;
export type UrgencyLevel = z.infer<typeof urgencySchema>;
