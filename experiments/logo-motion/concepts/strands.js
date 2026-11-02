/**
 * 1 · Two strands meet (1.4 s)
 * The navy strand draws from its top-left end, the blue strand from its top-right end.
 * They approach the crossing from opposite directions, pass with blue over navy (as in
 * the artwork), settle into the exact symbol, and the lettering wipes in beside them.
 */
import { drawStroke, handoffSymbol, prepareStrokeDraw, revealWord, setLogoState } from "../lib/logo.js";

const gsap = window.gsap;

const strands = {
  id: "strands",
  number: 1,
  name: "Two strands meet",
  duration: 1.4,
  description:
    "The navy and blue strands draw towards each other from opposite ends, cross with the correct overlap and settle into the exact symbol. The lettering follows with a soft wipe.",
  approach: "SVG stroke drawing (dash offset) on the traced centrelines, GSAP timeline, round caps; the strokes crossfade to the PNG symbol over the last 0.2 s.",
  strengths: "Reads as two distinct strands joining into one identity. Very light (no canvas), crisp at any size, scrubs exactly.",
  limitations: "Depends on the traced centrelines matching the PNG; the fit is sub-pixel at this size, see the fidelity note. No depth or material.",
  approximated: false,
  create(stage) {
    const logo = stage.logo;
    setLogoState(logo, { word: 0, symbol: 0, vector: 1, wipe: "start" });
    const L = prepareStrokeDraw(logo);
    const tl = gsap.timeline({ paused: true });
    drawStroke(tl, logo.navy, L.navy, { at: 0, duration: 0.95, ease: "power3.inOut" });
    drawStroke(tl, logo.blue, L.blue, { at: 0.08, duration: 0.95, ease: "power3.inOut", reverse: true });
    revealWord(tl, logo, { at: 0.6, duration: 0.55, style: "wipe" });
    handoffSymbol(tl, logo, { at: 1.2, duration: 0.2 });
    return { timeline: tl, dispose() {} };
  },
};

export default strands;
