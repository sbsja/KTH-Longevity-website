import type { ReactNode } from "react";
import styles from "./Article.module.css";

/**
 * Reading layout for content pages. `aside` is reserved for the detail-page
 * composition where the scene's panel sits to the right of the text column.
 */
export function Article({
  children,
  wide = false,
  detail = false,
}: {
  children: ReactNode;
  wide?: boolean;
  detail?: boolean;
}) {
  return (
    <div className={`page ${styles.article} ${detail ? styles.detail : ""} ${wide ? styles.wide : ""}`}>
      <div className={styles.column}>{children}</div>
    </div>
  );
}

export function Section({ title, children, id }: { title?: string; children: ReactNode; id?: string }) {
  return (
    <section className={styles.section} id={id} aria-labelledby={id && title ? `${id}-title` : undefined}>
      {title && (
        <h2 id={id ? `${id}-title` : undefined} className={styles.sectionTitle}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
