import styles from "./Wordmark.module.css";

/**
 * The association's typographic mark: LONGEVITY set horizontally with K, T, H
 * running vertically through its T. Recreated from the BioArctic event cover as
 * live text in the display face, so it scales and reads as text.
 */
export function Wordmark({ size = 20, className }: { size?: number; className?: string }) {
  const unit = size; // cap height-ish unit in px
  return (
    <span className={[styles.mark, className].filter(Boolean).join(" ")} style={{ fontSize: unit }} aria-hidden="true">
      <span className={styles.row}>
        <span className={styles.k}>K</span>
      </span>
      <span className={styles.row}>
        <span className={styles.longevi}>LONGEVI</span>
        <span className={styles.t}>T</span>
        <span className={styles.y}>Y</span>
      </span>
      <span className={styles.row}>
        <span className={styles.h}>H</span>
      </span>
    </span>
  );
}
