import Link from "next/link";
import type { GalleryItem } from "@/content/types";
import styles from "./HtmlGallery.module.css";
import { asset } from "@/lib/assetPath";

/**
 * The same items as the 3D gallery, as a plain HTML list. Used on phones and
 * tablets under the scene hero, on the list view, and whenever WebGL is not
 * available. Server-renderable, no JavaScript required.
 */
export function HtmlGallery({
  items,
  headingLevel = 3,
  compact = false,
}: {
  items: GalleryItem[];
  headingLevel?: 2 | 3;
  compact?: boolean;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  if (items.length === 0) {
    return <p className={`${styles.empty} muted`}>Nothing in this category yet.</p>;
  }
  return (
    <ul className={`${styles.grid} ${compact ? styles.compact : ""}`} data-gallery-list>
      {items.map((item) => (
        <li key={item.id} className={`card ${styles.item}`}>
          <img src={asset(`/covers/${item.cover.id}.svg`)} alt="" width={1200} height={750} loading="lazy" decoding="async" />
          <div className={styles.body}>
            <p className={`${styles.meta} mono`}>
              <span>{item.label}</span>
              {item.meta && <span className={styles.sep}>{item.meta}</span>}
            </p>
            <H className={styles.title}>
              <Link href={item.href} className={styles.link}>
                {item.title}
              </Link>
            </H>
            <p className={styles.summary}>{item.summary}</p>
            <span className={`${styles.cta} mono`} aria-hidden="true">
              {item.cta}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
