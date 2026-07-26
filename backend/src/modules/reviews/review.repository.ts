import { reviewsCollection } from '../../db/collections.js';
import type { Review, ReviewDocument, ReviewStatus } from './review.types.js';
import { toReview } from './review.mapper.js';

/**
 * All Firestore access for reviews. The service layer never touches the SDK,
 * which keeps query mechanics in one place and the business rules testable.
 *
 * Reads fetch a single `orderBy(createdAt)` page and filter in memory rather
 * than composing `where` clauses. Two reasons: Firestore needs a hand-built
 * composite index for every where+orderBy combination, and it cannot do
 * substring matching at all — the dashboard's free-text search would be
 * impossible server-side. At one business's volume (hundreds of testimonials)
 * a single ordered read is well within a Firestore page and far simpler. The
 * boundary is documented on FETCH_LIMIT below.
 */

/**
 * Safety cap on a single read. Past this, the right move is Firestore
 * pagination with composite indexes plus a dedicated search index.
 */
const FETCH_LIMIT = 1000;

export const reviewRepository = {
  /** Newest first. Filtering and sorting are applied by the service. */
  async findAll(): Promise<Review[]> {
    const snapshot = await reviewsCollection()
      .orderBy('createdAt', 'desc')
      .limit(FETCH_LIMIT)
      .get();

    return snapshot.docs.map(toReview);
  },

  async findById(id: string): Promise<Review | null> {
    const snapshot = await reviewsCollection().doc(id).get();
    return snapshot.exists ? toReview(snapshot) : null;
  },

  async create(document: ReviewDocument): Promise<Review> {
    const reference = reviewsCollection().doc();
    await reference.set(document);

    return toReview(await reference.get());
  },

  /**
   * Reserves a document id before the write, so images can be uploaded to a
   * path that already includes the review they belong to.
   */
  nextId(): string {
    return reviewsCollection().doc().id;
  },

  async createWithId(id: string, document: ReviewDocument): Promise<Review> {
    const reference = reviewsCollection().doc(id);
    await reference.set(document);

    return toReview(await reference.get());
  },

  async updateStatus(id: string, status: ReviewStatus): Promise<Review | null> {
    const reference = reviewsCollection().doc(id);

    const snapshot = await reference.get();
    if (!snapshot.exists) return null;

    await reference.update({ status, updatedAt: new Date().toISOString() });
    return toReview(await reference.get());
  },

  /**
   * Most recent submission from an address, used for duplicate detection.
   * Equality + orderBy on different fields would need a composite index, so
   * this filters by email only and compares timestamps in the service.
   */
  async findByEmail(email: string): Promise<Review[]> {
    const snapshot = await reviewsCollection()
      .where('email', '==', email.toLowerCase())
      .limit(20)
      .get();

    return snapshot.docs.map(toReview);
  },

  async count(): Promise<number> {
    const snapshot = await reviewsCollection().count().get();
    return snapshot.data().count;
  },
};
