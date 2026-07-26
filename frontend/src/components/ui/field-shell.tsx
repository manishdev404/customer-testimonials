'use client';

import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FieldShellProps {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  /** Rendered on the label row, e.g. a character counter. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Shared label / hint / error chrome for form controls.
 *
 * Extracted so `Input`, `Textarea` and the custom controls (rating, uploader)
 * present identical spacing, wording and ARIA wiring instead of each
 * reimplementing it.
 */
export function FieldShell({
  id,
  label,
  error,
  hint,
  optional,
  action,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || action) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label htmlFor={id} className="text-[13px] font-medium text-gray-700">
              {label}
              {optional && <span className="ml-1.5 font-normal text-gray-400">Optional</span>}
            </label>
          )}
          {action}
        </div>
      )}

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-[13px] text-rose-600"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
