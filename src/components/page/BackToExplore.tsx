"use client";

import styles from "./BackToExplore.module.css";

/**
 * The way out of any content page: a rounded capsule with a chevron, sticky at
 * the top of the reading column so it stays reachable on long pages. The desktop
 * Esc hint describes the shortcut handled by the page shell.
 */
export function BackToExplore({ onBack }: { onBack: () => void }) {
  return (
    <div className={styles.wrap}>
      <button type="button" className={`${styles.back} mono`} onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Explore
        <kbd className={styles.kbd} aria-hidden="true">
          Esc
        </kbd>
      </button>
    </div>
  );
}
