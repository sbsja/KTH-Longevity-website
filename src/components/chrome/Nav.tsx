"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./Wordmark";
import { site } from "@/content/site";
import styles from "./Nav.module.css";

const items = [
  { href: "/", label: "Explore" },
  { href: "/about/", label: "About" },
  { href: "/join/", label: "Join" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/events") || pathname.startsWith("/research") || pathname.startsWith("/explore");
  return pathname.startsWith(href.replace(/\/$/, ""));
}

export function Nav() {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label={`${site.name}, home`}>
        <Wordmark size={15} />
        <span className={styles.brandText}>
          <span className={styles.brandName}>{site.name}</span>
          <span className={styles.brandTag}>{site.tagline}</span>
        </span>
      </Link>

      <nav aria-label="Primary" className={styles.capsule}>
        <ul className={styles.list}>
          {items.map((item, i) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className={styles.item}>
                {i > 0 && <span className={styles.rule} aria-hidden="true" />}
                <Link
                  href={item.href}
                  className={`${styles.link} mono`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
