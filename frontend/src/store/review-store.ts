import { create } from 'zustand';
import { DEFAULT_FILTERS } from '@/constants';
import { HttpError } from '@/lib/http';
import { getReviews, updateReview } from '@/services';
import type { Review, ReviewFilters, ReviewStats, ReviewStatus } from '@/types';

interface ReviewState {
  reviews: Review[];
  stats: ReviewStats;
  selectedReview: Review | null;
  filters: ReviewFilters;
  search: string;
  /** True only for a full list load, so skeletons don't flash on refetches. */
  loading: boolean;
  /** True while re-querying with existing data on screen. */
  refreshing: boolean;
  error: string | null;
  /** IDs with a moderation request in flight; drives per-card button spinners. */
  pendingIds: string[];

  fetchReviews: (options?: { silent?: boolean }) => Promise<void>;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<ReviewFilters>) => void;
  resetFilters: () => void;
  selectReview: (review: Review | null) => void;
  updateStatus: (id: string, status: ReviewStatus) => Promise<Review>;
}

const EMPTY_STATS: ReviewStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  positive: 0,
  averageRating: 0,
};

/**
 * Guards against out-of-order responses: a slow request that resolves after a
 * newer one must not overwrite fresher results. Kept outside the store because
 * it is transient bookkeeping, not rendered state.
 */
let latestRequestId = 0;

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  stats: EMPTY_STATS,
  selectedReview: null,
  filters: { ...DEFAULT_FILTERS },
  search: '',
  loading: true,
  refreshing: false,
  error: null,
  pendingIds: [],

  fetchReviews: async ({ silent = false } = {}) => {
    const requestId = ++latestRequestId;
    const hasData = get().reviews.length > 0;

    set({ loading: !hasData && !silent, refreshing: hasData || silent, error: null });

    try {
      const { search, filters } = get();
      const result = await getReviews({ ...filters, search });

      if (requestId !== latestRequestId) return; // superseded
      set({ reviews: result.reviews, stats: result.stats, loading: false, refreshing: false });
    } catch (error) {
      if (requestId !== latestRequestId) return;
      set({
        loading: false,
        refreshing: false,
        error:
          error instanceof HttpError
            ? error.message
            : 'Could not load reviews. Please try again.',
      });
    }
  },

  setSearch: (search) => set({ search }),

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS }, search: '' }),

  selectReview: (selectedReview) => set({ selectedReview }),

  updateStatus: async (id, status) => {
    const previous = get().reviews;
    const target = previous.find((review) => review.id === id);
    if (!target) throw new Error('Review not found.');

    // Optimistic: the card reflects the decision immediately, and the whole
    // snapshot is restored if the request fails.
    set((state) => ({
      pendingIds: [...state.pendingIds, id],
      reviews: state.reviews.map((review) =>
        review.id === id ? { ...review, status } : review,
      ),
      stats: adjustStats(state.stats, target.status, status),
    }));

    try {
      const updated = await updateReview(id, { status });

      set((state) => ({
        reviews: state.reviews.map((review) => (review.id === id ? updated : review)),
        selectedReview:
          state.selectedReview?.id === id ? updated : state.selectedReview,
        pendingIds: state.pendingIds.filter((pendingId) => pendingId !== id),
      }));

      // Re-sync so the list respects an active status filter and the stats are
      // authoritative rather than locally derived.
      void get().fetchReviews({ silent: true });

      return updated;
    } catch (error) {
      set((state) => ({
        reviews: previous,
        stats: adjustStats(state.stats, status, target.status),
        pendingIds: state.pendingIds.filter((pendingId) => pendingId !== id),
      }));
      throw error;
    }
  },
}));

/** Moves one review between status buckets without a server round trip. */
function adjustStats(stats: ReviewStats, from: ReviewStatus, to: ReviewStatus): ReviewStats {
  if (from === to) return stats;
  return { ...stats, [from]: Math.max(0, stats[from] - 1), [to]: stats[to] + 1 };
}
