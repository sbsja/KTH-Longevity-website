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

  it("travels forward and backward with wrap-around", () => {
    const n = featured.length;
    expect(galleryStore.getState().activeIndex).toBe(0);
    galleryStore.prev();
    expect(galleryStore.getState().activeIndex).toBe(n - 1);
    galleryStore.next();
    expect(galleryStore.getState().activeIndex).toBe(0);
    galleryStore.setIndex(n + 2);
    expect(galleryStore.getState().activeIndex).toBe(2);
  });

  it("keeps the active item when a filter still contains it, otherwise starts at 0", () => {
    galleryStore.focusItem("research:notes");
    galleryStore.setCategory("research");
    expect(galleryStore.activeItem()?.id).toBe("research:notes");
    galleryStore.setCategory("events");
    expect(galleryStore.getState().activeIndex).toBe(0);
    expect(galleryStore.activeItem()?.category).toBe("events");
  });

  it("widens the filter when focusing an item outside it (direct links)", () => {
    galleryStore.setCategory("events");
    galleryStore.focusItem("about:community");
    expect(galleryStore.getState().category).toBe("all");
    expect(galleryStore.activeItem()?.id).toBe("about:community");
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
  it("moves the active panel right in detail mode and dims everything in ambient mode", () => {
    const detail = computeTarget(0, 7, "detail", true);
    expect(detail.x).toBeGreaterThan(2);
    for (const k of [0, 1, -1, 2]) expect(computeTarget(k, 7, "ambient", true).opacity).toBeLessThan(0.2);
  });
});
