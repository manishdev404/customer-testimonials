'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, X } from 'lucide-react';
import { NAV_ITEMS } from '@/constants';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { cn } from '@/lib/cn';
import { useReviewStore } from '@/store';
import { Logo } from './logo';

export interface SidebarProps {
  /** Controls the mobile drawer; the desktop rail is always visible. */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  // Escape closes the mobile drawer. Harmless on desktop, where it is never open.
  useEscapeKey(open, onClose);

  return (
    <>
      {/* Mobile scrim */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-gray-950/30 backdrop-blur-[1px] transition-opacity duration-200 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[min(17rem,85vw)] flex-col border-r border-gray-200 bg-white lg:w-64',
          'transition-[transform,visibility] duration-250 ease-out lg:translate-x-0 lg:visible',
          // `visibility` (not just translate) is what keeps a closed drawer out
          // of the tab order and the accessibility tree — an off-screen but
          // still-focusable menu is a real keyboard trap on mobile. Transitioning
          // it defers the flip to hidden until the slide-out finishes.
          open ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 pr-2 pl-4">
          <Link
            href="/write-review"
            className="rounded-lg transition-opacity hover:opacity-80"
            onClick={onClose}
          >
            <Logo />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="-mr-0.5 flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Main" className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          <p className="px-2.5 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Dashboard
          </p>

          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <SidebarLink item={item} onNavigate={onClose} />
              </li>
            ))}
          </ul>
        </nav>

        <PendingSummary />
      </aside>
    </>
  );
}

function SidebarLink({
  item,
  onNavigate,
}: {
  item: (typeof NAV_ITEMS)[number];
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        // Roomier rows on touch, tightening up from `lg` where a pointer is precise.
        'group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium',
        'transition-all duration-150 ease-out active:bg-gray-100',
        'lg:min-h-0 lg:gap-2.5 lg:px-2.5 lg:py-2 lg:text-sm',
        active
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
      )}
    >
      <Icon
        className={cn(
          'h-4.5 w-4.5 shrink-0 transition-colors lg:h-4 lg:w-4',
          active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600',
        )}
        aria-hidden="true"
      />
      <span className="truncate">{item.label}</span>

      {item.external && (
        <ArrowUpRight
          className="ml-auto h-3.5 w-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500"
          aria-label="(public page)"
        />
      )}
    </Link>
  );
}

/** Live moderation backlog, so the queue is visible from anywhere in the app. */
function PendingSummary() {
  const pending = useReviewStore((state) => state.stats.pending);

  return (
    <div className="pb-safe shrink-0 border-t border-gray-100 p-3">
      <div className="rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-gray-700">Awaiting review</span>
          <span className="tabular rounded-md bg-white px-1.5 py-0.5 text-[12px] font-semibold text-gray-900 shadow-xs">
            {pending}
          </span>
        </div>
        <p className="mt-1 text-[12px] leading-snug text-gray-500">
          {pending === 0
            ? 'The queue is clear.'
            : `${pending} testimonial${pending === 1 ? '' : 's'} to moderate.`}
        </p>
      </div>
    </div>
  );
}
