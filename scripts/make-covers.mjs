/**
 * Generates the seven gallery covers: one consistent sequence of cell-cycle
 * illustrations (interphase through cytokinesis) in the mint / aqua / cyan / navy
 * theme. Original artwork, generated geometry, no external assets.
 *
 *   node scripts/make-covers.mjs
 *
 * Writes public/covers/stage-1-interphase.svg … stage-7-daughter-cells.svg
 * and removes the previous cover set.
 */
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const W = 1200;
const H = 750;
const ICE = "#e3faf5";
const AQUA = "#c6f0ef";
const CYAN = "#69c9dd";
const NAVY = "#08283d";
const NUC = "#175998";
const WHITE = "#f8fcfb";

const OUT = path.resolve("public/covers");
await mkdir(OUT, { recursive: true });

const f = (n) => Number(n.toFixed(2));

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function defs(id) {
  return `<defs>
  <radialGradient id="bg${id}" cx="30%" cy="35%" r="95%"><stop offset="0" stop-color="${WHITE}"/><stop offset=".4" stop-color="${ICE}"/><stop offset="1" stop-color="${AQUA}"/></radialGradient>
  <radialGradient id="glow${id}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${CYAN}" stop-opacity=".5"/><stop offset=".6" stop-color="${CYAN}" stop-opacity=".12"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/></radialGradient>
  <radialGradient id="cyto${id}" cx="38%" cy="36%" r="72%"><stop offset="0" stop-color="${WHITE}" stop-opacity=".92"/><stop offset=".65" stop-color="${AQUA}" stop-opacity=".6"/><stop offset="1" stop-color="${CYAN}" stop-opacity=".42"/></radialGradient>
  <radialGradient id="nuc${id}" cx="38%" cy="34%" r="72%"><stop offset="0" stop-color="#4a92d0"/><stop offset=".5" stop-color="${NUC}"/><stop offset="1" stop-color="${NAVY}"/></radialGradient>
  <radialGradient id="depth${id}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${NUC}" stop-opacity=".28"/><stop offset="1" stop-color="${NUC}" stop-opacity="0"/></radialGradient>
  <filter id="b3${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="b9${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="b28${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28"/></filter>
</defs>`;
}

/* Soft aqueous background with faint, partially cropped membranes of other cells. */
function background(id, r) {
  let s = `<rect width="${W}" height="${H}" fill="url(#bg${id})"/>`;
  s += `<ellipse cx="200" cy="640" rx="420" ry="300" fill="url(#glow${id})"/>`;
  s += `<ellipse cx="1060" cy="90" rx="360" ry="260" fill="url(#glow${id})" opacity=".7"/>`;
  for (const [cx, cy, rad, op] of [
    [-60, 560, 300, 0.5],
    [1230, 720, 330, 0.45],
    [1180, -40, 260, 0.4],
  ]) {
    for (let i = 0; i < 4; i++) {
      s += `<circle cx="${cx}" cy="${cy}" r="${f(rad - i * 9)}" fill="none" stroke="${WHITE}" stroke-opacity="${f(op * (1 - i * 0.2))}" stroke-width="${i === 0 ? 3 : 1.5}"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="${f(rad * 0.3)}" fill="url(#depth${id})" filter="url(#b28${id})"/>`;
  }
  // suspended specks
  for (let i = 0; i < 46; i++) {
    const x = r() * W;
    const y = r() * H;
    const rad = 1 + r() * 3.5;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" fill="${r() > 0.5 ? WHITE : CYAN}" fill-opacity="${f(0.25 + r() * 0.5)}"/>`;
  }
  return s;
}

/* A translucent cell: outer glow, cytoplasm, layered membrane rings. */
function cellBody(id, cx, cy, rx, ry, r, opts = {}) {
  const rings = opts.rings ?? 4;
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${f(rx * 1.32)}" ry="${f(ry * 1.32)}" fill="url(#glow${id})"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#cyto${id})"/>`;
  for (let i = 0; i < rings; i++) {
    const k = 1 - i * 0.045;
    const rot = (r() - 0.5) * 6;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${f(rx * k)}" ry="${f(ry * k)}" transform="rotate(${f(rot)} ${cx} ${cy})" fill="none" stroke="${WHITE}" stroke-opacity="${f(0.95 - i * 0.2)}" stroke-width="${i === 0 ? 5 : 2}"/>`;
  }
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${f(rx * 1.015)}" ry="${f(ry * 1.015)}" fill="none" stroke="${CYAN}" stroke-opacity=".55" stroke-width="2.5" filter="url(#b3${id})"/>`;
  // cytoplasm texture
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 0.92;
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + r() * 2.2)}" fill="${r() > 0.35 ? WHITE : CYAN}" fill-opacity="${f(0.3 + r() * 0.5)}"/>`;
  }
  return s;
}

