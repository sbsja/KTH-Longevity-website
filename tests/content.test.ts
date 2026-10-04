import { describe, expect, it } from "vitest";
import { events, getEvent, pastEvents, upcomingEvents } from "@/content/events";
import { categories, featured, findItemByHref, itemsFor } from "@/content/featured";
import { links } from "@/content/links";
import { advisors, board, teams } from "@/content/people";
import { research, researchByTopic } from "@/content/research";

const routes = new Set(["/", "/explore/", "/events/", "/research/", "/about/", "/join/", ...events.map((e) => `/events/${e.slug}/`)]);

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
      }
    }
    expect(getEvent("breaking-through-the-blood-brain-barrier")?.date.iso).toBeUndefined();
    expect(getEvent("measuring-aging")?.date.iso).toBe("2025-02-18");
    expect(getEvent("kickoff-seed")?.date.iso).toBe("2024-12-17");
  });
  it("never expose a registration link on a past event", () => {
    for (const e of pastEvents) expect(e.registrationUrl ?? null).toBeNull();
  });
  it("has no verified upcoming event right now (so the empty state renders)", () => {
    expect(upcomingEvents).toHaveLength(0);
  });
});

describe("featured gallery", () => {
  it("links every item to a real route", () => {
    for (const item of featured) {
      const base = item.href.split("#")[0];
      expect(routes.has(base), `${item.id} -> ${item.href}`).toBe(true);
    }
  });
  it("has one shared model for 3D, list and detail", () => {
    const ids = featured.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of featured) {
      expect(item.title.length).toBeGreaterThan(3);
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.cover.id).toMatch(/^[a-z-]+$/);
    }
  });
  it("filters by category and resolves routes back to items", () => {
    expect(itemsFor("all")).toHaveLength(featured.length);
    for (const c of categories) {
      if (c.id === "all") continue;
      for (const i of itemsFor(c.id)) expect(i.category).toBe(c.id);
    }
    expect(findItemByHref("/events/measuring-aging")?.id).toBe("event:measuring-aging");
    expect(findItemByHref("/events/measuring-aging/")?.id).toBe("event:measuring-aging");
    expect(findItemByHref("/about")?.id).toBe("about:community");
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

describe("people and links", () => {
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
  it("keeps private addresses and editor links out of the configuration", () => {
    const serialized = JSON.stringify(links);
    // Only the organisation mailbox may appear; no personal address of any member.
    const addresses = serialized.match(/[\w.+-]+@[\w.-]+/g) ?? [];
    expect(addresses).toEqual(["kthlongevity@gmail.com"]);
    expect(serialized).not.toMatch(/docs\.google\.com\/forms/);
    expect(links.recruitmentForm).toBeNull();
    expect(links.contactEmail).toBe("kthlongevity@gmail.com");
  });
});
