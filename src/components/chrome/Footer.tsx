import Link from "next/link";
import { links } from "@/content/links";
import { site } from "@/content/site";
import { primaryNav, secondaryNav } from "@/lib/navigation";
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
          {primaryNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
          {secondaryNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
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
