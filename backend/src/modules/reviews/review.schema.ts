import { z } from 'zod';
import {
  COMPANY_MAX_LENGTH,
  MAX_IMAGES,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  NAME_MAX_LENGTH,
  RATING_MAX,
  RATING_MIN,
} from './review.constants.js';
import { REVIEW_STATUSES } from './review.types.js';

/**
 * Request validation. The frontend validates the same rules for immediate
 * feedback, but this is the authority — a client can always be bypassed.
 */

const dataUrlPattern = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;

const imageSchema = z.object({
  name: z.string().trim().min(1).max(200),
  // Only accept inline base64 images; an arbitrary remote URL here would let a
  // caller point the wall at content we never validated.
  url: z.string().regex(dataUrlPattern, 'Image must be a base64-encoded data URL.'),
  size: z.number().int().nonnegative(),
});

export const createReviewSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(NAME_MAX_LENGTH),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  company: z
    .string()
    .trim()
    .min(2, 'Company must be at least 2 characters.')
    .max(COMPANY_MAX_LENGTH),
  rating: z
    .number()
    .int('Select a star rating.')
    .min(RATING_MIN, 'Select a star rating.')
    .max(RATING_MAX, 'Select a star rating.'),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN_LENGTH, `Testimonial must be at least ${MESSAGE_MIN_LENGTH} characters.`)
    .max(MESSAGE_MAX_LENGTH, `Testimonial must be under ${MESSAGE_MAX_LENGTH} characters.`),
  images: z
    .array(imageSchema)
    .max(MAX_IMAGES, `You can upload at most ${MAX_IMAGES} images.`)
    .default([]),
});

export const updateReviewSchema = z.object({
  status: z.enum(REVIEW_STATUSES, {
    errorMap: () => ({ message: `Status must be one of: ${REVIEW_STATUSES.join(', ')}.` }),
  }),
});

export const reviewQuerySchema = z.object({
  status: z.enum([...REVIEW_STATUSES, 'all']).catch('all'),
  rating: z
    .union([z.coerce.number().int().min(RATING_MIN).max(RATING_MAX), z.literal('all')])
    .catch('all'),
  sort: z.enum(['newest', 'oldest']).catch('newest'),
  search: z.string().trim().max(200).catch(''),
});

export type CreateReviewBody = z.infer<typeof createReviewSchema>;
export type UpdateReviewBody = z.infer<typeof updateReviewSchema>;

/** Flattens a ZodError into the `{ field: message }` map the API returns. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const issue of error.errors) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fields[key]) fields[key] = issue.message;
  }

  return fields;
}
