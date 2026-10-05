import { beforeEach, describe, expect, it } from "vitest";
import { featured } from "@/content/featured";
import { galleryStore, ringOffset } from "@/lib/galleryStore";
import { computeTarget } from "@/components/scene/layout";

describe("ringOffset", () => {
  it("returns the shortest wrapped distance", () => {
    expect(ringOffset(0, 1, 7)).toBe(1);
    expect(ringOffset(0, 6, 7)).toBe(-1);
    expect(ringOffset(6, 0, 7)).toBe(1);
    expect(ringOffset(3, 3, 7)).toBe(0);
    expect(ringOffset(0, 1, 2)).toBe(1);
    expect(ringOffset(0, 0, 0)).toBe(0);
  });
});

describe("galleryStore", () => {
  beforeEach(() => galleryStore.reset());

  it("travels forward and backward with wrap-around over all seven cards", () => {
    const n = featured.length;
    expect(n).toBe(7);
    expect(galleryStore.getState().activeIndex).toBe(0);
    galleryStore.prev();
    expect(galleryStore.getState().activeIndex).toBe(n - 1);
    galleryStore.next();
    expect(galleryStore.getState().activeIndex).toBe(0);
    galleryStore.setIndex(n + 2);
    expect(galleryStore.getState().activeIndex).toBe(2);
  });

  it("focuses a card by id (route → card mapping) and ignores unknown ids", () => {
    galleryStore.focusItem("section:newsletter");
    expect(galleryStore.activeItem()?.href).toBe("/newsletter/");
    const version = galleryStore.getState().travelVersion;
    galleryStore.focusItem("section:newsletter");
    expect(galleryStore.getState().travelVersion).toBe(version);
    galleryStore.focusItem("nope");
    expect(galleryStore.activeItem()?.href).toBe("/newsletter/");
  });

  it("has no manual pause state any more", () => {
    expect("paused" in galleryStore.getState()).toBe(false);
  });

  it("remembers that the gallery initiated a navigation", () => {
    galleryStore.markNavigation(true);
    expect(galleryStore.getState().cameFromGallery).toBe(true);
    galleryStore.markNavigation(false);
    expect(galleryStore.getState().cameFromGallery).toBe(false);
  });
});

describe("computeTarget", () => {
  it("puts the active panel in front and fades panels three steps away", () => {
    const active = computeTarget(0, 7, "gallery", true);
    expect(active.opacity).toBe(1);
    expect(active.active).toBe(1);
    expect(active.z).toBeGreaterThan(computeTarget(1, 7, "gallery", true).z);
    expect(computeTarget(3, 7, "gallery", true).opacity).toBe(0);
    expect(computeTarget(99, 7, "gallery", true).opacity).toBe(0);
  });
  it("spreads neighbours to both sides", () => {
    const left = computeTarget(-1, 7, "gallery", true);
    const right = computeTarget(1, 7, "gallery", true);
    expect(left.x).toBeLessThan(0);
    expect(right.x).toBeGreaterThan(0);
  });
  it("recedes behind the reading surface on content pages instead of standing beside it", () => {
    const detail = computeTarget(0, 7, "detail", true);
    const gallery = computeTarget(0, 7, "gallery", true);
    expect(detail.z).toBeLessThan(gallery.z - 2);
    expect(Math.abs(detail.x)).toBeLessThan(1);
    expect(detail.opacity).toBeLessThan(0.3);
    for (const k of [0, 1, -1, 2]) expect(computeTarget(k, 7, "ambient", true).opacity).toBeLessThan(0.2);
    expect(computeTarget(1, 7, "detail", true)).toEqual(computeTarget(1, 7, "ambient", true));
  });
});
