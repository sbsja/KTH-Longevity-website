import type { Person, Team } from "./types";

/**
 * Roles as recorded in the board's own notes of 17 September and 1 October 2026,
 * reconciled with the annual meeting of 15 May 2026. This is the public subset
 * the board has named; the full board is elected at the annual meeting each May.
 */
export const peopleAsOf = "October 2026";

export const board: Person[] = [
  { name: "Sara Jameel", role: "Chairperson" },
  { name: "Lorena Guzman", role: "Vice Chairperson" },
  { name: "Alex Kairouz", role: "Partnerships Lead" },
  { name: "Julia Stark", role: "Communications Lead" },
  { name: "Samer Jameel", role: "Digital Development Lead" },
];

export const advisors: Person[] = [
  { name: "Jonas Eriksson", role: "Advisor" },
  { name: "William Ferreira Andrén", role: "Advisor" },
];

export const teams: Team[] = [
  {
    id: "partnerships",
    name: "Partnerships",
    lead: "Alex Kairouz",
    does: "Manages partnerships and sponsorships: finding researchers and companies to speak at or support events, and keeping those relationships going between events.",
    youCould: [
      "Research companies and labs working on ageing and write the first email",
      "Prepare proposals for hosting or sponsoring an event",
      "Look after guests on event night",
    ],
  },
  {
    id: "communications",
    name: "Communications",
    lead: "Julia Stark",
    does: "Manages marketing and social media: announcing events, running the Instagram account, posters and QR codes on campus, and photography.",
    youCould: [
      "Plan the announcement of the next event and make it stand out",
      "Design posters and short-form video",
      "Photograph events and write recaps",
    ],
  },
  {
    id: "digital",
    name: "Digital Development",
    lead: "Samer Jameel",
    does: "Manages the website and the association's digital tools, from this gallery to event pages and sign-up flows.",
    youCould: [
      "Propose and build features for the website",
      "Keep event and research content up to date",
      "Improve accessibility and performance",
    ],
  },
];
