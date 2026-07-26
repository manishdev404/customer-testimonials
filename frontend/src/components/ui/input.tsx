'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { FieldShell } from './field-shell';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  optional?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, optional, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <FieldShell
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      optional={optional}
    >
      <div className="relative">
        {leftIcon && (
          <span
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-lg border bg-white px-3 text-sm text-gray-900',
            'placeholder:text-gray-400 shadow-xs',
            'transition-all duration-150 ease-out',
            'hover:border-gray-300',
            'focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 focus:outline-none',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            leftIcon && 'pl-9',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
              : 'border-gray-200',
            className,
          )}
          {...props}
        />
      </div>
    </FieldShell>
  );
});
