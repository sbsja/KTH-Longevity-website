/**
 * Visual check: opens the site in a real (headless) Edge via Playwright and writes
 * screenshots per viewport to docs/screenshots. Also prints the WebGL renderer the
 * page sees and any console errors.
 *
 *   node scripts/screenshots.mjs [baseUrl]    (default http://localhost:3010)
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3010";
const outDir = path.resolve(process.env.OUT_DIR ?? "docs/screenshots");
await mkdir(outDir, { recursive: true });

const viewports = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1024", width: 1024, height: 768 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
];
const routes = [
  { name: "home", path: "/", settle: 4500 },
  { name: "event", path: "/events/measuring-aging/", settle: 3000 },
  { name: "research", path: "/research/", settle: 1500 },
  { name: "about", path: "/about/", settle: 1500 },
  { name: "join", path: "/join/", settle: 1500 },
  { name: "explore", path: "/explore/", settle: 1500 },
  { name: "events", path: "/events/", settle: 1500 },
];

const only = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;

const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"],
});

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  if (process.env.NO_WEBGL) {
    // Exercise the HTML/CSS fallback: pretend the browser has no WebGL at all.
    await context.addInitScript(() => {
      const proto = HTMLCanvasElement.prototype;
      const original = proto.getContext;
      proto.getContext = function (type, ...rest) {
        if (String(type).includes("webgl")) return null;
        return original.call(this, type, ...rest);
      };
    });
  }
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

  for (const r of routes) {
    if (only && !only.has(r.name)) continue;
    await page.goto(base + r.path, { waitUntil: "networkidle" });
    await page.waitForTimeout(r.settle);
    const info = await page.evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      const dbg = gl && gl.getExtension("WEBGL_debug_renderer_info");
      return {
        renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl ? "webgl, renderer hidden" : "none",
        scene: document.documentElement.dataset.scene,
        visibility: document.visibilityState,
        title: document.title,
      };
    });
    const file = path.join(outDir, `${r.name}-${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: vp.width < 1024 && r.name !== "home" ? false : false });
    console.log(`${vp.name} ${r.name}: scene=${info.scene} vis=${info.visibility} gl=${info.renderer} -> ${path.relative(process.cwd(), file)}`);
  }
  if (errors.length) console.log(`  console errors @${vp.name}:\n   - ` + errors.join("\n   - "));
  await context.close();
}
await browser.close();
