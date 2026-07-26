/**
 * Domain model. Mirrors the frontend's `types/review.ts` — they are separate
 * codebases, so the contract is duplicated deliberately and must stay in sync.
 */

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const SENTIMENTS = ['positive', 'neutral', 'negative'] as const;
export type Sentiment = (typeof SENTIMENTS)[number];

export interface ReviewImage {
  id: string;
  name: string;
  /** Public Cloud Storage URL, or an inline data URL on the fallback path. */
  url: string;
  size: number;
  /** Storage object path, kept so the file can be deleted with the review. */
  storagePath?: string;
}

export interface ReviewInsights {
  sentiment: Sentiment;
  summary: string;
  /** Which analyser produced this — 'groq' or 'heuristic'. */
  source: string;
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

/** The public wall never exposes email, moderation status or AI insights. */
export type PublicTestimonial = Omit<Review, 'email' | 'status' | 'insights'>;

/**
 * Shape stored in Firestore. Timestamps are ISO strings rather than Firestore
 * Timestamps so documents are portable and the mapper stays SDK-agnostic;
 * lexicographic ordering of ISO-8601 matches chronological ordering, so
 * `orderBy('createdAt')` still sorts correctly.
 */
export interface ReviewDocument {
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
  /** Lowercased haystack for substring search; never returned to clients. */
  searchIndex: string;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  positive: number;
  averageRating: number;
}

export interface ReviewListResult {
  reviews: Review[];
  stats: ReviewStats;
}

export type SortOrder = 'newest' | 'oldest';

export interface ReviewQuery {
  status?: ReviewStatus | 'all';
  rating?: number | 'all';
  sort?: SortOrder;
  search?: string;
}

export interface CreateReviewInput {
  name: string;
  email: string;
  company: string;
  rating: number;
  message: string;
  images: Array<{ name: string; url: string; size: number }>;
}
