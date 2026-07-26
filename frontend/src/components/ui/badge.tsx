import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

const TONE_STYLES: Record<BadgeTone, string> = {
  neutral: 'bg-gray-50 text-gray-700 border-gray-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  accent: 'bg-violet-50 text-violet-700 border-violet-200',
};

const DOT_STYLES: Record<BadgeTone, string> = {
  neutral: 'bg-gray-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  accent: 'bg-violet-500',
};

export interface BadgeProps {
  tone?: BadgeTone;
  /** Renders a leading status dot. */
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', dot, icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5',
        'text-[12px] leading-5 font-medium whitespace-nowrap',
        TONE_STYLES[tone],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT_STYLES[tone])} aria-hidden="true" />}
      {icon}
      {children}
    </span>
  );
}
