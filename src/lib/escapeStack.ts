"use client";

import { useEffect, useRef } from "react";

/**
 * One window-level Escape listener for the whole site. Components register a
 * handler while they are "open"; the most recently registered one wins. So an
 * open menu closes before a page dismisses, and nothing has to coordinate.
 */
type Handler = (e: KeyboardEvent) => void;
const handlers: { fn: Handler }[] = [];
let installed = false;

function install() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || e.defaultPrevented) return;
    const top = handlers[handlers.length - 1];
    if (!top) return;
    e.preventDefault();
    top.fn(e);
  });
}

export function useEscape(fn: Handler, enabled = true) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    if (!enabled) return;
    install();
    const entry = { fn: (e: KeyboardEvent) => ref.current(e) };
    handlers.push(entry);
    return () => {
      const i = handlers.indexOf(entry);
      if (i >= 0) handlers.splice(i, 1);
    };
  }, [enabled]);
}

/** Exposed for tests. */
export const escapeStack = {
  depth: () => handlers.length,
  trigger(e: KeyboardEvent) {
    const top = handlers[handlers.length - 1];
    top?.fn(e);
    return !!top;
  },
  push(fn: Handler) {
    const entry = { fn };
    handlers.push(entry);
    return () => {
      const i = handlers.indexOf(entry);
      if (i >= 0) handlers.splice(i, 1);
    };
  },
};
