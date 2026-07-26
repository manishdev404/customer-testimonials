'use client';

import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { FieldShell } from './field-shell';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  /** Current length; renders a live counter against `maxLength`. */
  currentLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, optional, currentLength, maxLength, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

  const showCounter = typeof currentLength === 'number' && typeof maxLength === 'number';
  const nearLimit = showCounter && currentLength >= maxLength * 0.9;

  return (
    <FieldShell
      id={textareaId}
      label={label}
      error={error}
      hint={hint}
      optional={optional}
      action={
        showCounter ? (
          <span
            // Announced politely so screen-reader users hear the limit
            // approaching without every keystroke interrupting them.
            aria-live="polite"
            className={cn(
              'tabular text-[12px] tracking-tight transition-colors',
              nearLimit ? 'font-medium text-amber-600' : 'text-gray-400',
              currentLength >= maxLength && 'text-rose-600',
            )}
          >
            {currentLength} / {maxLength}
          </span>
        ) : undefined
      }
    >
      <textarea
        ref={ref}
        id={textareaId}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'scrollbar-thin w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900',
          'placeholder:text-gray-400 shadow-xs min-h-[132px] leading-relaxed',
          'transition-all duration-150 ease-out',
          'hover:border-gray-300',
          'focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 focus:outline-none',
          'disabled:cursor-not-allowed disabled:bg-gray-50',
          error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : 'border-gray-200',
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
});
