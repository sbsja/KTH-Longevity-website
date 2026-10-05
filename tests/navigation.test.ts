import { beforeEach, describe, expect, it } from "vitest";
import { escapeStack } from "@/lib/escapeStack";
import { currentAttr, isLegacyRoute, legacyRoutes, primaryNav, secondaryNav, sectionOf } from "@/lib/navigation";
import { planReturn, routeHistory } from "@/lib/routeHistory";

describe("sections and current states", () => {
  it("lists exactly the six sections in order", () => {
    expect(primaryNav.map((i) => [i.label, i.href])).toEqual([
      ["About", "/about/"],
      ["Events", "/events/"],
      ["Projects", "/projects/"],
      ["Job board", "/jobs/"],
      ["Newsletter", "/newsletter/"],
      ["Contact", "/contact/"],
    ]);
    const labels = primaryNav.map((i) => i.label);
    for (const removed of ["Explore", "Research", "Get involved", "Join", "Browse all"]) expect(labels).not.toContain(removed);
  });
  it("maps every route to its section; home, legacy and secondary routes to none", () => {
    expect(sectionOf("/")).toBeNull();
    expect(sectionOf("/about/")).toBe("about");
    expect(sectionOf("/events/")).toBe("events");
    expect(sectionOf("/events/measuring-aging/")).toBe("events");
    expect(sectionOf("/projects")).toBe("projects");
    expect(sectionOf("/jobs/")).toBe("jobs");
    expect(sectionOf("/newsletter/")).toBe("newsletter");
    expect(sectionOf("/contact/")).toBe("contact");
    expect(sectionOf("/research/")).toBeNull();
    expect(sectionOf("/explore/")).toBeNull();
    expect(sectionOf("/join/")).toBeNull();
    expect(sectionOf("/nowhere/")).toBeNull();
  });
  it("marks the exact page, and Events as the section of an event detail", () => {
    expect(currentAttr("/about/", "/about/", "about")).toBe("page");
    expect(currentAttr("/about/", "/events/", "events")).toBeUndefined();
    expect(currentAttr("/events/kickoff-seed/", "/events/", "events")).toBe("true");
    expect(currentAttr("/events/", "/events/", "events")).toBe("page");
    expect(currentAttr("/research/", "/about/", "about")).toBeUndefined();
  });
  it("keeps the old list and join routes as redirects, and research as a secondary page", () => {
    expect(legacyRoutes["/explore/"]).toBe("/");
    expect(legacyRoutes["/join/"]).toBe("/about/#participate");
    expect(isLegacyRoute("/explore")).toBe(true);
    expect(isLegacyRoute("/about/")).toBe(false);
    expect(secondaryNav.map((i) => i.href)).toEqual(["/research/"]);
  });
});

describe("routeHistory and return plans", () => {
  beforeEach(() => routeHistory.reset());

  it("falls back to home on a direct load", () => {
    routeHistory.record("/about/");
    expect(planReturn("origin", "/about/")).toEqual({ action: "push", href: "/" });
    expect(planReturn("home", "/about/")).toEqual({ action: "push", href: "/" });
  });
  it("goes back to home when home was the previous internal route", () => {
    routeHistory.record("/");
    routeHistory.record("/events/measuring-aging/");
    expect(planReturn("home", "/events/measuring-aging/")).toEqual({ action: "back", href: "/" });
    expect(planReturn("origin", "/events/measuring-aging/")).toEqual({ action: "back", href: "/" });
  });
  it("returns to the previous internal page from the gutter, but home from the button", () => {
    routeHistory.record("/");
    routeHistory.record("/projects/");
    routeHistory.record("/about/");
    expect(planReturn("origin", "/about/")).toEqual({ action: "back", href: "/projects/" });
    expect(planReturn("home", "/about/")).toEqual({ action: "push", href: "/" });
  });
  it("pops instead of pushing when the browser goes back", () => {
    routeHistory.record("/");
    routeHistory.record("/projects/");
    routeHistory.markPop();
    routeHistory.record("/");
    expect(routeHistory.size()).toBe(1);
    expect(routeHistory.previous()).toBeNull();
  });
  it("ignores repeated records of the same route", () => {
    routeHistory.record("/jobs/");
    routeHistory.record("/jobs/");
    expect(routeHistory.size()).toBe(1);
  });
});

describe("escape stack", () => {
  it("gives Escape to the most recently opened layer first", () => {
    const calls: string[] = [];
    const releasePage = escapeStack.push(() => calls.push("page"));
    const releaseMenu = escapeStack.push(() => calls.push("menu"));
    const ev = new Event("keydown") as KeyboardEvent;
    escapeStack.trigger(ev);
    releaseMenu();
    escapeStack.trigger(ev);
    releasePage();
    expect(calls).toEqual(["menu", "page"]);
    expect(escapeStack.trigger(ev)).toBe(false);
  });
});
