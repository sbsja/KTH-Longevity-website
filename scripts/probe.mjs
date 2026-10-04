/**
 * Debug helper: open a page in headless Edge, wait, and evaluate an expression.
 *   node scripts/probe.mjs "<js expression>" [path] [settleMs]
 * The dev scene exposes window.__kthScene (fiber root state) outside production.
 */
import { chromium } from "@playwright/test";

const expr = process.argv[2] ?? "document.title";
const route = process.argv[3] ?? "/";
const settle = Number(process.argv[4] ?? 3000);
const base = process.env.BASE_URL ?? "http://localhost:3010";

const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
await page.goto(base + route, { waitUntil: "networkidle" });
await page.waitForTimeout(settle);
const result = await page.evaluate(expr);
console.log(JSON.stringify(result, null, 2));
if (process.env.SHOT) {
  await page.waitForTimeout(Number(process.env.SHOT_WAIT ?? 800));
  await page.screenshot({ path: process.env.SHOT });
  console.log("screenshot ->", process.env.SHOT);
}
if (logs.length) console.log("console:\n" + logs.map((l) => "  " + l).join("\n"));
await browser.close();
