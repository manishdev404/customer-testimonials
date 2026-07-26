'use client';

import { CheckCircle2, Clock, Inbox, Sparkles, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatRating } from '@/utils/format';
import { StatCardSkeleton } from '@/components/ui/skeleton';
import type { ReviewStats, ReviewStatus } from '@/types';

interface StatDefinition {
  key: string;
  label: string;
  icon: LucideIcon;
  iconClass: string;
  value: (stats: ReviewStats) => number;
  caption?: (stats: ReviewStats) => string;
  /** Clicking the card filters the list to this status. */
  filter?: ReviewStatus | 'all';
  /** Spans both columns on phones, so five cards never leave an orphan row. */
  wideOnMobile?: boolean;
}

const STAT_DEFINITIONS: StatDefinition[] = [
  {
    key: 'total',
    label: 'Total reviews',
    icon: Inbox,
    iconClass: 'bg-gray-100 text-gray-600',
    value: (stats) => stats.total,
    caption: (stats) => `${formatRating(stats.averageRating)} average rating`,
    filter: 'all',
    wideOnMobile: true,
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: Clock,
    iconClass: 'bg-amber-50 text-amber-600',
    value: (stats) => stats.pending,
    caption: () => 'Awaiting moderation',
    filter: 'pending',
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: CheckCircle2,
    iconClass: 'bg-emerald-50 text-emerald-600',
    value: (stats) => stats.approved,
    caption: () => 'Live on the wall',
    filter: 'approved',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    icon: XCircle,
    iconClass: 'bg-rose-50 text-rose-600',
    value: (stats) => stats.rejected,
    caption: () => 'Never published',
    filter: 'rejected',
  },
  {
    key: 'positive',
    label: 'Positive reviews',
    icon: Sparkles,
    iconClass: 'bg-violet-50 text-violet-600',
    value: (stats) => stats.positive,
    caption: (stats) =>
      stats.total === 0
        ? 'No reviews yet'
        : `${Math.round((stats.positive / stats.total) * 100)}% rated 4+`,
  },
];

export interface StatsCardsProps {
  stats: ReviewStats;
  loading: boolean;
  onFilterSelect: (status: ReviewStatus | 'all') => void;
  activeFilter: ReviewStatus | 'all';
}

export function StatsCards({ stats, loading, onFilterSelect, activeFilter }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {STAT_DEFINITIONS.map((definition) => (
          <div key={definition.key} className={definition.wideOnMobile ? 'col-span-2 sm:col-span-1' : undefined}>
            <StatCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
      {STAT_DEFINITIONS.map((definition) => {
        const Icon = definition.icon;
        const clickable = definition.filter !== undefined;
        const active = clickable && definition.filter === activeFilter;

        const content = (
          <>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[13px] font-medium text-gray-500">{definition.label}</span>
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  definition.iconClass,
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>

            <p className="tabular mt-2.5 text-[26px] leading-none font-semibold tracking-tight text-gray-900">
              {definition.value(stats)}
            </p>

            {definition.caption && (
              <p className="mt-1.5 truncate text-[12px] text-gray-400">
                {definition.caption(stats)}
              </p>
            )}
          </>
        );

        const baseClass = cn(
          'rounded-xl border bg-white p-3.5 text-left shadow-soft transition-all duration-200 ease-out sm:p-4',
          definition.wideOnMobile && 'col-span-2 sm:col-span-1',
          active ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200',
          clickable && 'active:scale-[0.98] hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lift',
        );

        return clickable ? (
          <button
            key={definition.key}
            type="button"
            onClick={() => onFilterSelect(definition.filter!)}
            aria-pressed={active}
            className={baseClass}
          >
            {content}
          </button>
        ) : (
          <div key={definition.key} className={baseClass}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
