import type { Review, ReviewStatus } from '@/types';
import { analyseReview } from './insights';

/**
 * Deterministic demo data so the dashboard, filters and public wall have
 * something meaningful to render on a cold start.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Seed attachments are generated as inline SVG data URLs rather than remote
 * files, so the app renders identically offline and needs no image host.
 */
function placeholderImage(label: string, from: string, to: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
    </linearGradient></defs>
    <rect width="800" height="500" fill="url(#g)"/>
    <rect x="48" y="48" width="704" height="404" rx="16" fill="#ffffff" opacity="0.14"/>
    <text x="400" y="264" text-anchor="middle" font-family="Inter,system-ui,sans-serif"
      font-size="34" font-weight="600" fill="#ffffff" opacity="0.92">${label}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
}

interface SeedInput {
  name: string;
  email: string;
  company: string;
  rating: number;
  message: string;
  status: ReviewStatus;
  daysAgo: number;
  images?: Array<{ label: string; from: string; to: string }>;
}

const SEED_INPUTS: SeedInput[] = [
  {
    name: 'Priya Nair',
    email: 'priya.nair@northwind.io',
    company: 'Northwind Labs',
    rating: 5,
    message:
      'We replaced three separate tools with this. Collecting testimonials used to take our team a full week of chasing people over email — now the request goes out and approvals land in one place. The moderation flow is genuinely excellent.',
    status: 'approved',
    daysAgo: 2,
    images: [{ label: 'Moderation queue', from: '#4f46e5', to: '#0ea5e9' }],
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
    images: [
      { label: 'Pricing page embed', from: '#0f172a', to: '#334155' },
      { label: 'Conversion lift', from: '#059669', to: '#10b981' },
    ],
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
    name: 'Hannah Weiss',
    email: 'hannah.weiss@loopcart.com',
    company: 'Loopcart',
    rating: 5,
    message:
      'Beautiful, intuitive and quick. Our customers actually finish the submission form now, which was never true with the Google Form we used before. Response rate roughly tripled.',
    status: 'pending',
    daysAgo: 0.2,
    images: [{ label: 'Submission form', from: '#7c3aed', to: '#c026d3' }],
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

export function createSeedReviews(): Review[] {
  const now = Date.now();

  return SEED_INPUTS.map((input, index) => {
    const createdAt = new Date(now - input.daysAgo * DAY_MS).toISOString();

    return {
      id: `rev_seed_${String(index + 1).padStart(3, '0')}`,
      name: input.name,
      email: input.email,
      company: input.company,
      rating: input.rating,
      message: input.message,
      images: (input.images ?? []).map((image, imageIndex) => ({
        id: `img_seed_${index + 1}_${imageIndex + 1}`,
        name: `${image.label.toLowerCase().replace(/\s+/g, '-')}.svg`,
        url: placeholderImage(image.label, image.from, image.to),
        size: 24_000,
      })),
      status: input.status,
      insights: analyseReview(input.message, input.rating, input.company),
      createdAt,
      updatedAt: createdAt,
    };
  });
}
