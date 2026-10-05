import type { ReactNode } from "react";
import { PageShell } from "./PageShell";
import styles from "./Article.module.css";

/**
 * Reading layout for every content page: the wide frosted surface. The
 * interactive shell (return button, Escape, gutter dismissal, heading focus)
 * lives in PageShell; this stays a server component so page content renders
 * as plain HTML.
 */
export function Article({ children, back = true }: { children: ReactNode; back?: boolean }) {
  return <PageShell back={back}>{children}</PageShell>;
}

export function Section({ title, children, id, lead }: { title?: string; children: ReactNode; id?: string; lead?: string }) {
  return (
    <section className={styles.section} id={id} aria-labelledby={id && title ? `${id}-title` : undefined}>
      {title && (
        <h2 id={id ? `${id}-title` : undefined} className={styles.sectionTitle}>
          {title}
        </h2>
      )}
      {lead && <p className={`${styles.sectionLead} prose`}>{lead}</p>}
      {children}
    </section>
  );
}

/** Intro block under a page heading: the lede and optional supporting paragraphs at reading width. */
export function Intro({ children }: { children: ReactNode }) {
  return <div className={`prose ${styles.intro}`}>{children}</div>;
}
