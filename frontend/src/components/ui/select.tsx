'use client';

import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption<T extends string | number> {
  label: string;
  value: T;
}

export interface SelectProps<T extends string | number>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label?: string;
  options: ReadonlyArray<SelectOption<T>>;
  value: T;
  onValueChange: (value: T) => void;
}

/**
 * Wraps a native `<select>`. A custom listbox would look slightly sharper, but
 * the native control gives correct keyboard behaviour and mobile pickers for
 * free — the right trade for a filter bar.
 */
function SelectInner<T extends string | number>(
  { label, options, value, onValueChange, className, id, ...props }: SelectProps<T>,
  ref: React.Ref<HTMLSelectElement>,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label htmlFor={selectId} className="sr-only">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        value={value}
        onChange={(event) => {
          const raw = event.target.value;
          const match = options.find((option) => String(option.value) === raw);
          if (match) onValueChange(match.value);
        }}
        className={cn(
          'h-11 w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white sm:h-9.5',
          'py-0 pr-9 pl-3 font-medium text-gray-700 shadow-xs sm:text-sm',
          'transition-all duration-150 ease-out',
          'hover:border-gray-300 hover:bg-gray-50',
          'focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 focus:outline-none',
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
    </div>
  );
}

export const Select = forwardRef(SelectInner) as <T extends string | number>(
  props: SelectProps<T> & { ref?: React.Ref<HTMLSelectElement> },
) => React.ReactElement;
