/**
 * Renders the share image (public/og.png, 1200×630) and the favicon
 * (src/app/favicon.ico from src/app/icon.svg) with headless Edge.
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
const cover = await readFile(path.join(root, "public/covers/research.svg"), "utf8");
const coverData = "data:image/svg+xml;base64," + Buffer.from(cover).toString("base64");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Outfit;src:url(http://og.local/outfit.woff2) format('woff2');font-weight:100 900}
@font-face{font-family:Instrument;src:url(http://og.local/instrument.woff2) format('woff2');font-weight:400 700}
@font-face{font-family:Mono;src:url(http://og.local/mono.woff2) format('woff2');font-weight:100 800}
html,body{margin:0}
.card{position:relative;width:1200px;height:630px;overflow:hidden;background:#060f0e;color:#f2f6f4;font-family:Instrument,sans-serif}
.art{position:absolute;inset:0;background:url(${coverData}) center/cover;opacity:.9}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,15,14,.92) 0%,rgba(6,15,14,.78) 48%,rgba(6,15,14,.25) 100%)}
.glow1{position:absolute;left:-10%;bottom:-30%;width:60%;height:80%;background:radial-gradient(closest-side,rgba(129,216,208,.35),transparent 70%)}
.glow2{position:absolute;right:-5%;top:-30%;width:45%;height:70%;background:radial-gradient(closest-side,rgba(255,234,149,.28),transparent 70%)}
.mark{position:absolute;left:72px;top:64px;display:grid;grid-template-columns:auto auto auto;font-family:Outfit;font-weight:500;font-size:30px;line-height:.92;letter-spacing:.02em}
.mark .l{grid-column:1;grid-row:2}.mark .t{grid-column:2;grid-row:2}.mark .y{grid-column:3;grid-row:2}
.mark .k{grid-column:2;grid-row:1;justify-self:center}.mark .h{grid-column:2;grid-row:3;justify-self:center}
.eyebrow{position:absolute;left:72px;top:230px;font-family:Mono;font-size:16px;letter-spacing:.1em;text-transform:uppercase;color:#81d8d0}
h1{position:absolute;left:72px;top:262px;margin:0;width:900px;font-family:Outfit;font-weight:500;font-size:66px;line-height:1.04;letter-spacing:-.02em}
p{position:absolute;left:72px;top:448px;margin:0;width:640px;font-size:24px;line-height:1.4;color:#c7d3cf}
.pill{position:absolute;right:64px;top:64px;padding:14px 22px;border:1px solid rgba(242,246,244,.3);border-radius:999px;font-family:Mono;font-size:14px;letter-spacing:.1em;text-transform:uppercase;background:rgba(16,52,48,.5)}
</style></head><body><div class="card">
<div class="art"></div><div class="shade"></div><div class="glow1"></div><div class="glow2"></div>
<div class="mark"><span class="k">K</span><span class="l">LONGEVI</span><span class="t">T</span><span class="y">Y</span><span class="h">H</span></div>
<div class="pill">Stockholm · student association</div>
<div class="eyebrow">KTH Longevity</div>
<h1>Connecting students with longevity innovation.</h1>
<p>Talks, research and a student community exploring the science of a longer, healthier life.</p>
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

// ICO container with PNG entries (supported by all current browsers)
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