function nucleus(id, cx, cy, rad, opts = {}) {
  const dashed = opts.dashed ? ` stroke-dasharray="14 10"` : "";
  let s = `<circle cx="${cx}" cy="${cy}" r="${f(rad * 1.25)}" fill="url(#depth${id})" filter="url(#b9${id})"/>`;
  if (opts.fill !== false) s += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="url(#nuc${id})" fill-opacity="${opts.fillOpacity ?? 0.92}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${WHITE}" stroke-opacity="${opts.envelopeOpacity ?? 0.85}" stroke-width="3"${dashed}/>`;
  s += `<circle cx="${f(cx - rad * 0.3)}" cy="${f(cy - rad * 0.32)}" r="${f(rad * 0.42)}" fill="${WHITE}" fill-opacity=".14" filter="url(#b9${id})"/>`;
  return s;
}

/* Diffuse chromatin: short soft threads inside a nucleus. */
function chromatin(cx, cy, rad, r, n = 34, light = true) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 0.78;
    const x = cx + Math.cos(a) * rad * d;
    const y = cy + Math.sin(a) * rad * d;
    const ang = r() * Math.PI;
    const len = 9 + r() * 12;
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    const c = light ? "#bfe3ff" : NAVY;
    s += `<path d="M${f(x)} ${f(y)} Q${f((x + x2) / 2 + (r() - 0.5) * 8)} ${f((y + y2) / 2 + (r() - 0.5) * 8)} ${f(x2)} ${f(y2)}" fill="none" stroke="${c}" stroke-opacity="${f(0.45 + r() * 0.4)}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  return s;
}

/* A condensed chromosome: two sister chromatids crossing at the centromere. */
function chromosome(cx, cy, size, angle) {
  const w = size * 0.26;
  const arm = size / 2;
  const a1 = ((angle + 28) * Math.PI) / 180;
  const a2 = ((angle - 28) * Math.PI) / 180;
  const seg = (a) => `M${f(cx - Math.cos(a) * arm)} ${f(cy - Math.sin(a) * arm)} L${f(cx + Math.cos(a) * arm)} ${f(cy + Math.sin(a) * arm)}`;
  return (
    `<path d="${seg(a1)}" stroke="${NAVY}" stroke-width="${f(w)}" stroke-linecap="round" fill="none"/>` +
    `<path d="${seg(a2)}" stroke="${NAVY}" stroke-width="${f(w)}" stroke-linecap="round" fill="none"/>` +
    `<path d="${seg(a1)}" stroke="#3f86c7" stroke-opacity=".55" stroke-width="${f(w * 0.3)}" stroke-linecap="round" fill="none" transform="translate(${f(-w * 0.18)} ${f(-w * 0.18)})"/>` +
    `<path d="${seg(a2)}" stroke="#3f86c7" stroke-opacity=".55" stroke-width="${f(w * 0.3)}" stroke-linecap="round" fill="none" transform="translate(${f(-w * 0.18)} ${f(-w * 0.18)})"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${f(w * 0.42)}" fill="${CYAN}"/>`
  );
}

/* A separated chromatid in anaphase: a V with its vertex (centromere) leading toward the pole. */
function chromatidV(cx, cy, size, toward) {
  const dir = toward === "left" ? -1 : 1;
  const arm = size * 0.55;
  const w = size * 0.24;
  const p = (dx, dy) => `${f(cx + dx * dir)} ${f(cy + dy)}`;
  return (
    `<path d="M${p(arm * 0.9, -arm * 0.75)} L${p(0, 0)} L${p(arm * 0.9, arm * 0.75)}" fill="none" stroke="${NAVY}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${f(w * 0.4)}" fill="${CYAN}"/>`
  );
}

