'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ExternalLink, Inbox, RefreshCw, SearchX } from 'lucide-react';
import { SEARCH_DEBOUNCE_MS } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useReviewStore } from '@/store';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ReviewCardSkeleton } from '@/components/ui/skeleton';
import { useReviewModeration } from '../hooks/use-review-moderation';
import { ReviewCard } from './review-card';
import { ReviewDetailsModal } from './review-details-modal';
import { ReviewFilters } from './review-filters';
import { StatsCards } from './stats-cards';

const SKELETON_COUNT = 4;

export function ReviewDashboard() {
  const {
    reviews,
    stats,
    filters,
    search,
    loading,
    refreshing,
    error,
    selectedReview,
    fetchReviews,
    setSearch,
    setFilters,
    resetFilters,
    selectReview,
  } = useReviewStore();

  const moderation = useReviewModeration();

  // Debounced so typing doesn't fire a request per keystroke; the filter
  // selects are included so any change re-queries through the same path.
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews, debouncedSearch, filters.status, filters.rating, filters.sort]);

  const isFiltered =
    search.trim() !== '' || filters.status !== 'all' || filters.rating !== 'all';

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <StatsCards
        stats={stats}
        loading={loading}
        activeFilter={filters.status}
        onFilterSelect={(status) => setFilters({ status })}
      />

      <ReviewFilters
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        busy={refreshing || search !== debouncedSearch}
        resultCount={reviews.length}
      />

      {error ? (
        <EmptyState
          tone="danger"
          icon={AlertTriangle}
          title="Could not load reviews"
          description={error}
          action={
            <Button
              variant="secondary"
              onClick={() => void fetchReviews()}
              leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
            >
              Try again
            </Button>
          }
        />
      ) : loading ? (
        <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <ReviewCardSkeleton key={index} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        isFiltered ? (
          <EmptyState
            icon={SearchX}
            title="No matching reviews"
            description="No testimonials match your current search and filters. Try broadening them."
            action={
              <Button variant="secondary" onClick={resetFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Inbox}
            title="No testimonials yet"
            description="Once customers start submitting testimonials, they'll land here for you to approve or reject."
            action={
              <Link
                href="/write-review"
                className="inline-flex h-9.5 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 shadow-xs transition-all duration-150 hover:border-gray-300 hover:bg-gray-50"
              >
                Collect your first testimonial
              </Link>
            }
          />
        )
      ) : (
        <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              busy={moderation.isBusy(review.id)}
              onModerate={moderation.moderate}
              onViewDetails={selectReview}
            />
          ))}
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <p className="flex items-center justify-center gap-1.5 pt-1 text-[13px] text-gray-400">
          Approved testimonials appear on the
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1 font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
          >
            public wall
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        </p>
      )}

      <ReviewDetailsModal
        review={selectedReview}
        busy={selectedReview ? moderation.isBusy(selectedReview.id) : false}
        onClose={() => selectReview(null)}
        onModerate={moderation.moderate}
      />

      <ConfirmDialog
        open={moderation.confirming !== null}
        destructive
        title="Reject this testimonial?"
        description={
          moderation.confirming
            ? `${moderation.confirming.review.name}'s testimonial will not appear on the public wall. You can approve it later if you change your mind.`
            : ''
        }
        confirmLabel="Reject testimonial"
        loading={moderation.confirmLoading}
        onConfirm={() => void moderation.confirm()}
        onCancel={moderation.cancelConfirm}
      />
    </div>
  );
}
