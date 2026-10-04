"use client";

import { useSyncExternalStore } from "react";
import { featured, itemsFor } from "@/content/featured";
import type { Category, GalleryItem } from "@/content/types";

export type CategoryFilter = Category | "all";

export interface GalleryState {
  category: CategoryFilter;
  /** Index into the filtered item list. */
  activeIndex: number;
  /** Visitor-controlled pause of continuous motion. */
  paused: boolean;
  /** Set when the gallery initiated a navigation, so Back/Escape can return in place. */
  cameFromGallery: boolean;
  /** Incremented on every travel so listeners can react to repeated same-index requests. */
  travelVersion: number;
}

const initial: GalleryState = {
  category: "all",
  activeIndex: 0,
  paused: false,
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
    return itemsFor(state.category);
  },
  activeItem(): GalleryItem | undefined {
    return itemsFor(state.category)[state.activeIndex];
  },
  setIndex(i: number) {
    const n = itemsFor(state.category).length;
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
  setCategory(category: CategoryFilter) {
    if (category === state.category) return;
    const current = galleryStore.activeItem();
    const items = itemsFor(category);
    const keep = current ? items.findIndex((i) => i.id === current.id) : -1;
    set({ category, activeIndex: keep >= 0 ? keep : 0, travelVersion: state.travelVersion + 1 });
  },
  focusItem(id: string) {
    const items = itemsFor(state.category);
    let idx = items.findIndex((i) => i.id === id);
    if (idx < 0) {
      // Item is outside the current filter: widen to everything.
      const all = featured.findIndex((i) => i.id === id);
      if (all < 0) return;
      set({ category: "all", activeIndex: all, travelVersion: state.travelVersion + 1 });
      return;
    }
    idx = Math.max(0, idx);
    set({ activeIndex: idx, travelVersion: state.travelVersion + 1 });
  },
  setPaused(paused: boolean) {
    set({ paused });
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
