import type { Person, Team } from "./types";

/**
 * Roles as recorded in the board's own notes of 17 September and 1 October 2026,
 * reconciled with the annual meeting of 15 May 2026. This is the public subset
 * the board has named; the full board is elected at the annual meeting each May.
 * Descriptions repeat the responsibilities written in the notes; nothing is
 * inferred about individuals. No portraits are used.
 */
export const peopleAsOf = "October 2026";

export const board: Person[] = [
  { name: "Sara Jameel", role: "Chairperson", description: "Chairs the board and the association's meetings and opens its evenings." },
  { name: "Lorena Guzman", role: "Vice Chairperson", description: "Deputises for the chair and shares the treasurer's duties with her for the time being." },
  { name: "Alex Kairouz", role: "Partnerships Lead", description: "Leads the Partnerships team: partnerships and sponsorships with companies and research groups." },
  { name: "Julia Stark", role: "Communications Lead", description: "Leads the Communications team: marketing, social media and how events are announced." },
  { name: "Samer Jameel", role: "Digital Development Lead", description: "Leads the Digital Development team and the work on this website." },
];

export const advisors: Person[] = [
  { name: "Jonas Eriksson", role: "Advisor", description: "Board member since the association was constituted; advises the board and helps with interviews." },
  { name: "William Ferreira Andrén", role: "Advisor", description: "Board member since the association was constituted; co-hosted the MedAI Hackathon with KTH AI Society." },
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
    does: "Manages the website and the association's digital tools, from the Explore gallery to event pages and sign-up flows.",
    youCould: [
      "Propose and build features for the website",
      "Keep event, project and job-board content up to date",
      "Improve accessibility and performance",
    ],
  },
];
