import { getStorageBucket } from '../../db/firebase.js';
import { logger } from '../../lib/logger.js';
import { CloudStorageImageStore } from './cloud-storage.store.js';
import { InlineImageStore } from './inline.store.js';
import type { ImageStore } from './image-store.js';

export * from './image-store.js';

let store: ImageStore | null = null;

/**
 * Picks the image store once, at boot, by probing whether the configured
 * bucket actually exists. Probing here rather than per-request means a missing
 * bucket is reported in the startup log instead of surfacing as a confusing
 * failure on someone's first upload.
 */
export async function initImageStore(): Promise<ImageStore> {
  if (store) return store;

  try {
    const bucket = getStorageBucket();
    const [exists] = await bucket.exists();

    if (exists) {
      logger.info('Image store: Firebase Cloud Storage', { bucket: bucket.name });
      store = new CloudStorageImageStore();
      return store;
    }

    logger.warn(
      `Image store: bucket "${bucket.name}" not found — falling back to inline storage. ` +
        'Enable Cloud Storage (Blaze plan) and redeploy to store images as objects.',
    );
  } catch (error) {
    logger.warn('Image store: Cloud Storage unreachable — falling back to inline storage.', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  store = new InlineImageStore();
  return store;
}

export function getImageStore(): ImageStore {
  if (!store) throw new Error('Image store not initialised. Call initImageStore() at boot.');
  return store;
}
