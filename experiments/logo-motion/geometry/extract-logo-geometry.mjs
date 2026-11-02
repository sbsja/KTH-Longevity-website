/**
 * Derives an animation-only vector representation of the two crossing strokes in the
 * supplied logo (public/brand/kth-longevity-logo.png, 1008 × 480) and checks it against
 * the PNG pixel by pixel. The source file is read only, never modified.
 *
 *   node experiments/logo-motion/geometry/extract-logo-geometry.mjs
 *
 * Writes (all inside experiments/logo-motion/):
 *   geometry/logo-geometry.json   stroke paths, widths, colours, boxes, fidelity numbers
 *   geometry/fidelity-check.png   original | vector render | difference, 4× enlarged
 *   assets/logo-mark.png          the mark box of the PNG with its mint tile turned into
 *                                 transparency (same ink pixels, alpha = ink coverage)
 *
 * Method: every pixel in the symbol area is unmixed into "navy coverage" and "blue
 * coverage" against the known background (#e3faf5), navy (#08283d) and blue (#175998),
 * which are exact in the PNG. Column centroids give each stroke's centreline; the stroke
 * that keeps its full mass through the crossing is the one on top. A cubic Bézier per
 * stroke is fitted to the centreline and then refined, together with the stroke width and
 * end points, by rendering candidate SVGs with the same rasteriser and minimising the
 * per-pixel error against the original.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const SRC = path.join(root, "public/brand/kth-longevity-logo.png");
const BG = [227, 250, 245];
const NAVY = [8, 40, 61];
const BLUE = [23, 89, 152];
const MARK_BOX = { x: 175, y: 172, w: 663, h: 136 }; // the frame the site's header uses

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const px = (x, y) => {
  const i = (y * W + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};

// ---- unmix every pixel into navy / blue coverage ------------------------------------
const dn = NAVY.map((v, i) => v - BG[i]);
const db = BLUE.map((v, i) => v - BG[i]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nn = dot(dn, dn);
const bb = dot(db, db);
const nb = dot(dn, db);
const det = nn * bb - nb * nb;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
function unmix(x, y) {
  const [r, g, b, a] = px(x, y);
  // the tile has rounded, partly transparent corners: only fully opaque pixels carry ink
  if (a < 250) return [0, 0];
  const d = [r - BG[0], g - BG[1], b - BG[2]];
  const rn = dot(dn, d);
  const rb = dot(db, d);
  let an = (rn * bb - rb * nb) / det;
  let ab = (rb * nn - rn * nb) / det;
  an = clamp01(an);
  ab = clamp01(ab);
  const s = an + ab;
  if (s > 1) {
    an /= s;
    ab /= s;
  }
  return [an, ab];
}

// ink extents
let ink = { minx: W, miny: H, maxx: 0, maxy: 0 };
const cols = new Array(W).fill(0);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const [an, ab] = unmix(x, y);
    if (an + ab > 0.08) {
      cols[x] += an + ab;
      if (x < ink.minx) ink.minx = x;
      if (x > ink.maxx) ink.maxx = x;
      if (y < ink.miny) ink.miny = y;
      if (y > ink.maxy) ink.maxy = y;
    }
  }
}
// the symbol is the first run of occupied columns; the wordmark starts after the first wide gap
let symbolEnd = ink.minx;
while (symbolEnd < W && cols[symbolEnd] > 0) symbolEnd++;
let wordStart = symbolEnd;
while (wordStart < W && cols[wordStart] === 0) wordStart++;
const boxOf = (x0, x1) => {
  let miny = H,
    maxy = 0;
  for (let y = 0; y < H; y++)
    for (let x = x0; x <= x1; x++) {
      const [an, ab] = unmix(x, y);
      if (an + ab > 0.08) {
        if (y < miny) miny = y;
        if (y > maxy) maxy = y;
      }
    }
  return { x: x0, y: miny, w: x1 - x0 + 1, h: maxy - miny + 1 };
};
const symbolBox = boxOf(ink.minx, symbolEnd - 1);
const wordmarkBox = boxOf(wordStart, ink.maxx);

// ---- centrelines from column centroids --------------------------------------------
const area = { x0: symbolBox.x - 6, x1: symbolBox.x + symbolBox.w + 6, y0: symbolBox.y - 6, y1: symbolBox.y + symbolBox.h + 6 };
function columnStats(which) {
  const out = [];
  for (let x = area.x0; x <= area.x1; x++) {
    let mass = 0;
    let moment = 0;
    for (let y = area.y0; y <= area.y1; y++) {
      const a = unmix(x, y)[which];
      mass += a;
      moment += a * (y + 0.5);
    }
    out.push({ x: x + 0.5, mass, yc: mass > 0 ? moment / mass : NaN });
  }
  return out;
}
const navyCols = columnStats(0);
const blueCols = columnStats(1);
const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

function analyse(colsStats) {
  const occupied = colsStats.filter((c) => c.mass > 0.5);
  const xVisibleMin = occupied[0].x - 0.5;
  const xVisibleMax = occupied[occupied.length - 1].x + 0.5;
  const fullMass = median(occupied.map((c) => c.mass));
  // reliable columns: full mass (not a cap, not hidden by the other stroke)
  const reliable = occupied.filter((c) => c.mass > fullMass * 0.8 && c.x > xVisibleMin + 7 && c.x < xVisibleMax - 7);
  // slope-corrected width
  const widths = [];
  for (let i = 1; i < reliable.length - 1; i++) {
    const a = reliable[i - 1];
    const b = reliable[i + 1];
    if (b.x - a.x > 3) continue; // across a hidden gap
    const slope = (b.yc - a.yc) / (b.x - a.x);
    widths.push(reliable[i].mass * Math.cos(Math.atan(slope)));
  }
  const width = median(widths);
  // hidden span (columns inside the visible range with far less than full mass, away from the caps)
  const hidden = occupied.filter((c) => c.mass < fullMass * 0.5 && c.x > xVisibleMin + width && c.x < xVisibleMax - width);
  return { xVisibleMin, xVisibleMax, fullMass, width, reliable, hidden, dipRatio: hidden.length ? Math.min(...hidden.map((c) => c.mass)) / fullMass : 1 };
}
const navyA = analyse(navyCols);
const blueA = analyse(blueCols);
// the stroke whose mass dips through the crossing is underneath
const navyOnTop = navyA.dipRatio > blueA.dipRatio;

// ---- cubic Bézier fitting (least squares with Newton reparametrisation) --------------
const bez = (P, t) => {
  const mt = 1 - t;
  const a = mt * mt * mt,
    b = 3 * mt * mt * t,
    c = 3 * mt * t * t,
    d = t * t * t;
  return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]];
};
const bezD1 = (P, t) => {
  const mt = 1 - t;
  const a = 3 * mt * mt,
    b = 6 * mt * t,
    c = 3 * t * t;
  return [a * (P[1][0] - P[0][0]) + b * (P[2][0] - P[1][0]) + c * (P[3][0] - P[2][0]), a * (P[1][1] - P[0][1]) + b * (P[2][1] - P[1][1]) + c * (P[3][1] - P[2][1])];
};
const bezD2 = (P, t) => {
  const mt = 1 - t;
  return [
    6 * mt * (P[2][0] - 2 * P[1][0] + P[0][0]) + 6 * t * (P[3][0] - 2 * P[2][0] + P[1][0]),
    6 * mt * (P[2][1] - 2 * P[1][1] + P[0][1]) + 6 * t * (P[3][1] - 2 * P[2][1] + P[1][1]),
  ];
};
function fitCubic(points, P0, P3) {
  // chord-length parametrisation, then solve for P1, P2 and refine t values
  let ts = [0];
  for (let i = 1; i < points.length; i++) ts.push(ts[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  const total = ts[ts.length - 1];
  ts = ts.map((v) => v / total);
  // t for the fixed endpoints: points lie strictly inside the curve, so place them by projection later
  let P = [P0, [0, 0], [0, 0], P3];
  for (let iter = 0; iter < 8; iter++) {
    // least squares for P1,P2: Q_i - mt^3 P0 - t^3 P3 = B1(t) P1 + B2(t) P2
    let c11 = 0,
      c12 = 0,
      c22 = 0;
    const r1 = [0, 0],
      r2 = [0, 0];
    for (let i = 0; i < points.length; i++) {
      const t = ts[i],
        mt = 1 - t;
      const b0 = mt * mt * mt,
        b1 = 3 * mt * mt * t,
        b2 = 3 * mt * t * t,
        b3 = t * t * t;
      const rx = points[i][0] - b0 * P0[0] - b3 * P3[0];
      const ry = points[i][1] - b0 * P0[1] - b3 * P3[1];
      c11 += b1 * b1;
      c12 += b1 * b2;
      c22 += b2 * b2;
      r1[0] += b1 * rx;
      r1[1] += b1 * ry;
      r2[0] += b2 * rx;
      r2[1] += b2 * ry;
    }
    const d = c11 * c22 - c12 * c12;
    const P1 = [(r1[0] * c22 - r2[0] * c12) / d, (r1[1] * c22 - r2[1] * c12) / d];
    const P2 = [(r2[0] * c11 - r1[0] * c12) / d, (r2[1] * c11 - r1[1] * c12) / d];
    P = [P0, P1, P2, P3];
    // Newton step on each t to the closest point
    ts = ts.map((t, i) => {
      for (let k = 0; k < 3; k++) {
        const q = bez(P, t),
          d1 = bezD1(P, t),
          d2 = bezD2(P, t);
        const dx = q[0] - points[i][0],
          dy = q[1] - points[i][1];
        const num = dx * d1[0] + dy * d1[1];
        const den = d1[0] * d1[0] + d1[1] * d1[1] + dx * d2[0] + dy * d2[1];
        if (Math.abs(den) < 1e-9) break;
        t = Math.min(1, Math.max(0, t - num / den));
      }
      return t;
    });
  }
  let maxErr = 0;
  for (let i = 0; i < points.length; i++) {
    const q = bez(P, ts[i]);
    maxErr = Math.max(maxErr, Math.hypot(q[0] - points[i][0], q[1] - points[i][1]));
  }
  return { P, maxErr };
}

function initialStroke(A) {
  const pts = A.reliable.map((c) => [c.x, c.yc]);
  // end points: the round cap reaches width/2 beyond the end point along x (the cap circle)
  const w = A.width;
  const first = pts.slice(0, 6);
  const last = pts.slice(-6);
  const lin = (seg, x) => {
    const n = seg.length;
    const mx = seg.reduce((s, p) => s + p[0], 0) / n;
    const my = seg.reduce((s, p) => s + p[1], 0) / n;
    const sxx = seg.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
    const sxy = seg.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0);
    return my + (sxy / sxx) * (x - mx);
  };
  const x0 = A.xVisibleMin + w / 2;
  const x3 = A.xVisibleMax - w / 2;
  const P0 = [x0, lin(first, x0)];
  const P3 = [x3, lin(last, x3)];
  const { P, maxErr } = fitCubic(pts, P0, P3);
  return { P, width: w, fitErr: maxErr };
}

const navy0 = initialStroke(navyA);
const blue0 = initialStroke(blueA);

// ---- render-and-compare refinement --------------------------------------------------
const fmt = (v) => Number(v.toFixed(2));
const pathOf = (P) => `M${fmt(P[0][0])} ${fmt(P[0][1])} C${fmt(P[1][0])} ${fmt(P[1][1])} ${fmt(P[2][0])} ${fmt(P[2][1])} ${fmt(P[3][0])} ${fmt(P[3][1])}`;
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const crop = { left: area.x0, top: area.y0, width: area.x1 - area.x0 + 1, height: area.y1 - area.y0 + 1 };

function svgFor(navyP, blueP, wN, wB, cap) {
  const under = navyOnTop ? ["blue", blueP, wB] : ["navy", navyP, wN];
  const over = navyOnTop ? ["navy", navyP, wN] : ["blue", blueP, wB];
  const col = (n) => (n === "navy" ? hex(NAVY) : hex(BLUE));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${crop.width}" height="${crop.height}" viewBox="${crop.left} ${crop.top} ${crop.width} ${crop.height}">
<rect x="${crop.left}" y="${crop.top}" width="${crop.width}" height="${crop.height}" fill="${hex(BG)}"/>
<path d="${pathOf(under[1])}" fill="none" stroke="${col(under[0])}" stroke-width="${fmt(under[2])}" stroke-linecap="${cap}"/>
<path d="${pathOf(over[1])}" fill="none" stroke="${col(over[0])}" stroke-width="${fmt(over[2])}" stroke-linecap="${cap}"/>
</svg>`;
}
const original = await sharp(SRC).extract(crop).removeAlpha().raw().toBuffer();
async function errorOf(svg) {
  const r = await sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer();
  let sum = 0;
  let max = 0;
  let over16 = 0;
  for (let i = 0; i < r.length; i += 3) {
    const e = (Math.abs(r[i] - original[i]) + Math.abs(r[i + 1] - original[i + 1]) + Math.abs(r[i + 2] - original[i + 2])) / 3;
    sum += e;
    if (e > max) max = e;
    if (e > 16) over16++;
  }
  return { mean: sum / (r.length / 3), max, over16, pixels: r.length / 3 };
}

let state = { navy: navy0.P.map((p) => [...p]), blue: blue0.P.map((p) => [...p]), wN: navy0.width, wB: blue0.width };
let cap = "round";
const evalState = async (s, c = cap) => (await errorOf(svgFor(s.navy, s.blue, s.wN, s.wB, c))).mean;
let best = await evalState(state);
const buttErr = await evalState(state, "butt");
if (buttErr < best) {
  cap = "butt";
  best = buttErr;
}
// coordinate descent over the 16 control coordinates and the two widths
const params = [];
for (const k of ["navy", "blue"]) for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) params.push({ k, i, j });
params.push({ k: "wN" }, { k: "wB" });
const get = (s, p) => (p.i === undefined ? s[p.k] : s[p.k][p.i][p.j]);
const set = (s, p, v) => {
  const c = { navy: s.navy.map((q) => [...q]), blue: s.blue.map((q) => [...q]), wN: s.wN, wB: s.wB };
  if (p.i === undefined) c[p.k] = v;
  else c[p.k][p.i][p.j] = v;
  return c;
};
for (const step of [1, 0.5, 0.25, 0.125, 0.0625]) {
  let improved = true;
  let guard = 0;
  while (improved && guard++ < 6) {
    improved = false;
    for (const p of params) {
      for (const dir of [-1, 1]) {
        const cand = set(state, p, get(state, p) + dir * step);
        const e = await evalState(cand);
        if (e < best - 1e-6) {
          best = e;
          state = cand;
          improved = true;
        }
      }
    }
  }
}
const finalErr = await errorOf(svgFor(state.navy, state.blue, state.wN, state.wB, cap));

// crossing point: closest approach of the two centrelines
let crossing = null;
let bestD = Infinity;
for (let i = 0; i <= 400; i++) {
  const a = bez(state.navy, i / 400);
  for (let j = 0; j <= 400; j++) {
    const b = bez(state.blue, j / 400);
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (d < bestD) {
      bestD = d;
      crossing = { x: fmt((a[0] + b[0]) / 2), y: fmt((a[1] + b[1]) / 2), tNavy: i / 400, tBlue: j / 400 };
    }
  }
}

// ---- outputs -------------------------------------------------------------------------
await mkdir(path.join(here, "../assets"), { recursive: true });

// 1. fidelity sheet: original | vector | difference (×4)
const vectorSvg = svgFor(state.navy, state.blue, state.wN, state.wB, cap);
const vectorRaw = await sharp(Buffer.from(vectorSvg)).removeAlpha().raw().toBuffer();
const diff = Buffer.alloc(original.length);
for (let i = 0; i < original.length; i += 3) {
  const e = Math.min(255, (Math.abs(vectorRaw[i] - original[i]) + Math.abs(vectorRaw[i + 1] - original[i + 1]) + Math.abs(vectorRaw[i + 2] - original[i + 2])) * 2);
  diff[i] = 255;
  diff[i + 1] = 255 - e;
  diff[i + 2] = 255 - e;
}
const scale = 4;
const tile = async (raw) => sharp(raw, { raw: { width: crop.width, height: crop.height, channels: 3 } }).resize(crop.width * scale, crop.height * scale, { kernel: "nearest" }).png().toBuffer();
await sharp({
  create: { width: crop.width * scale * 3 + 2 * 8, height: crop.height * scale, channels: 3, background: "#ffffff" },
})
  .composite([
    { input: await tile(original), left: 0, top: 0 },
    { input: await tile(vectorRaw), left: crop.width * scale + 8, top: 0 },
    { input: await tile(diff), left: 2 * (crop.width * scale + 8), top: 0 },
  ])
  .png()
  .toFile(path.join(here, "fidelity-check.png"));

// 2. the mark with its tile turned into transparency (alpha = ink coverage, colour = ink mix)
const markRaw = Buffer.alloc(MARK_BOX.w * MARK_BOX.h * 4);
for (let y = 0; y < MARK_BOX.h; y++) {
  for (let x = 0; x < MARK_BOX.w; x++) {
    const [an, ab] = unmix(MARK_BOX.x + x, MARK_BOX.y + y);
    const a = an + ab;
    const o = (y * MARK_BOX.w + x) * 4;
    if (a <= 0.002) {
      markRaw[o] = NAVY[0];
      markRaw[o + 1] = NAVY[1];
      markRaw[o + 2] = NAVY[2];
      markRaw[o + 3] = 0;
      continue;
    }
    for (let c = 0; c < 3; c++) markRaw[o + c] = Math.round((an * NAVY[c] + ab * BLUE[c]) / a);
    markRaw[o + 3] = Math.round(a * 255);
  }
}
await sharp(markRaw, { raw: { width: MARK_BOX.w, height: MARK_BOX.h, channels: 4 } })
  .png()
  .toFile(path.join(here, "../assets/logo-mark.png"));

// 3. geometry
const strokeOut = (P, w, color, name) => ({
  color,
  width: fmt(w),
  cap,
  path: pathOf(P),
  points: P.map((p) => [fmt(p[0]), fmt(p[1])]),
  from: name === "navy" ? "top-left" : "bottom-left",
  to: name === "navy" ? "bottom-right" : "top-right",
});
const geometry = {
  source: "public/brand/kth-longevity-logo.png",
  generatedBy: "experiments/logo-motion/geometry/extract-logo-geometry.mjs",
  coordinateSpace: "pixels of the source PNG (1008 × 480), y down",
  image: { width: W, height: H },
  background: hex(BG),
  markBox: MARK_BOX,
  symbolBox,
  wordmarkBox,
  inkBox: { x: ink.minx, y: ink.miny, w: ink.maxx - ink.minx + 1, h: ink.maxy - ink.miny + 1 },
  order: navyOnTop ? ["blue", "navy"] : ["navy", "blue"],
  onTop: navyOnTop ? "navy" : "blue",
  strokes: {
    navy: strokeOut(state.navy, state.wN, hex(NAVY), "navy"),
    blue: strokeOut(state.blue, state.wB, hex(BLUE), "blue"),
  },
  crossing,
  fit: { navyCentrelineMaxErrPx: fmt(navy0.fitErr), blueCentrelineMaxErrPx: fmt(blue0.fitErr) },
  fidelity: {
    region: crop,
    meanAbsError255: Number(finalErr.mean.toFixed(3)),
    maxAbsError255: finalErr.max,
    pixelsOver16: finalErr.over16,
    pixelsCompared: finalErr.pixels,
    note: "Per-channel mean absolute difference between the vector render (librsvg) and the PNG over the symbol area, 0–255 scale.",
  },
  massDip: { navy: fmt(navyA.dipRatio), blue: fmt(blueA.dipRatio) },
};
await writeFile(path.join(here, "logo-geometry.json"), JSON.stringify(geometry, null, 2) + "\n");
console.log(JSON.stringify(geometry, null, 2));
