import type { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-response';
import { reviewRepository } from '@/server/review-repository';
import { REVIEW_STATUSES, type ReviewStatus, type UpdateReviewPayload } from '@/types';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  let payload: Partial<UpdateReviewPayload>;
  try {
    payload = (await request.json()) as Partial<UpdateReviewPayload>;
  } catch {
    return fail('Request body must be valid JSON.', 400);
  }

  if (!REVIEW_STATUSES.includes(payload.status as ReviewStatus)) {
    return fail(`Status must be one of: ${REVIEW_STATUSES.join(', ')}.`, 422, {
      status: 'Invalid status.',
    });
  }

  try {
    const review = await reviewRepository.updateStatus(id, payload.status as ReviewStatus);
    return review ? ok(review) : fail('Review not found.', 404);
  } catch {
    return fail('Could not update the review. Please try again.', 500);
  }
}
