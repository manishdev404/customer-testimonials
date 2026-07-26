import { fail, ok } from '@/lib/api-response';
import { reviewRepository } from '@/server/review-repository';
import type { PublicTestimonial } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Public wall feed. Approved-only is enforced here, at the data boundary, so a
 * pending or rejected testimonial can never leak through a client-side bug —
 * and the submitter's email is stripped before it ever leaves the server.
 */
export async function GET() {
  try {
    const approved = await reviewRepository.listApproved();

    const testimonials: PublicTestimonial[] = approved.map(
      ({ email: _email, status: _status, insights: _insights, ...testimonial }) => testimonial,
    );

    return ok(testimonials);
  } catch {
    return fail('Could not load testimonials.', 500);
  }
}
