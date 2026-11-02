/**
 * 3 · Cell division reveals the logo (1.8 s)
 * A translucent cell elongates, narrows in the middle and separates into two forms
 * (a Cassini oval, which naturally goes circle → peanut → two loops). The facing
 * membrane arcs of the two daughters then reach back to the centre and become the
 * four arms of the crossing: left-top and right-bottom arcs → navy, the others → blue.
 */
import { COLOR, easeInOutCubic, handoffSymbol, lerpPts, pathFromPoints, revealWord, sampleBezier, setLogoState } from "../lib/logo.js";
import { svgEl } from "../lib/stage.js";

const gsap = window.gsap;
const N = 44; // points per half-arc polyline

/** Cassini oval in local maths coordinates (y up), foci at ±c, product constant b². */
function cassini(c, b, n) {
  if (b >= c) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2;
      const r2 = c * c * Math.cos(2 * th) + Math.sqrt(Math.max(0, b ** 4 - c ** 4 * Math.sin(2 * th) ** 2));
      const r = Math.sqrt(Math.max(0, r2));
      pts.push([r * Math.cos(th), r * Math.sin(th)]);
    }
    return { single: true, whole: pts };
  }
  const thMax = 0.5 * Math.asin(Math.min(1, (b * b) / (c * c)));
  const radius = (th, sign) => Math.sqrt(Math.max(0, c * c * Math.cos(2 * th) + sign * Math.sqrt(Math.max(0, b ** 4 - c ** 4 * Math.sin(2 * th) ** 2))));
  const outer = [];
  const inner = [];
  const half = Math.floor(n / 2);
  for (let i = 0; i <= half; i++) {
    const th = -thMax + (2 * thMax * i) / half;
    outer.push([radius(th, 1) * Math.cos(th), radius(th, 1) * Math.sin(th)]);
    inner.push([radius(th, -1) * Math.cos(th), radius(th, -1) * Math.sin(th)]);
  }
  const right = [...outer, ...[...inner].reverse()];
  const left = right.map(([x, y]) => [-x, y]);
  // inner arcs from the junction with the outer arc towards the pinch point, upper and lower
  const innerUpper = [];
  const innerLower = [];
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const thU = thMax * (1 - f);
    const thL = -thMax * (1 - f);
    innerUpper.push([radius(thU, -1) * Math.cos(thU), radius(thU, -1) * Math.sin(thU)]);
    innerLower.push([radius(thL, -1) * Math.cos(thL), radius(thL, -1) * Math.sin(thL)]);
  }
  return { single: false, right, left, innerUpper, innerLower };
}

