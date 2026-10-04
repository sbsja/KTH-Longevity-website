"use client";

import gsap from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { categories } from "@/content/featured";
import { site } from "@/content/site";
import { galleryStore, useGalleryState } from "@/lib/galleryStore";
import { useSceneState } from "@/lib/sceneStore";
import { DESKTOP_QUERY, REDUCED_MOTION_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import { useGalleryInput, useSwipe } from "./useGalleryInput";
import styles from "./GalleryHud.module.css";

/**
 * The interface over the scene: category list, active item title and metadata,
 * previous/next, list view, motion control. Everything here is real HTML with
 * real links; the 3D panels are the picture, this is the content.
 *
 * On desktop the title sits exactly on the active panel: the scene publishes the
 * panel's projected rectangle as CSS variables on this element every frame.
 */
export function GalleryHud() {
  const router = useRouter();
  const state = useGalleryState();
  const { status } = useSceneState();
  const desktop = useMediaQuery(DESKTOP_QUERY, true);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY, false);
  const items = galleryStore.items();
  const item = items[state.activeIndex] ?? items[0];
  const sceneOn = status === "ready" || status === "loading";

  const root = useRef<HTMLDivElement>(null);
  const titleLink = useRef<HTMLAnchorElement>(null);
  const hero = useRef<HTMLDivElement>(null);

  useGalleryInput(desktop && sceneOn);
  useSwipe(hero, !desktop && sceneOn);

  // Restore focus to the active title when returning from a page the gallery opened.
  useEffect(() => {
    if (galleryStore.getState().cameFromGallery) {
      titleLink.current?.focus({ preventScroll: true });
      galleryStore.markNavigation(false);
    }
  }, []);

  // One restrained entrance: the chrome settles in after the HTML is on screen.
  useEffect(() => {
    if (!root.current || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-enter]", {
        opacity: 0,
        y: 10,
        duration: 0.8,
        stagger: 0.07,
        delay: 0.25,
        ease: "power2.out",
        clearProps: "transform",
      });
    }, root);
    return () => ctx.revert();
  }, [reducedMotion]);

  const open = () => {
    if (!item) return;
    galleryStore.markNavigation(true);
    router.push(item.href);
  };

  const count = items.length;
  const pos = count ? state.activeIndex + 1 : 0;

  return (
    <div ref={root} id="gallery-hud" className={styles.hud} data-scene={status}>
      {/* Intro: what this is, visible on first load */}
      <p className={styles.intro} data-enter>
        {site.description}
      </p>

      {/* Category list, left */}
      <nav className={styles.categories} aria-label="Gallery categories" data-enter>
        <p className={`${styles.categoriesLabel} mono`}>What are you looking for?</p>
        <ul>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`${styles.category} mono`}
                aria-pressed={state.category === c.id}
                onClick={() => galleryStore.setCategory(c.id)}
              >
                <span aria-hidden="true" className={styles.arrow}>
                  →
                </span>
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile swipe surface: the first viewport is the scene hero */}
      <div ref={hero} className={styles.hero} onClick={desktop ? undefined : open} aria-hidden="true" />

      {/* Active item: title on the panel, action under it */}
      <section className={styles.active} aria-roledescription="carousel" aria-label="Featured" data-enter>
        <div className={styles.activeInner} key={item?.id} aria-live="polite" aria-atomic="true">
          {item && (
            <>
              <div className={styles.onPanel}>
                <p className={`${styles.meta} mono`}>
                  <span>{item.label}</span>
                  {item.meta && (
                    <>
                      <span className={styles.dot} aria-hidden="true" />
                      <span>{item.meta}</span>
                    </>
                  )}
                </p>
                <h2 className={styles.title}>
                  <Link ref={titleLink} href={item.href} onClick={() => galleryStore.markNavigation(true)}>
                    {item.title}
                  </Link>
                </h2>
              </div>
              <div className={styles.underPanel}>
                <p className={styles.summary}>{item.summary}</p>
                <Link href={item.href} className={`btn btn-primary ${styles.cta}`} onClick={() => galleryStore.markNavigation(true)}>
                  {item.cta}
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Travel controls, right under the nav */}
      <div className={styles.controls} data-enter>
        <button type="button" className={styles.arrowBtn} onClick={() => galleryStore.prev()} aria-label="Previous item">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M11 3 5 9l6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <span className={`${styles.counter} mono`} aria-label={`Item ${pos} of ${count}`}>
          {String(pos).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
        <button type="button" className={styles.arrowBtn} onClick={() => galleryStore.next()} aria-label="Next item">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="m7 3 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      {/* Utilities, bottom */}
      <div className={styles.utilities} data-enter>
        <Link href="/explore/" className={`${styles.utility} mono`}>
          Browse as a list
        </Link>
        <button
          type="button"
          className={`${styles.utility} mono`}
          aria-pressed={state.paused}
          onClick={() => galleryStore.setPaused(!state.paused)}
        >
          {state.paused ? "Resume motion" : "Pause motion"}
        </button>
        <p className={`${styles.hint} mono`} aria-hidden="true">
          Scroll, swipe or use arrow keys
        </p>
      </div>
    </div>
  );
}
