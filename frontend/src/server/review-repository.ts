import { randomUUID } from 'node:crypto';
import type { CreateReviewPayload, Review, ReviewQuery, ReviewStatus } from '@/types';
import { calculateStats, filterReviews, sortReviews } from '@/utils/review';
import { analyseReview } from './insights';
import { createSeedReviews } from './seed';

/**
 * In-memory persistence for the demo.
 *
 * Everything the rest of the app touches goes through this module, so moving to
 * Postgres/Prisma means reimplementing these four methods and nothing else.
 * State hangs off `globalThis` so Next.js hot reloads don't wipe the data
 * mid-session.
 */

const STORE_KEY = Symbol.for('testify.review-store');

interface ReviewStore {
  reviews: Review[];
}

function getStore(): ReviewStore {
  const globalRef = globalThis as unknown as Record<symbol, ReviewStore | undefined>;
  if (!globalRef[STORE_KEY]) {
    globalRef[STORE_KEY] = { reviews: createSeedReviews() };
  }
  return globalRef[STORE_KEY];
}

/** Simulated latency so loading skeletons and disabled states are observable. */
const ARTIFICIAL_LATENCY_MS = 420;

function delay(ms = ARTIFICIAL_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const reviewRepository = {
  async list(query: ReviewQuery = {}) {
    await delay();
    const { reviews } = getStore();

    return {
      // Stats intentionally ignore the query: the cards describe the whole
      // inbox, not the current filter.
      stats: calculateStats(reviews),
      reviews: sortReviews(filterReviews(reviews, query), query.sort),
    };
  },

  async listApproved(): Promise<Review[]> {
    await delay();
    const { reviews } = getStore();
    return sortReviews(
      reviews.filter((review) => review.status === 'approved'),
      'newest',
    );
  },

  async create(payload: CreateReviewPayload): Promise<Review> {
    await delay(650);
    const store = getStore();
    const timestamp = new Date().toISOString();

    const review: Review = {
      id: `rev_${randomUUID()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      company: payload.company.trim(),
      rating: payload.rating,
      message: payload.message.trim(),
      images: payload.images.map((image) => ({
        id: `img_${randomUUID()}`,
        name: image.name,
        url: image.url,
        size: image.size,
      })),
      // Every submission starts unpublished — the wall only ever shows what a
      // moderator has explicitly approved.
      status: 'pending',
      insights: analyseReview(payload.message, payload.rating, payload.company.trim()),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    store.reviews.unshift(review);
    return review;
  },

  async updateStatus(id: string, status: ReviewStatus): Promise<Review | null> {
    await delay(300);
    const store = getStore();
    const index = store.reviews.findIndex((review) => review.id === id);
    if (index === -1) return null;

    const updated: Review = {
      ...store.reviews[index]!,
      status,
      updatedAt: new Date().toISOString(),
    };

    store.reviews[index] = updated;
    return updated;
  },
};
