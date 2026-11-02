/**
 * 5 · Glass-and-light reveal (0.9 s)
 * The complete logo is already in place. A restrained cyan light passes over the ink,
 * a brief lens-like refraction travels with it and settles, and one faint membrane
 * ripple expands behind and disappears. The quietest concept: nothing moves except light.
 */
import { COLOR, setLogoState } from "../lib/logo.js";
import { LOGO_MARK_URL, svgEl } from "../lib/stage.js";

const gsap = window.gsap;

/** A 1-D lens profile as a displacement map: grey = no offset, lighter/darker = push/pull. */
function lensMapDataUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100">
<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
<stop offset="0" stop-color="rgb(128,128,128)"/>
<stop offset="0.3" stop-color="rgb(128,128,128)"/>
<stop offset="0.42" stop-color="rgb(176,128,128)"/>
<stop offset="0.5" stop-color="rgb(128,128,128)"/>
<stop offset="0.58" stop-color="rgb(80,128,128)"/>
<stop offset="0.7" stop-color="rgb(128,128,128)"/>
<stop offset="1" stop-color="rgb(128,128,128)"/>
</linearGradient></defs>
<rect width="300" height="100" fill="url(#g)"/></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const glass = {
  id: "glass",
  number: 5,
  name: "Glass-and-light reveal",
  duration: 0.9,
  description:
    "The finished logo is already in position. A restrained cyan light sweeps across it, causing a brief glass-like refraction that settles at once, while one faint membrane ripple expands behind it and disappears.",
  approach: "SVG: a gradient light band masked by the logo's own alpha (so it only touches the ink), an feDisplacementMap lens that travels with the band and fades to zero, and one expanding ring behind the logo.",
  strengths: "Quietest and shortest; works on the original pixels end to end, so there is nothing to hand off; keeps type readable throughout.",
  limitations: "Refraction is a filter on a raster, so it is slightly soft while active; must stay subtle to avoid reading as a generic metallic shine.",
  approximated: false,
  create(stage) {
    const logo = stage.logo;
    const g = stage.geometry;
    setLogoState(logo, { word: 1, symbol: 1, vector: 0 });
    const mb = g.markBox;

    // light band, visible only on the ink
    const bandW = 150;
    logo.defs.append(
      svgEl("linearGradient", { id: "glass-band", gradientUnits: "userSpaceOnUse", x1: 0, x2: bandW, y1: 0, y2: 0, gradientTransform: "" }, [
        svgEl("stop", { offset: 0, "stop-color": COLOR.cyan, "stop-opacity": 0 }),
        svgEl("stop", { offset: 0.4, "stop-color": COLOR.cyan, "stop-opacity": 0.72 }),
        svgEl("stop", { offset: 0.52, "stop-color": "#ffffff", "stop-opacity": 0.78 }),
        svgEl("stop", { offset: 0.64, "stop-color": COLOR.cyan, "stop-opacity": 0.72 }),
        svgEl("stop", { offset: 1, "stop-color": COLOR.cyan, "stop-opacity": 0 }),
      ]),
      svgEl("mask", { id: "mask-ink", "mask-type": "alpha", maskUnits: "userSpaceOnUse", x: mb.x - 40, y: mb.y - 40, width: mb.w + 80, height: mb.h + 80 }, [
        svgEl("image", { href: LOGO_MARK_URL, x: mb.x, y: mb.y, width: mb.w, height: mb.h, preserveAspectRatio: "none" }),
      ]),
    );
    const bandGrad = logo.defs.querySelector("#glass-band");
    const band = svgEl("rect", { x: mb.x - 60, y: mb.y - 60, width: mb.w + 120, height: mb.h + 120, fill: "url(#glass-band)", mask: "url(#mask-ink)" });
    logo.over.append(band);

    // refraction: displacement filter on the PNG layers, travelling with the band
    const filter = svgEl("filter", { id: "glass-refract", filterUnits: "userSpaceOnUse", primitiveUnits: "userSpaceOnUse", x: mb.x - 80, y: mb.y - 80, width: mb.w + 160, height: mb.h + 160 });
    const feImage = svgEl("feImage", { href: lensMapDataUri(), x: 0, y: mb.y - 80, width: 300, height: mb.h + 160, preserveAspectRatio: "none", result: "lens" });
    const feDisp = svgEl("feDisplacementMap", { in: "SourceGraphic", in2: "lens", scale: 0, xChannelSelector: "R", yChannelSelector: "G" });
    filter.append(feImage, feDisp);
    logo.defs.append(filter);
    const pngLayers = [logo.pngSymbol, logo.wordGroup];

    // one membrane ripple behind the logo (viewport coordinates)
    const centre = stage.pngToViewport(g.crossing.x, g.crossing.y);
    const ripple = svgEl("circle", { cx: centre.x, cy: centre.y, r: 30, fill: "none", stroke: COLOR.aquaDeep, "stroke-width": 1.5, opacity: 0 });
    stage.fxUnder.append(ripple);

    const state = { bandX: mb.x - 260, lens: 0, rippleR: 30, rippleO: 0 };
    const skew = -16; // degrees, the band leans like a light caught on glass
    const render = () => {
      bandGrad.setAttribute("gradientTransform", `translate(${state.bandX.toFixed(2)} 0) skewX(${skew})`);
      feImage.setAttribute("x", (state.bandX - 75).toFixed(2));
      feDisp.setAttribute("scale", state.lens.toFixed(3));
      const active = state.lens > 0.02;
      for (const n of pngLayers) {
        if (active) n.setAttribute("filter", "url(#glass-refract)");
        else n.removeAttribute("filter");
      }
      ripple.setAttribute("r", state.rippleR.toFixed(2));
      ripple.style.opacity = state.rippleO.toFixed(3);
    };

    const tl = gsap.timeline({ paused: true, onUpdate: render });
    tl.fromTo(state, { bandX: mb.x - 260 }, { bandX: mb.x + mb.w + 80, duration: 0.74, ease: "power2.inOut", immediateRender: false }, 0);
    tl.fromTo(state, { lens: 0 }, { lens: 7, duration: 0.26, ease: "sine.in", immediateRender: false }, 0.1);
    tl.fromTo(state, { lens: 7 }, { lens: 0, duration: 0.4, ease: "power2.out", immediateRender: false }, 0.36);
    const rippleMax = stage.isPhone ? 180 : 320;
    tl.fromTo(state, { rippleR: 30 }, { rippleR: rippleMax, duration: 0.72, ease: "power2.out", immediateRender: false }, 0.04);
    tl.fromTo(state, { rippleO: 0 }, { rippleO: 0.55, duration: 0.12, ease: "power1.out", immediateRender: false }, 0.04);
    tl.fromTo(state, { rippleO: 0.55 }, { rippleO: 0, duration: 0.56, ease: "power2.out", immediateRender: false }, 0.18);
    tl.to({}, { duration: 0.16 }, 0.74); // settle: nothing moves, colours are the originals
    render();
    return { timeline: tl, dispose() {} };
  },
};

export default glass;
