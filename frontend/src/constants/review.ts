import type { ReviewStatus, Sentiment, SortOrder } from '@/types';

/** Upload rules, enforced client-side and re-validated on the server. */
export const MAX_IMAGES = 2;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const MESSAGE_MIN_LENGTH = 20;
export const MESSAGE_MAX_LENGTH = 600;
export const NAME_MAX_LENGTH = 60;
export const COMPANY_MAX_LENGTH = 60;

/** Longest edge, in px, an uploaded image is downscaled to before transport. */
export const IMAGE_MAX_DIMENSION = 1400;
export const IMAGE_COMPRESSION_QUALITY = 0.82;

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** A review counts as "positive" for the stats card at this rating or above. */
export const POSITIVE_RATING_THRESHOLD = 4;

export const RATING_LABELS: Record<number, string> = {
  1: 'Terrible',
  2: 'Poor',
  3: 'Average',
  4: 'Great',
  5: 'Excellent',
};

export const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
};

export const STATUS_FILTER_OPTIONS: Array<{ label: string; value: ReviewStatus | 'all' }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export const RATING_FILTER_OPTIONS: Array<{ label: string; value: number | 'all' }> = [
  { label: 'All ratings', value: 'all' },
  { label: '5 stars', value: 5 },
  { label: '4 stars', value: 4 },
  { label: '3 stars', value: 3 },
  { label: '2 stars', value: 2 },
  { label: '1 star', value: 1 },
];

export const SORT_OPTIONS: Array<{ label: string; value: SortOrder }> = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
];

export const DEFAULT_FILTERS = {
  status: 'all',
  rating: 'all',
  sort: 'newest',
} as const;

/** Debounce for the moderation search box, in ms. */
export const SEARCH_DEBOUNCE_MS = 300;
