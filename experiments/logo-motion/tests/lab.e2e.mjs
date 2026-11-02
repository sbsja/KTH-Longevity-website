import { test, expect } from "@playwright/test";

const CONCEPTS = [
  ["strands", 1.4],
  ["focus", 1.3],
  ["division", 1.8],
  ["molecules", 1.8],
  ["glass", 0.9],
  ["connect", 1.6],
];

const loaded = (page) => page.waitForFunction(() => window.__lab?.player?.master && !window.__lab.player.loading);
async function select(page, id) {
  await page.locator(`input[name="concept"][value="${id}"]`).check();
  await page.waitForFunction((cid) => window.__lab.player.concept?.id === cid && window.__lab.player.master && !window.__lab.player.loading, id);
}
const playerState = (page) =>
  page.evaluate(() => {
    const p = window.__lab.player;
    const logo = window.__lab.stage.logo;
    const op = (el) => parseFloat(getComputedStyle(el).opacity);
    return {
      time: p.time,
      duration: p.duration,
      intro: p.introDuration,
      playing: p.playing,
      word: op(logo.wordGroup),
      symbol: op(logo.pngSymbol),
      vector: op(logo.vector),
      wipeX: parseFloat(logo.wipeRect.getAttribute("x")),
      wipeTo: logo.wipeTo,
      wipeFrom: logo.wipeFrom,
      navyOffset: parseFloat(logo.navy.getAttribute("stroke-dashoffset") || "0"),
      navyLength: logo.navy.getTotalLength(),
    };
  });

