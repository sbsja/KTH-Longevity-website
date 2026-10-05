import { expect, test, type Page } from "@playwright/test";

async function sceneReady(page: Page) {
  await page.waitForFunction(() => document.documentElement.dataset.scene === "ready", null, { timeout: 30_000 });
}

const counter = (page: Page) => page.locator('[aria-label^="Item "]');
const primary = (page: Page) => page.getByRole("navigation", { name: "Primary" });
const SECTIONS = ["About", "Events", "Projects", "Job board", "Newsletter", "Contact"];
const SECTION_ROUTES = ["/about/", "/events/", "/projects/", "/jobs/", "/newsletter/", "/contact/"];

/** The reading surface must be the wide, centred layout: most of the viewport, centred, never a narrow left column. */
async function expectWideSurface(page: Page) {
  const box = await page.getByTestId("page-surface").boundingBox();
  const width = page.viewportSize()!.width;
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(width * 0.6);
  expect(Math.abs(box!.x - (width - box!.x - box!.width))).toBeLessThan(4);
}

test.describe("gallery on desktop", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "desktop viewport only");

  test("travels with keys, wheel and buttons, opens a card and returns in place", async ({ page, baseURL }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("KTH Longevity");
    await sceneReady(page);

    await expect(counter(page)).toHaveText("01 / 07");
    await expect(page.getByRole("heading", { level: 2 })).toContainText("Breaking Through the Blood-Brain Barrier");

    await page.keyboard.press("ArrowRight");
    await expect(counter(page)).toHaveText("02 / 07");
    await expect(page.getByRole("heading", { level: 2 })).toContainText("A student community for longevity science");

    await page.waitForTimeout(650);
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 240);
    await expect(counter(page)).toHaveText("03 / 07");
    await expect(page.getByRole("heading", { level: 2 })).toContainText("Evenings about a longer, healthier life");

    await page.waitForTimeout(650);
    await page.getByRole("button", { name: "Previous item" }).click();
    await expect(counter(page)).toHaveText("02 / 07");

    await page.getByRole("link", { name: "About us" }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("A student community for longevity science");
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await expectWideSurface(page);

    await page.keyboard.press("Escape");
    await expect.poll(() => page.url()).toBe(`${baseURL}/`);
    await expect(counter(page)).toHaveText("02 / 07");
    await expect(page.getByRole("heading", { level: 2 }).getByRole("link")).toBeFocused();
  });

  test("the seven cards reach the six sections and the featured event", async ({ page }) => {
    await page.goto("/");
    await sceneReady(page);
    const hrefs: string[] = [];
    for (let i = 0; i < 7; i++) {
      const href = await page.getByRole("heading", { level: 2 }).getByRole("link").getAttribute("href");
      hrefs.push(href ?? "");
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(560);
    }
    expect(hrefs).toEqual(["/events/breaking-through-the-blood-brain-barrier/", ...SECTION_ROUTES]);
    await expect(counter(page)).toHaveText("01 / 07");
  });

  test("the bottom controls are gone and nothing replaced them", async ({ page }) => {
    await page.goto("/");
    await sceneReady(page);
    await expect(page.getByRole("link", { name: /Browse as a list/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Pause motion|Resume motion/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Browse all/i })).toHaveCount(0);
    // No control group in the bottom-left corner any more (the card's own call to action sits under the panel, right-aligned)
    const bottomLeft = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#gallery-hud a, #gallery-hud button")).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top > window.innerHeight * 0.8 && r.left < window.innerWidth * 0.4;
      }).length,
    );
    expect(bottomLeft).toBe(0);
    await expect(page.getByRole("button", { name: "Previous item" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next item" })).toBeVisible();
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
    await expect(page.locator("[data-gallery-list] li a[href]")).toHaveCount(7);
    await expect(page.locator("[data-gallery-list] li a[href='/jobs/']")).toBeVisible();
    await context.close();
  });

  test("works with reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await sceneReady(page);
    await page.keyboard.press("ArrowRight");
    await expect(counter(page)).toHaveText("02 / 07");
    await context.close();
  });
});

