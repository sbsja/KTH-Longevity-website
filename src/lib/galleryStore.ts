"use client";

import { useSyncExternalStore } from "react";
import { featured } from "@/content/featured";
import type { GalleryItem } from "@/content/types";

export interface GalleryState {
  /** Index into the featured items. */
  activeIndex: number;
  /** Set when the gallery initiated a navigation, so Back/Escape can return in place. */
  cameFromGallery: boolean;
  /** Incremented on every travel so listeners can react to repeated same-index requests. */
  travelVersion: number;
}

const initial: GalleryState = {
  activeIndex: 0,
  cameFromGallery: false,
  travelVersion: 0,
};

let state: GalleryState = initial;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function set(partial: Partial<GalleryState>) {
  state = { ...state, ...partial };
  emit();
}

export const galleryStore = {
  getState: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  items(): GalleryItem[] {
    return featured;
  },
  activeItem(): GalleryItem | undefined {
    return featured[state.activeIndex];
  },
  setIndex(i: number) {
    const n = featured.length;
    if (n === 0) return;
    const wrapped = ((i % n) + n) % n;
    set({ activeIndex: wrapped, travelVersion: state.travelVersion + 1 });
  },
  next() {
    galleryStore.setIndex(state.activeIndex + 1);
  },
  prev() {
    galleryStore.setIndex(state.activeIndex - 1);
  },
  focusItem(id: string) {
    const idx = featured.findIndex((i) => i.id === id);
    if (idx < 0 || idx === state.activeIndex) return;
    set({ activeIndex: idx, travelVersion: state.travelVersion + 1 });
  },
  markNavigation(fromGallery: boolean) {
    set({ cameFromGallery: fromGallery });
  },
  reset() {
    state = initial;
    emit();
  },
};

const getServerSnapshot = () => initial;

export function useGalleryState(): GalleryState {
  return useSyncExternalStore(galleryStore.subscribe, galleryStore.getState, getServerSnapshot);
}

/**
 * Shortest wrapped distance from `from` to `to` on a ring of `n` items.
 * Positive means `to` is ahead (next), negative behind (previous).
 */
export function ringOffset(from: number, to: number, n: number): number {
  if (n <= 0) return 0;
  let d = (to - from) % n;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}
