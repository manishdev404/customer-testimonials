'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToastStore, type ToastVariant } from '@/store/toast-store';

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; iconClass: string; accent: string }
> = {
  success: { icon: CheckCircle2, iconClass: 'text-emerald-600', accent: 'bg-emerald-500' },
  error: { icon: AlertCircle, iconClass: 'text-rose-600', accent: 'bg-rose-500' },
  info: { icon: Info, iconClass: 'text-sky-600', accent: 'bg-sky-500' },
};

/**
 * Global toast outlet. Mounted once in the root layout; anything in the app
 * raises a toast through the store without prop drilling or context.
 */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div
      // `polite` so announcements queue behind whatever the user is doing.
      role="status"
      aria-live="polite"
      aria-atomic="false"
      // Anchored bottom-centre on phones (within thumb reach, clear of the home
      // indicator) and bottom-right on larger screens.
      className="pb-safe pointer-events-none fixed inset-x-0 bottom-0 z-60 flex flex-col items-center gap-2 p-3 sm:inset-x-auto sm:right-0 sm:bottom-0 sm:items-end sm:p-4"
    >
      {toasts.map((toast) => {
        const { icon: Icon, iconClass, accent } = VARIANT_CONFIG[toast.variant];

        return (
          <div
            key={toast.id}
            className={cn(
              'animate-toast-in pointer-events-auto relative flex w-full max-w-sm items-start gap-3',
              'overflow-hidden rounded-xl border border-gray-200 bg-white p-3.5 pl-4 shadow-lift',
            )}
          >
            <span className={cn('absolute inset-y-0 left-0 w-1', accent)} aria-hidden="true" />

            <Icon className={cn('mt-0.5 h-4.5 w-4.5 shrink-0', iconClass)} aria-hidden="true" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-[13px] leading-relaxed text-gray-500">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-mt-0.5 -mr-0.5 shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
