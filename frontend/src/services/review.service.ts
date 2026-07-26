import { http } from '@/lib/http';
import type {
  CreateReviewPayload,
  PublicTestimonial,
  Review,
  ReviewListResult,
  ReviewQuery,
  UpdateReviewPayload,
} from '@/types';

/**
 * The only module that knows about API endpoints. Components and stores depend
 * on these functions, never on URLs — which keeps transport concerns out of the
 * UI and makes the whole layer trivial to mock in tests.
 */

export function getReviews(query: ReviewQuery = {}): Promise<ReviewListResult> {
  return http.get<ReviewListResult>('/reviews', {
    params: {
      search: query.search || undefined,
      status: query.status && query.status !== 'all' ? query.status : undefined,
      rating: query.rating && query.rating !== 'all' ? query.rating : undefined,
      sort: query.sort,
    },
  });
}

export function createReview(payload: CreateReviewPayload): Promise<Review> {
  return http.post<Review>('/reviews', payload);
}

export function updateReview(id: string, payload: UpdateReviewPayload): Promise<Review> {
  return http.patch<Review>(`/reviews/${id}`, payload);
}

export function getPublicReviews(): Promise<PublicTestimonial[]> {
  return http.get<PublicTestimonial[]>('/testimonials');
}
