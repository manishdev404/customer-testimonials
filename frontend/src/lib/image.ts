import {
  ACCEPTED_IMAGE_TYPES,
  IMAGE_COMPRESSION_QUALITY,
  IMAGE_MAX_DIMENSION,
  MAX_IMAGE_SIZE_BYTES,
} from '@/constants';
import { formatBytes } from '@/utils/format';

export interface ProcessedImage {
  name: string;
  url: string;
  size: number;
}

/**
 * Validates a single file against the upload rules.
 * @returns an error message, or `null` when the file is acceptable.
 */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" is not a supported image (JPG, PNG, WebP or GIF).`;
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `"${file.name}" is ${formatBytes(file.size)}. Each image must be under ${formatBytes(
      MAX_IMAGE_SIZE_BYTES,
    )}.`;
  }
  return null;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Could not read "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not decode image.'));
    image.src = dataUrl;
  });
}

/** Approximate byte length of a base64 data URL, without allocating a Blob. */
function dataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Downscales an image to `IMAGE_MAX_DIMENSION` on its longest edge and
 * re-encodes it as JPEG, so a 10 MB phone photo travels as a few hundred KB.
 *
 * Animated GIFs and any decode failure fall back to the untouched data URL —
 * a larger upload is better than a rejected one.
 */
export async function processImageFile(file: File): Promise<ProcessedImage> {
  const original = await readAsDataUrl(file);

  if (file.type === 'image/gif') {
    return { name: file.name, url: original, size: file.size };
  }

  try {
    const image = await loadImage(original);
    const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(image.width, image.height));

    // Already small enough — re-encoding would only lose quality.
    if (scale === 1 && file.size <= 400 * 1024) {
      return { name: file.name, url: original, size: file.size };
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable.');

    // Flatten transparency onto white so PNGs don't turn black as JPEG.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const compressed = canvas.toDataURL('image/jpeg', IMAGE_COMPRESSION_QUALITY);
    const compressedSize = dataUrlByteSize(compressed);

    return compressedSize < file.size
      ? { name: file.name, url: compressed, size: compressedSize }
      : { name: file.name, url: original, size: file.size };
  } catch {
    return { name: file.name, url: original, size: file.size };
  }
}
