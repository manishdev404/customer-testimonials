
'use client';

import { useState } from 'react';
import { Quote } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { Avatar } from '@/components/ui/avatar';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { ImagePreview } from '@/components/ui/image-preview';
import { Rating } from '@/components/ui/rating';
import type { PublicTestimonial } from '@/types';

export function TestimonialCard({ testimonial }: { testimonial: PublicTestimonial }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <figure
        className="group mb-4 break-inside-avoid rounded-2xl border border-gray-200 bg-white p-5 shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lift sm:mb-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <Rating value={testimonial.rating} />
          <Quote
            className="h-6 w-6 shrink-0 fill-gray-100 text-gray-100 transition-colors duration-200 group-hover:fill-gray-200 group-hover:text-gray-200"
            aria-hidden="true"
          />
        </div>

        <blockquote className="mt-4">
          <p className="text-[15px] leading-relaxed whitespace-pre-line text-gray-700">
            {testimonial.message}
          </p>
        </blockquote>

        {testimonial.images.length > 0 && (
          <ImagePreview
            images={testimonial.images}
            onOpen={setLightboxIndex}
            className="mt-5 grid-cols-2"
          />
        )}

        <figcaption className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
          <Avatar name={testimonial.name} />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{testimonial.name}</p>
            <p className="truncate text-[13px] text-gray-500">{testimonial.company}</p>
          </div>

          <time
            dateTime={testimonial.createdAt}
            className="shrink-0 text-[12px] whitespace-nowrap text-gray-400"
          >
            {formatDate(testimonial.createdAt)}
          </time>
        </figcaption>
      </figure>

      <ImageLightbox
        images={testimonial.images}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}