test.describe("logo motion lab", () => {
  let problems;
  test.beforeEach(async ({ page }) => {
    problems = [];
    page.on("console", (m) => {
      if (m.type() === "error") problems.push(`console.error: ${m.text()}`);
    });
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("requestfailed", (r) => problems.push(`requestfailed: ${r.url()}`));
  });
  test.afterEach(() => {
    expect(problems).toEqual([]);
  });

  test("opens on a still frame of the finished logo with six named concepts and a visible Replay", async ({ page }) => {
    await page.goto("/");
    await loaded(page);
    const radios = page.getByRole("radio", { name: /strands|focus|division|molecules|glass|connects/i });
    await expect(radios).toHaveCount(6);
    await expect(page.locator(".concept")).toHaveCount(6);
    await expect(page.locator('input[name="concept"][value="strands"]')).toBeChecked();
    await expect(page.locator("#replay-overlay")).toBeVisible();
    const s = await playerState(page);
    expect(s.playing).toBe(false);
    expect(s.time).toBeCloseTo(s.duration, 2);
    expect(s.word).toBe(1);
    expect(s.symbol).toBe(1);
    expect(s.vector).toBe(0);
    await expect(page.locator("#time-total")).toHaveText("1.40");
    // controls live outside the stage
    const stage = await page.locator("#stage").boundingBox();
    const controls = await page.locator(".controls").boundingBox();
    expect(controls.y).toBeGreaterThanOrEqual(stage.y + stage.height);
  });

  for (const [id, duration] of CONCEPTS) {
    test(`${id}: native duration ${duration} s, plays through on Replay, ends on the shared final artwork`, async ({ page }) => {
      await page.goto("/");
      await loaded(page);
      await select(page, id);
      let s = await playerState(page);
      expect(s.intro).toBeCloseTo(duration, 1);
      expect(s.duration).toBeCloseTo(duration, 1);
      await page.locator("#btn-replay").click();
      await page.waitForFunction(() => window.__lab.player.time > 0.05 && window.__lab.player.time < window.__lab.player.duration);
      await expect(page.locator("#btn-toggle")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#replay-overlay")).toBeHidden();
      await page.waitForFunction(() => !window.__lab.player.playing && window.__lab.player.time >= window.__lab.player.duration - 1e-6, null, {
        timeout: duration * 1000 + 4000,
      });
      s = await playerState(page);
      expect(s.word).toBe(1);
      expect(s.symbol).toBe(1);
      expect(s.vector).toBe(0);
      expect(s.wipeX).toBeCloseTo(s.wipeTo, 1);
      await expect(page.locator("#replay-overlay")).toBeVisible();
      // the symbol and lettering of the final frame are the PNG layers in every concept
      const extra = await page.evaluate(() => ({
        division: document.querySelectorAll(".division-strands").length,
        canvases: document.querySelectorAll(".gl-layer canvas").length,
        lines: document.querySelectorAll("[data-connection]").length,
      }));
      expect(extra.division).toBe(id === "division" ? 1 : 0);
      expect(extra.canvases).toBe(id === "molecules" ? 1 : 0);
      expect(extra.lines).toBe(id === "connect" ? 6 : 0);
    });
  }

  test("speed changes playback, not the design duration", async ({ page }) => {
    await page.goto("/?concept=strands");
    await loaded(page);
    await page.locator('input[name="speed"][value="0.5"]').check();
    await expect(page.locator("#time-total")).toHaveText("1.40");
    await expect(page.locator("#speed-note")).toContainText("1.40 s");
    await expect(page.locator("#speed-note")).toContainText("2.80 s");
    await page.locator("#btn-replay").click();
    await page.waitForTimeout(800);
    const t = await page.evaluate(() => window.__lab.player.time);
    expect(t).toBeGreaterThan(0.2);
    expect(t).toBeLessThan(0.6); // at 1× it would be ~0.8 s by now
    await page.locator('input[name="speed"][value="1.5"]').check();
    await expect(page.locator("#speed-note")).toContainText("0.93 s");
    await expect(page.locator("#time-total")).toHaveText("1.40");
  });

  test("the scrubber seeks exactly, in both directions, and Replay resets everything", async ({ page }) => {
    await page.goto("/?concept=strands");
    await loaded(page);
    const scrubber = page.locator("#scrubber");
    await expect(page.locator('label[for="scrubber"]')).toHaveText("Timeline position");
    await scrubber.fill("0.5");
    let s = await playerState(page);
    expect(s.time).toBeCloseTo(0.5, 2);
    expect(s.playing).toBe(false);
    expect(s.navyOffset).toBeGreaterThan(0);
    expect(s.navyOffset).toBeLessThan(s.navyLength); // partially drawn
    expect(s.wipeX).toBeLessThan(s.wipeTo); // lettering not yet revealed
    expect(s.symbol).toBe(0);
    await expect(page.locator("#time-now")).toHaveText("0.50");
    await expect(scrubber).toHaveAttribute("aria-valuetext", "0.50 of 1.40 seconds");
    await scrubber.fill("1.4");
    s = await playerState(page);
    expect(s.symbol).toBe(1);
    expect(s.vector).toBe(0);
    await scrubber.fill("0");
    s = await playerState(page);
    expect(s.navyOffset).toBeCloseTo(s.navyLength + 2, 0); // nothing drawn at the first frame
    expect(s.wipeX).toBeCloseTo(s.wipeFrom, 0); // the lettering mask hides everything at the first frame
    await scrubber.fill("1.1");
    await page.locator("#btn-replay").click();
    await page.waitForFunction(() => window.__lab.player.playing);
    const t = await page.evaluate(() => window.__lab.player.time);
    expect(t).toBeLessThan(0.4);
    await page.locator("#btn-toggle").click();
    await expect(page.locator("#btn-toggle")).toHaveAttribute("aria-pressed", "false");
    const paused = await playerState(page);
    expect(paused.playing).toBe(false);
    await page.locator("#btn-restart").click();
    await expect(page.locator("#time-now")).toHaveText("0.00");
  });

  test("rapid switching leaves one composition, no stray layers and no running timelines", async ({ page }) => {
    await page.goto("/?concept=strands");
    await loaded(page);
    for (const [id] of [...CONCEPTS, ...CONCEPTS.slice().reverse()]) {
      await page.locator(`input[name="concept"][value="${id}"]`).check(); // no waiting between switches
    }
    await page.waitForFunction(() => window.__lab.player.concept?.id === "strands" && window.__lab.player.master && !window.__lab.player.loading);
    await page.waitForTimeout(300);
    const check = await page.evaluate(() => ({
      roots: document.querySelectorAll(".logo-root").length,
      canvases: document.querySelectorAll(".gl-layer canvas").length,
      fxOver: window.__lab.stage.fxOver.childElementCount,
      fxUnder: window.__lab.stage.fxUnder.childElementCount,
      extras: document.querySelectorAll(".division-cell, .division-strands, [data-connection]").length,
      globalChildren: window.gsap.globalTimeline.getChildren(false, true, true).length,
      labelsHidden: window.__lab.stage.sections ? window.__lab.stage.sections.hidden : true,
      filter: window.__lab.stage.logo.svg.style.filter,
    }));
    expect(check.roots).toBe(1);
    expect(check.canvases).toBe(0);
    expect(check.fxOver).toBe(0);
    expect(check.fxUnder).toBe(0);
    expect(check.extras).toBe(0);
    expect(check.globalChildren).toBe(1); // only the current master timeline
    expect(check.labelsHidden).toBe(true);
    expect(check.filter).toBe("");
  });

  test("homepage context: labels stay clickable, a click finishes the intro at once, the logo settles into the header", async ({ page }) => {
    await page.goto("/?concept=connect&context=home&settle=1");
    await loaded(page);
    const s0 = await playerState(page);
    expect(s0.duration).toBeGreaterThan(s0.intro + 0.5);
    await expect(page.locator("#settle-toggle")).toBeChecked();
    await expect(page.locator("#scrub-marks")).toContainText("intro ends");
    await page.locator("#btn-replay").click();
    await page.waitForFunction(() => window.__lab.player.time > 0.3);
    const events = page.locator(".sim-header .sim-link", { hasText: "Events" });
    await expect(events).toBeVisible();
    await events.click();
    const s1 = await playerState(page);
    expect(s1.playing).toBe(false);
    expect(s1.time).toBeCloseTo(s1.duration, 2);
    await expect(page.locator("#status")).toContainText("Simulated navigation to Events");
    await expect(page.locator(".sim-route")).toContainText("/events/");
    const handoff = await page.evaluate(() => ({
      headerImg: parseFloat(getComputedStyle(document.querySelector(".sim-logo img")).opacity),
      stageLogo: parseFloat(getComputedStyle(window.__lab.stage.logo.root).opacity),
    }));
    expect(handoff.headerImg).toBe(1);
    expect(handoff.stageLogo).toBe(0);
    // the header did not move: six labels still in the bar
    await expect(page.locator(".sim-header .sim-link")).toHaveCount(6);
  });

  for (const query of ["concept=connect&device=phone", "concept=connect&device=phone&context=home"]) {
    test(`phone (${query.includes("home") ? "homepage context" : "logo only"}): connection lines never pass over a label`, async ({ page }) => {
      await page.goto(`/?${query}`);
      await loaded(page);
      await page.locator("#scrubber").fill("1");
      const result = await page.evaluate(() => {
        const stage = window.__lab.stage;
        const targets = stage.labelTargets();
        const inflate = 2;
        const hits = [];
        for (const path of document.querySelectorAll("[data-connection]")) {
          const L = path.getTotalLength();
          const own = targets.find((t) => t.id === path.dataset.connection);
          for (let i = 0; i <= 300; i++) {
            const p = path.getPointAtLength((L * i) / 300);
            for (const t of targets) {
              const r = t.rect;
              const inside = p.x > r.x - inflate && p.x < r.x + r.width + inflate && p.y > r.y - inflate && p.y < r.y + r.height + inflate;
              const nearOwnAnchor = t === own && Math.hypot(p.x - own.anchor.x, p.y - own.anchor.y) < 6;
              if (inside && !nearOwnAnchor) hits.push({ line: path.dataset.connection, label: t.id, x: +p.x.toFixed(1), y: +p.y.toFixed(1) });
            }
          }
        }
        return { lines: document.querySelectorAll("[data-connection]").length, targets: targets.length, hits };
      });
      expect(result.lines).toBe(6);
      expect(result.targets).toBe(6);
      expect(result.hits).toEqual([]);
    });
  }

  test("reduced motion opens on the still preview; Replay plays the sample on request", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?concept=strands");
    await loaded(page);
    await expect(page.locator("#still-toggle")).toBeChecked();
    await expect(page.locator("#scrubber")).toBeDisabled();
    await expect(page.locator("#stage-note")).toBeVisible();
    await expect(page.locator("#stage-note")).toContainText("reduced motion");
    const s = await playerState(page);
    expect(s.playing).toBe(false);
    expect(s.symbol).toBe(1);
    await page.locator("#btn-replay").click();
    await page.waitForFunction(() => window.__lab.player.playing);
    await expect(page.locator("#still-toggle")).not.toBeChecked();
    await expect(page.locator("#status")).toContainText("Playing on request");
  });

  test("shortlist is remembered in this browser and nothing else", async ({ page }) => {
    await page.goto("/");
    await loaded(page);
    const star = page.getByLabel("Shortlist 2 Microscope focus");
    await star.check();
    await expect(page.locator("#shortlist-note")).toContainText("2 Microscope focus");
    await page.reload();
    await loaded(page);
    await expect(page.getByLabel("Shortlist 2 Microscope focus")).toBeChecked();
    const stored = await page.evaluate(() => localStorage.getItem("kthl.logoMotion.shortlist"));
    expect(JSON.parse(stored)).toEqual(["focus"]);
    await page.getByLabel("Shortlist 2 Microscope focus").uncheck();
    await expect(page.locator("#shortlist-note")).toContainText("Shortlist concepts to compare later");
  });

  test("keyboard: concepts are a radio group, Space toggles playback, controls are labelled", async ({ page }) => {
    await page.goto("/?concept=strands");
    await loaded(page);
    await page.locator('input[name="concept"][value="strands"]').focus();
    await page.keyboard.press("ArrowDown");
    await page.waitForFunction(() => window.__lab.player.concept?.id === "focus" && !window.__lab.player.loading);
    await expect(page.locator("#about-heading")).toHaveText("2 · Microscope focus");
    await page.locator("#stage").focus();
    await page.keyboard.press(" ");
    await page.waitForFunction(() => window.__lab.player.playing);
    await page.keyboard.press(" ");
    await page.waitForFunction(() => !window.__lab.player.playing);
    await expect(page.getByRole("group", { name: "Playback", exact: true })).toBeVisible();
    await expect(page.locator("#speed-seg legend")).toHaveText("Playback speed");
    await expect(page.locator("#scrubber")).toHaveAttribute("aria-valuetext", /of 1\.30 seconds/);
  });
});

test.describe("phone preview layout", () => {
  test("the logo is reframed larger relative to the phone viewport and the lettering stays legible", async ({ page }) => {
    await page.goto("/?concept=strands&device=phone");
    await loaded(page);
    const m = await page.evaluate(() => {
      const stage = window.__lab.stage;
      const place = stage.logo.place;
      return { ratio: place.width / stage.L.width, k: stage.k, markHeightPx: place.height * stage.k };
    });
    expect(m.ratio).toBeGreaterThan(0.7); // 300 of 390 virtual px
    expect(m.markHeightPx).toBeGreaterThan(40); // two lines of lettering at a readable size
  });
});
