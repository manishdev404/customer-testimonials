'use client';

import { Check, Eye, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDate, formatRelativeTime } from '@/utils/format';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ImagePreview } from '@/components/ui/image-preview';
import { Rating } from '@/components/ui/rating';
import { AiBadge, SentimentBadge, StatusBadge } from '@/components/common/status-badge';
import type { Review, ReviewStatus } from '@/types';

export interface ReviewCardProps {
  review: Review;
  /** A moderation request for this review is in flight. */
  busy?: boolean;
  onModerate: (review: Review, status: ReviewStatus) => void;
  onViewDetails: (review: Review) => void;
}

export function ReviewCard({ review, busy, onModerate, onViewDetails }: ReviewCardProps) {
  const canApprove = review.status !== 'approved';
  const canReject = review.status !== 'rejected';

  return (
    <article
      className={cn(
        'animate-slide-up rounded-xl border border-gray-200 bg-white shadow-soft',
        'transition-all duration-200 ease-out hover:border-gray-300 hover:shadow-lift',
        busy && 'opacity-70',
      )}
    >
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar name={review.name} />

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-gray-900">{review.name}</h3>
              <p className="truncate text-[13px] text-gray-500">
                {review.company}
                <span className="mx-1.5 text-gray-300">·</span>
                <time dateTime={review.createdAt} title={formatDate(review.createdAt)}>
                  {formatRelativeTime(review.createdAt)}
                </time>
              </p>
            </div>
          </div>

          <StatusBadge status={review.status} />
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <Rating value={review.rating} />
          <span className="h-3 w-px bg-gray-200" aria-hidden="true" />
          <SentimentBadge sentiment={review.insights.sentiment} />
        </div>

        <blockquote className="text-sm leading-relaxed text-gray-700">
          <p className="line-clamp-4">{review.message}</p>
        </blockquote>

        {review.images.length > 0 && (
          <ImagePreview images={review.images} className="sm:grid-cols-2" />
        )}

        {/* AI summary — visually distinguished so a moderator never mistakes a
            generated digest for the customer's own words. */}
        <div className="rounded-lg border border-violet-100 bg-violet-50/40 px-3.5 py-3">
          <div className="flex items-center gap-2">
            <AiBadge />
            <span className="text-[12px] font-medium text-violet-900/70">Summary</span>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-gray-700">
            {review.insights.summary}
          </p>
        </div>
      </div>

      {/*
        Phones get an even three-column split so no action wraps to its own line
        and every target stays thumb-sized; from `sm` up it relaxes into the
        natural inline row with details pushed to the right.
      */}
      <footer className="grid grid-cols-3 items-center gap-2 border-t border-gray-100 px-4 py-3 sm:flex sm:flex-wrap sm:px-5">
        <Button
          variant="success"
          size="sm"
          className="min-w-0 px-2 sm:px-3"
          disabled={!canApprove || busy}
          loading={busy}
          onClick={() => onModerate(review, 'approved')}
          leftIcon={<Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        >
          {review.status === 'approved' ? 'Approved' : 'Approve'}
        </Button>

        <Button
          variant="danger"
          size="sm"
          className="min-w-0 px-2 sm:px-3"
          disabled={!canReject || busy}
          onClick={() => onModerate(review, 'rejected')}
          leftIcon={<X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        >
          {review.status === 'rejected' ? 'Rejected' : 'Reject'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="min-w-0 px-2 sm:ml-auto sm:px-3"
          onClick={() => onViewDetails(review)}
          leftIcon={<Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        >
          <span className="sm:hidden">Details</span>
          <span className="hidden sm:inline">View details</span>
        </Button>
      </footer>
    </article>
  );
}
