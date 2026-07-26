'use client';

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { cn } from '@/lib/cn';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZE_STYLES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: keyof typeof SIZE_STYLES;
  /** Sticky action row pinned to the bottom of the dialog. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Accessible dialog: rendered in a portal, labelled by its heading, closes on
 * Escape or backdrop click, and keeps Tab focus inside while open. Focus
 * returns to whatever opened it on close.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Portals need a DOM target, which only exists after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useLockBodyScroll(open);

  // Escape is handled by a shared stack so only the topmost overlay reacts.
  useEscapeKey(open, onClose);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      // Wrap at both ends so focus can never escape to the page behind.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', handleKeyDown);

    // Defer so the panel is painted before we move focus into it.
    const timer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (target ?? panelRef.current)?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
      previouslyFocused.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="animate-fade-in absolute inset-0 bg-gray-950/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          // Bottom sheet on phones, centred dialog from `sm` up. 92vh would sit
          // under the iOS browser chrome, so dvh is used where supported.
          'animate-scale-in relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-white',
          'rounded-t-2xl shadow-overlay sm:max-h-[92vh] sm:rounded-2xl',
          SIZE_STYLES[size],
        )}
      >
        {/* Sheet grabber — signals "drag or tap away to dismiss" on touch. */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden" aria-hidden="true">
          <span className="h-1 w-9 rounded-full bg-gray-300" />
        </div>

        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold tracking-tight text-gray-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-0.5 text-[13px] text-gray-500 sm:text-sm">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mt-1 -mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 sm:h-8 sm:w-8"
          >
            <X className="h-4.5 w-4.5 sm:h-4 sm:w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          {children}
        </div>

        {footer && (
          <footer className="pb-safe flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/60 px-4 py-3 sm:flex-row sm:justify-end sm:px-5 sm:py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
