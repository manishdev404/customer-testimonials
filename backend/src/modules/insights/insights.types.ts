import type { ReviewInsights } from '../reviews/review.types.js';

export interface InsightsRequest {
  message: string;
  rating: number;
  company: string;
}

/**
 * A sentiment + summary analyser. Two implementations exist (a hosted model and
 * a local heuristic) and the review module depends only on this interface, so
 * swapping providers never touches business logic.
 */
export interface InsightsProvider {
  readonly name: string;
  analyse(request: InsightsRequest): Promise<ReviewInsights>;
}
