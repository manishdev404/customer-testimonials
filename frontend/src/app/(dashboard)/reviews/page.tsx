import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { PageContainer } from '@/components/layout/app-shell';
import { ReviewDashboard } from '@/features/review-management/components/review-dashboard';

export const metadata: Metadata = {
  title: 'Review Management',
  description: 'Approve or reject incoming customer testimonials.',
};

export default function ReviewManagementPage() {
  return (
    <PageContainer
      title="Review management"
      description="Every submission lands here first. Approve the ones you want on your public wall, reject the rest."
      action={
        <Link
          href="/testimonials"
          className="inline-flex h-9.5 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 shadow-xs transition-all duration-150 hover:border-gray-300 hover:bg-gray-50"
        >
          View public wall
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      }
    >
      <ReviewDashboard />
    </PageContainer>
  );
}
