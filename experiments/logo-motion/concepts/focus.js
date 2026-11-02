/**
 * 2 · Microscope focus (1.3 s)
 * The finished logo sits out of focus behind a translucent membrane. A short focus
 * adjustment (in, a touch past, then settled) brings it to perfect sharpness while the
 * surrounding cells come into view and then recede into the common background.
 */
import { COLOR, applyFocus, setLogoState } from "../lib/logo.js";
import { svgEl } from "../lib/stage.js";

const gsap = window.gsap;

const focus = {
  id: "focus",
  number: 2,
  name: "Microscope focus",
  duration: 1.3,
  description:
    "The complete logo appears softly out of focus behind a translucent membrane. One short focus adjustment brings it into sharp detail, with a small change of scale as the depth cue, while the cellular surroundings clear and then fade back.",
  approach: "CSS blur and scale on the logo composition driven by a GSAP proxy (three-stage focus curve: in, slight overshoot, settle); SVG membrane and blurred cell discs behind and over it.",
  strengths: "The defining action is unmistakable and calm; the artwork is never redrawn, only refocused, so the end frame is the original pixels.",
  limitations: "Large blur radii on a big element cost GPU time on low-end devices; the overshoot must stay subtle or it reads as camera shake.",
  approximated: false,
  create(stage) {
    const logo = stage.logo;
    const g = stage.geometry;
    setLogoState(logo, { word: 1, symbol: 1, vector: 0 });
    logo.svg.style.transformOrigin = "50% 50%";

    // translucent membrane over the logo (PNG coordinates)
    const defs = logo.defs;
    defs.append(
      svgEl("radialGradient", { id: "focus-membrane", cx: "50%", cy: "50%", r: "55%" }, [
        svgEl("stop", { offset: 0, "stop-color": COLOR.softWhite, "stop-opacity": 0.92 }),
        svgEl("stop", { offset: 0.55, "stop-color": COLOR.aqua, "stop-opacity": 0.6 }),
        svgEl("stop", { offset: 1, "stop-color": COLOR.aquaDeep, "stop-opacity": 0 }),
      ]),
    );
    const cx = g.markBox.x + g.markBox.w / 2;
    const cy = g.markBox.y + g.markBox.h / 2;
    const membrane = svgEl("ellipse", { cx, cy, rx: 470, ry: 170, fill: "url(#focus-membrane)" });
    membrane.style.transformOrigin = `${cx}px ${cy}px`;
    logo.over.append(membrane);

    // out-of-focus cells around the logo (viewport coordinates, behind the logo)
    const { width: W, height: H } = stage.L;
    const centre = stage.pngToViewport(cx, cy);
    const spread = stage.isPhone ? 0.8 : 1;
    const cells = [
      [-0.34, -0.3, 92],
      [0.4, -0.26, 70],
      [-0.47, 0.22, 58],
      [0.33, 0.3, 110],
      [0.05, -0.45, 46],
      [-0.08, 0.44, 64],
      [0.5, 0.02, 40],
    ].map(([fx, fy, r]) => {
      const c = svgEl("circle", {
        cx: centre.x + fx * W * spread,
        cy: centre.y + fy * H * spread,
        r: r * (stage.isPhone ? 0.55 : 1),
        fill: COLOR.aquaDeep,
        stroke: COLOR.softWhite,
        "stroke-width": 3,
      });
      stage.fxUnder.append(c);
      return c;
    });

    const state = { blur: 14, scale: 1.05, membrane: 0.85, membraneBlur: 6, membraneScale: 1.0, env: 0, envBlur: 26 };
    const render = () => {
      applyFocus(logo.svg, { blur: state.blur, scale: state.scale });
      membrane.style.opacity = state.membrane.toFixed(3);
      membrane.style.filter = state.membraneBlur > 0.05 ? `blur(${state.membraneBlur.toFixed(2)}px)` : "none";
      membrane.style.transform = `scale(${state.membraneScale.toFixed(4)})`;
      for (const c of cells) {
        c.style.opacity = state.env.toFixed(3);
        c.style.filter = `blur(${state.envBlur.toFixed(1)}px)`;
      }
    };

    const tl = gsap.timeline({ paused: true, onUpdate: render });
    // focus curve: a quick rack towards sharp, a touch past, then settled
    tl.fromTo(state, { blur: 14 }, { blur: 2.4, duration: 0.55, ease: "power2.inOut", immediateRender: false }, 0);
    tl.fromTo(state, { blur: 2.4 }, { blur: 3.6, duration: 0.17, ease: "sine.inOut", immediateRender: false }, 0.55);
    tl.fromTo(state, { blur: 3.6 }, { blur: 0, duration: 0.28, ease: "power3.out", immediateRender: false }, 0.72);
    tl.fromTo(state, { scale: 1.05 }, { scale: 1, duration: 1.0, ease: "power2.out", immediateRender: false }, 0);
    // membrane clears and thins away
    tl.fromTo(state, { membraneBlur: 6 }, { membraneBlur: 0, duration: 0.7, ease: "power2.out", immediateRender: false }, 0.1);
    tl.fromTo(state, { membrane: 0.85 }, { membrane: 0, duration: 0.6, ease: "power2.inOut", immediateRender: false }, 0.35);
    tl.fromTo(state, { membraneScale: 1 }, { membraneScale: 1.12, duration: 0.95, ease: "power1.out", immediateRender: false }, 0);
    // surroundings come into view, then recede into the common background
    tl.fromTo(state, { env: 0 }, { env: 0.34, duration: 0.5, ease: "power2.out", immediateRender: false }, 0.05);
    tl.fromTo(state, { envBlur: 26 }, { envBlur: 9, duration: 0.8, ease: "power2.out", immediateRender: false }, 0);
    tl.fromTo(state, { env: 0.34 }, { env: 0, duration: 0.4, ease: "power2.inOut", immediateRender: false }, 0.9);
    render();
    return {
      timeline: tl,
      dispose() {
        logo.svg.style.filter = "";
        logo.svg.style.transform = "";
      },
    };
  },
};

export default focus;
