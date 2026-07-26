'use client';

import { useCallback, useState } from 'react';
import { STATUS_LABELS } from '@/constants';
import { HttpError } from '@/lib/http';
import { toast, useReviewStore } from '@/store';
import type { Review, ReviewStatus } from '@/types';

interface PendingDecision {
  review: Review;
  status: ReviewStatus;
}

/**
 * Moderation actions for the dashboard.
 *
 * Approving applies straight away — it is the common case and easily undone by
 * rejecting. Rejecting asks for confirmation first, because it is the decision
 * that removes a customer's words from the public wall.
 */
export function useReviewModeration() {
  const updateStatus = useReviewStore((state) => state.updateStatus);
  const pendingIds = useReviewStore((state) => state.pendingIds);

  const [confirming, setConfirming] = useState<PendingDecision | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const apply = useCallback(
    async ({ review, status }: PendingDecision) => {
      try {
        await updateStatus(review.id, status);

        toast.success(
          `Review ${STATUS_LABELS[status].toLowerCase()}`,
          status === 'approved'
            ? `${review.name}'s testimonial is now live on the public wall.`
            : `${review.name}'s testimonial will not be published.`,
        );
      } catch (error) {
        toast.error(
          'Could not update review',
          error instanceof HttpError ? error.message : 'Please try again.',
        );
      }
    },
    [updateStatus],
  );

  const moderate = useCallback(
    (review: Review, status: ReviewStatus) => {
      if (status === 'rejected') {
        setConfirming({ review, status });
        return;
      }
      void apply({ review, status });
    },
    [apply],
  );

  const confirm = useCallback(async () => {
    if (!confirming) return;

    setConfirmLoading(true);
    await apply(confirming);
    setConfirmLoading(false);
    setConfirming(null);
  }, [apply, confirming]);

  return {
    moderate,
    confirming,
    confirmLoading,
    confirm,
    cancelConfirm: () => setConfirming(null),
    isBusy: (id: string) => pendingIds.includes(id),
  };
}
