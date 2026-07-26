import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
        <FileQuestion className="h-5 w-5" aria-hidden="true" />
      </span>

      <h1 className="mt-5 text-xl font-semibold tracking-tight text-gray-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <Link
        href="/write-review"
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white shadow-xs transition-colors hover:bg-gray-800"
      >
        Back to the app
      </Link>
    </main>
  );
}
