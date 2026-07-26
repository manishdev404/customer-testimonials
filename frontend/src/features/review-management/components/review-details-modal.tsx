'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { formatDateTime } from '@/utils/format';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { ImagePreview } from '@/components/ui/image-preview';
import { Modal } from '@/components/ui/modal';
import { Rating } from '@/components/ui/rating';
import { AiBadge, SentimentBadge, StatusBadge } from '@/components/common/status-badge';
import type { Review, ReviewStatus } from '@/types';

export interface ReviewDetailsModalProps {
  review: Review | null;
  busy?: boolean;
  onClose: () => void;
  onModerate: (review: Review, status: ReviewStatus) => void;
}

export function ReviewDetailsModal({
  review,
  busy,
  onClose,
  onModerate,
}: ReviewDetailsModalProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!review) return null;

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title="Review details"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="danger"
              disabled={review.status === 'rejected' || busy}
              onClick={() => onModerate(review, 'rejected')}
              leftIcon={<X className="h-4 w-4" aria-hidden="true" />}
            >
              Reject
            </Button>
            <Button
              disabled={review.status === 'approved' || busy}
              loading={busy}
              onClick={() => onModerate(review, 'approved')}
              leftIcon={<Check className="h-4 w-4" aria-hidden="true" />}
            >
              Approve
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={review.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-gray-900">{review.name}</p>
                <p className="truncate text-sm text-gray-500">{review.company}</p>
                <a
                  href={`mailto:${review.email}`}
                  className="truncate text-[13px] text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
                >
                  {review.email}
                </a>
              </div>
            </div>

            <StatusBadge status={review.status} />
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3.5 text-[13px] sm:grid-cols-3">
            <DetailItem label="Rating">
              <Rating value={review.rating} size="sm" showValue />
            </DetailItem>
            <DetailItem label="Sentiment">
              <SentimentBadge sentiment={review.insights.sentiment} />
            </DetailItem>
            <DetailItem label="Submitted">
              <time dateTime={review.createdAt} className="text-gray-700">
                {formatDateTime(review.createdAt)}
              </time>
            </DetailItem>
          </dl>

          <section>
            <h3 className="text-[13px] font-medium text-gray-700">Testimonial</h3>
            <blockquote className="mt-2 rounded-lg border-l-2 border-gray-900 bg-gray-50/60 py-3 pr-3 pl-4 text-sm leading-relaxed whitespace-pre-line text-gray-700">
              {review.message}
            </blockquote>
          </section>

          <section>
            <div className="flex items-center gap-2">
              <AiBadge />
              <h3 className="text-[13px] font-medium text-gray-700">Summary</h3>
            </div>
            <p className="mt-2 rounded-lg border border-violet-100 bg-violet-50/40 px-3.5 py-3 text-[13px] leading-relaxed text-gray-700">
              {review.insights.summary}
            </p>
          </section>

          {review.images.length > 0 && (
            <section>
              <h3 className="text-[13px] font-medium text-gray-700">
                Attachments ({review.images.length})
              </h3>
              <ImagePreview
                images={review.images}
                onOpen={setLightboxIndex}
                className="mt-2 sm:grid-cols-2"
              />
            </section>
          )}
        </div>
      </Modal>

      {/* Layered above the dialog; the shared Escape stack keeps them ordered. */}
      <ImageLightbox
        images={review.images}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] text-gray-400">{label}</dt>
      <dd className="mt-1 flex items-center">{children}</dd>
    </div>
  );
}
