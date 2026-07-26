'use client';

import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import { DEFAULT_FILTERS, RATING_FILTER_OPTIONS, SORT_OPTIONS, STATUS_FILTER_OPTIONS } from '@/constants';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { ReviewFilters as Filters } from '@/types';

export interface ReviewFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  onReset: () => void;
  /** Shows a spinner in the search field while a query is in flight. */
  busy?: boolean;
  resultCount: number;
}

export function ReviewFilters({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onReset,
  busy,
  resultCount,
}: ReviewFiltersProps) {
  const isFiltered =
    search.trim() !== '' ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.rating !== DEFAULT_FILTERS.rating ||
    filters.sort !== DEFAULT_FILTERS.sort;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-soft">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <label htmlFor="review-search" className="sr-only">
            Search reviews by name, company or content
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="review-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, company, email or content..."
            className={cn(
              'h-11 w-full rounded-lg border border-gray-200 bg-white pl-9 text-gray-900 shadow-xs sm:h-9.5 sm:text-sm',
              'placeholder:text-gray-400 transition-all duration-150',
              'hover:border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 focus:outline-none',
              busy ? 'pr-9' : 'pr-3',
            )}
          />
          {busy && (
            <Loader2
              className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400"
              aria-hidden="true"
            />
          )}
        </div>

        {/*
          Two columns on phones with sort spanning the full width: three selects
          side by side at 360px leaves each ~100px, which truncates every label
          to the point of uselessness.
        */}
        <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
          <SlidersHorizontal
            className="hidden h-4 w-4 shrink-0 text-gray-400 lg:block"
            aria-hidden="true"
          />

          <Select
            label="Filter by status"
            options={STATUS_FILTER_OPTIONS}
            value={filters.status}
            onValueChange={(status) => onFiltersChange({ status })}
            className="lg:w-38"
          />
          <Select
            label="Filter by rating"
            options={RATING_FILTER_OPTIONS}
            value={filters.rating}
            onValueChange={(rating) => onFiltersChange({ rating })}
            className="lg:w-34"
          />
          <Select
            label="Sort order"
            options={SORT_OPTIONS}
            value={filters.sort}
            onValueChange={(sort) => onFiltersChange({ sort })}
            className="col-span-2 lg:col-span-1 lg:w-36"
          />
        </div>
      </div>

      {isFiltered && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-2.5">
          <p aria-live="polite" className="text-[13px] text-gray-500">
            <span className="tabular font-medium text-gray-900">{resultCount}</span>{' '}
            {resultCount === 1 ? 'review matches' : 'reviews match'} your filters
          </p>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<X className="h-3.5 w-3.5" aria-hidden="true" />}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
