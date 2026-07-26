import type { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-response';
import { reviewRepository } from '@/server/review-repository';
import { validateCreateReview } from '@/utils/validation';
import { REVIEW_STATUSES, type CreateReviewPayload, type ReviewQuery, type ReviewStatus } from '@/types';

/** In-memory store — never cache these responses. */
export const dynamic = 'force-dynamic';

function parseQuery(request: NextRequest): ReviewQuery {
  const params = request.nextUrl.searchParams;

  const status = params.get('status');
  const rating = Number(params.get('rating'));
  const sort = params.get('sort');

  return {
    search: params.get('search') ?? undefined,
    status: REVIEW_STATUSES.includes(status as ReviewStatus) ? (status as ReviewStatus) : 'all',
    rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : 'all',
    sort: sort === 'oldest' ? 'oldest' : 'newest',
  };
}

export async function GET(request: NextRequest) {
  try {
    return ok(await reviewRepository.list(parseQuery(request)));
  } catch {
    return fail('Could not load reviews.', 500);
  }
}

export async function POST(request: NextRequest) {
  let payload: Partial<CreateReviewPayload>;

  try {
    payload = (await request.json()) as Partial<CreateReviewPayload>;
  } catch {
    return fail('Request body must be valid JSON.', 400);
  }

  const errors = validateCreateReview(payload);
  if (Object.keys(errors).length > 0) {
    return fail('Please correct the highlighted fields.', 422, errors);
  }

  try {
    const review = await reviewRepository.create(payload as CreateReviewPayload);
    return ok(review, 201);
  } catch {
    return fail('Could not save your testimonial. Please try again.', 500);
  }
}
