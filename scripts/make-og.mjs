/**
 * Renders the share image (public/og.png, 1200×630, with the supplied logo) and
 * the favicon (src/app/favicon.ico from src/app/icon.svg) with headless Edge.
 *   node scripts/make-og.mjs
 */
import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const fonts = {
  outfit: path.join(root, "node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2"),
  instrument: path.join(root, "node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2"),
  mono: path.join(root, "node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2"),
};
const cover = await readFile(path.join(root, "public/covers/stage-4-metaphase.svg"), "utf8");
const coverData = "data:image/svg+xml;base64," + Buffer.from(cover).toString("base64");
// The supplied logo (1008 × 480); only the mark's box (x 175–838, y 172–308) is framed.
const logo = await readFile(path.join(root, "public/brand/kth-longevity-logo.png"));
const logoData = "data:image/png;base64," + logo.toString("base64");
const MARK_H = 56;
const IMG_H = (MARK_H * 480) / 136;
const IMG_W = (IMG_H * 1008) / 480;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Outfit;src:url(http://og.local/outfit.woff2) format('woff2');font-weight:100 900}
@font-face{font-family:Instrument;src:url(http://og.local/instrument.woff2) format('woff2');font-weight:400 700}
@font-face{font-family:Mono;src:url(http://og.local/mono.woff2) format('woff2');font-weight:100 800}
html,body{margin:0}
.card{position:relative;width:1200px;height:630px;overflow:hidden;background:#e3faf5;color:#08283d;font-family:Instrument,sans-serif}
.art{position:absolute;inset:0;background:url(${coverData}) right center/cover}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(227,250,245,.96) 0%,rgba(227,250,245,.86) 42%,rgba(227,250,245,.1) 75%)}
.glow{position:absolute;left:-10%;bottom:-30%;width:60%;height:80%;background:radial-gradient(closest-side,rgba(105,201,221,.35),transparent 70%)}
.logo{position:absolute;left:72px;top:64px;display:inline-flex;align-items:center;padding:8px 14px;border:1px solid rgba(8,40,61,.14);border-radius:14px;background:#e3faf5}
.logo .frame{position:relative;overflow:hidden;width:${(IMG_W * 663) / 1008}px;height:${MARK_H}px}
.logo img{position:absolute;width:${IMG_W}px;height:${IMG_H}px;left:${(-IMG_W * 175) / 1008}px;top:${(-IMG_H * 172) / 480}px}
.eyebrow{position:absolute;left:72px;top:230px;font-family:Mono;font-size:16px;letter-spacing:.1em;text-transform:uppercase;color:#175998}
h1{position:absolute;left:72px;top:262px;margin:0;width:760px;font-family:Outfit;font-weight:500;font-size:66px;line-height:1.04;letter-spacing:-.02em;color:#08283d}
p{position:absolute;left:72px;top:448px;margin:0;width:600px;font-size:24px;line-height:1.4;color:#3c5b6e}
.pill{position:absolute;right:64px;top:64px;padding:14px 22px;border:1px solid rgba(8,40,61,.25);border-radius:999px;font-family:Mono;font-size:14px;letter-spacing:.1em;text-transform:uppercase;background:rgba(248,252,251,.7);color:#08283d}
</style></head><body><div class="card">
<div class="art"></div><div class="shade"></div><div class="glow"></div>
<div class="logo"><span class="frame"><img src="${logoData}" alt=""></span></div>
<div class="pill">Stockholm, student association</div>
<div class="eyebrow">KTH Longevity</div>
<h1>Connecting students with longevity innovation.</h1>
<p>Talks, projects and a student community exploring the science of a longer, healthier life.</p>
</div></body></html>`;

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.route("http://og.local/**", async (route) => {
  const name = path.basename(new URL(route.request().url()).pathname, ".woff2");
  const file = fonts[name];
  if (!file) return route.fulfill({ status: 404 });
  return route.fulfill({ status: 200, contentType: "font/woff2", body: await readFile(file) });
});
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.locator(".card").screenshot({ path: path.join(root, "public/og.png"), type: "png" });
console.log("wrote public/og.png");

// Favicon: rasterise icon.svg at a few sizes and pack an .ico
const svg = await readFile(path.join(root, "src/app/icon.svg"), "utf8");
const sizes = [16, 32, 48];
const pngs = [];
for (const size of sizes) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  pngs.push(await page.screenshot({ omitBackground: true, type: "png", clip: { x: 0, y: 0, width: size, height: size } }));
}
await browser.close();

const count = pngs.length;
const header = Buffer.alloc(6 + 16 * count);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(count, 4);
let offset = header.length;
const chunks = [];
pngs.forEach((png, i) => {
  const size = sizes[i];
  const e = 6 + i * 16;
  header.writeUInt8(size >= 256 ? 0 : size, e);
  header.writeUInt8(size >= 256 ? 0 : size, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(png.length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += png.length;
  chunks.push(png);
});
await writeFile(path.join(root, "src/app/favicon.ico"), Buffer.concat([header, ...chunks]));
console.log("wrote src/app/favicon.ico");
