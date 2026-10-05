"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { events } from "@/content/events";
import { useEscape } from "@/lib/escapeStack";
import { currentAttr, norm, primaryNav } from "@/lib/navigation";
import { Logo } from "./Logo";
import styles from "./Nav.module.css";

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="m3 5 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Persistent header: the logo at the top left, the six sections centred on the
 * viewport (a 1fr / auto / 1fr grid, so the bar is centred regardless of the
 * logo's width), an accessible Events submenu listing each event page, and a
 * labelled menu at narrow widths with the same six destinations.
 */
export function Nav() {
  const pathname = usePathname();
  // Open state is keyed by the route it was opened on, so a route change closes
  // both menus without an effect.
  const [eventsOpenAt, setEventsOpenAt] = useState<string | null>(null);
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const eventsOpen = eventsOpenAt === pathname;
  const menuOpen = menuOpenAt === pathname;
  const setEventsOpen = (open: boolean) => setEventsOpenAt(open ? pathname : null);
  const setMenuOpen = (open: boolean) => setMenuOpenAt(open ? pathname : null);
  const eventsBtn = useRef<HTMLButtonElement>(null);
  const eventsMenu = useRef<HTMLUListElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const eventsId = useId();

  // Escape closes the most recently opened menu before anything else on the page.
  useEscape(() => {
    setEventsOpen(false);
    eventsBtn.current?.focus();
  }, eventsOpen);
  useEscape(() => {
    setMenuOpen(false);
    menuBtn.current?.focus();
  }, menuOpen);

  // Pointer outside an open menu closes it.
  useEffect(() => {
    if (!eventsOpen && !menuOpen) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (eventsOpen && !eventsMenu.current?.contains(t) && !eventsBtn.current?.contains(t)) setEventsOpenAt(null);
      if (menuOpen && !menuPanel.current?.contains(t) && !menuBtn.current?.contains(t)) setMenuOpenAt(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [eventsOpen, menuOpen]);

  // Focus moves into a menu when it opens.
  useEffect(() => {
    if (eventsOpen) eventsMenu.current?.querySelector<HTMLElement>("a")?.focus();
  }, [eventsOpen]);
  useEffect(() => {
    if (menuOpen) menuPanel.current?.querySelector<HTMLElement>("a")?.focus();
  }, [menuOpen]);

  const eventLinks = (className: string) =>
    events.map((e) => (
      <li key={e.slug}>
        <Link
          href={`/events/${e.slug}/`}
          className={className}
          aria-current={norm(pathname) === `/events/${e.slug}/` ? "page" : undefined}
        >
          <span className={styles.subTitle}>{e.title}</span>
          <span className={`${styles.subMeta} mono`}>{e.date.display}</span>
        </Link>
      </li>
    ));

  return (
    <header className={styles.header}>
      <Logo className={styles.logo} />

      <nav aria-label="Primary" className={styles.bar}>
        <ul className={styles.list}>
          {primaryNav.map((item) => (
            <li key={item.href} className={styles.item}>
              <Link href={item.href} className={`${styles.link} mono`} aria-current={currentAttr(pathname, item.href, item.section)}>
                {item.label}
              </Link>
              {item.section === "events" && (
                <>
                  <button
                    ref={eventsBtn}
                    type="button"
                    className={styles.disclosure}
                    aria-expanded={eventsOpen}
                    aria-controls={eventsId}
                    aria-label="Show event pages"
                    onClick={() => setEventsOpen(!eventsOpen)}
                  >
                    <Chevron />
                  </button>
                  <ul id={eventsId} ref={eventsMenu} className={styles.submenu} hidden={!eventsOpen}>
                    {eventLinks(styles.subLink)}
                    <li>
                      <Link href="/events/" className={`${styles.subLink} ${styles.subAll} mono`}>
                        All events, upcoming and past
                      </Link>
                    </li>
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.end}>
        <button
          ref={menuBtn}
          type="button"
          className={`${styles.menuButton} mono`}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={styles.burger} aria-hidden="true">
            <i />
            <i />
          </span>
          Menu
        </button>
      </div>

      <div id="site-menu" ref={menuPanel} className={styles.panel} hidden={!menuOpen}>
        <nav aria-label="Site menu">
          <ul className={styles.panelList}>
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.panelLink} aria-current={currentAttr(pathname, item.href, item.section)}>
                  {item.label}
                </Link>
                {item.section === "events" && <ul className={styles.panelSub}>{eventLinks(styles.panelSubLink)}</ul>}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
