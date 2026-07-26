import { POSITIVE_RATING_THRESHOLD } from '@/constants';
import type { Review, ReviewQuery, ReviewStats } from '@/types';

/**
 * Query helpers shared by the API layer. Kept pure so the same logic can move
 * to a real database's WHERE clause without rewriting the semantics.
 */

function matchesSearch(review: Review, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  return [review.name, review.company, review.email, review.message].some((field) =>
    field.toLowerCase().includes(needle),
  );
}

export function filterReviews(reviews: Review[], query: ReviewQuery): Review[] {
  const { status = 'all', rating = 'all', search = '' } = query;

  return reviews.filter((review) => {
    if (status !== 'all' && review.status !== status) return false;
    if (rating !== 'all' && review.rating !== rating) return false;
    return matchesSearch(review, search);
  });
}

export function sortReviews(reviews: Review[], sort: ReviewQuery['sort'] = 'newest'): Review[] {
  const direction = sort === 'oldest' ? 1 : -1;
  return [...reviews].sort(
    (a, b) => direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
  );
}

/** Always computed over the complete dataset so the cards stay stable. */
export function calculateStats(reviews: Review[]): ReviewStats {
  const stats = reviews.reduce<ReviewStats>(
    (acc, review) => {
      acc.total += 1;
      acc[review.status] += 1;
      if (review.rating >= POSITIVE_RATING_THRESHOLD) acc.positive += 1;
      acc.averageRating += review.rating;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0, positive: 0, averageRating: 0 },
  );

  stats.averageRating = stats.total > 0 ? stats.averageRating / stats.total : 0;
  return stats;
}
