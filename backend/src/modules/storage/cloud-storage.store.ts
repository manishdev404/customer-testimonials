import { randomUUID } from 'node:crypto';
import { getStorageBucket } from '../../db/firebase.js';
import { HttpError } from '../../lib/http-error.js';
import { logger } from '../../lib/logger.js';
import type { ReviewImage } from '../reviews/review.types.js';
import { decodeDataUrl, type ImageStore, type IncomingImage } from './image-store.js';

/**
 * Stores images as objects in Firebase Cloud Storage and keeps only the URL on
 * the Firestore document — the correct shape, since a Firestore document is
 * capped at 1 MiB and two photos can exceed that on their own.
 */
export class CloudStorageImageStore implements ImageStore {
  readonly kind = 'cloud-storage' as const;

  async save(reviewId: string, images: IncomingImage[]): Promise<ReviewImage[]> {
    if (images.length === 0) return [];

    const bucket = getStorageBucket();

    return Promise.all(
      images.map(async (image) => {
        const decoded = decodeDataUrl(image.url);
        if (!decoded) throw HttpError.unprocessable('One of the uploaded images is malformed.');

        const id = randomUUID();
        const storagePath = `testimonials/${reviewId}/${id}.${decoded.extension}`;
        const file = bucket.file(storagePath);

        // The download token is what makes the object readable over the public
        // Firebase URL without opening up the whole bucket.
        const downloadToken = randomUUID();

        await file.save(decoded.buffer, {
          resumable: false,
          contentType: decoded.contentType,
          metadata: {
            cacheControl: 'public, max-age=31536000, immutable',
            metadata: {
              firebaseStorageDownloadTokens: downloadToken,
              originalName: image.name,
              reviewId,
            },
          },
        });

        return {
          id,
          name: image.name,
          url:
            `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
            `${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`,
          size: decoded.buffer.byteLength,
          storagePath,
        } satisfies ReviewImage;
      }),
    );
  }

  async remove(images: ReviewImage[]): Promise<void> {
    const bucket = getStorageBucket();

    await Promise.all(
      images
        .filter((image) => image.storagePath)
        .map((image) =>
          bucket
            .file(image.storagePath!)
            .delete()
            // Cleanup failures must not fail the caller's request.
            .catch((error: unknown) =>
              logger.warn('Could not delete storage object', {
                path: image.storagePath,
                error: error instanceof Error ? error.message : String(error),
              }),
            ),
        ),
    );
  }
}