function centrosome(cx, cy, r, rays = 9, rayLen = 26) {
  let s = "";
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + r() * 0.3;
    s += `<line x1="${cx}" y1="${cy}" x2="${f(cx + Math.cos(a) * rayLen * (0.6 + r() * 0.6))}" y2="${f(cy + Math.sin(a) * rayLen * (0.6 + r() * 0.6))}" stroke="${CYAN}" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="7" fill="${NUC}"/><circle cx="${cx}" cy="${cy}" r="11" fill="none" stroke="${WHITE}" stroke-opacity=".8" stroke-width="2"/>`;
  return s;
}

function fibre(x1, y1, x2, y2, op = 0.75, w = 1.7) {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${NUC}" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round"/>`;
}

function label(text) {
  return `<text x="${W - 48}" y="${H - 40}" text-anchor="end" font-family="ui-monospace, 'JetBrains Mono', Consolas, monospace" font-size="18" letter-spacing="2.4" fill="${NAVY}" fill-opacity=".55">${text}</text>`;
}

function wrap(id, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
${defs(id)}
${body}
</svg>
`;
}

const stages = [];

/* 1. Interphase: intact nucleus, diffuse chromatin, duplicated centrosome pair. The cell prepares. */
{
  const id = "s1";
  const r = rng(11);
  const cx = 800;
  const cy = 375;
  let b = background(id, r);
  b += cellBody(id, cx, cy, 238, 232, r);
  b += nucleus(id, cx - 10, cy + 6, 112);
  b += chromatin(cx - 10, cy + 6, 112, r, 40);
  b += `<circle cx="${cx - 44}" cy="${cy - 14}" r="19" fill="${NAVY}" fill-opacity=".55"/>`; // nucleolus
  b += centrosome(cx + 150, cy - 118, r, 7, 14) + centrosome(cx + 172, cy - 102, r, 7, 14);
  b += label("CELL CYCLE MOTIF · INTERPHASE · BEFORE DIVISION");
  stages.push({ file: "stage-1-interphase.svg", svg: wrap(id, b) });
}

/* 2. Prophase: chromosomes condense inside the nucleus; centrosomes move apart. */
{
  const id = "s2";
  const r = rng(23);
  const cx = 800;
  const cy = 375;
  let b = background(id, r);
  b += cellBody(id, cx, cy, 240, 232, r);
  b += nucleus(id, cx - 8, cy + 4, 118, { fillOpacity: 0.78, envelopeOpacity: 0.75, dashed: true });
  const spots = [
    [-48, -36, 58, 15],
    [34, -42, 54, -30],
    [-30, 42, 56, 70],
    [44, 36, 52, 10],
  ];
  for (const [dx, dy, sz, ang] of spots) b += chromosome(cx - 8 + dx, cy + 4 + dy, sz, ang);
  b += centrosome(cx - 160, cy - 150, r, 11, 36) + centrosome(cx + 158, cy + 150, r, 11, 36);
  b += label("CELL CYCLE MOTIF · PROPHASE");
  stages.push({ file: "stage-2-prophase.svg", svg: wrap(id, b) });
}

/* 3. Prometaphase: the envelope is gone; spindle fibres reach the kinetochores. */
{
  const id = "s3";
  const r = rng(37);
  const cx = 800;
  const cy = 375;
  let b = background(id, r);
  b += cellBody(id, cx, cy, 246, 230, r);
  const left = [cx - 196, cy];
  const right = [cx + 196, cy];
  const chr = [
    [-62, -70, 56, 20],
    [26, -34, 54, -40],
    [-18, 30, 58, 65],
    [58, 72, 52, 5],
  ];
  for (const [dx, dy] of chr) {
    b += fibre(left[0], left[1], cx + dx, cy + dy, 0.55) + fibre(right[0], right[1], cx + dx, cy + dy, 0.55);
  }
  for (let i = 0; i < 5; i++) b += fibre(left[0], left[1], cx + 40 + i * 20, cy - 110 + i * 55, 0.22, 1.2);
  for (let i = 0; i < 5; i++) b += fibre(right[0], right[1], cx - 50 - i * 18, cy - 100 + i * 50, 0.22, 1.2);
  for (const [dx, dy, sz, ang] of chr) b += chromosome(cx + dx, cy + dy, sz, ang);
  b += centrosome(left[0], left[1], r, 12, 34) + centrosome(right[0], right[1], r, 12, 34);
  b += label("CELL CYCLE MOTIF · PROMETAPHASE");
  stages.push({ file: "stage-3-prometaphase.svg", svg: wrap(id, b) });
}

