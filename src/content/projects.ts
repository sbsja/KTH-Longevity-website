import type { Project } from "./types";

/**
 * Projects the association is actually running. One at the moment: this
 * website. Facts come from the repository and the board's meeting notes; see
 * docs/CONTENT-SOURCES.md. Nothing here is invented to fill a grid.
 */
export const projects: Project[] = [
  {
    slug: "website",
    title: "The KTH Longevity website",
    status: "Ongoing",
    team: "Digital Development",
    lead: "Samer Jameel",
    summary:
      "Building and improving the association's public home: the site you are reading, from the Explore gallery to the event pages, the job board and the forms.",
    purpose: [
      "KTH Longevity needed one place where students, researchers and companies can see what the association is, what it has hosted and how to take part, instead of piecing it together from Instagram posts and word of mouth.",
      "The website is also where the association's digital tools meet: event pages that stay accurate after the evening is over, a job board that can be kept current, a newsletter signup and a contact form that reaches the board.",
      "It is deliberately built from the association's own records. Every event, name and date on the site points back to a document, and open questions stay open until the board answers them.",
    ],
    provides: [
      "An interactive Explore gallery on the home page, with a plain HTML version for phones, reduced motion and browsers without WebGL",
      "Pages for each event the association has hosted, with programme, speakers and topics",
      "About, Projects, Job board, Newsletter and Contact sections fed by one shared content model",
      "A curated reading list of ageing research with the kind of study each paper is",
      "A static build that can be hosted anywhere, with no database or tracking",
    ],
    milestones: [
      { when: "April 2025", what: "The board set aside a budget line for a website and picked the domain name kthlongevity.com." },
      { when: "November 2025", what: "A website for members was put on the agenda, to follow the registration of the association." },
      { when: "January 2026", what: "Hosting and domain options were compared at the board meeting." },
      { when: "October 2026", what: "First release of the current site, with the Digital Development team formed to carry it on." },
    ],
    technologies: ["Next.js", "React", "TypeScript", "Three.js with React Three Fiber", "GSAP", "Playwright and Vitest"],
    links: [],
    contactSubject: "Contributing to the KTH Longevity website",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
