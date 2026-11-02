/**
 * 4 · Molecules assemble (1.8 s)
 * A small set of softly lit beads travels along the two traced curves and parks at
 * evenly spaced stations, like pearls on a string. The strokes then surface beneath them
 * and the beads sink into the continuous strands; a few ambient beads disperse into
 * the background. Rendered with Three.js (real lighting and clearcoat highlights); if
 * WebGL is unavailable the same deterministic positions are drawn as shaded SVG discs.
 */
import { COLOR, arcTable, clamp01, easeOutCubic, handoffSymbol, revealWord, seeded, setLogoState } from "../lib/logo.js";
import { svgEl } from "../lib/stage.js";

const gsap = window.gsap;
const PER_STRAND = 24;
const AMBIENT = 14;

/** Deterministic bead schedule: where every bead is at design time t (seconds), in PNG px. */
function buildSchedule(geometry) {
  const beads = [];
  for (const [name, reverse] of [
    ["navy", false],
    ["blue", true],
  ]) {
    const stroke = geometry.strokes[name];
    const table = arcTable(stroke.points);
    for (let i = 0; i < PER_STRAND; i++) {
      const station = ((i + 0.5) / PER_STRAND) * table.length; // distance from the entry end
      const delay = i * 0.02;
      const travel = 0.7 * (0.5 + 0.5 * (station / table.length));
      beads.push({
        kind: name,
        color: stroke.color,
        radius: stroke.width * 0.5,
        z: 12 * Math.sin((station / table.length) * Math.PI * 2 + (reverse ? 1.3 : 0.2)),
        positionAt(t) {
          const p = easeOutCubic(clamp01((t - delay) / travel));
          const s = station * p;
          const dist = reverse ? table.length - s : s;
          const [x, y] = table.pointAt(dist);
          // a controlled lateral wobble that dies out as the bead parks
          const wob = 4.5 * (1 - p) * Math.sin(i * 1.7 + t * 9);
          return { x: x + wob * (reverse ? -0.6 : 0.6), y: y + wob, settled: p };
        },
      });
    }
  }
  const rnd = seeded(20261006);
  const cx = geometry.crossing.x;
  const cy = geometry.crossing.y;
  for (let i = 0; i < AMBIENT; i++) {
    const ang = rnd() * Math.PI * 2;
    const rad = 55 + rnd() * 85;
    const r = 3 + rnd() * 3;
    const vx = Math.cos(ang) * (0.5 + rnd() * 0.6);
    const vy = Math.sin(ang) * (0.5 + rnd() * 0.6);
    const phase = rnd() * Math.PI * 2;
    beads.push({
      kind: "ambient",
      color: COLOR.aquaDeep,
      radius: r,
      z: -20 + rnd() * 40,
      positionAt(t) {
        const d = clamp01((t - 0.95) / 0.65); // disperse between 0.95 s and 1.6 s
        const drift = 6 * Math.sin(phase + t * 1.6);
        return { x: cx + Math.cos(ang) * rad + vx * (drift + d * 60), y: cy + Math.sin(ang) * rad + vy * (drift + d * 60), settled: 1 - d };
      },
    });
  }
  return beads;
}

/** Bead visual scale at time t: strand beads sink into the stroke, ambient beads disperse. */
function beadScale(bead, t) {
  if (bead.kind === "ambient") return 1 - easeOutCubic(clamp01((t - 0.95) / 0.65));
  return 1 - easeOutCubic(clamp01((t - 1.02) / 0.3));
}

