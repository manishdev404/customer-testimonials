'use client';

import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { HttpError } from '@/lib/http';
import { createReview } from '@/services';
import { toast } from '@/store';
import { EMPTY_REVIEW_FORM, type ReviewFormValues } from '../types';

interface UseReviewFormResult {
  form: UseFormReturn<ReviewFormValues>;
  submit: () => void;
  submitting: boolean;
  /** Set after a successful submission so the page can show a confirmation. */
  submittedName: string | null;
  reset: () => void;
}

/**
 * Owns submission for the testimonial form: calls the API, maps server-side
 * field errors back onto the matching inputs, and clears the form on success.
 *
 * Kept out of the component so the form stays presentational and this logic
 * can be tested on its own.
 */
export function useReviewForm(): UseReviewFormResult {
  const form = useForm<ReviewFormValues>({
    defaultValues: EMPTY_REVIEW_FORM,
    // Validate on blur first, then live once a field has an error — feedback
    // arrives when it's useful, not while the user is still typing.
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const submit = form.handleSubmit(async (values) => {
    setSubmitting(true);

    try {
      await createReview({
        name: values.name,
        email: values.email,
        company: values.company,
        rating: values.rating,
        message: values.message,
        images: values.images.map(({ name, url, size }) => ({ name, url, size })),
      });

      setSubmittedName(values.name.trim().split(/\s+/)[0] ?? values.name);
      form.reset(EMPTY_REVIEW_FORM);

      toast.success(
        'Testimonial submitted',
        'Thanks! It is now waiting for approval before it appears publicly.',
      );
    } catch (error) {
      if (error instanceof HttpError && error.fields) {
        // Surface server validation on the fields themselves rather than only
        // in a toast, so the user can see exactly what to fix.
        for (const [field, message] of Object.entries(error.fields)) {
          if (field in EMPTY_REVIEW_FORM) {
            form.setError(field as keyof ReviewFormValues, { type: 'server', message });
          }
        }
      }

      toast.error(
        'Could not submit testimonial',
        error instanceof HttpError ? error.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  });

  return {
    form,
    submit,
    submitting,
    submittedName,
    reset: () => {
      setSubmittedName(null);
      form.reset(EMPTY_REVIEW_FORM);
    },
  };
}
