import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastState {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const TOAST_DURATION_MS = 4500;
const MAX_VISIBLE_TOASTS = 3;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  show: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    set((state) => ({ toasts: [...state.toasts, { ...toast, id }].slice(-MAX_VISIBLE_TOASTS) }));
    setTimeout(() => get().dismiss(id), TOAST_DURATION_MS);

    return id;
  },

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));

/**
 * Imperative helper so non-React code (services, handlers) can raise a toast
 * without pulling in a hook.
 */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().show({ variant: 'success', title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().show({ variant: 'error', title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().show({ variant: 'info', title, description }),
};