const division = {
  id: "division",
  number: 3,
  name: "Cell division reveals the logo",
  duration: 1.8,
  description:
    "A translucent cell elongates, develops a narrowing middle and separates into two forms. The membrane arcs facing each other reach back and become the two curved strands, then the wordmark completes the reveal.",
  approach: "Procedural SVG: a Cassini oval (circle → peanut → two loops) for the membrane, two soft nuclei, and a point-wise morph from the daughters' inner arcs to the traced strand halves; GSAP drives the parameters.",
  strengths: "The pinch and the transformation are explicit and recognisable; organic motion that matches the site's cellular artwork; no canvas required.",
  limitations: "The longest concept; the arc-to-strand morph is a stylised reading of division rather than anything literal, and the strand halves are polylines until the handoff to the PNG symbol.",
  approximated: false,
  create(stage) {
    const logo = stage.logo;
    const g = stage.geometry;
    setLogoState(logo, { word: 0, symbol: 0, vector: 0, wipe: "start" });

    const cx = g.crossing.x;
    const cy = g.crossing.y;
    const toScreen = (pts) => pts.map(([x, y]) => [cx + x, cy - y]);
    const tc = g.crossing.tNavy;
    const navyP = g.strokes.navy.points;
    const blueP = g.strokes.blue.points;
    const targets = {
      navyL: sampleBezier(navyP, N, 0, tc), // top-left end → crossing
      navyR: sampleBezier(navyP, N, 1, tc), // bottom-right end → crossing
      blueL: sampleBezier(blueP, N, 0, tc), // bottom-left end → crossing
      blueR: sampleBezier(blueP, N, 1, tc), // top-right end → crossing
    };

    // ---- DOM ----
    logo.defs.append(
      svgEl("radialGradient", { id: "div-cyto", cx: "40%", cy: "38%", r: "70%" }, [
        svgEl("stop", { offset: 0, "stop-color": COLOR.softWhite, "stop-opacity": 0.95 }),
        svgEl("stop", { offset: 0.55, "stop-color": COLOR.aqua, "stop-opacity": 0.7 }),
        svgEl("stop", { offset: 1, "stop-color": COLOR.cyan, "stop-opacity": 0.45 }),
      ]),
      svgEl("radialGradient", { id: "div-nucleus", cx: "45%", cy: "42%", r: "55%" }, [
        svgEl("stop", { offset: 0, "stop-color": COLOR.nucleus, "stop-opacity": 0.55 }),
        svgEl("stop", { offset: 0.7, "stop-color": COLOR.navy, "stop-opacity": 0.25 }),
        svgEl("stop", { offset: 1, "stop-color": COLOR.navy, "stop-opacity": 0 }),
      ]),
    );
    const glow = svgEl("circle", { cx, cy, r: 90, fill: COLOR.cyan, opacity: 0.18 });
    glow.style.filter = "blur(18px)";
    const membraneFill = svgEl("path", { fill: "url(#div-cyto)" });
    const membrane = svgEl("path", { fill: "none", stroke: COLOR.cyan, "stroke-width": 3, "stroke-linejoin": "round", opacity: 0.9 });
    const membraneHi = svgEl("path", { fill: "none", stroke: COLOR.softWhite, "stroke-width": 1, "stroke-linejoin": "round", opacity: 0.8 });
    const nucA = svgEl("ellipse", { cx, cy, rx: 15, ry: 13, fill: "url(#div-nucleus)" });
    const nucB = svgEl("ellipse", { cx, cy, rx: 15, ry: 13, fill: "url(#div-nucleus)" });
    const cellGroup = svgEl("g", { class: "division-cell" }, [glow, membraneFill, nucA, nucB, membrane, membraneHi]);
    logo.under.append(cellGroup);

    // the four half-strands, navy below blue (as in the artwork)
    const halves = {};
    const strandGroup = svgEl("g", { class: "division-strands" });
    for (const [name, colorName] of [
      ["navyL", "navy"],
      ["navyR", "navy"],
      ["blueL", "blue"],
      ["blueR", "blue"],
    ]) {
      halves[name] = svgEl("path", {
        fill: "none",
        stroke: COLOR.aquaDeep,
        "stroke-width": 2.6,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "data-target": g.strokes[colorName].color,
      });
      strandGroup.append(halves[name]);
    }
    logo.over.append(strandGroup);

    // ---- state and render ----
    const state = {
      size: 2.6, // overall scale: the mother cell is large, the daughters are strand-sized
      c: 0, // focus distance (unit space, multiplied by size)
      b: 47, // Cassini constant (unit space)
      drift: 0, // extra separation of the daughters after the split
      morph: 0, // inner arcs → strand halves
      cellOpacity: 1,
      halvesOpacity: 0,
      strandWidth: 2.6,
      nucleusSplit: 0,
      nucleusOpacity: 1,
      glowOpacity: 0.18,
    };
    let arcs = null; // last inner arcs, kept so the morph has a fixed source once separation is done

    const render = () => {
      const shape = cassini(state.c * state.size, state.b * state.size, 160);
      if (shape.single) {
        const d = pathFromPoints(toScreen(shape.whole)) + " Z";
        membrane.setAttribute("d", d);
        membraneFill.setAttribute("d", d);
        membraneHi.setAttribute("d", d);
      } else {
        const shift = (pts, dx) => pts.map(([x, y]) => [x + dx, y]);
        const right = toScreen(shift(shape.right, state.drift));
        const left = toScreen(shift(shape.left, -state.drift));
        const d = `${pathFromPoints(right)} Z ${pathFromPoints(left)} Z`;
        membrane.setAttribute("d", d);
        membraneFill.setAttribute("d", d);
        membraneHi.setAttribute("d", d);
        arcs = {
          // right loop: upper inner arc → blue's top-right arm, lower → navy's bottom-right arm
          blueR: toScreen(shift(shape.innerUpper, state.drift)),
          navyR: toScreen(shift(shape.innerLower, state.drift)),
          // left loop (mirror): upper → navy's top-left arm, lower → blue's bottom-left arm
          navyL: toScreen(shift(shape.innerUpper.map(([x, y]) => [-x, y]), -state.drift)),
          blueL: toScreen(shift(shape.innerLower.map(([x, y]) => [-x, y]), -state.drift)),
        };
      }
      cellGroup.style.opacity = state.cellOpacity.toFixed(3);
      glow.style.opacity = state.glowOpacity.toFixed(3);
      glow.setAttribute("r", (90 * state.size).toFixed(1));
      const nx = (state.c * 0.78 + state.drift) * state.size;
      nucA.setAttribute("cx", (cx - nx * state.nucleusSplit).toFixed(2));
      nucB.setAttribute("cx", (cx + nx * state.nucleusSplit).toFixed(2));
      const squash = 1 - 0.25 * Math.min(1, state.c / 46);
      for (const n of [nucA, nucB]) {
        n.setAttribute("rx", (15 * state.size * (1 + 0.3 * (1 - state.nucleusSplit))).toFixed(2));
        n.setAttribute("ry", (13 * state.size * squash).toFixed(2));
        n.style.opacity = state.nucleusOpacity.toFixed(3);
      }
      membrane.setAttribute("stroke-width", (2.2 + 0.8 * state.size).toFixed(2));
      strandGroup.style.opacity = state.halvesOpacity.toFixed(3);
      if (arcs) {
        const m = easeInOutCubic(state.morph);
        for (const name of Object.keys(halves)) {
          const pts = lerpPts(arcs[name], targets[name], m);
          halves[name].setAttribute("d", pathFromPoints(pts));
          halves[name].setAttribute("stroke-width", state.strandWidth.toFixed(2));
          halves[name].setAttribute("stroke", gsap.utils.interpolate(COLOR.aquaDeep, halves[name].dataset.target, m));
        }
      }
    };

    const tl = gsap.timeline({ paused: true, onUpdate: render });
    // A · elongate and pinch (0 → 0.62), while the whole cell settles towards the strands' scale
    tl.fromTo(state, { size: 2.6 }, { size: 1, duration: 0.86, ease: "power2.inOut", immediateRender: false }, 0);
    tl.fromTo(state, { c: 0 }, { c: 46, duration: 0.62, ease: "power2.inOut", immediateRender: false }, 0);
    tl.fromTo(state, { b: 47 }, { b: 46.4, duration: 0.62, ease: "power1.in", immediateRender: false }, 0);
    tl.fromTo(state, { nucleusSplit: 0 }, { nucleusSplit: 1, duration: 0.6, ease: "power2.inOut", immediateRender: false }, 0.08);
    // B · separate (0.62 → 0.86)
    tl.fromTo(state, { b: 46.4 }, { b: 43.5, duration: 0.24, ease: "power2.out", immediateRender: false }, 0.62);
    tl.fromTo(state, { drift: 0 }, { drift: 7, duration: 0.3, ease: "power2.out", immediateRender: false }, 0.64);
    // C · membranes become strands (0.86 → 1.42)
    tl.fromTo(state, { halvesOpacity: 0 }, { halvesOpacity: 1, duration: 0.1, ease: "none", immediateRender: false }, 0.84);
    tl.fromTo(state, { morph: 0 }, { morph: 1, duration: 0.56, ease: "none", immediateRender: false }, 0.86);
    tl.fromTo(state, { strandWidth: 2.6 }, { strandWidth: g.strokes.navy.width, duration: 0.5, ease: "power2.inOut", immediateRender: false }, 0.9);
    tl.fromTo(state, { cellOpacity: 1 }, { cellOpacity: 0, duration: 0.32, ease: "power2.in", immediateRender: false }, 0.92);
    tl.fromTo(state, { nucleusOpacity: 1 }, { nucleusOpacity: 0, duration: 0.25, ease: "power2.in", immediateRender: false }, 0.86);
    tl.fromTo(state, { glowOpacity: 0.18 }, { glowOpacity: 0, duration: 0.5, ease: "power1.inOut", immediateRender: false }, 1.0);
    // D · wordmark and handoff
    revealWord(tl, logo, { at: 1.15, duration: 0.5, style: "wipe" });
    handoffSymbol(tl, logo, { at: 1.6, duration: 0.2, from: strandGroup });
    render();
    return { timeline: tl, dispose() {} };
  },
};

export default division;
