import type admin from 'firebase-admin';
import type { PublicTestimonial, Review, ReviewDocument } from './review.types.js';

/**
 * Translation between the Firestore document and the API representation.
 * Isolated here so the storage shape can change without rippling outward.
 */

export function toReview(
  snapshot: admin.firestore.QueryDocumentSnapshot<ReviewDocument> |
    admin.firestore.DocumentSnapshot<ReviewDocument>,
): Review {
  const data = snapshot.data();
  if (!data) throw new Error(`Review document ${snapshot.id} is empty.`);

  // `searchIndex` is an internal query aid and is deliberately not spread in.
  return {
    id: snapshot.id,
    name: data.name,
    email: data.email,
    company: data.company,
    rating: data.rating,
    message: data.message,
    images: data.images ?? [],
    status: data.status,
    insights: data.insights,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Strips everything the public wall must not expose: the submitter's email,
 * the moderation status, and the internal AI insights.
 */
export function toPublicTestimonial(review: Review): PublicTestimonial {
  return {
    id: review.id,
    name: review.name,
    company: review.company,
    rating: review.rating,
    message: review.message,
    // storagePath is an internal detail; keep it off the public payload.
    images: review.images.map(({ id, name, url, size }) => ({ id, name, url, size })),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

/** Lowercased haystack enabling substring search across the fields we match on. */
export function buildSearchIndex(
  fields: Pick<Review, 'name' | 'email' | 'company' | 'message'>,
): string {
  return [fields.name, fields.email, fields.company, fields.message].join(' ').toLowerCase();
}
