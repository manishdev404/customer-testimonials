'use client';

import Link from 'next/link';
import { AlertTriangle, MessageSquareQuote, PenLine, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { TestimonialCardSkeleton } from '@/components/ui/skeleton';
import { usePublicTestimonials } from '../hooks/use-public-testimonials';
import { TestimonialCard } from './testimonial-card';
import { TestimonialHero } from './testimonial-hero';

const SKELETON_COUNT = 6;

export function TestimonialWall() {
  const { testimonials, loading, error, refetch } = usePublicTestimonials();

  const averageRating =
    testimonials.length > 0
      ? testimonials.reduce((sum, item) => sum + item.rating, 0) / testimonials.length
      : 0;

  return (
    <>
      <TestimonialHero
        count={testimonials.length}
        averageRating={averageRating}
        names={testimonials.map((item) => item.name)}
      />

      <section className="pb-safe mx-auto max-w-6xl px-3 py-10 sm:px-6 sm:py-20">
        {loading ? (
          // Columns rather than a grid, so cards of different heights tile
          // without the ragged gaps a fixed grid leaves behind.
          <div className="columns-1 gap-4 sm:gap-5 md:columns-2 lg:columns-3">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div key={index} className="mb-5 break-inside-avoid">
                <TestimonialCardSkeleton />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            tone="danger"
            icon={AlertTriangle}
            title="Could not load testimonials"
            description={error}
            action={
              <Button
                variant="secondary"
                onClick={refetch}
                leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
              >
                Try again
              </Button>
            }
          />
        ) : testimonials.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="No testimonials published yet"
            description="Approved testimonials appear here. Be the first to share your experience."
            action={
              <Link
                href="/write-review"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white shadow-xs transition-colors hover:bg-gray-800"
              >
                <PenLine className="h-4 w-4" aria-hidden="true" />
                Write a testimonial
              </Link>
            }
          />
        ) : (
          <div className="columns-1 gap-4 sm:gap-5 md:columns-2 lg:columns-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
