"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { galleryStore } from "@/lib/galleryStore";

const WHEEL_THRESHOLD = 90;
const COOLDOWN_MS = 520;

function isTypingTarget(t: EventTarget | null) {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable;
}

/**
 * Desktop gallery input: wheel/trackpad, arrow and page keys, and touch swipes
 * on the whole viewport. Only active on the home route on desktop, so no other
 * page's scrolling is ever touched.
 */
export function useGalleryInput(enabled: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    let acc = 0;
    let last = 0;
    let lastEvent = 0;

    const travel = (dir: 1 | -1) => {
      const now = performance.now();
      if (now - last < COOLDOWN_MS) return;
      last = now;
      if (dir > 0) galleryStore.next();
      else galleryStore.prev();
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // browser zoom gesture
      const now = performance.now();
      if (now - lastEvent > 220) acc = 0;
      lastEvent = now;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 120 : 1;
      const delta = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit;
      acc += delta;
      if (Math.abs(acc) >= WHEEL_THRESHOLD) {
        travel(acc > 0 ? 1 : -1);
        acc = 0;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isTypingTarget(e.target)) return;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          travel(1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          travel(-1);
          break;
        case "Home":
          e.preventDefault();
          galleryStore.setIndex(0);
          break;
        case "End":
          e.preventDefault();
          galleryStore.setIndex(galleryStore.items().length - 1);
          break;
        case "Enter": {
          // Only when focus is not already on an interactive element.
          const t = e.target as HTMLElement | null;
          if (t && t !== document.body && t.closest("a,button,[tabindex]")) return;
          const item = galleryStore.activeItem();
          if (item) {
            galleryStore.markNavigation(true);
            router.push(item.href);
          }
          break;
        }
      }
    };

    let touchStart: { x: number; y: number; t: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY, t: performance.now() };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      const dist = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (Math.abs(dist) > 48 && performance.now() - touchStart.t < 800) travel(dist < 0 ? 1 : -1);
      touchStart = null;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, router]);
}

/** Horizontal swipe inside one element (the mobile hero), leaving vertical page scroll alone. */
export function useSwipe(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let start: { x: number; y: number; t: number } | null = null;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start = { x: t.clientX, y: t.clientY, t: performance.now() };
    };
    const onEnd = (e: TouchEvent) => {
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3 && performance.now() - start.t < 800) {
        if (dx < 0) galleryStore.next();
        else galleryStore.prev();
      }
      start = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [ref, enabled]);
}
