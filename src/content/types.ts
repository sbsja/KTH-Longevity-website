/**
 * Shared content model.
 *
 * One set of records feeds the 3D gallery, the HTML fallback list, the section
 * pages and the detail pages. Scene code never defines content; it only reads
 * these types.
 */

/** The six primary sections of the site, in navigation order. */
export type SectionId = "about" | "events" | "projects" | "jobs" | "newsletter" | "contact";

export type EventStatus = "past" | "upcoming" | "tba";

/** A date we can show. `iso` is only set when the day is established by a source. */
export interface EventDate {
  iso?: string;
  display: string;
  precision: "day" | "season" | "unknown";
  /**
   * Approximate ISO date used only for ordering when `iso` is unknown
   * (for example "2026-09" for an autumn event). Never displayed.
   */
  sortKey?: string;
}

export interface Speaker {
  name: string;
  roleAtEvent?: string;
  /** Affiliation or title as stated at the time of the event. */
  affiliationAtEvent?: string;
  note?: string;
}

export interface ProgrammeEntry {
  time?: string;
  title: string;
}

export interface SourceRef {
  /** Path relative to the association's document folder, or a public URL. */
  path: string;
  note?: string;
}

export type CoverPalette = "tiffany" | "yellow" | "green" | "mixed";

export interface CoverSpec {
  /** Maps to /covers/<id>.svg */
  id: string;
  alt: string;
  palette: CoverPalette;
}

export interface EventRecord {
  slug: string;
  title: string;
  subtitle?: string;
  status: EventStatus;
  date: EventDate;
  venue?: string;
  /** Format shown next to the date, e.g. "Talk and discussion" or "Hackathon". */
  format?: string;
  /** One or two sentences for cards and the gallery. */
  summary: string;
  /** Paragraphs for the detail page. */
  description: string[];
  speakers: Speaker[];
  topics: string[];
  programme: ProgrammeEntry[];
  /** Presenting organisation(s), when organisations rather than individuals presented. */
  presentedWith?: string;
  /** Only set for confirmed upcoming events with a verified public registration URL. */
  registrationUrl?: string | null;
  /** A verified public page about the event (for example its Luma page), shown as a secondary link. */
  externalUrl?: string;
  externalLabel?: string;
  cover: CoverSpec;
  sources: SourceRef[];
}

export type StudyType =
  | "Human cohort study"
  | "Human observational study"
  | "Mouse study"
  | "Cell study"
  | "Review"
  | "Preview article"
  | "Preprint, not peer reviewed";

export interface ResearchItem {
  id: string;
  topic: string;
  title: string;
  journal: string;
  year: number;
  studyType: StudyType;
  /** Plain-language summary written by us; findings belong to the authors. */
  summary: string;
  /** What the study can and cannot tell us. */
  caveat?: string;
  doi: string;
  url: string;
  sources: SourceRef[];
}

export interface Person {
  name: string;
  role: string;
  /** One sentence on what the role covers, only where the board's notes support it. */
  description?: string;
}

export interface Team {
  id: string;
  name: string;
  lead?: string;
  does: string;
  youCould: string[];
}

export interface Milestone {
  when: string;
  title: string;
  text: string;
  /** ISO date or month for ordering, e.g. "2024-12-17" or "2025-11". */
  sortKey: string;
}

export type ProjectStatus = "Ongoing" | "Completed" | "Planned";

export interface Project {
  slug: string;
  title: string;
  status: ProjectStatus;
  team: string;
  lead?: string;
  summary: string;
  /** Why the project exists. */
  purpose: string[];
  /** What it delivers today. */
  provides: string[];
  milestones: { when: string; what: string }[];
  technologies: string[];
  /** Verified public links only. */
  links: { label: string; href: string }[];
  /** Subject line suggested when someone writes in about contributing. */
  contactSubject: string;
}

export type JobType = "Society role" | "Internship" | "Thesis project" | "Research position" | "Part-time" | "Full-time" | "Volunteer";

export type WorkArrangement = "On site" | "Hybrid" | "Remote";

export interface JobListing {
  id: string;
  title: string;
  organisation: string;
  location: string;
  arrangement?: WorkArrangement;
  type: JobType;
  summary?: string;
  /** ISO date of the application deadline; omit when the listing has none. */
  deadline?: string;
  /** Verified public application link. */
  applyUrl: string;
  /** ISO date the listing was approved for publication. */
  postedOn: string;
  /** Set to "closed" to retire a listing before its deadline. */
  status?: "open" | "closed";
}

export interface GalleryItem {
  id: string;
  kind: "section" | "event";
  section?: SectionId;
  title: string;
  /** Content type shown to visitors, e.g. "Event" or "About". */
  label: string;
  /** Short qualifier shown next to the label, e.g. "Autumn 2026" or "Updates by email". */
  meta?: string;
  dateIso?: string;
  summary: string;
  href: string;
  cta: string;
  cover: CoverSpec;
}