const molecules = {
  id: "molecules",
  number: 4,
  name: "Molecules assemble",
  duration: 1.8,
  description:
    "Softly lit molecular beads travel along the two curves and park in sequence, then sink into smooth continuous strands. The wordmark appears while the remaining beads settle into the background.",
  approach: "Three.js (instanced spheres, physical material with clearcoat, two lights) on a transparent canvas aligned to the SVG coordinates; positions are a pure function of time, so replay and scrubbing are identical. SVG discs with gradient shading are used when WebGL is not available.",
  strengths: "The only concept with real depth and material highlights; the pearls-into-strand moment is distinctive and still restrained (no sparks, no starfield).",
  limitations: "Heaviest concept: a WebGL context and a 1.2 MB library for one intro; bead-to-stroke merge is a crossfade rather than true geometry fusion; needs the SVG fallback path for WebGL-less browsers.",
  approximated: false,
  uses3d: true,
  async create(stage, ctx) {
    const logo = stage.logo;
    const g = stage.geometry;
    setLogoState(logo, { word: 0, symbol: 0, vector: 1, wipe: "start" });
    gsap.set(logo.vector, { opacity: 0 });
    const beads = buildSchedule(g);
    const { width: W, height: H } = stage.L;
    const toVp = (x, y) => stage.pngToViewport(x, y);
    const pxScale = logo.scale; // PNG px → viewport px

    let renderer = null;
    let three = null;
    let svgBeads = null;
    let mode = "webgl";

    try {
      if (ctx.forceSvgBeads) throw new Error("forced fallback");
      const THREE = await import("/vendor/three.module.js");
      const canvas = document.createElement("canvas");
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
      renderer.setClearColor(0x000000, 0);
      const scene = new THREE.Scene();
      const fov = 16;
      const dist = H / 2 / Math.tan((fov / 2) * (Math.PI / 180));
      const camera = new THREE.PerspectiveCamera(fov, W / H, dist * 0.5, dist * 1.5);
      camera.position.set(W / 2, -H / 2, dist);
      camera.lookAt(W / 2, -H / 2, 0);
      const key = new THREE.DirectionalLight(0xffffff, 2.6);
      key.position.set(-0.6, 0.9, 1).normalize();
      const fill = new THREE.DirectionalLight(0x69c9dd, 1.1);
      fill.position.set(0.8, -0.5, 0.6).normalize();
      const hemi = new THREE.HemisphereLight(0xf8fcfb, 0xc6f0ef, 0.9);
      scene.add(key, fill, hemi);
      const geo = new THREE.SphereGeometry(1, 28, 20);
      const material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.18 });
      const mesh = new THREE.InstancedMesh(geo, material, beads.length);
      const colour = new THREE.Color();
      beads.forEach((b, i) => mesh.setColorAt(i, colour.set(b.color)));
      mesh.instanceColor.needsUpdate = true;
      scene.add(mesh);
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const v3 = new THREE.Vector3();
      const s3 = new THREE.Vector3();
      three = {
        render(t) {
          beads.forEach((b, i) => {
            const p = b.positionAt(t);
            const vp = toVp(p.x, p.y);
            const sc = Math.max(0.0001, b.radius * pxScale * beadScale(b, t));
            v3.set(vp.x, -vp.y, b.z * pxScale);
            s3.set(sc, sc, sc);
            m4.compose(v3, q, s3);
            mesh.setMatrixAt(i, m4);
          });
          mesh.instanceMatrix.needsUpdate = true;
          renderer.render(scene, camera);
        },
        dispose() {
          geo.dispose();
          material.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
        },
      };
      stage.glLayer.append(canvas);
    } catch (err) {
      mode = "svg";
      three = null;
      renderer = null;
      console.info("Molecules: drawing beads as SVG.", err?.message ?? err);
      // shaded discs: a radial gradient per colour with an off-centre highlight
      const defs = svgEl("defs");
      const gradFor = (id, base) =>
        svgEl("radialGradient", { id, cx: "35%", cy: "32%", r: "70%" }, [
          svgEl("stop", { offset: 0, "stop-color": "#ffffff", "stop-opacity": 0.95 }),
          svgEl("stop", { offset: 0.28, "stop-color": base, "stop-opacity": 0.75 }),
          svgEl("stop", { offset: 1, "stop-color": base }),
        ]);
      defs.append(gradFor("bead-navy", COLOR.navy), gradFor("bead-blue", COLOR.nucleus), gradFor("bead-ambient", COLOR.aquaDeep));
      stage.fxOver.append(defs);
      svgBeads = beads.map((b) => {
        const c = svgEl("circle", { r: b.radius * pxScale, fill: `url(#bead-${b.kind})` });
        stage.fxOver.append(c);
        return c;
      });
    }

    const state = { t: 0 };
    const render = () => {
      const t = state.t;
      if (three) three.render(t);
      else if (svgBeads) {
        beads.forEach((b, i) => {
          const p = b.positionAt(t);
          const vp = toVp(p.x, p.y);
          const sc = beadScale(b, t);
          const c = svgBeads[i];
          c.setAttribute("cx", vp.x.toFixed(2));
          c.setAttribute("cy", vp.y.toFixed(2));
          c.setAttribute("r", Math.max(0, b.radius * pxScale * sc).toFixed(2));
          c.style.opacity = sc > 0.001 ? "1" : "0";
        });
      }
    };

    const tl = gsap.timeline({ paused: true, onUpdate: render });
    tl.fromTo(state, { t: 0 }, { t: 1.8, duration: 1.8, ease: "none", immediateRender: false }, 0);
    // the strands surface beneath the parked beads, then the beads sink into them
    tl.fromTo(logo.vector, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.inOut", immediateRender: false }, 0.98);
    revealWord(tl, logo, { at: 1.1, duration: 0.5, style: "wipe" });
    handoffSymbol(tl, logo, { at: 1.6, duration: 0.2 });
    render();
    return {
      timeline: tl,
      note: mode === "svg" ? "WebGL was not available here, so the beads are SVG discs with gradient shading (same positions)." : null,
      dispose() {
        three?.dispose();
        stage.glLayer.replaceChildren();
      },
    };
  },
};

export default molecules;
