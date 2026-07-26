import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, PenLine } from 'lucide-react';
import { PRODUCT_NAME } from '@/constants';
import { Logo } from '@/components/layout/logo';
import { TestimonialWall } from '@/features/public-testimonials/components/testimonial-wall';

export const metadata: Metadata = {
  title: 'Customer Testimonials',
  description: 'Real words from the people who use our product every day.',
};

/**
 * Public route — deliberately outside the `(dashboard)` group so it renders
 * without the admin sidebar. This is the page a business would link to
 * from its marketing site.
 */
export default function PublicTestimonialsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:gap-4 sm:px-6">
          <Link href="/testimonials" className="rounded-lg transition-opacity hover:opacity-80">
            <Logo />
          </Link>

          <nav className="flex items-center gap-1.5" aria-label="Public">
            <Link
              href="/reviews"
              className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to dashboard
            </Link>

            <Link
              href="/write-review"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-gray-800 active:scale-[0.98] sm:h-9 sm:text-[13px]"
            >
              <PenLine className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
              Write a review
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <TestimonialWall />
      </main>

      <footer className="border-t border-gray-200 bg-gray-50/50">
        <div className="pb-safe mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-7 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="text-[13px] text-gray-500">
            © {new Date().getFullYear()} {PRODUCT_NAME}. Testimonials are published with customer
            permission.
          </p>
          <Link
            href="/write-review"
            className="text-[13px] font-medium text-gray-600 underline-offset-4 transition-colors hover:text-gray-900 hover:underline"
          >
            Share your experience →
          </Link>
        </div>
      </footer>
    </div>
  );
}
