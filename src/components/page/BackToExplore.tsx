"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { galleryStore } from "@/lib/galleryStore";
import styles from "./BackToExplore.module.css";

/**
 * The way out of a detail page. Returns to the gallery at the same position
 * (history back when the gallery opened this page, otherwise a plain link),
 * and Escape does the same. Also moves focus to the page heading on arrival.
 */
export function BackToExplore({ headingId }: { headingId: string }) {
  const router = useRouter();
  const btn = useRef<HTMLButtonElement>(null);

  const close = () => {
    if (galleryStore.getState().cameFromGallery && window.history.length > 1) router.back();
    else router.push("/");
  };

  useEffect(() => {
    const h = document.getElementById(headingId);
    h?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headingId]);

  return (
    <button ref={btn} type="button" className={`${styles.back} mono`} onClick={close}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      Back to Explore
      <kbd className={styles.kbd} aria-hidden="true">
        Esc
      </kbd>
    </button>
  );
}
