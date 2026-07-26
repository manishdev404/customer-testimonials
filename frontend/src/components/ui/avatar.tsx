import { cn } from '@/lib/cn';
import { getInitials } from '@/utils/format';

const SIZE_STYLES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-[13px]',
  lg: 'h-12 w-12 text-sm',
} as const;

/**
 * Deterministic tint per person, so the same name always gets the same colour
 * across the dashboard and the public wall.
 */
const TINTS = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
];

function tintFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length]!;
}

export interface AvatarProps {
  name: string;
  size?: keyof typeof SIZE_STYLES;
  className?: string;
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      // Decorative: the name is always rendered next to it in text.
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none',
        'ring-1 ring-black/[0.04]',
        SIZE_STYLES[size],
        tintFor(name),
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
