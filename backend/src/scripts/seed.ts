import { reviewsCollection } from '../db/collections.js';
import { verifyFirestoreConnection } from '../db/firebase.js';
import { logger } from '../lib/logger.js';
import { SEED_REVIEWS } from '../data/seed-reviews.js';
import { HeuristicInsightsProvider } from '../modules/insights/heuristic.provider.js';
import { buildSearchIndex } from '../modules/reviews/review.mapper.js';
import { reviewRepository } from '../modules/reviews/review.repository.js';
import type { ReviewDocument } from '../modules/reviews/review.types.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Seeding uses the heuristic analyser rather than the hosted model on purpose:
 * ten model calls on every cold start would be slow, cost quota, and make the
 * demo data non-deterministic.
 */
const insights = new HeuristicInsightsProvider();

export async function seedReviews(): Promise<number> {
  const now = Date.now();
  // One batch, so seeding is atomic — a partial seed would be worse than none.
  const batch = reviewsCollection().firestore.batch();

  for (const seed of SEED_REVIEWS) {
    const createdAt = new Date(now - seed.daysAgo * DAY_MS).toISOString();

    const document: ReviewDocument = {
      name: seed.name,
      email: seed.email,
      company: seed.company,
      rating: seed.rating,
      message: seed.message,
      images: [],
      status: seed.status,
      insights: await insights.analyse({
        message: seed.message,
        rating: seed.rating,
        company: seed.company,
      }),
      createdAt,
      updatedAt: createdAt,
      searchIndex: buildSearchIndex(seed),
    };

    batch.set(reviewsCollection().doc(), document);
  }

  await batch.commit();
  return SEED_REVIEWS.length;
}

/** Called at boot. Never overwrites existing data. */
export async function seedIfEmpty(): Promise<void> {
  const existing = await reviewRepository.count();

  if (existing > 0) {
    logger.info(`Seed skipped: ${existing} reviews already present`);
    return;
  }

  const count = await seedReviews();
  logger.info(`Seeded ${count} demo reviews`);
}

// `npm run db:seed` — force a seed regardless of current contents.
if (process.argv[1]?.includes('seed')) {
  void (async () => {
    try {
      await verifyFirestoreConnection();
      logger.info(`Seeded ${await seedReviews()} demo reviews`);
      process.exit(0);
    } catch (error) {
      logger.error('Seed failed', {
        message: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    }
  })();
}
