"use client";

/**
 * A record of the internal routes visited in this session, in order, kept in
 * memory only. It answers one question safely: "where did the visitor come from
 * inside this site?" Unlike `window.history.length`, it never counts external
 * pages, and it empties on reload, so a direct load falls back to the home route.
 *
 * Back/Forward navigations are detected through `popstate` and pop the record
 * instead of pushing, so the record keeps mirroring the browser's back-chain.
 */
let stack: string[] = [];
let popPending = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const routeHistory = {
  /** Called whenever the pathname changes. */
  record(pathname: string) {
    if (popPending) {
      popPending = false;
      if (stack.length >= 2 && stack[stack.length - 2] === pathname) stack.pop();
      else if (stack[stack.length - 1] !== pathname) stack.push(pathname);
    } else if (stack[stack.length - 1] !== pathname) {
      stack.push(pathname);
    }
    if (stack.length > 60) stack = stack.slice(-60);
    emit();
  },
  /** Called from a popstate listener, before the router reports the new pathname. */
  markPop() {
    popPending = true;
  },
  current(): string | null {
    return stack[stack.length - 1] ?? null;
  },
  /** The internal route visited right before the current one, or null. */
  previous(): string | null {
    return stack.length >= 2 ? stack[stack.length - 2] : null;
  },
  size() {
    return stack.length;
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  reset() {
    stack = [];
    popPending = false;
    emit();
  },
};

/**
 * Decide how to leave the current page.
 * - `home`: the Back button and Escape. Uses browser back when the previous
 *   internal route is the home route (keeps history tidy), otherwise pushes "/".
 * - `origin`: the backdrop click. Returns to the previous internal route when
 *   there is one (home included), otherwise falls back to "/".
 */
export function planReturn(kind: "home" | "origin", pathname: string): { action: "back" | "push"; href: string } {
  const prev = routeHistory.previous();
  if (kind === "home") {
    return prev === "/" ? { action: "back", href: "/" } : { action: "push", href: "/" };
  }
  if (prev && prev !== pathname) return { action: "back", href: prev };
  return { action: "push", href: "/" };
}
