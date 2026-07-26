import type { Review, ReviewStats } from './review';

/**
 * Every endpoint answers with this envelope so the client can branch on a
 * single, predictable shape instead of guessing from the HTTP status alone.
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorBody };

export interface ApiErrorBody {
  message: string;
  /** Field-level validation messages, keyed by field name. */
  fields?: Record<string, string>;
}

export interface ReviewListResult {
  reviews: Review[];
  /** Always computed over the full dataset, never over the filtered subset. */
  stats: ReviewStats;
}
