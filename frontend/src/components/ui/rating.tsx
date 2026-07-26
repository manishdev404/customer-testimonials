'use client';

import { useState, type KeyboardEvent } from 'react';
import { Star } from 'lucide-react';
import { RATING_LABELS, RATING_MAX, RATING_MIN } from '@/constants';
import { cn } from '@/lib/cn';

const SIZE_STYLES = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-8 w-8 sm:h-7 sm:w-7',
} as const;

export interface RatingProps {
  value: number;
  size?: keyof typeof SIZE_STYLES;
  className?: string;
  /** Renders "4.0" next to the stars. */
  showValue?: boolean;
}

/** Read-only star display. */
export function Rating({ value, size = 'md', showValue, className }: RatingProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: RATING_MAX }, (_, index) => (
          <Star
            key={index}
            className={cn(
              SIZE_STYLES[size],
              index < value ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-300',
            )}
          />
        ))}
      </span>
      {showValue && <span className="tabular ml-1 text-sm text-gray-500">{value}.0</span>}
      <span className="sr-only">{value} out of 5 stars</span>
    </span>
  );
}

export interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
  name?: string;
  className?: string;
}

/**
 * Interactive rating control.
 *
 * Implemented as a radiogroup rather than a row of buttons so screen readers
 * announce it as a single choice, and arrow keys move between values the way
 * they do in a native radio list.
 */
export function RatingInput({ value, onChange, error, name, className }: RatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = ['ArrowRight', 'ArrowUp'].includes(event.key)
      ? 1
      : ['ArrowLeft', 'ArrowDown'].includes(event.key)
        ? -1
        : 0;

    if (step === 0) return;
    event.preventDefault();

    const next = Math.min(RATING_MAX, Math.max(RATING_MIN, (value || RATING_MIN) + step));
    onChange(next);
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <div
        role="radiogroup"
        aria-label="Star rating"
        aria-required="true"
        aria-invalid={error || undefined}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setHovered(null)}
        className={cn(
          'inline-flex items-center gap-1 rounded-lg p-1 transition-colors',
          error && 'ring-2 ring-rose-200',
        )}
      >
        {Array.from({ length: RATING_MAX }, (_, index) => {
          const starValue = index + 1;
          const filled = starValue <= active;

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              name={name}
              aria-checked={value === starValue}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''} — ${RATING_LABELS[starValue]}`}
              // Only the checked star is a tab stop; the group handles the rest.
              tabIndex={-1}
              onClick={() => onChange(starValue)}
              onMouseEnter={() => setHovered(starValue)}
              // p-1.5 on mobile lifts each star to a ~44px tap target.
              className="rounded-md p-1.5 transition-transform duration-150 ease-out hover:scale-110 active:scale-90 sm:p-0.5"
            >
              <Star
                className={cn(
                  SIZE_STYLES.lg,
                  'transition-colors duration-150',
                  filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-300',
                )}
              />
            </button>
          );
        })}
      </div>

      <span
        aria-live="polite"
        className={cn(
          'text-sm font-medium transition-opacity duration-150',
          active > 0 ? 'text-gray-700 opacity-100' : 'text-gray-400 opacity-0',
        )}
      >
        {active > 0 ? RATING_LABELS[active] : 'placeholder'}
      </span>
    </div>
  );
}
