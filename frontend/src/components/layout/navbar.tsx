'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { PRODUCT_NAME } from '@/constants';
import { cn } from '@/lib/cn';
import { useReviewStore } from '@/store';
import { UserMenu } from './user-menu';

export interface NavbarProps {
  onOpenSidebar: () => void;
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  const router = useRouter();
  const search = useReviewStore((state) => state.search);
  const setSearch = useReviewStore((state) => state.setSearch);

  // On phones the search is a second row that opens on demand: four controls
  // plus a text field do not fit a 360px bar without one of them being unusable.
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mobileSearchOpen) mobileInputRef.current?.focus();
  }, [mobileSearchOpen]);

  // Bound to the same store slice as the moderation page's search bar, so the
  // two stay in sync instead of competing.
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMobileSearchOpen(false);
    mobileInputRef.current?.blur();
    router.push('/reviews');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-1 px-2 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <span className="truncate text-[15px] font-semibold tracking-tight text-gray-900 lg:hidden">
          {PRODUCT_NAME}
        </span>

        {/* Inline search, sm and up. */}
        <form onSubmit={handleSubmit} role="search" className="ml-auto hidden sm:block lg:mr-auto lg:ml-0">
          <label htmlFor="global-search" className="sr-only">
            Search testimonials
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="global-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search testimonials..."
              className="h-9 w-56 rounded-lg border border-gray-200 bg-gray-50/70 pr-3 pl-9 text-sm text-gray-900 shadow-xs transition-all duration-200 ease-out placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:outline-none md:w-64 md:focus:w-80"
            />
          </div>
        </form>

        {/* Toggle for the mobile search row. */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen((value) => !value)}
          aria-label={mobileSearchOpen ? 'Close search' : 'Search testimonials'}
          aria-expanded={mobileSearchOpen}
          aria-controls="mobile-search-row"
          className={cn(
            'ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors sm:hidden',
            mobileSearchOpen
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
          )}
        >
          {mobileSearchOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Search className="h-5 w-5" aria-hidden="true" />
          )}
          {/* Dot marks an active filter that is currently out of sight. */}
          {!mobileSearchOpen && search.trim() !== '' && (
            <span className="absolute mt-4 ml-4 h-1.5 w-1.5 rounded-full bg-gray-900" />
          )}
        </button>

        <UserMenu />
      </div>

      {/* Full-width search row, phones only. */}
      <div
        id="mobile-search-row"
        className={cn(
          'grid overflow-hidden transition-all duration-200 ease-out sm:hidden',
          mobileSearchOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0">
          <form onSubmit={handleSubmit} role="search" className="px-3 pb-3">
            <label htmlFor="mobile-search" className="sr-only">
              Search testimonials
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                ref={mobileInputRef}
                id="mobile-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search testimonials..."
                // Not focusable while collapsed, or it becomes an invisible tab stop.
                tabIndex={mobileSearchOpen ? undefined : -1}
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50/70 pr-3 pl-9 text-gray-900 shadow-xs placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:outline-none"
              />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