/* 4. Metaphase: chromosomes line up on the equatorial plate between the two poles. */
{
  const id = "s4";
  const r = rng(41);
  const cx = 800;
  const cy = 375;
  let b = background(id, r);
  b += cellBody(id, cx, cy, 250, 228, r);
  const left = [cx - 200, cy];
  const right = [cx + 200, cy];
  const ys = [-108, -36, 36, 108];
  for (const dy of ys) b += fibre(left[0], left[1], cx - 6, cy + dy, 0.6) + fibre(right[0], right[1], cx + 6, cy + dy, 0.6);
  for (let i = 0; i < 4; i++) b += fibre(left[0], left[1], cx + 60, cy - 90 + i * 60, 0.2, 1.2) + fibre(right[0], right[1], cx - 60, cy - 90 + i * 60, 0.2, 1.2);
  b += `<line x1="${cx}" y1="${cy - 160}" x2="${cx}" y2="${cy + 160}" stroke="${WHITE}" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="4 8"/>`;
  for (const dy of ys) b += chromosome(cx, cy + dy, 58, 90);
  b += centrosome(left[0], left[1], r, 12, 34) + centrosome(right[0], right[1], r, 12, 34);
  b += label("CELL CYCLE MOTIF · METAPHASE");
  stages.push({ file: "stage-4-metaphase.svg", svg: wrap(id, b) });
}

/* 5. Anaphase: sister chromatids separate and move toward opposite poles; the cell lengthens. */
{
  const id = "s5";
  const r = rng(53);
  const cx = 790;
  const cy = 375;
  let b = background(id, r);
  b += cellBody(id, cx, cy, 292, 212, r);
  const left = [cx - 228, cy];
  const right = [cx + 228, cy];
  const ys = [-96, -32, 32, 96];
  for (const dy of ys) {
    b += fibre(left[0], left[1], cx - 112, cy + dy, 0.6) + fibre(right[0], right[1], cx + 112, cy + dy, 0.6);
  }
  for (let i = 0; i < 5; i++) b += fibre(left[0] + 20, left[1] - 60 + i * 30, right[0] - 20, right[1] - 60 + i * 30, 0.16, 1.1);
  for (const dy of ys) b += chromatidV(cx - 112, cy + dy, 50, "left") + chromatidV(cx + 112, cy + dy, 50, "right");
  b += centrosome(left[0], left[1], r, 12, 32) + centrosome(right[0], right[1], r, 12, 32);
  b += label("CELL CYCLE MOTIF · ANAPHASE");
  stages.push({ file: "stage-5-anaphase.svg", svg: wrap(id, b) });
}

