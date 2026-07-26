'use client';

import { useEffect, useRef } from 'react';

type EscapeHandler = () => void;

/**
 * Stack of active handlers, innermost last. A single document listener
 * dispatches to the top of the stack only, so when overlays are layered
 * (a lightbox above a dialog) Escape dismisses just the topmost one.
 */
const handlerStack: EscapeHandler[] = [];
let listenerAttached = false;

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;

  const top = handlerStack[handlerStack.length - 1];
  if (!top) return;

  event.preventDefault();
  top();
}

export function useEscapeKey(enabled: boolean, handler: EscapeHandler): void {
  // Kept in a ref so re-registering isn't required when the callback identity
  // changes — that would reorder the stack on every render.
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const entry: EscapeHandler = () => handlerRef.current();
    handlerStack.push(entry);

    if (!listenerAttached) {
      document.addEventListener('keydown', onKeyDown);
      listenerAttached = true;
    }

    return () => {
      const index = handlerStack.indexOf(entry);
      if (index !== -1) handlerStack.splice(index, 1);

      if (handlerStack.length === 0 && listenerAttached) {
        document.removeEventListener('keydown', onKeyDown);
        listenerAttached = false;
      }
    };
  }, [enabled]);
}
