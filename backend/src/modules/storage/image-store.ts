import type { ReviewImage } from '../reviews/review.types.js';

export interface IncomingImage {
  name: string;
  /** base64 data URL, as produced by the browser after compression. */
  url: string;
  size: number;
}

/**
 * Where testimonial images live.
 *
 * Two implementations exist because Firebase Cloud Storage requires the Blaze
 * plan: `CloudStorageImageStore` is the correct production path, and
 * `InlineImageStore` keeps the product working on a free Spark project. The
 * rest of the app depends only on this interface, so which one is active never
 * leaks into the review module.
 */
export interface ImageStore {
  readonly kind: 'cloud-storage' | 'inline';

  /** Persists images for a review and returns their stored representation. */
  save(reviewId: string, images: IncomingImage[]): Promise<ReviewImage[]>;

  /** Best-effort cleanup; must not throw. */
  remove(images: ReviewImage[]): Promise<void>;
}

export interface DecodedImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

const DATA_URL_PATTERN = /^data:(image\/(jpeg|png|webp|gif));base64,(.+)$/;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/** Shared by both stores: turns a data URL into raw bytes. */
export function decodeDataUrl(dataUrl: string): DecodedImage | null {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) return null;

  const contentType = match[1]!;
  const buffer = Buffer.from(match[3]!, 'base64');

  return { buffer, contentType, extension: EXTENSIONS[contentType] ?? 'bin' };
}
