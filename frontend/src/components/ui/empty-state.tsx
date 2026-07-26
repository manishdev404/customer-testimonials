import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  /** Signals a failure rather than an empty result. */
  tone?: 'neutral' | 'danger';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  tone = 'neutral',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed bg-white px-6 py-16 text-center',
        tone === 'danger' ? 'border-rose-200 bg-rose-50/30' : 'border-gray-200',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl border',
          tone === 'danger'
            ? 'border-rose-200 bg-white text-rose-500'
            : 'border-gray-200 bg-gray-50 text-gray-400',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-gray-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
