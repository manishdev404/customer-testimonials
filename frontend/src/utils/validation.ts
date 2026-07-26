import {
  COMPANY_MAX_LENGTH,
  MAX_IMAGES,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  NAME_MAX_LENGTH,
  RATING_MAX,
  RATING_MIN,
} from '@/constants';
import type { CreateReviewPayload } from '@/types';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Server-side validation of a submission payload. The form validates the same
 * rules through React Hook Form for instant feedback; this is the authority,
 * because a client can always be bypassed.
 *
 * @returns field-keyed error messages; empty when the payload is valid.
 */
export function validateCreateReview(payload: Partial<CreateReviewPayload>): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = payload.name?.trim() ?? '';
  const email = payload.email?.trim() ?? '';
  const company = payload.company?.trim() ?? '';
  const message = payload.message?.trim() ?? '';

  if (name.length < 2) errors.name = 'Name must be at least 2 characters.';
  else if (name.length > NAME_MAX_LENGTH) errors.name = `Name must be under ${NAME_MAX_LENGTH} characters.`;

  if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';

  if (company.length < 2) errors.company = 'Company must be at least 2 characters.';
  else if (company.length > COMPANY_MAX_LENGTH)
    errors.company = `Company must be under ${COMPANY_MAX_LENGTH} characters.`;

  if (
    typeof payload.rating !== 'number' ||
    !Number.isInteger(payload.rating) ||
    payload.rating < RATING_MIN ||
    payload.rating > RATING_MAX
  ) {
    errors.rating = 'Select a star rating.';
  }

  if (message.length < MESSAGE_MIN_LENGTH)
    errors.message = `Testimonial must be at least ${MESSAGE_MIN_LENGTH} characters.`;
  else if (message.length > MESSAGE_MAX_LENGTH)
    errors.message = `Testimonial must be under ${MESSAGE_MAX_LENGTH} characters.`;

  if (payload.images && payload.images.length > MAX_IMAGES)
    errors.images = `You can upload at most ${MAX_IMAGES} images.`;

  return errors;
}
