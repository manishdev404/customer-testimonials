import { Star } from 'lucide-react';
import { formatRating } from '@/utils/format';
import { Avatar } from '@/components/ui/avatar';

export interface TestimonialHeroProps {
  count: number;
  averageRating: number;
  /** Up to five names, used for the avatar cluster. */
  names: string[];
}

export function TestimonialHero({ count, averageRating, names }: TestimonialHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-white">
      {/* Subtle grid wash — adds depth without competing with the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, #000 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 0%, #000 40%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-[12px] font-medium text-gray-600 shadow-xs backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Loved by teams everywhere
        </span>

        <h1 className="mt-5 text-[32px] leading-[1.1] font-semibold tracking-tight text-balance text-gray-900 sm:mt-6 sm:text-5xl">
          Customer testimonials
        </h1>

        <p className="mx-auto mt-3.5 max-w-xl text-[15px] leading-relaxed text-balance text-gray-500 sm:mt-4 sm:text-base">
          Real words from the people who use our product every day. Every testimonial below was
          submitted by a customer and approved by our team.
        </p>

        {count > 0 && (
          <div className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row sm:justify-center sm:gap-5">
            {names.length > 0 && (
              <div className="flex -space-x-2.5" aria-hidden="true">
                {names.slice(0, 5).map((name) => (
                  <Avatar key={name} name={name} className="ring-2 ring-white" />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </span>
              <p className="text-sm text-gray-600">
                <span className="tabular font-semibold text-gray-900">
                  {formatRating(averageRating)}
                </span>{' '}
                from{' '}
                <span className="tabular font-semibold text-gray-900">{count}</span>{' '}
                {count === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
