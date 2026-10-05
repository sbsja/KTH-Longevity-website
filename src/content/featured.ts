import { featuredEvent } from "./events";
import type { GalleryItem, SectionId } from "./types";

/**
 * The seven items on the home gallery's ring, in order. One card per primary
 * section plus one documented featured event, so the gallery reaches the same
 * places as the top navigation. The seven cell-cycle covers are assigned in
 * sequence; the featured event keeps the cover of its own record.
 */
function eventCard(): GalleryItem {
  const e = featuredEvent;
  return {
    id: `event:${e.slug}`,
    kind: "event",
    title: e.title,
    label: e.status === "upcoming" ? "Upcoming event" : "Latest event",
    meta: e.date.display,
    dateIso: e.date.iso,
    summary: e.summary,
    href: `/events/${e.slug}/`,
    cta: e.status === "upcoming" ? "About the event" : "Read about the event",
    cover: e.cover,
  };
}

export const featured: GalleryItem[] = [
  eventCard(),
  {
    id: "section:about",
    kind: "section",
    section: "about",
    title: "A student community for longevity science",
    label: "About",
    meta: "Stockholm, since 2024",
    summary:
      "Who we are, what we do and the people behind KTH Longevity: an independent non-profit student association exploring the science of a longer, healthier life.",
    href: "/about/",
    cta: "About us",
    cover: {
      id: "stage-2-prophase",
      alt: "Illustration: a cell in prophase, chromosomes condensing inside the nucleus while two centrosomes move apart.",
      palette: "tiffany",
    },
  },
  {
    id: "section:events",
    kind: "section",
    section: "events",
    title: "Evenings about a longer, healthier life",
    label: "Events",
    meta: "Upcoming and past",
    summary:
      "Talks, discussions and networking with researchers and companies working on ageing, usually on campus at KTH. See what is coming up and what we have hosted.",
    href: "/events/",
    cta: "See events",
    cover: {
      id: "stage-3-prometaphase",
      alt: "Illustration: a cell in prometaphase, spindle fibres reaching scattered chromosomes after the nuclear envelope has gone.",
      palette: "mixed",
    },
  },
  {
    id: "section:projects",
    kind: "section",
    section: "projects",
    title: "Building the KTH Longevity website",
    label: "Projects",
    meta: "Ongoing",
    summary:
      "Our current project is the site you are reading: what it is for, where it stands and how members can help shape it.",
    href: "/projects/",
    cta: "See the project",
    cover: {
      id: "stage-4-metaphase",
      alt: "Illustration: a cell in metaphase, chromosomes lined up on the equator between two spindle poles.",
      palette: "mixed",
    },
  },
  {
    id: "section:jobs",
    kind: "section",
    section: "jobs",
    title: "Opportunities to work on ageing",
    label: "Job board",
    meta: "Roles and positions",
    summary:
      "Roles in the association and positions at organisations working on longevity, posted once they are confirmed.",
    href: "/jobs/",
    cta: "Open the job board",
    cover: {
      id: "stage-5-anaphase",
      alt: "Illustration: a cell in anaphase, two sets of chromatids drawn toward opposite poles.",
      palette: "tiffany",
    },
  },
  {
    id: "section:newsletter",
    kind: "section",
    section: "newsletter",
    title: "Hear about the next evening first",
    label: "Newsletter",
    meta: "Updates by email",
    summary: "Society updates, upcoming events and project news by email, whenever there is something worth telling.",
    href: "/newsletter/",
    cta: "Subscribe",
    cover: {
      id: "stage-6-telophase",
      alt: "Illustration: a cell in telophase, two nuclei re-forming as a cleavage furrow pinches the middle.",
      palette: "mixed",
    },
  },
  {
    id: "section:contact",
    kind: "section",
    section: "contact",
    title: "Talk to us",
    label: "Contact",
    meta: "Questions and collaborations",
    summary: "Questions, collaboration ideas, a talk you would like to give or hear: write to the board and we will answer.",
    href: "/contact/",
    cta: "Get in touch",
    cover: {
      id: "stage-7-daughter-cells",
      alt: "Illustration: two daughter cells after cytokinesis, each with its own nucleus.",
      palette: "yellow",
    },
  },
];

const normalise = (pathname: string) => (pathname.endsWith("/") ? pathname : `${pathname}/`);

/** The card for a section, by id. */
export function sectionCard(section: SectionId): GalleryItem {
  const item = featured.find((i) => i.section === section);
  if (!item) throw new Error(`No gallery card for section ${section}`);
  return item;
}

/**
 * Which card a route belongs to: an exact match first, then the Events card for
 * any event page that is not itself featured. Legacy and unknown routes have no
 * card, so the gallery keeps its position.
 */
export function findItemByHref(pathname: string): GalleryItem | undefined {
  const p = normalise(pathname);
  const exact = featured.find((i) => i.href.split("#")[0] === p);
  if (exact) return exact;
  if (p.startsWith("/events/")) return sectionCard("events");
  return undefined;
}
