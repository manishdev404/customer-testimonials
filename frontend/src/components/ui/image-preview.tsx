'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatBytes } from '@/utils/format';

export interface PreviewImage {
  name: string;
  url: string;
  size: number;
}

export interface ImagePreviewProps {
  images: PreviewImage[];
  /** Omit to render a read-only gallery. */
  onRemove?: (index: number) => void;
  /** Called when a tile is activated, e.g. to open a lightbox. */
  onOpen?: (index: number) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Thumbnail grid used both by the uploader (removable) and by the moderation
 * card / details modal (read-only).
 *
 * Uses a plain <img> rather than next/image: sources are data URLs whose
 * dimensions aren't known ahead of time, so the optimiser adds nothing.
 */
export function ImagePreview({
  images,
  onRemove,
  onOpen,
  disabled,
  className,
}: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <ul className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3', className)}>
      {images.map((image, index) => {
        const clickable = Boolean(onOpen);

        return (
          <li
            key={`${image.name}-${index}`}
            className="group animate-fade-in relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-xs"
          >
            <div
              className={cn('aspect-4/3 w-full', clickable && 'cursor-zoom-in')}
              {...(clickable
                ? {
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': `View ${image.name}`,
                    onClick: () => onOpen?.(index),
                    onKeyDown: (event: React.KeyboardEvent) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpen?.(index);
                      }
                    },
                  }
                : {})}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
            </div>

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={disabled}
                aria-label={`Remove ${image.name}`}
                className={cn(
                  'absolute top-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-lg',
                  'bg-gray-950/70 text-white backdrop-blur-sm transition-all duration-150',
                  // Always visible on touch — a hover-only control is simply
                  // unreachable there. Reveal-on-hover only where hover exists.
                  'opacity-100 can-hover:opacity-0 can-hover:group-hover:opacity-100',
                  'focus-visible:opacity-100 hover:bg-gray-950 active:scale-95 disabled:cursor-not-allowed',
                  'can-hover:h-7 can-hover:w-7',
                )}
              >
                <X className="h-4 w-4 can-hover:h-3.5 can-hover:w-3.5" aria-hidden="true" />
              </button>
            )}

            <div className="border-t border-gray-200 bg-white px-2.5 py-1.5">
              <p className="truncate text-[12px] font-medium text-gray-700">{image.name}</p>
              <p className="tabular text-[11px] text-gray-400">{formatBytes(image.size)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
