"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useEscape } from "@/lib/escapeStack";
import { planReturn } from "@/lib/routeHistory";
import { BackToExplore } from "./BackToExplore";
import styles from "./Article.module.css";

/**
 * The shared shell around every content page: one wide, centred reading
 * surface over the calmed scene.
 *
 * - "Back to Explore" and Escape return to the home gallery, which keeps its
 *   position because the scene and its store never unmount. Escape pressed in a
 *   form field only leaves the field.
 * - The exposed gutter outside the surface dismisses the page back to wherever
 *   the visitor came from inside the site (home included), falling back to home
 *   on direct loads. Only a press that both starts and ends on the gutter
 *   counts, so drags, text selection, form use and clicks on content never do.
 * - Focus moves to the page heading on arrival.
 */
export function PageShell({ children, back = true }: { children: ReactNode; back?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const column = useRef<HTMLDivElement>(null);
  const pressedOnBackdrop = useRef(false);

  const leave = (kind: "home" | "origin") => {
    const plan = planReturn(kind, pathname);
    if (plan.action === "back") router.back();
    else router.push(plan.href);
  };

  // Escape returns home, except while a form field has focus: there it only
  // leaves the field, so typing or selecting text in a form never closes the page.
  useEscape((e) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.matches("input, textarea, select, [contenteditable]") || t.isContentEditable)) {
      t.blur();
      return;
    }
    leave("home");
  }, back);

  useEffect(() => {
    const heading = column.current?.querySelector<HTMLElement>("h1");
    if (!heading) return;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className={`page ${styles.article}`}>
      <div
        className={styles.backdrop}
        aria-hidden="true"
        data-testid="page-backdrop"
        onPointerDown={(e) => {
          pressedOnBackdrop.current = e.button === 0 && e.target === e.currentTarget;
        }}
        onPointerUp={(e) => {
          const ok = pressedOnBackdrop.current && e.target === e.currentTarget;
          pressedOnBackdrop.current = false;
          if (ok) leave("origin");
        }}
        onPointerCancel={() => {
          pressedOnBackdrop.current = false;
        }}
        onPointerLeave={() => {
          pressedOnBackdrop.current = false;
        }}
      />
      <div ref={column} className={styles.column} data-testid="page-surface">
        {back && <BackToExplore onBack={() => leave("home")} />}
        {children}
      </div>
    </div>
  );
}
