import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/app-shell';
import { ReviewForm } from '@/features/write-review/components/review-form';

export const metadata: Metadata = {
  title: 'Write Review',
  description: 'Share your experience and help others decide.',
};

export default function WriteReviewPage() {
  return (
    <PageContainer
      width="narrow"
      title="Write a review"
      description="Tell us how it went. Your testimonial goes to the team for approval before it appears on the public wall."
    >
      <ReviewForm />
    </PageContainer>
  );
}
