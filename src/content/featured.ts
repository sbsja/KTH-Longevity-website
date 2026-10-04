import { events, getEvent, nextEventNotice } from "./events";
import type { Category, GalleryItem } from "./types";

function eventItem(slug: string): GalleryItem {
  const e = getEvent(slug);
  if (!e) throw new Error(`Featured event missing: ${slug}`);
  return {
    id: `event:${e.slug}`,
    kind: "event",
    category: "events",
    title: e.title,
    label: "Event",
    meta: e.status === "past" && e.date.precision === "day" ? e.date.display : e.date.display,
    dateIso: e.date.iso,
    summary: e.summary,
    href: `/events/${e.slug}/`,
    cta: "Read about the event",
    cover: e.cover,
  };
}

/**
 * The featured items in gallery order. Seven items: three documented events,
 * the research notes, the association, the teams, and an honest "next event"
 * state. Nothing here is invented to fill the ring.
 */
export const featured: GalleryItem[] = [
  eventItem("breaking-through-the-blood-brain-barrier"),
  eventItem("measuring-aging"),
  {
    id: "research:notes",
    kind: "research",
    category: "research",
    title: "Reading notes on ageing science",
    label: "Research",
    meta: "Reading notes, 2025",
    summary:
      "Thirteen papers from the members' weekly reading list: ageing clocks, telomeres, immune ageing, diet and environment. Each with the kind of study it is and what it can tell us.",
    href: "/research/",
    cta: "Open the reading notes",
    cover: {
      id: "research",
      alt: "Abstract artwork: two thin helical strands in Tiffany blue and pale yellow crossing a deep green field.",
      palette: "mixed",
    },
  },
  eventItem("kickoff-seed"),
  {
    id: "about:community",
    kind: "about",
    category: "community",
    title: "A student community for longevity science",
    label: "Community",
    meta: "Stockholm",
    summary:
      "An independent non-profit student association that brings researchers, companies and students into the same room to talk about healthy ageing.",
    href: "/about/",
    cta: "About the association",
    cover: {
      id: "community",
      alt: "Abstract artwork: a constellation of small lights joined by fine lines on deep green.",
      palette: "tiffany",
    },
  },
  {
    id: "team:join",
    kind: "team",
    category: "community",
    title: "Join a team",
    label: "Get involved",
    meta: "Partnerships, Communications, Digital",
    summary:
      "Three small teams run the association between events. Find out what each one does and how to hear about the next application round.",
    href: "/join/",
    cta: "See how to get involved",
    cover: {
      id: "team",
      alt: "Abstract artwork: three overlapping translucent panels in Tiffany blue, pale yellow and green.",
      palette: "mixed",
    },
  },
  {
    id: "announcement:next-event",
    kind: "announcement",
    category: "events",
    title: nextEventNotice.title,
    label: "Upcoming",
    meta: "Date to be announced",
    summary: nextEventNotice.body,
    href: "/events/#upcoming",
    cta: "How to hear about it first",
    cover: {
      id: "next-event",
      alt: "Abstract artwork: a dashed ring of pale light around a single bright point on deep green.",
      palette: "yellow",
    },
  },
];

export const categories: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "events", label: "Events" },
  { id: "research", label: "Research" },
  { id: "community", label: "Community" },
];

export function itemsFor(category: Category | "all"): GalleryItem[] {
  return category === "all" ? featured : featured.filter((i) => i.category === category);
}

export function findItemByHref(pathname: string): GalleryItem | undefined {
  const norm = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return featured.find((i) => i.href.split("#")[0] === norm);
}

export const featuredEventSlugs = events.map((e) => e.slug);
