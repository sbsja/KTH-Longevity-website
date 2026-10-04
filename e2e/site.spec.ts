import { expect, test, type Page } from "@playwright/test";

async function sceneReady(page: Page) {
  await page.waitForFunction(() => document.documentElement.dataset.scene === "ready", null, { timeout: 30_000 });
}

test.describe("gallery on desktop", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "desktop viewport only");

  test("travels with keys, wheel and buttons, opens an item and returns in place", async ({ page, baseURL }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("KTH Longevity");
    await sceneReady(page);

    const counter = page.locator('[aria-label^="Item "]');
    await expect(counter).toHaveText("01 / 07");
    await expect(page.getByRole("heading", { level: 2 })).toContainText("Breaking Through the Blood-Brain Barrier");

    await page.keyboard.press("ArrowRight");
    await expect(counter).toHaveText("02 / 07");
    await expect(page.getByRole("heading", { level: 2 })).toContainText("Measuring Aging");

    await page.waitForTimeout(650); // travel cooldown
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 240);
    await expect(counter).toHaveText("03 / 07");

    await page.waitForTimeout(650);
    await page.getByRole("button", { name: "Previous item" }).click();
    await expect(counter).toHaveText("02 / 07");

    await page.getByRole("link", { name: "Read about the event" }).click();
    await expect(page).toHaveURL(/\/events\/measuring-aging\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Measuring Aging");
    await expect(page.locator("#event-title")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect.poll(() => page.url()).toBe(`${baseURL}/`);
    await expect(counter).toHaveText("02 / 07");
    // Focus returns to the title of the item that was opened.
    await expect(page.getByRole("heading", { level: 2 }).getByRole("link")).toBeFocused();
  });

  test("filters by category and links to the list view", async ({ page }) => {
    await page.goto("/");
    await sceneReady(page);
    const counter = page.locator('[aria-label^="Item "]');
    await page.getByRole("button", { name: "Research" }).click();
    await expect(counter).toHaveText("01 / 01");
    await expect(page.getByRole("heading", { level: 2 })).toContainText("Reading notes");
    await page.getByRole("button", { name: "Events" }).click();
    await expect(counter).toHaveText("01 / 04");
    await page.getByRole("button", { name: "Everything" }).click();
    await expect(counter).toHaveText("01 / 07");

    await page.getByRole("link", { name: "Browse as a list" }).click();
    await expect(page).toHaveURL(/\/explore\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Browse everything");
    await expect(page.locator("[data-gallery-list] li a[href]")).toHaveCount(7);
    await page.getByRole("button", { name: "Community" }).click();
    await expect(page.locator("[data-gallery-list] li a[href]")).toHaveCount(2);
  });

  test("pause and resume motion is a real control", async ({ page }) => {
    await page.goto("/");
    await sceneReady(page);
    const toggle = page.getByRole("button", { name: "Pause motion" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "Resume motion" })).toHaveAttribute("aria-pressed", "true");
  });

  test("falls back to the HTML gallery when WebGL is unavailable", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      const proto = HTMLCanvasElement.prototype as unknown as { getContext: (...args: unknown[]) => unknown };
      const original = proto.getContext;
      proto.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
        if (String(args[0]).includes("webgl")) return null;
        return original.apply(this, args);
      };
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForFunction(() => document.documentElement.dataset.scene === "unavailable");
    await expect(page.getByRole("heading", { name: "Everything in the gallery" })).toBeVisible();
    await expect(page.locator("[data-gallery-list] li a[href^='/events/']").first()).toBeVisible();
    await context.close();
  });

  test("works with reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await sceneReady(page);
    const counter = page.locator('[aria-label^="Item "]');
    await page.keyboard.press("ArrowRight");
    await expect(counter).toHaveText("02 / 07");
    await context.close();
  });
});

test.describe("pages", () => {
  const pages: [string, RegExp][] = [
    ["/about/", /Connecting students with longevity innovation/],
    ["/join/", /Four ways in/],
    ["/research/", /Reading notes on ageing science/],
    ["/events/", /Evenings about a longer, healthier life/],
    ["/explore/", /Browse everything/],
    ["/events/kickoff-seed/", /Seed: the KTH Longevity kickoff/],
    ["/events/breaking-through-the-blood-brain-barrier/", /Breaking Through the Blood-Brain Barrier/],
  ];
  for (const [path, heading] of pages) {
    test(`${path} renders with a heading, nav and footer`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
    });
  }

  test("events index shows the honest empty state for upcoming events", async ({ page }) => {
    await page.goto("/events/");
    await expect(page.getByText("Next event to be announced")).toBeVisible();
    await expect(page.getByRole("link", { name: /Follow @kthlongevity/ })).toHaveAttribute("href", /instagram\.com\/kthlongevity/);
  });

  test("the blood-brain barrier event never shows a fabricated date", async ({ page }) => {
    await page.goto("/events/breaking-through-the-blood-brain-barrier/");
    await expect(page.locator("main")).not.toContainText(/\d{1,2} (September|October) 2026/);
    await expect(page.locator("main")).toContainText("autumn 2026");
  });

  test("research items link to public DOIs only", async ({ page }) => {
    await page.goto("/research/");
    const hrefs = await page.locator("main a[href^='http']").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(hrefs.length).toBeGreaterThan(10);
    for (const h of hrefs) expect(h).toMatch(/^https:\/\/doi\.org\//);
  });

  test("unknown routes get the not-found page", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist/");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("That page is not here");
  });

  test("event pages carry metadata and a share image", async ({ page }) => {
    await page.goto("/events/measuring-aging/");
    await expect(page).toHaveTitle(/Measuring Aging/);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toContain("Karolina Gustavsson");
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toMatch(/\/og\.png$/);
  });

  test("the join page has no dead application button", async ({ page }) => {
    await page.goto("/join/");
    const apply = page.getByRole("link", { name: /applications open|Apply now/ });
    await expect(apply).toHaveAttribute("href", /^(mailto:|https?:)/);
  });
});

test.describe("phones", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 1440) >= 768, "phone viewport only");

  test("home scrolls normally and lists every item under the scene", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    const scrollable = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 200);
    expect(scrollable).toBe(true);
    await expect(page.getByRole("heading", { name: "Everything in the gallery" })).toBeAttached();
    await expect(page.locator("[data-gallery-list] li a[href]")).toHaveCount(7);
    const noHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(noHorizontalScroll).toBe(true);
  });

  test("event page shows the cover and reads top to bottom", async ({ page }) => {
    await page.goto("/events/kickoff-seed/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Seed: the KTH Longevity kickoff");
    await expect(page.locator("main img[alt]").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Back to Explore/ })).toBeVisible();
  });
});
