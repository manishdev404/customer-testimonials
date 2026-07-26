import type admin from 'firebase-admin';
import { getFirestore } from './firebase.js';
import type { ReviewDocument } from '../modules/reviews/review.types.js';

export const COLLECTIONS = {
  reviews: 'reviews',
} as const;

/**
 * Typed collection reference. The converter is the single place where the
 * Firestore document shape meets the TypeScript type, so every read and write
 * elsewhere is checked.
 */
const reviewConverter: admin.firestore.FirestoreDataConverter<ReviewDocument> = {
  toFirestore: (review) => review as admin.firestore.DocumentData,
  fromFirestore: (snapshot) => snapshot.data() as ReviewDocument,
};

export function reviewsCollection(): admin.firestore.CollectionReference<ReviewDocument> {
  return getFirestore().collection(COLLECTIONS.reviews).withConverter(reviewConverter);
}
