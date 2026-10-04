"use client";

import { useSyncExternalStore } from "react";

/** Subscribe to a media query without a flash: server snapshot is the given default. */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverDefault,
  );
}

export const DESKTOP_QUERY = "(min-width: 1024px)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
