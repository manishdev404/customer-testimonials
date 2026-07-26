'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-gray-900 text-white shadow-xs hover:bg-gray-800 active:bg-gray-950 disabled:bg-gray-300 disabled:shadow-none',
  secondary:
    'bg-white text-gray-800 border border-gray-200 shadow-xs hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger:
    'bg-white text-rose-600 border border-rose-200 shadow-xs hover:bg-rose-50 hover:border-rose-300 active:bg-rose-100',
  success:
    'bg-white text-emerald-700 border border-emerald-200 shadow-xs hover:bg-emerald-50 hover:border-emerald-300 active:bg-emerald-100',
  link: 'bg-transparent text-gray-900 underline-offset-4 hover:underline p-0 h-auto',
};

/**
 * Sizes are mobile-first: comfortable tap targets by default, tightening from
 * `sm` up where a precise pointer is likely. A 32px control is fine under a
 * mouse and frustrating under a thumb.
 */
const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg sm:h-8 sm:px-3 sm:text-[13px]',
  md: 'h-11 px-4 text-[15px] gap-2 rounded-lg sm:h-9.5 sm:text-sm',
  lg: 'h-12 px-5 text-base gap-2 rounded-xl sm:h-11 sm:text-[15px]',
  icon: 'h-10 w-10 rounded-lg sm:h-9 sm:w-9',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth,
    className,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      // Communicates the busy state to assistive tech, not just visually.
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex items-center justify-center font-medium whitespace-nowrap',
        'transition-all duration-150 ease-out select-none',
        // Touch has no hover, so a press needs its own visible acknowledgement.
        'active:scale-[0.98] disabled:active:scale-100',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {/* min-w-0 lets a long label truncate rather than overflow a narrow cell. */}
      <span className="min-w-0 truncate">{children}</span>
      {!loading && rightIcon}
    </button>
  );
});
