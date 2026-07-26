import type { ReviewStatus } from '../modules/reviews/review.types.js';

export interface SeedReview {
  name: string;
  email: string;
  company: string;
  rating: number;
  message: string;
  status: ReviewStatus;
  /** Age of the submission, used to build a realistic timeline. */
  daysAgo: number;
}

/**
 * Demo content so the dashboard, filters and public wall are meaningful on a
 * fresh database. Written to cover the full range: every status, high and low
 * ratings, and wording that exercises the sentiment analyser.
 */
export const SEED_REVIEWS: SeedReview[] = [
  {
    name: 'Priya Nair',
    email: 'priya.nair@northwind.io',
    company: 'Northwind Labs',
    rating: 5,
    message:
      'We replaced three separate tools with this. Collecting testimonials used to take our team a full week of chasing people over email — now the request goes out and approvals land in one place. The moderation flow is genuinely excellent.',
    status: 'approved',
    daysAgo: 2,
  },
  {
    name: 'Marcus Feld',
    email: 'marcus@parallelhq.com',
    company: 'Parallel',
    rating: 5,
    message:
      'The embed dropped onto our marketing site in under five minutes and looks like we built it ourselves. Conversion on the pricing page is up noticeably since we added social proof above the fold.',
    status: 'approved',
    daysAgo: 4,
  },
  {
    name: 'Sofia Almeida',
    email: 'sofia@brightbase.co',
    company: 'Brightbase',
    rating: 4,
    message:
      'Really solid product and a delight to use day to day. The sentiment tagging saves me from reading every submission end to end. I would love bulk approve, but that is a small gap in an otherwise great tool.',
    status: 'approved',
    daysAgo: 6,
  },
  {
    name: 'Daniel Oyelaran',
    email: 'daniel@finlytics.app',
    company: 'Finlytics',
    rating: 5,
    message:
      'Support answered in eleven minutes on a Sunday. The product is fast, the design is clean, and nothing has broken in three months of daily use. Easy recommendation.',
    status: 'approved',
    daysAgo: 9,
  },
  {
    name: 'Grace Lindqvist',
    email: 'grace@meridian.studio',
    company: 'Meridian Studio',
    rating: 5,
    message:
      'As a design studio we are picky about anything that renders on a client site. This is the first testimonial widget we have shipped without restyling it first. Typography and spacing are spot on.',
    status: 'approved',
    daysAgo: 13,
  },
  {
    name: 'Hannah Weiss',
    email: 'hannah.weiss@loopcart.com',
    company: 'Loopcart',
    rating: 5,
    message:
      'Beautiful, intuitive and quick. Our customers actually finish the submission form now, which was never true with the Google Form we used before. Response rate roughly tripled.',
    status: 'pending',
    daysAgo: 0.2,
  },
  {
    name: 'Tomas Vrba',
    email: 'tomas@stackreach.dev',
    company: 'Stackreach',
    rating: 4,
    message:
      'Great foundation and the wall layout looks polished out of the box. Setup was smooth. I hit one confusing moment around image limits, but the error message explained it clearly enough.',
    status: 'pending',
    daysAgo: 0.5,
  },
  {
    name: 'Amara Okafor',
    email: 'amara@relayworks.io',
    company: 'Relayworks',
    rating: 3,
    message:
      'The core flow works well and the interface is clean. Filtering is a bit basic for our volume, and I would like to export approved testimonials as CSV. Fine for now, but we will outgrow it.',
    status: 'pending',
    daysAgo: 1.2,
  },
  {
    name: 'Owen Brady',
    email: 'owen@shiftlogic.net',
    company: 'Shiftlogic',
    rating: 2,
    message:
      'Disappointed with the onboarding. The dashboard was confusing at first and I lost some work because I did not realise a draft was not saved. The team responded quickly, but the first hour was frustrating.',
    status: 'rejected',
    daysAgo: 16,
  },
  {
    name: 'Ivy Chen',
    email: 'ivy@cloudpeak.ai',
    company: 'Cloudpeak',
    rating: 1,
    message:
      'Not what we expected. The import was slow and broken for our dataset and we had to fall back to manual entry. Would not recommend at our scale.',
    status: 'rejected',
    daysAgo: 21,
  },
];