/* 6. Telophase: two nuclei re-form while the cleavage furrow begins to pinch the cell. */
{
  const id = "s6";
  const r = rng(67);
  const cx = 790;
  const cy = 375;
  let b = background(id, r);
  // peanut outline: two lobes joined by a waist
  const lobe = 196;
  const dx = 150;
  const waist = 118;
  const pathD = `M${cx - dx} ${cy - lobe} C${cx - dx + lobe * 0.55} ${cy - lobe} ${cx - 40} ${cy - waist} ${cx} ${cy - waist} C${cx + 40} ${cy - waist} ${cx + dx - lobe * 0.55} ${cy - lobe} ${cx + dx} ${cy - lobe} A${lobe} ${lobe} 0 0 1 ${cx + dx} ${cy + lobe} C${cx + dx - lobe * 0.55} ${cy + lobe} ${cx + 40} ${cy + waist} ${cx} ${cy + waist} C${cx - 40} ${cy + waist} ${cx - dx + lobe * 0.55} ${cy + lobe} ${cx - dx} ${cy + lobe} A${lobe} ${lobe} 0 0 1 ${cx - dx} ${cy - lobe} Z`;
  b += `<ellipse cx="${cx}" cy="${cy}" rx="${f((dx + lobe) * 1.25)}" ry="${f(lobe * 1.32)}" fill="url(#glow${id})"/>`;
  b += `<path d="${pathD}" fill="url(#cyto${id})"/>`;
  for (let i = 0; i < 3; i++) b += `<path d="${pathD}" fill="none" stroke="${WHITE}" stroke-opacity="${f(0.95 - i * 0.28)}" stroke-width="${i === 0 ? 5 : 2}" transform="translate(${cx} ${cy}) scale(${f(1 - i * 0.04)}) translate(${-cx} ${-cy})"/>`;
  b += `<path d="${pathD}" fill="none" stroke="${CYAN}" stroke-opacity=".55" stroke-width="2.5" filter="url(#b3${id})"/>`;
  for (let i = 0; i < 60; i++) {
    const side = r() > 0.5 ? -1 : 1;
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 0.85;
    b += `<circle cx="${f(cx + side * dx + Math.cos(a) * lobe * d)}" cy="${f(cy + Math.sin(a) * lobe * d)}" r="${f(1 + r() * 2.2)}" fill="${r() > 0.35 ? WHITE : CYAN}" fill-opacity="${f(0.3 + r() * 0.5)}"/>`;
  }
  // midbody remnants
  for (let i = 0; i < 6; i++) b += fibre(cx - 80, cy - 50 + i * 20, cx + 80, cy - 50 + i * 20, 0.2, 1.1);
  for (const side of [-1, 1]) {
    const nx = cx + side * (dx + 20);
    b += nucleus(id, nx, cy, 78, { fillOpacity: 0.6, envelopeOpacity: 0.7, dashed: true });
    b += chromatin(nx, cy, 70, r, 22, true);
    for (let i = 0; i < 4; i++) {
      b += `<circle cx="${f(nx + (r() - 0.5) * 70)}" cy="${f(cy + (r() - 0.5) * 70)}" r="${f(9 + r() * 7)}" fill="${NAVY}" fill-opacity=".55" filter="url(#b3${id})"/>`;
    }
  }
  b += label("CELL CYCLE MOTIF · TELOPHASE");
  stages.push({ file: "stage-6-telophase.svg", svg: wrap(id, b) });
}

/* 7. Cytokinesis complete: two daughter cells, each with its own nucleus. */
{
  const id = "s7";
  const r = rng(79);
  const cy = 375;
  let b = background(id, r);
  const cells = [
    [585, 170],
    [1000, 170],
  ];
  // thin bridge remnant between them
  b += `<line x1="${cells[0][0] + 166}" y1="${cy}" x2="${cells[1][0] - 166}" y2="${cy}" stroke="${CYAN}" stroke-opacity=".6" stroke-width="2" stroke-dasharray="3 7"/>`;
  for (const [cx, rad] of cells) {
    b += cellBody(id, cx, cy, rad, rad - 4, r, { rings: 3 });
    b += nucleus(id, cx - 6, cy + 4, 72);
    b += chromatin(cx - 6, cy + 4, 72, r, 26);
    b += `<circle cx="${cx - 28}" cy="${cy - 8}" r="12" fill="${NAVY}" fill-opacity=".5"/>`;
    b += centrosome(cx + 92, cy - 76, r, 6, 12);
  }
  b += label("CELL CYCLE MOTIF · CYTOKINESIS · TWO DAUGHTER CELLS");
  stages.push({ file: "stage-7-daughter-cells.svg", svg: wrap(id, b) });
}

// remove the previous set, write the new one
for (const name of await readdir(OUT)) {
  if (name.endsWith(".svg") && !name.startsWith("stage-")) await unlink(path.join(OUT, name));
}
for (const s of stages) {
  await writeFile(path.join(OUT, s.file), s.svg);
  console.log("wrote", s.file, `${(s.svg.length / 1024).toFixed(1)} kB`);
}
