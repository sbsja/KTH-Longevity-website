/**
 * Captures review frames of every concept at several timeline positions, in headless
 * Microsoft Edge, and measures the vector → PNG handoff of the symbol.
 *
 *   node experiments/logo-motion/tests/capture-frames.mjs [outDir] [labUrl]
 *
 * Defaults: outDir = experiments/logo-motion/review, labUrl = http://localhost:3020
 * (start the lab first: node experiments/logo-motion/serve.mjs).
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve(process.argv[2] ?? "experiments/logo-motion/review");
const base = process.argv[3] ?? process.env.LAB_URL ?? "http://localhost:3020";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
const problems = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") problems.push(`console.${m.type()}: ${m.text()}`);
});
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
page.on("requestfailed", (r) => problems.push(`requestfailed: ${r.url()}`));

async function open(query) {
  await page.goto(`${base}/?${query}`);
  await page.waitForFunction(() => window.__lab?.player?.master && !window.__lab.player.loading);
  await page.waitForTimeout(150);
}
async function select(id) {
  await page.locator(`input[name="concept"][value="${id}"]`).check();
  await page.waitForFunction((cid) => window.__lab.player.concept?.id === cid && window.__lab.player.master && !window.__lab.player.loading, id);
  await page.waitForTimeout(100);
}
async function seek(t) {
  await page.evaluate((tt) => window.__lab.player.seek(tt), t);
  await page.waitForTimeout(60);
}
const stage = page.locator("#stage");
async function shot(name) {
  await stage.screenshot({ path: path.join(outDir, `${name}.png`) });
}

const plan = {
  strands: [0.25, 0.5, 0.75, 1.0, 1.19, 1.4],
  focus: [0.0, 0.3, 0.6, 0.72, 0.95, 1.3],
  division: [0.2, 0.45, 0.62, 0.8, 0.95, 1.15, 1.4, 1.8],
  molecules: [0.15, 0.4, 0.7, 1.0, 1.15, 1.4, 1.8],
  glass: [0.1, 0.25, 0.4, 0.55, 0.7, 0.9],
  connect: [0.3, 0.6, 0.9, 1.05, 1.25, 1.6],
};

// desktop, logo only
await open("concept=strands");
for (const [id, times] of Object.entries(plan)) {
  await select(id);
  for (const t of times) {
    await seek(t);
    await shot(`${id}-desktop-${t.toFixed(2)}`);
  }
}

// handoff check on the strands concept: frame just before the crossfade vs the final frame
await select("strands");
const svgBox = await page.evaluate(() => {
  const r = window.__lab.stage.logo.svg.getBoundingClientRect();
  const s = document.querySelector("#stage").getBoundingClientRect();
  return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
});
const crop = { left: Math.floor(svgBox.x - 10), top: Math.floor(svgBox.y - 10), width: Math.ceil(svgBox.w * 0.26), height: Math.ceil(svgBox.h + 20) };
await seek(1.19);
const before = await stage.screenshot();
await seek(1.4);
const after = await stage.screenshot();
const a = await sharp(before).extract(crop).removeAlpha().raw().toBuffer();
const b = await sharp(after).extract(crop).removeAlpha().raw().toBuffer();
let sum = 0;
let max = 0;
let over24 = 0;
for (let i = 0; i < a.length; i += 3) {
  const e = (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])) / 3;
  sum += e;
  if (e > max) max = e;
  if (e > 24) over24++;
}
const handoff = { meanAbsError255: +(sum / (a.length / 3)).toFixed(3), maxAbsError255: +max.toFixed(1), pixelsOver24: over24, pixelsCompared: a.length / 3 };
await sharp(before).extract(crop).resize(crop.width * 3, crop.height * 3, { kernel: "nearest" }).toFile(path.join(outDir, "handoff-vector.png"));
await sharp(after).extract(crop).resize(crop.width * 3, crop.height * 3, { kernel: "nearest" }).toFile(path.join(outDir, "handoff-png.png"));

// phone, logo only
await open("concept=strands&device=phone");
for (const [id, t] of [
  ["strands", 0.6],
  ["division", 0.95],
  ["molecules", 0.7],
  ["connect", 1.0],
]) {
  await select(id);
  await seek(t);
  await shot(`${id}-phone-${t.toFixed(2)}`);
}
await seek(1.6);
await shot("connect-phone-end");

// homepage context
await open("concept=connect&context=home");
await seek(1.0);
await shot("connect-home-desktop-1.00");
await seek(1.6);
await shot("connect-home-desktop-end");
await open("concept=connect&context=home&device=phone");
await seek(1.0);
await shot("connect-home-phone-1.00");
await open("concept=strands&context=home&settle=1");
for (const t of [1.4, 1.75, 2.0, 2.1]) {
  await seek(t);
  await shot(`strands-home-settle-${t.toFixed(2)}`);
}
const settleTotal = await page.evaluate(() => window.__lab.player.duration);

console.log(JSON.stringify({ outDir, handoff, settleTotal, problems }, null, 2));
await browser.close();
