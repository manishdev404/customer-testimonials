import { Quote } from 'lucide-react';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '@/constants';
import { cn } from '@/lib/cn';

export function Logo({
  showWordmark = true,
  className,
}: {
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white shadow-xs">
        <Quote className="h-4 w-4 fill-current" aria-hidden="true" />
      </span>

      {showWordmark && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-gray-900">
            {PRODUCT_NAME}
          </span>
          <span className="mt-0.5 truncate text-[11px] text-gray-400">{PRODUCT_TAGLINE}</span>
        </span>
      )}
    </span>
  );
}
