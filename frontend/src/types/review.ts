/**
 * Core domain model. This is the single source of truth for the shape of a
 * testimonial across the API layer, the store and the UI.
 */

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const SENTIMENTS = ['positive', 'neutral', 'negative'] as const;
export type Sentiment = (typeof SENTIMENTS)[number];

export interface ReviewImage {
  id: string;
  /** Original filename, shown in the preview tile. */
  name: string;
  /** Data URL. A production backend would swap this for an object-storage URL. */
  url: string;
  /** Size in bytes after client-side compression. */
  size: number;
}

/** Output of the sentiment analyser, stored alongside the review. */
export interface ReviewInsights {
  sentiment: Sentiment;
  /** Short, human-readable digest of the testimonial. */
  summary: string;
}

export interface Review {
  id: string;
  name: string;
  email: string;
  company: string;
  rating: number;
  message: string;
  images: ReviewImage[];
  status: ReviewStatus;
  insights: ReviewInsights;
  createdAt: string;
  updatedAt: string;
}

/**
 * The public wall never exposes the submitter's email address.
 */
export type PublicTestimonial = Omit<Review, 'email' | 'status' | 'insights'>;

/** Payload accepted by `POST /api/reviews`. */
export interface CreateReviewPayload {
  name: string;
  email: string;
  company: string;
  rating: number;
  message: string;
  images: Array<Pick<ReviewImage, 'name' | 'url' | 'size'>>;
}

/** Payload accepted by `PATCH /api/reviews/:id`. */
export interface UpdateReviewPayload {
  status: ReviewStatus;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  positive: number;
  averageRating: number;
}

export type SortOrder = 'newest' | 'oldest';

/** `'all'` is a UI-level sentinel meaning "do not narrow on this dimension". */
export interface ReviewFilters {
  status: ReviewStatus | 'all';
  rating: number | 'all';
  sort: SortOrder;
}

export interface ReviewQuery extends Partial<ReviewFilters> {
  search?: string;
}
