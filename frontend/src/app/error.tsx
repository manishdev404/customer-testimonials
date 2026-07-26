'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Root error boundary. Catches render-time failures anywhere in the tree and
 * offers a recovery path instead of a blank screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Stands in for the error-reporting service a production app would call.
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>

      <h1 className="mt-5 text-xl font-semibold tracking-tight text-gray-900">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
        An unexpected error occurred. Try again, and if it keeps happening, reload the page.
      </p>

      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
