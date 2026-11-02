/**
 * 6 · Logo connects to the six sections (1.6 s)
 * The symbol forms, six fine lines reach from it to the section labels (the real header
 * labels in homepage context), a pulse runs along each line to its label, and the lines
 * dissolve, leaving the finished logo and untouched navigation. Labels never move.
 */
import { COLOR, drawStroke, handoffSymbol, prepareStrokeDraw, revealWord, setLogoState } from "../lib/logo.js";
import { svgEl } from "../lib/stage.js";

const gsap = window.gsap;

/**
 * Path from the symbol to a label anchor. Labels above the logo (header bar, label row):
 * leave upwards and arrive from below into the label's bottom edge. Labels below in two
 * columns (phones): swing into the free middle corridor while still above the labels,
 * run straight down it, then turn into the facing edge of the chip. Lines never pass
 * over text.
 */
export function connectionPath(origin, target, corridor) {
  const { anchor, side } = target;
  const f = (v) => v.toFixed(1);
  if (side === "bottom") {
    const dy = origin.y - anchor.y;
    return `M${f(origin.x)} ${f(origin.y)} C${f(origin.x)} ${f(origin.y - dy * 0.5)} ${f(anchor.x)} ${f(anchor.y + dy * 0.45)} ${f(anchor.x)} ${f(anchor.y)}`;
  }
  const cx = corridor.x;
  const gapY = corridor.top - 12; // still in the clear band above the labels
  const midY = origin.y + (gapY - origin.y) * 0.5;
  const r = Math.min(20, Math.max(8, (anchor.y - gapY) / 2));
  const turnX = side === "right" ? cx - r : cx + r;
  return (
    `M${f(origin.x)} ${f(origin.y)} C${f(origin.x)} ${f(midY)} ${f(cx)} ${f(midY)} ${f(cx)} ${f(gapY)}` +
    ` L${f(cx)} ${f(anchor.y - r)} Q${f(cx)} ${f(anchor.y)} ${f(turnX)} ${f(anchor.y)} L${f(anchor.x)} ${f(anchor.y)}`
  );
}

const connect = {
  id: "connect",
  number: 6,
  name: "Logo connects to the six sections",
  duration: 1.6,
  description:
    "The symbol forms, six fine lines briefly connect it to About, Events, Projects, Job board, Newsletter and Contact, a subtle pulse travels along each connection, and the lines dissolve, leaving the finished logo and clear navigation.",
  approach: "SVG stroke drawing for the symbol; connection curves computed from the live positions of the labels (header bar on desktop, a two-column arrangement with a free corridor on phones) and drawn with dash offsets; the pulse is a short travelling dash.",
  strengths: "Ties the mark to the structure of the site; labels stay still and clickable throughout; adapts to where the labels really are.",
  limitations: "In production the line targets must be measured after fonts load and on resize; the effect is weaker when the labels are hidden behind a phone menu, so the phone layout uses a compact label arrangement.",
  approximated: false,
  needsLabels: true,
  create(stage) {
    const logo = stage.logo;
    const g = stage.geometry;
    setLogoState(logo, { word: 0, symbol: 0, vector: 1, wipe: "start" });
    const L = prepareStrokeDraw(logo);

    const targets = stage.labelTargets();
    const above = targets.length && targets[0].side === "bottom";
    const origin = above ? stage.pngToViewport(g.crossing.x, g.symbolBox.y + 2) : stage.pngToViewport(g.crossing.x, g.symbolBox.y + g.symbolBox.h - 2);
    const corridor = above ? null : { x: stage.L.width / 2, top: stage.rectInViewport(stage.sections).y };

    const layer = stage.fxOver;
    const lines = targets.map((t) => {
      const d = connectionPath(origin, t, corridor);
      const line = svgEl("path", { d, fill: "none", stroke: COLOR.nucleus, "stroke-width": 1.25, "stroke-linecap": "round", opacity: 0.55, "data-connection": t.id });
      const pulse = svgEl("path", { d, fill: "none", stroke: COLOR.cyan, "stroke-width": 2.4, "stroke-linecap": "round", opacity: 0 });
      layer.append(line, pulse);
      const len = line.getTotalLength();
      gsap.set(line, { attr: { "stroke-dasharray": `${len + 1} ${len + 1}`, "stroke-dashoffset": len + 1 } });
      gsap.set(pulse, { attr: { "stroke-dasharray": `18 ${len + 40}`, "stroke-dashoffset": 18 } });
      const text = t.node.querySelector(".sim-label-text") ?? t.node;
      return { line, pulse, len, text, target: t };
    });
    const originalColor = lines.length ? getComputedStyle(lines[0].text).color : COLOR.text2;

    const tl = gsap.timeline({ paused: true });
    // the symbol forms quickly, both strands at once from opposite ends
    drawStroke(tl, logo.navy, L.navy, { at: 0, duration: 0.55, ease: "power3.out" });
    drawStroke(tl, logo.blue, L.blue, { at: 0.04, duration: 0.55, ease: "power3.out", reverse: true });
    revealWord(tl, logo, { at: 0.28, duration: 0.45, style: "wipe" });
    lines.forEach(({ line, pulse, len, text }, i) => {
      const at = 0.42 + i * 0.04;
      tl.fromTo(line, { attr: { "stroke-dashoffset": len + 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.42, ease: "power2.out", immediateRender: false }, at);
      // pulse: a short dash runs from the symbol to the label
      const pAt = 0.78 + i * 0.03;
      tl.fromTo(pulse, { opacity: 0 }, { opacity: 0.95, duration: 0.06, ease: "none", immediateRender: false }, pAt);
      tl.fromTo(pulse, { attr: { "stroke-dashoffset": 18 } }, { attr: { "stroke-dashoffset": -(len + 1) }, duration: 0.4, ease: "power1.inOut", immediateRender: false }, pAt);
      tl.fromTo(pulse, { opacity: 0.95 }, { opacity: 0, duration: 0.08, ease: "none", immediateRender: false }, pAt + 0.32);
      // the label acknowledges the pulse without moving: a brief shift to navy and back
      tl.fromTo(text, { color: originalColor }, { color: COLOR.navy, duration: 0.12, ease: "power1.out", immediateRender: false }, pAt + 0.28);
      tl.fromTo(text, { color: COLOR.navy }, { color: originalColor, duration: 0.26, ease: "power1.inOut", immediateRender: false }, pAt + 0.4);
      // dissolve: the line retracts towards its label and fades
      tl.fromTo(line, { attr: { "stroke-dashoffset": 0 } }, { attr: { "stroke-dashoffset": -(len + 1) }, duration: 0.3, ease: "power2.in", immediateRender: false }, 1.16 + i * 0.02);
      tl.fromTo(line, { opacity: 0.55 }, { opacity: 0, duration: 0.28, ease: "power1.in", immediateRender: false }, 1.18 + i * 0.02);
    });
    handoffSymbol(tl, logo, { at: 1.4, duration: 0.2 });
    tl.to({}, { duration: 0.01 }, 1.59);
    return {
      timeline: tl,
      dispose() {
        for (const { text } of lines) text.style.color = "";
      },
    };
  },
};

export default connect;
