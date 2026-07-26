import { randomUUID } from 'node:crypto';
import { HttpError } from '../../lib/http-error.js';
import type { ReviewImage } from '../reviews/review.types.js';
import { decodeDataUrl, type ImageStore, type IncomingImage } from './image-store.js';

/**
 * Fallback used when no Cloud Storage bucket is available (Firebase requires
 * the Blaze plan to create one). Images stay on the Firestore document as data
 * URLs.
 *
 * Firestore caps a document at 1 MiB, so the total is guarded here: exceeding
 * it would make the write fail with an opaque INVALID_ARGUMENT. Rejecting with
 * a clear message beats a corrupt submission.
 */

/** 1 MiB minus headroom for the text fields, insights and search index. */
const MAX_TOTAL_INLINE_BYTES = 700 * 1024;

export class InlineImageStore implements ImageStore {
  readonly kind = 'inline' as const;

  async save(_reviewId: string, images: IncomingImage[]): Promise<ReviewImage[]> {
    if (images.length === 0) return [];

    const stored: ReviewImage[] = [];
    let total = 0;

    for (const image of images) {
      const decoded = decodeDataUrl(image.url);
      if (!decoded) throw HttpError.unprocessable('One of the uploaded images is malformed.');

      // The data URL, not the raw bytes, is what occupies the document.
      total += image.url.length;

      if (total > MAX_TOTAL_INLINE_BYTES) {
        throw HttpError.payloadTooLarge(
          'Those images are too large to store. Please use smaller images, or enable ' +
            'Firebase Cloud Storage to lift this limit.',
        );
      }

      stored.push({
        id: randomUUID(),
        name: image.name,
        url: image.url,
        size: decoded.buffer.byteLength,
      });
    }

    return stored;
  }

  async remove(): Promise<void> {
    // Inline images live on the document and disappear with it.
  }
}
