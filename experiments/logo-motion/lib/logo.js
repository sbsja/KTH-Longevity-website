/**
 * Shared building blocks for the six concepts: the logo's visibility state, stroke
 * drawing, the restrained wordmark reveal, the handoff from vector strokes to the PNG
 * symbol, and geometry helpers. Every tween is a fromTo with explicit values so that
 * any position on the timeline is a pure function of time (seeking is exact).
 */

const gsap = window.gsap;

export const COLOR = {
  ice: "#e3faf5",
  aqua: "#c6f0ef",
  aquaDeep: "#9fdfe3",
  cyan: "#69c9dd",
  navy: "#08283d",
  nucleus: "#175998",
  softWhite: "#f8fcfb",
  text2: "#3c5b6e",
};

/** Opacity of the three logo layers. 1 = visible. */
export function setLogoState(logo, { word = 0, symbol = 0, vector = 0, wipe = "end" } = {}) {
  gsap.set(logo.wordGroup, { opacity: word });
  gsap.set(logo.pngSymbol, { opacity: symbol });
  gsap.set(logo.vector, { opacity: vector });
  gsap.set(logo.wipeRect, { attr: { x: wipe === "start" ? logo.wipeFrom : logo.wipeTo } });
  logo.wordGroup.removeAttribute("mask");
}

/** Hide both strokes with a dash pattern; returns their lengths. */
export function prepareStrokeDraw(logo) {
  const out = {};
  for (const name of ["navy", "blue"]) {
    const p = logo[name];
    const L = p.getTotalLength();
    out[name] = L;
    gsap.set(p, { attr: { "stroke-dasharray": `${L + 2} ${L + 2}`, "stroke-dashoffset": L + 2 } });
  }
  return out;
}

/**
 * Draw a stroke from its start (reverse: false) or from its end (reverse: true).
 * A positive dash offset reveals from the path start; a negative one from the end.
 */
export function drawStroke(tl, path, length, { at = 0, duration = 0.8, ease = "power3.inOut", reverse = false } = {}) {
  const L = length + 2;
  tl.fromTo(
    path,
    { attr: { "stroke-dashoffset": reverse ? -L : L } },
    { attr: { "stroke-dashoffset": 0 }, duration, ease, immediateRender: false },
    at,
  );
  return tl;
}

/** The wordmark appears: a feathered wipe from the symbol outwards, a fade, or a fade with a small rise. */
export function revealWord(tl, logo, { at = 0, duration = 0.5, style = "wipe" } = {}) {
  if (style === "wipe") {
    logo.wordGroup.setAttribute("mask", "url(#mask-word)");
    tl.set(logo.wordGroup, { opacity: 1 }, 0);
    tl.fromTo(
      logo.wipeRect,
      { attr: { x: logo.wipeFrom } },
      { attr: { x: logo.wipeTo }, duration, ease: "power2.inOut", immediateRender: false },
      at,
    );
    return tl;
  }
  if (style === "rise") {
    tl.fromTo(logo.wordGroup, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration, ease: "power2.out", immediateRender: false }, at);
    return tl;
  }
  tl.fromTo(logo.wordGroup, { opacity: 0 }, { opacity: 1, duration, ease: "power2.inOut", immediateRender: false }, at);
  return tl;
}

/** Vector strokes → the PNG symbol. With sub-pixel alignment the crossfade is invisible. */
export function handoffSymbol(tl, logo, { at = 0, duration = 0.2, from = null } = {}) {
  const source = from ?? logo.vector;
  tl.fromTo(logo.pngSymbol, { opacity: 0 }, { opacity: 1, duration, ease: "none", immediateRender: false }, at);
  tl.fromTo(source, { opacity: 1 }, { opacity: 0, duration, ease: "none", immediateRender: false }, at);
  return tl;
}

/* ---------------- geometry ---------------- */

export function bezierAt(P, t) {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]];
}

export function bezierTangent(P, t) {
  const mt = 1 - t;
  const x = 3 * mt * mt * (P[1][0] - P[0][0]) + 6 * mt * t * (P[2][0] - P[1][0]) + 3 * t * t * (P[3][0] - P[2][0]);
  const y = 3 * mt * mt * (P[1][1] - P[0][1]) + 6 * mt * t * (P[2][1] - P[1][1]) + 3 * t * t * (P[3][1] - P[2][1]);
  const n = Math.hypot(x, y) || 1;
  return [x / n, y / n];
}

/** n points along the cubic from parameter t0 to t1 (t1 may be smaller than t0 to reverse). */
export function sampleBezier(P, n, t0 = 0, t1 = 1) {
  const pts = [];
  for (let i = 0; i < n; i++) pts.push(bezierAt(P, t0 + ((t1 - t0) * i) / (n - 1)));
  return pts;
}

/** Arc-length table for a cubic, so beads can be placed by distance. */
export function arcTable(P, segments = 200) {
  const ts = [0];
  const ls = [0];
  let prev = bezierAt(P, 0);
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const p = bezierAt(P, t);
    ls.push(ls[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
    ts.push(t);
    prev = p;
  }
  const length = ls[segments];
  return {
    length,
    tAt(s) {
      const target = Math.min(Math.max(s, 0), length);
      let lo = 0;
      let hi = segments;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (ls[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      if (lo === 0) return 0;
      const f = (target - ls[lo - 1]) / (ls[lo] - ls[lo - 1] || 1);
      return ts[lo - 1] + f * (ts[lo] - ts[lo - 1]);
    },
    pointAt(s) {
      return bezierAt(P, this.tAt(s));
    },
  };
}

export function pathFromPoints(pts) {
  if (!pts.length) return "";
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
  return d;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const lerpPts = (A, B, t) => A.map((p, i) => [lerp(p[0], B[i][0], t), lerp(p[1], B[i][1], t)]);
export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
export const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Small deterministic pseudo-random sequence (same numbers on every replay). */
export function seeded(seed = 7) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Apply a blur (and optional scale) to a node from a proxy; removes the filter when sharp. */
export function applyFocus(node, { blur = 0, scale = 1 }) {
  node.style.filter = blur > 0.04 ? `blur(${blur.toFixed(2)}px)` : "none";
  node.style.transform = Math.abs(scale - 1) > 0.0005 ? `scale(${scale.toFixed(4)})` : "none";
}
