'use client';

import { useCallback, useEffect, useState } from 'react';
import { HttpError } from '@/lib/http';
import { getPublicReviews } from '@/services';
import type { PublicTestimonial } from '@/types';

interface UsePublicTestimonialsResult {
  testimonials: PublicTestimonial[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Loads the approved-only public feed.
 *
 * Local state rather than the Zustand store on purpose: this data belongs to a
 * public page with no moderation concerns, and keeping it separate stops the
 * admin store from leaking into a page that must never show pending or
 * rejected testimonials.
 */
export function usePublicTestimonials(): UsePublicTestimonialsResult {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setTestimonials(await getPublicReviews());
    } catch (caught) {
      setError(
        caught instanceof HttpError
          ? caught.message
          : 'Could not load testimonials. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { testimonials, loading, error, refetch: () => void load() };
}
