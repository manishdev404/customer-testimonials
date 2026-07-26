'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, PenLine } from 'lucide-react';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/avatar';

/**
 * The assignment scopes out authentication, so this represents the single
 * hardcoded workspace owner rather than a signed-in session.
 */
const WORKSPACE_OWNER = {
  name: 'Alex Rivera',
  email: 'alex@testify.app',
  role: 'Workspace owner',
};

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, open, close);
  useEscapeKey(open, close);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={cn(
          'flex items-center gap-2 rounded-lg py-1 pr-1.5 pl-1 transition-colors',
          open ? 'bg-gray-100' : 'hover:bg-gray-100',
        )}
      >
        <Avatar name={WORKSPACE_OWNER.name} size="sm" />
        <span className="hidden text-[13px] font-medium text-gray-700 sm:block">
          {WORKSPACE_OWNER.name}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-gray-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="animate-scale-in absolute top-full right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lift"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 px-3.5 py-3">
            <Avatar name={WORKSPACE_OWNER.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{WORKSPACE_OWNER.name}</p>
              <p className="truncate text-[12px] text-gray-500">{WORKSPACE_OWNER.email}</p>
            </div>
          </div>

          <div className="p-1.5">
            <MenuLink href="/write-review" icon={PenLine} onSelect={close}>
              Collect a testimonial
            </MenuLink>
            <MenuLink href="/testimonials" icon={ExternalLink} onSelect={close}>
              View public wall
            </MenuLink>
          </div>

          <p className="border-t border-gray-100 bg-gray-50/60 px-3.5 py-2 text-[11px] text-gray-400">
            {WORKSPACE_OWNER.role} · demo account, no sign-in required
          </p>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  onSelect,
  children,
}: {
  href: string;
  icon: typeof PenLine;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
    >
      <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
      {children}
    </Link>
  );
}
