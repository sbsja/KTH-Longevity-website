import Link from "next/link";
import { links } from "@/content/links";
import { site } from "@/content/site";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.name}>{site.name}</p>
          <p className="muted">
            An {site.history.legalForm} in {site.city}.
          </p>
        </div>
        <ul className={styles.links} aria-label="Footer">
          <li>
            <Link href="/explore/">Browse everything</Link>
          </li>
          <li>
            <Link href="/events/">Events</Link>
          </li>
          <li>
            <Link href="/research/">Research</Link>
          </li>
          <li>
            <Link href="/about/">About</Link>
          </li>
          <li>
            <Link href="/join/">Join</Link>
          </li>
          <li>
            <a href={links.instagram} rel="noopener noreferrer" target="_blank">
              Instagram {links.instagramHandle}
            </a>
          </li>
          <li>
            <a href={`mailto:${links.contactEmail}`}>{links.contactEmail}</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
