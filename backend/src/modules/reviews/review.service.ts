import { HttpError } from '../../lib/http-error.js';
import { logger } from '../../lib/logger.js';
import { insightsService } from '../insights/insights.service.js';
import { getImageStore } from '../storage/index.js';
import { DUPLICATE_WINDOW_MS, POSITIVE_RATING_THRESHOLD } from './review.constants.js';
import { buildSearchIndex, toPublicTestimonial } from './review.mapper.js';
import { reviewRepository } from './review.repository.js';
import type {
  CreateReviewInput,
  PublicTestimonial,
  Review,
  ReviewDocument,
  ReviewListResult,
  ReviewQuery,
  ReviewStats,
  ReviewStatus,
  SortOrder,
} from './review.types.js';

/**
 * Business rules for testimonials. Holds every decision that is not storage
 * mechanics: moderation defaults, duplicate handling, stats and the
 * approved-only guarantee for the public wall.
 */

function matchesSearch(review: Review, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  return [review.name, review.company, review.email, review.message].some((field) =>
    field.toLowerCase().includes(needle),
  );
}

function filterReviews(reviews: Review[], query: ReviewQuery): Review[] {
  const { status = 'all', rating = 'all', search = '' } = query;

  return reviews.filter((review) => {
    if (status !== 'all' && review.status !== status) return false;
    if (rating !== 'all' && review.rating !== rating) return false;
    return matchesSearch(review, search);
  });
}

function sortReviews(reviews: Review[], sort: SortOrder = 'newest'): Review[] {
  const direction = sort === 'oldest' ? 1 : -1;

  return [...reviews].sort(
    (a, b) => direction * (Date.parse(a.createdAt) - Date.parse(b.createdAt)),
  );
}

/** Always computed over the full dataset, never the filtered subset. */
function calculateStats(reviews: Review[]): ReviewStats {
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

export const reviewService = {
  async list(query: ReviewQuery): Promise<ReviewListResult> {
    const all = await reviewRepository.findAll();

    return {
      // Stats describe the whole inbox so the cards don't move when the
      // moderator narrows the list.
      stats: calculateStats(all),
      reviews: sortReviews(filterReviews(all, query), query.sort),
    };
  },

  /**
   * The public wall. Approved-only is enforced here rather than trusting a
   * caller-supplied filter, so a pending or rejected testimonial cannot leak
   * through a bug in the client.
   */
  async listPublic(): Promise<PublicTestimonial[]> {
    const all = await reviewRepository.findAll();

    return sortReviews(
      all.filter((review) => review.status === 'approved'),
      'newest',
    ).map(toPublicTestimonial);
  },

  async getById(id: string): Promise<Review> {
    const review = await reviewRepository.findById(id);
    if (!review) throw HttpError.notFound('Review not found.');
    return review;
  },

  async create(input: CreateReviewInput): Promise<Review> {
    await assertNotDuplicate(input);

    // The id is reserved first so uploaded objects can be filed under the
    // review they belong to, which makes cleanup straightforward.
    const id = reviewRepository.nextId();
    const imageStore = getImageStore();
    const images = await imageStore.save(id, input.images);

    try {
      const insights = await insightsService.analyse({
        message: input.message,
        rating: input.rating,
        company: input.company,
      });

      const timestamp = new Date().toISOString();

      const document: ReviewDocument = {
        name: input.name,
        email: input.email.toLowerCase(),
        company: input.company,
        rating: input.rating,
        message: input.message,
        images,
        // Every submission starts unpublished. The wall only ever shows what a
        // moderator has explicitly approved.
        status: 'pending',
        insights,
        createdAt: timestamp,
        updatedAt: timestamp,
        searchIndex: buildSearchIndex(input),
      };

      return await reviewRepository.createWithId(id, document);
    } catch (error) {
      // Don't leave orphaned objects in the bucket if the write fails.
      await imageStore.remove(images);
      throw error;
    }
  },

  async updateStatus(id: string, status: ReviewStatus): Promise<Review> {
    const updated = await reviewRepository.updateStatus(id, status);
    if (!updated) throw HttpError.notFound('Review not found.');

    logger.info('Review moderated', { id, status });
    return updated;
  },
};

/**
 * Rejects a repeat submission from the same address inside the duplicate
 * window. Cheap junk/accidental-double-submit protection that needs no extra
 * infrastructure; it deliberately does not block a genuine second testimonial
 * sent later.
 */
async function assertNotDuplicate(input: CreateReviewInput): Promise<void> {
  const existing = await reviewRepository.findByEmail(input.email);
  if (existing.length === 0) return;

  const cutoff = Date.now() - DUPLICATE_WINDOW_MS;
  const recent = existing.find((review) => Date.parse(review.createdAt) > cutoff);

  if (recent) {
    throw new HttpError(
      'We already have a recent testimonial from this email address. Thank you!',
      409,
      { fields: { email: 'A testimonial from this address was submitted in the last 24 hours.' } },
    );
  }
}
