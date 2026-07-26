'use client';

import { useCallback, useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES, MAX_IMAGE_SIZE_BYTES } from '@/constants';
import { cn } from '@/lib/cn';
import { processImageFile, validateImageFile, type ProcessedImage } from '@/lib/image';
import { formatBytes } from '@/utils/format';
import { ImagePreview } from './image-preview';

export interface ImageUploadProps {
  value: ProcessedImage[];
  onChange: (images: ProcessedImage[]) => void;
  /** Surfaced for validation errors owned by the parent form. */
  error?: string;
  disabled?: boolean;
  maxImages?: number;
}

/**
 * Drag-and-drop image uploader with click-to-browse fallback.
 *
 * Files are validated, then downscaled and re-encoded in the browser before
 * they leave the page, so a 10 MB photo becomes a small payload. The dropzone
 * is a real <button>, which makes it reachable by keyboard for free.
 */
export function ImageUpload({
  value,
  onChange,
  error,
  disabled,
  maxImages = MAX_IMAGES,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const descriptionId = useId();

  const remaining = maxImages - value.length;
  const isFull = remaining <= 0;
  const isBusy = processing || Boolean(disabled);
  const visibleError = error ?? localError;

  const addFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setLocalError(null);

      const incoming = Array.from(fileList);

      if (incoming.length > remaining) {
        setLocalError(
          remaining === 0
            ? `You've already added ${maxImages} images. Remove one to add another.`
            : `You can add ${remaining} more image${remaining === 1 ? '' : 's'}.`,
        );
        if (remaining === 0) return;
      }

      const accepted: File[] = [];
      for (const file of incoming.slice(0, remaining)) {
        const problem = validateImageFile(file);
        if (problem) {
          setLocalError(problem);
          continue;
        }
        accepted.push(file);
      }

      if (accepted.length === 0) return;

      setProcessing(true);
      try {
        const processed = await Promise.all(accepted.map(processImageFile));
        onChange([...value, ...processed]);
      } catch {
        setLocalError('Could not process that image. Please try a different file.');
      } finally {
        setProcessing(false);
      }
    },
    [maxImages, onChange, remaining, value],
  );

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void addFiles(event.target.files);
    // Reset so picking the same file twice still fires a change event.
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    if (isBusy || isFull) return;
    void addFiles(event.dataTransfer.files);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    if (!isBusy && !isFull) setDragging(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple={remaining > 1}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragging(false)}
        disabled={isBusy || isFull}
        aria-describedby={descriptionId}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8',
          'transition-all duration-200 ease-out',
          dragging
            ? 'scale-[1.01] border-gray-900 bg-gray-50'
            : 'border-gray-200 bg-gray-50/40 hover:border-gray-300 hover:bg-gray-50',
          (isBusy || isFull) && 'cursor-not-allowed opacity-60 hover:border-gray-200',
          visibleError && !dragging && 'border-rose-200 bg-rose-50/30',
        )}
      >
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-xs transition-transform duration-200',
            dragging && 'scale-110 text-gray-900',
          )}
        >
          {processing ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
          ) : isFull ? (
            <ImagePlus className="h-4.5 w-4.5" aria-hidden="true" />
          ) : (
            <UploadCloud className="h-4.5 w-4.5" aria-hidden="true" />
          )}
        </span>

        <span className="text-sm font-medium text-gray-700">
          {processing
            ? 'Optimising images...'
            : isFull
              ? `Maximum of ${maxImages} images added`
              : dragging
                ? 'Drop to upload'
                : 'Drag & drop images, or click to browse'}
        </span>

        <span id={descriptionId} className="text-[12px] text-gray-400">
          Up to {maxImages} images · JPG, PNG, WebP or GIF · max {formatBytes(MAX_IMAGE_SIZE_BYTES)} each
        </span>
      </button>

      {visibleError && (
        <p role="alert" className="text-[13px] text-rose-600">
          {visibleError}
        </p>
      )}

      <ImagePreview
        images={value}
        disabled={isBusy}
        onRemove={(index) => {
          setLocalError(null);
          onChange(value.filter((_, itemIndex) => itemIndex !== index));
        }}
      />
    </div>
  );
}
