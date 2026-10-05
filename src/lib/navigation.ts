import type { SectionId } from "@/content/types";

/**
 * The site's top-level destinations and the rules for marking the current one.
 * Pure module: used by the header, the footer, the gallery mapping and unit tests.
 */
export type Section = SectionId;

export interface NavItem {
  href: string;
  label: string;
  section: Section;
}

/** The six primary sections, in the order they appear in the header. */
export const primaryNav: NavItem[] = [
  { href: "/about/", label: "About", section: "about" },
  { href: "/events/", label: "Events", section: "events" },
  { href: "/projects/", label: "Projects", section: "projects" },
  { href: "/jobs/", label: "Job board", section: "jobs" },
  { href: "/newsletter/", label: "Newsletter", section: "newsletter" },
  { href: "/contact/", label: "Contact", section: "contact" },
];

/**
 * Routes kept for old links. Each one redirects client-side to its new home
 * (a static export cannot issue server redirects). They are never recorded in
 * the in-session route history, so returning from a page never lands on one.
 */
export const legacyRoutes: Record<string, string> = {
  "/explore/": "/",
  "/join/": "/about/#participate",
};

/** Retained secondary pages: reachable from content and the footer, not from the primary navigation. */
export const secondaryNav: { href: string; label: string }[] = [{ href: "/research/", label: "Reading notes" }];

export const norm = (p: string) => (p.endsWith("/") ? p : `${p}/`);

/** Which section a pathname belongs to. Home, legacy and secondary routes belong to none. */
export function sectionOf(pathname: string): Section | null {
  const p = norm(pathname);
  for (const item of primaryNav) {
    if (p === item.href || p.startsWith(item.href)) return item.section;
  }
  return null;
}

/** aria-current: "page" on the exact route, "true" on the section parent (event details → Events). */
export function currentAttr(pathname: string, href: string, section: Section): "page" | "true" | undefined {
  if (norm(pathname) === norm(href)) return "page";
  if (sectionOf(pathname) === section) return "true";
  return undefined;
}

export function isLegacyRoute(pathname: string): boolean {
  return norm(pathname) in legacyRoutes;
}
