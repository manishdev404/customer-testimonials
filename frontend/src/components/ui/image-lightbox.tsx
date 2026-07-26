'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import type { PreviewImage } from './image-preview';

export interface ImageLightboxProps {
  images: PreviewImage[];
  /** Index of the visible image, or `null` when closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/**
 * Full-bleed image viewer with arrow-key navigation. Deliberately not built on
 * `Modal` — a lightbox wants no header chrome and an edge-to-edge canvas.
 */
export function ImageLightbox({ images, index, onIndexChange, onClose }: ImageLightboxProps) {
  const open = index !== null && images.length > 0;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useLockBodyScroll(open);
  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;

    function handleArrows(event: KeyboardEvent) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();

      const step = event.key === 'ArrowRight' ? 1 : -1;
      onIndexChange((index! + step + images.length) % images.length);
    }

    document.addEventListener('keydown', handleArrows);
    return () => document.removeEventListener('keydown', handleArrows);
  }, [open, index, images.length, onIndexChange]);

  if (!open || !mounted) return null;

  const current = images[index]!;
  const hasMultiple = images.length > 1;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${images.length}: ${current.name}`}
      className="animate-fade-in fixed inset-0 z-70 flex items-center justify-center bg-gray-950/90 p-3 sm:p-10"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image viewer"
        autoFocus
        className="absolute top-4 right-4 rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {hasMultiple && (
        <>
          <LightboxArrow
            direction="previous"
            onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
          />
          <LightboxArrow
            direction="next"
            onClick={() => onIndexChange((index + 1) % images.length)}
          />
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.url}
        alt={current.name}
        onClick={(event) => event.stopPropagation()}
        className="animate-scale-in max-h-full max-w-full rounded-lg object-contain shadow-overlay"
      />

      {hasMultiple && (
        <p className="tabular absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/80 backdrop-blur-sm">
          {index + 1} / {images.length}
        </p>
      )}
    </div>,
    document.body,
  );
}

function LightboxArrow({
  direction,
  onClick,
}: {
  direction: 'previous' | 'next';
  onClick: () => void;
}) {
  const Icon = direction === 'next' ? ChevronRight : ChevronLeft;

  return (
    <button
      type="button"
      aria-label={`${direction === 'next' ? 'Next' : 'Previous'} image`}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white ${
        direction === 'next' ? 'right-3 sm:right-6' : 'left-3 sm:left-6'
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
