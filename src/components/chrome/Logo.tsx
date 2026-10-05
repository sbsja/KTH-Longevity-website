import Link from "next/link";
import { site } from "@/content/site";
import styles from "./Logo.module.css";

/**
 * The association's logo, as supplied: public/brand/kth-longevity-logo.png
 * (1008 × 480, the crossing symbol and "KTH LONGEVITY" on a rounded mint tile).
 * The file carries a lot of padding around the mark, so the frame below shows
 * only the mark's bounding box (x 175–838, y 172–308 of the source) at a fixed
 * height, keeping the image's own pixels and proportions. Linked to home.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={[styles.logo, className].filter(Boolean).join(" ")} aria-label={`${site.name}, home`}>
      <span className={styles.frame} aria-hidden="true">
        {/* Plain <img>: the asset is static and must not be re-encoded. */}
        <img src="/brand/kth-longevity-logo.png" alt="" width={1008} height={480} decoding="async" fetchPriority="high" />
      </span>
    </Link>
  );
}
