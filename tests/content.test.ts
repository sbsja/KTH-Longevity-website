import { describe, expect, it } from "vitest";
import { events, eventSortKey, featuredEvent, getEvent, pastEvents, upcomingEvents } from "@/content/events";
import { featured, findItemByHref, sectionCard } from "@/content/featured";
import { forms } from "@/content/forms";
import { links } from "@/content/links";
import { advisors, board, teams } from "@/content/people";
import { projects } from "@/content/projects";
import { research, researchByTopic } from "@/content/research";
import { milestones } from "@/content/site";
import { primaryNav } from "@/lib/navigation";

const routes = new Set(["/", ...primaryNav.map((i) => i.href), "/research/", ...events.map((e) => `/events/${e.slug}/`)]);

describe("events", () => {
  it("have unique slugs and every past event is marked past", () => {
    const slugs = events.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const e of pastEvents) expect(e.status).toBe("past");
  });
  it("only carry a structured date when the day is established", () => {
    for (const e of events) {
      if (e.date.iso) {
        expect(e.date.precision).toBe("day");
        expect(e.date.iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      } else {
        expect(e.date.precision).not.toBe("day");
        expect(e.date.display).not.toMatch(/\d{1,2} (September|October) 2026/);
      }
    }
    expect(getEvent("breaking-through-the-blood-brain-barrier")?.date.iso).toBeUndefined();
    expect(getEvent("medai-hackathon")?.date.iso).toBe("2025-09-22");
    expect(getEvent("measuring-aging")?.date.iso).toBe("2025-02-18");
    expect(getEvent("kickoff-seed")?.date.iso).toBe("2024-12-17");
  });
  it("lists past events newest first and upcoming events soonest first", () => {
    const keys = pastEvents.map(eventSortKey);
    expect([...keys].sort().reverse()).toEqual(keys);
    expect(pastEvents[0].slug).toBe("breaking-through-the-blood-brain-barrier");
    expect(pastEvents.at(-1)?.slug).toBe("kickoff-seed");
    const up = upcomingEvents.map(eventSortKey);
    expect([...up].sort()).toEqual(up);
  });
  it("never expose a registration link on a past event", () => {
    for (const e of pastEvents) expect(e.registrationUrl ?? null).toBeNull();
  });
  it("has no verified upcoming event right now (so the empty state renders)", () => {
    expect(upcomingEvents).toHaveLength(0);
    expect(featuredEvent.slug).toBe("breaking-through-the-blood-brain-barrier");
  });
  it("only links to verified public pages", () => {
    for (const e of events) {
      if (e.externalUrl) expect(e.externalUrl).toMatch(/^https:\/\/(luma\.com|lu\.ma)\//);
    }
  });
});

describe("featured gallery", () => {
  it("has seven cards: the six sections in navigation order plus one featured event", () => {
    expect(featured).toHaveLength(7);
    expect(featured.filter((i) => i.kind === "event")).toHaveLength(1);
    expect(featured.filter((i) => i.kind === "section").map((i) => i.section)).toEqual(primaryNav.map((i) => i.section));
    expect(featured[0].id).toBe(`event:${featuredEvent.slug}`);
  });
  it("links every card to a real route", () => {
    for (const item of featured) {
      const base = item.href.split("#")[0];
      expect(routes.has(base), `${item.id} -> ${item.href}`).toBe(true);
    }
    for (const nav of primaryNav) expect(sectionCard(nav.section).href).toBe(nav.href);
  });
  it("uses the seven cell-cycle covers in sequence, each with alt text", () => {
    expect(featured.map((i) => i.cover.id)).toEqual([
      "stage-1-interphase",
      "stage-2-prophase",
      "stage-3-prometaphase",
      "stage-4-metaphase",
      "stage-5-anaphase",
      "stage-6-telophase",
      "stage-7-daughter-cells",
    ]);
    for (const item of featured) {
      expect(item.title.length).toBeGreaterThan(3);
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.cover.alt).toMatch(/^Illustration: /);
    }
    const ids = featured.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("resolves routes back to cards, with the Events card for unfeatured event pages", () => {
    expect(findItemByHref("/about")?.id).toBe("section:about");
    expect(findItemByHref("/jobs/")?.id).toBe("section:jobs");
    expect(findItemByHref(`/events/${featuredEvent.slug}/`)?.id).toBe(`event:${featuredEvent.slug}`);
    expect(findItemByHref("/events/measuring-aging/")?.id).toBe("section:events");
    expect(findItemByHref("/research/")).toBeUndefined();
    expect(findItemByHref("/nowhere/")).toBeUndefined();
  });
});

describe("research", () => {
  it("uses public DOI links and declares a study type for every item", () => {
    for (const r of research) {
      expect(r.url).toBe(`https://doi.org/${r.doi}`);
      expect(r.url).not.toMatch(/focus\.lib\.kth\.se/);
      expect(r.studyType.length).toBeGreaterThan(0);
      expect(r.year).toBeGreaterThanOrEqual(2024);
    }
  });
  it("groups every item under a topic", () => {
    const grouped = researchByTopic().flatMap((g) => g.items);
    expect(grouped).toHaveLength(research.length);
  });
  it("labels preprints and commentaries as such", () => {
    const preprint = research.find((r) => r.doi.startsWith("10.1101/"));
    expect(preprint?.studyType).toBe("Preprint, not peer reviewed");
    const nv = research.find((r) => r.id === "somatic-mutations-epigenetic-clocks");
    expect(nv?.studyType).toBe("Preview article");
  });
});

describe("people, history, projects", () => {
  it("names only roles the board recorded, and no portraits", () => {
    expect(board.map((p) => p.role)).toEqual([
      "Chairperson",
      "Vice Chairperson",
      "Partnerships Lead",
      "Communications Lead",
      "Digital Development Lead",
    ]);
    expect(advisors).toHaveLength(2);
    expect(teams.map((t) => t.id)).toEqual(["partnerships", "communications", "digital"]);
  });
  it("keeps the first event and the formal constitution as separate milestones, in order", () => {
    const keys = milestones.map((m) => m.sortKey);
    expect([...keys].sort()).toEqual(keys);
    expect(milestones.find((m) => m.sortKey === "2024-12-17")?.title).toMatch(/first evening/i);
    expect(milestones.find((m) => m.sortKey === "2025-11-03")?.title).toMatch(/constituted/i);
  });
  it("has exactly one project, the website, with no invented links or completion figures", () => {
    expect(projects).toHaveLength(1);
    expect(projects[0].slug).toBe("website");
    expect(projects[0].status).toBe("Ongoing");
    expect(projects[0].links).toEqual([]);
    expect(JSON.stringify(projects[0])).not.toMatch(/\d+ ?%/);
  });
});

describe("links and forms", () => {
  it("keeps private addresses and editor links out of the configuration", () => {
    const serialized = JSON.stringify(links);
    // Only the organisation mailbox may appear; no personal address of any member.
    const addresses = serialized.match(/[\w.+-]+@[\w.-]+/g) ?? [];
    expect(addresses).toEqual(["kthlongevity@gmail.com"]);
    expect(serialized).not.toMatch(/docs\.google\.com\/forms/);
    expect(links.recruitmentForm).toBeNull();
    expect(links.contactEmail).toBe("kthlongevity@gmail.com");
  });
  it("has no secrets in the form configuration and only https endpoints when set", () => {
    const serialized = JSON.stringify(forms);
    expect(serialized).not.toMatch(/api[_-]?key|secret|token/i);
    for (const endpoint of [forms.contact.endpoint, forms.newsletter.endpoint, forms.newsletter.hostedSignupUrl]) {
      if (endpoint) expect(endpoint).toMatch(/^https:\/\//);
    }
  });
});
