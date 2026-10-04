/**
 * Shared content model.
 *
 * One set of records feeds the 3D gallery, the list view, the index pages and
 * the detail pages. Scene code never defines content; it only reads these types.
 */

export type Category = "events" | "research" | "community";

export type ItemKind = "event" | "research" | "about" | "team" | "announcement";

export type EventStatus = "past" | "upcoming" | "tba";

/** A date we can show. `iso` is only set when the day is established by a source. */
export interface EventDate {
  iso?: string;
  display: string;
  precision: "day" | "season" | "unknown";
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
  /** Path relative to the association's document folder. */
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
  /** One or two sentences for cards and the gallery. */
  summary: string;
  /** Paragraphs for the detail page. */
  description: string[];
  speakers: Speaker[];
  topics: string[];
  programme: ProgrammeEntry[];
  /** Presenting organisation, when an organisation (not an individual) presented. */
  presentedWith?: string;
  /** Only set for confirmed upcoming events with a verified public registration URL. */
  registrationUrl?: string | null;
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
}

export interface Team {
  id: string;
  name: string;
  lead?: string;
  does: string;
  youCould: string[];
}

export interface GalleryItem {
  id: string;
  kind: ItemKind;
  category: Category;
  title: string;
  /** Content type shown to visitors, e.g. "Event". */
  label: string;
  /** Short qualifier shown next to the label, e.g. "18 February 2025" or "Past event". */
  meta?: string;
  dateIso?: string;
  summary: string;
  href: string;
  cta: string;
  cover: CoverSpec;
}