test.describe("header", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 980, "wide layout only");

  test("lists the six sections centred on the viewport, with the logo top left and correct current states", async ({ page }) => {
    await page.goto("/projects/");
    const nav = primary(page);
    const labels = await nav.getByRole("link").evaluateAll((as) => as.map((a) => a.textContent?.trim()).filter((t) => t && !/All events/.test(t)));
    expect(labels).toEqual(SECTIONS);
    for (const removed of ["Explore", "Research", "Get involved", "Browse all"]) {
      await expect(nav.getByRole("link", { name: removed, exact: true })).toHaveCount(0);
    }
    await expect(nav.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute("aria-current", "page");

    const logo = page.getByRole("link", { name: "KTH Longevity, home" });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("href", "/");
    const img = logo.locator("img");
    await expect(img).toHaveAttribute("src", "/brand/kth-longevity-logo.png");
    const logoBox = (await logo.boundingBox())!;
    const navBox = (await nav.boundingBox())!;
    const width = page.viewportSize()!.width;
    expect(logoBox.x).toBeLessThan(80);
    expect(logoBox.y).toBeLessThan(40);
    expect(logoBox.height).toBeGreaterThanOrEqual(44);
    expect(logoBox.height).toBeLessThan(72);
    // Centred on the viewport, not in the space beside the logo
    expect(Math.abs(navBox.x + navBox.width / 2 - width / 2)).toBeLessThan(6);
    expect(navBox.x).toBeGreaterThan(logoBox.x + logoBox.width + 8);

    await page.goto("/events/measuring-aging/");
    await expect(nav.getByRole("link", { name: "Events", exact: true })).toHaveAttribute("aria-current", "true");
    await page.goto("/research/");
    expect(await nav.locator("a[aria-current]").count()).toBe(0);
  });

  test("events submenu opens with the keyboard, lists each event page and closes on Escape", async ({ page }) => {
    await page.goto("/about/");
    const toggle = page.getByRole("button", { name: "Show event pages" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const first = primary(page).getByRole("link", { name: /Breaking Through the Blood-Brain Barrier/ });
    await expect(first).toBeVisible();
    await expect(first).toBeFocused();
    await expect(primary(page).getByRole("link", { name: /MedAI Hackathon/ })).toBeVisible();
    await expect(primary(page).getByRole("link", { name: /Measuring Aging/ })).toBeVisible();
    await expect(primary(page).getByRole("link", { name: /Seed: the KTH Longevity kickoff/ })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await expect(page).toHaveURL(/\/about\/$/);

    await toggle.click();
    await primary(page).getByRole("link", { name: /Measuring Aging/ }).click();
    await expect(page).toHaveURL(/\/events\/measuring-aging\/$/);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("wide layout, return and dismissal", () => {
  test("every section and event page shows the return control and it goes home", async ({ page, baseURL }) => {
    for (const path of [...SECTION_ROUTES, "/research/", "/events/kickoff-seed/", "/events/medai-hackathon/"]) {
      await page.goto(path);
      await expect(page.getByRole("button", { name: /Back to Explore/ })).toBeVisible();
    }
    await page.getByRole("button", { name: /Back to Explore/ }).click();
    await expect.poll(() => page.url()).toBe(`${baseURL}/`);
  });

  test("the heading receives focus on arrival", async ({ page }) => {
    await page.goto("/jobs/");
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  });

  test.describe("on desktop", () => {
    test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "desktop viewport only");

    test("event pages use the same wide, centred surface as the other sections", async ({ page }) => {
      await page.goto("/research/");
      const research = (await page.getByTestId("page-surface").boundingBox())!;
      for (const path of ["/events/breaking-through-the-blood-brain-barrier/", "/events/kickoff-seed/", "/about/", "/contact/"]) {
        await page.goto(path);
        await expectWideSurface(page);
        const box = (await page.getByTestId("page-surface").boundingBox())!;
        expect(Math.abs(box.width - research.width)).toBeLessThan(2);
        expect(Math.abs(box.x - research.x)).toBeLessThan(2);
      }
      // The event cover is part of the page, not a panel beside it
      await page.goto("/events/kickoff-seed/");
      await expect(page.locator("main img[alt^='Illustration']")).toBeVisible();
    });

    test("the gutter returns to the previous internal page, Escape returns home, and the ring keeps its place", async ({ page, baseURL }) => {
      await page.goto("/");
      await sceneReady(page);
      await primary(page).getByRole("link", { name: "Projects", exact: true }).click();
      await expect(page).toHaveURL(/\/projects\/$/);
      await primary(page).getByRole("link", { name: "About", exact: true }).click();
      await expect(page).toHaveURL(/\/about\/$/);

      await page.mouse.click(20, 520);
      await expect(page).toHaveURL(/\/projects\/$/);

      await page.keyboard.press("Escape");
      await expect.poll(() => page.url()).toBe(`${baseURL}/`);
      // Visiting Projects rotated the ring to the Projects card (fourth), and that position is kept.
      await expect(counter(page)).toHaveText("04 / 07");
      await expect(page.getByRole("heading", { level: 2 })).toContainText("Building the KTH Longevity website");
    });

    test("clicks inside the surface, text selection, drags and form use never dismiss", async ({ page }) => {
      await page.goto("/contact/");
      await page.getByRole("heading", { level: 1 }).click();
      await expect(page).toHaveURL(/\/contact\/$/);
      // Whitespace inside the surface
      const box = (await page.getByTestId("page-surface").boundingBox())!;
      await page.mouse.click(box.x + box.width - 30, box.y + box.height - 30);
      await expect(page).toHaveURL(/\/contact\/$/);
      // Drag out of the surface and back in
      await page.mouse.move(500, 420);
      await page.mouse.down();
      await page.mouse.move(20, 520, { steps: 6 });
      await page.mouse.up();
      await expect(page).toHaveURL(/\/contact\/$/);
      await page.mouse.move(20, 520);
      await page.mouse.down();
      await page.mouse.move(500, 420, { steps: 6 });
      await page.mouse.up();
      await expect(page).toHaveURL(/\/contact\/$/);
      // Using the form
      await page.getByLabel("Name", { exact: true }).fill("Ada");
      await page.getByLabel("Message", { exact: true }).fill("Selecting text and typing must not close the page.");
      await page.getByLabel("Message", { exact: true }).selectText();
      await page.keyboard.press("Escape");
      await expect(page).toHaveURL(/\/contact\/$/);
    });

    test("a direct load falls back to home from the gutter", async ({ page, baseURL }) => {
      await page.goto("/newsletter/");
      await page.mouse.click(20, 520);
      await expect.poll(() => page.url()).toBe(`${baseURL}/`);
    });

    test("header clicks never dismiss and Back/Forward keep working", async ({ page, baseURL }) => {
      await page.goto("/about/");
      await page.getByRole("link", { name: "KTH Longevity, home" }).hover();
      await expect(page).toHaveURL(/\/about\/$/);
      await primary(page).getByRole("link", { name: "Projects", exact: true }).click();
      await expect(page).toHaveURL(/\/projects\/$/);
      await page.goBack();
      await expect(page).toHaveURL(/\/about\/$/);
      await page.goForward();
      await expect(page).toHaveURL(/\/projects\/$/);
      await page.keyboard.press("Escape");
      await expect.poll(() => page.url()).toBe(`${baseURL}/`);
    });
  });
});

test.describe("pages", () => {
  const pages: [string, RegExp][] = [
    ["/about/", /A student community for longevity science/],
    ["/events/", /Evenings about a longer, healthier life/],
    ["/projects/", /What we are building/],
    ["/jobs/", /Opportunities to work on ageing/],
    ["/newsletter/", /Hear about the next evening first/],
    ["/contact/", /Talk to us/],
    ["/research/", /Reading notes on ageing science/],
    ["/events/kickoff-seed/", /Seed: the KTH Longevity kickoff/],
    ["/events/medai-hackathon/", /MedAI Hackathon/],
    ["/events/breaking-through-the-blood-brain-barrier/", /Breaking Through the Blood-Brain Barrier/],
  ];
  for (const [path, heading] of pages) {
    test(`${path} renders with a heading, nav and footer`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
      expect(overflow).toBe(true);
    });
  }

  test("about has who, purpose, team, history and participation, with the two founding dates kept apart", async ({ page }) => {
    await page.goto("/about/");
    for (const name of ["Our purpose and activities", "The team", "Our history", "How to participate"]) {
      await expect(page.getByRole("heading", { name, level: 2 })).toBeVisible();
    }
    const main = page.locator("main");
    await expect(main).toContainText("December 2024");
    await expect(main).toContainText("November 2025");
    await expect(main).toContainText("Sara Jameel");
    await expect(main.locator("img")).toHaveCount(0);
  });

  test("events separates upcoming and past, newest first, with an honest empty state and no fabricated date", async ({ page }) => {
    await page.goto("/events/");
    await expect(page.getByRole("heading", { name: "Upcoming events" })).toBeVisible();
    await expect(page.getByTestId("upcoming-empty")).toContainText("No confirmed upcoming events yet");
    await expect(page.getByTestId("upcoming-empty").getByRole("link", { name: "Get the newsletter" })).toHaveAttribute("href", "/newsletter/");
    const titles = await page.locator("#past h3 a").allTextContents();
    expect(titles).toEqual(["Breaking Through the Blood-Brain Barrier", "MedAI Hackathon", "Measuring Aging", "Seed: the KTH Longevity kickoff"]);
    await expect(page.locator("main")).not.toContainText(/\d{1,2} (September|October) 2026/);
    await expect(page.getByRole("button", { name: /Register/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^Register$/ })).toHaveCount(0);
  });

  test("projects shows the single website project without filters, with a way to contribute", async ({ page }) => {
    await page.goto("/projects/");
    await expect(page.getByRole("heading", { name: "The KTH Longevity website" })).toBeVisible();
    await expect(page.locator("main")).toContainText("Ongoing");
    await expect(page.getByRole("link", { name: "Write to us about contributing" })).toHaveAttribute("href", "/contact/?topic=website");
    await expect(page.getByRole("button", { name: /filter|All categories/i })).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/\d+ ?%/);
  });

  test("job board shows an honest empty state with a contact link", async ({ page }) => {
    await page.goto("/jobs/");
    await expect(page.getByTestId("jobs-empty")).toContainText("Nothing open right now");
    await expect(page.getByTestId("jobs-empty").getByRole("link", { name: "Tell us about an opportunity" })).toHaveAttribute("href", "/contact/?topic=jobs");
  });

  test("the contact page pre-fills the subject from the project page", async ({ page }) => {
    await page.goto("/contact/?topic=website");
    await expect(page.getByLabel("Subject", { exact: true })).toHaveValue("Contributing to the KTH Longevity website");
    await expect(page.locator("main")).toContainText("kthlongevity@gmail.com");
  });

  test("legacy routes redirect: the old list view to home and join to participation", async ({ page, baseURL }) => {
    await page.goto("/explore/");
    await expect.poll(() => page.url()).toBe(`${baseURL}/`);
    await page.goto("/join/");
    await expect.poll(() => page.url()).toBe(`${baseURL}/about/#participate`);
    await expect(page.getByRole("heading", { name: "How to participate" })).toBeVisible();
  });

  test("research items link to public DOIs only", async ({ page }) => {
    await page.goto("/research/");
    const hrefs = await page.locator("main a[href^='http']").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(hrefs.length).toBeGreaterThan(10);
    for (const h of hrefs) expect(h).toMatch(/^https:\/\/doi\.org\//);
  });

  test("unknown routes get the not-found page with one return control and the six sections", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist/");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("That page is not here");
    await expect(page.getByRole("button", { name: /Back to Explore/ })).toHaveCount(1);
    for (const name of SECTIONS) await expect(page.locator("main").getByRole("link", { name, exact: true })).toBeVisible();
  });

  test("event pages carry metadata and a share image", async ({ page }) => {
    await page.goto("/events/measuring-aging/");
    await expect(page).toHaveTitle(/Measuring Aging/);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toContain("Karolina Gustavsson");
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toMatch(/\/og\.png$/);
    const theme = await page.locator('meta[name="theme-color"]').first().getAttribute("content");
    expect(theme?.toLowerCase()).toBe("#e3faf5");
  });

  test("the footer reaches every section and the reading notes", async ({ page }) => {
    await page.goto("/about/");
    const footer = page.getByRole("contentinfo");
    for (const name of [...SECTIONS, "Reading notes"]) await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
    await expect(footer.getByRole("link", { name: /Browse everything|Join$/ })).toHaveCount(0);
  });
});

test.describe("phones", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 1440) >= 768, "phone viewport only");

  test("home scrolls normally and lists every card under the scene", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
    const scrollable = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 200);
    expect(scrollable).toBe(true);
    await expect(page.getByRole("heading", { name: "Everything in the gallery" })).toBeAttached();
    await expect(page.locator("[data-gallery-list] li a[href]")).toHaveCount(7);
    const noHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(noHorizontalScroll).toBe(true);
  });

  test("the logo sits top left and the menu lists the six sections and event pages, then closes after use", async ({ page }) => {
    await page.goto("/");
    const logo = page.getByRole("link", { name: "KTH Longevity, home" });
    const logoBox = (await logo.boundingBox())!;
    expect(logoBox.x).toBeLessThan(40);
    expect(logoBox.y).toBeLessThan(40);
    const button = page.getByRole("button", { name: "Menu" });
    const buttonBox = (await button.boundingBox())!;
    expect(buttonBox.x).toBeGreaterThan(logoBox.x + logoBox.width);
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const menu = page.getByRole("navigation", { name: "Site menu" });
    for (const name of SECTIONS) await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
    await expect(menu.getByRole("link", { name: /Measuring Aging/ })).toBeVisible();
    await menu.getByRole("link", { name: "Job board", exact: true }).click();
    await expect(page).toHaveURL(/\/jobs\/$/);
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: /Back to Explore/ })).toBeVisible();
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
