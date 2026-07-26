'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Calls `handler` when a pointer press lands outside `ref`.
 *
 * Listens on `pointerdown` rather than `click` so the menu closes on press —
 * before a click on the element underneath resolves.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled: boolean,
  handler: () => void,
): void {
  useEffect(() => {
    if (!enabled) return;

    function onPointerDown(event: PointerEvent) {
      const element = ref.current;
      if (element && !element.contains(event.target as Node)) handler();
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [ref, enabled, handler]);
}
