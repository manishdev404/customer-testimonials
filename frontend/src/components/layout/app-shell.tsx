'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { cn } from '@/lib/cn';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

/**
 * Dashboard chrome: a fixed sidebar rail on desktop that becomes an overlay
 * drawer below `lg`, plus the sticky top bar.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // A route change on mobile should dismiss the drawer.
  useEffect(() => setSidebarOpen(false), [pathname]);

  // Stop the page behind the drawer from scrolling under the user's finger.
  useLockBodyScroll(sidebarOpen);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

/** Consistent page heading + max-width container for dashboard routes. */
export function PageContainer({
  title,
  description,
  action,
  children,
  width = 'wide',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  width?: 'wide' | 'narrow';
}) {
  return (
    <div
      className={cn(
        'pb-safe mx-auto w-full px-3 py-6 sm:px-6 sm:py-10',
        width === 'narrow' ? 'max-w-3xl' : 'max-w-6xl',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-gray-500 sm:text-sm">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="mt-5 sm:mt-7">{children}</div>
    </div>
  );
}
