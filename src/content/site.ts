import type { Milestone } from "./types";

export const site = {
  name: "KTH Longevity",
  shortName: "KTH Longevity",
  tagline: "Connecting students with longevity innovation.",
  description:
    "Explore the science of a longer, healthier life through talks, projects and a student community in Stockholm.",
  locale: "en",
  city: "Stockholm",
  /** From the statutes (§2) and the kickoff deck, translated. */
  purpose:
    "KTH Longevity exists to grow interest in and knowledge of longevity: the science and strategies that support a long and healthy life, with a particular focus on scientific progress and on wellness and health. It does that by building a community through events and discussions.",
  /** Dates that the documents actually support. */
  history: {
    firstEvent: "December 2024",
    constituted: "November 2025",
    legalForm: "independent non-profit student association (ideell förening)",
  },
} as const;

/**
 * Milestones the documents support, in chronological order. Each entry names
 * its source in docs/CONTENT-SOURCES.md.
 */
export const milestones: Milestone[] = [
  {
    sortKey: "2024-12-17",
    when: "December 2024",
    title: "The first evening",
    text: "Kickoff at KTH on 17 December: a stage session with Linus Petersson on why students should work on ageing, then discussion and networking.",
  },
  {
    sortKey: "2025-02-18",
    when: "February 2025",
    title: "Measuring Aging",
    text: "The second evening, with Karolina Gustavsson of Karolinska Institutet on biological age, ageing clocks and dementia risk.",
  },
  {
    sortKey: "2025-09-22",
    when: "September 2025",
    title: "MedAI Hackathon",
    text: "A one-week machine-learning hackathon on diagnostics data, co-hosted with KTH AI Society and ABC Labs, from kick-off to demo day.",
  },
  {
    sortKey: "2025-11-03",
    when: "November 2025",
    title: "Constituted as an association",
    text: "The constituting board meeting on 3 November made KTH Longevity an independent non-profit association with statutes of its own.",
  },
  {
    sortKey: "2026-01",
    when: "January 2026",
    title: "Registered",
    text: "The association received its organisation number, the step that lets it hold funds and sign agreements in its own name.",
  },
  {
    sortKey: "2026-05-15",
    when: "May 2026",
    title: "Annual meeting",
    text: "The annual meeting on 15 May elected the board for 2026, as the statutes require each May.",
  },
  {
    sortKey: "2026-09",
    when: "Autumn 2026",
    title: "Breaking Through the Blood-Brain Barrier",
    text: "An evening with BioArctic at KTH Innovation, with more than 300 approved registrations: the largest evening so far.",
  },
  {
    sortKey: "2026-10",
    when: "October 2026",
    title: "Teams and a website",
    text: "The first open application round for the Partnerships, Communications and Digital Development teams, and the release of this website.",
  },
];
