import * as THREE from "three";
import { ATOMS, BOKEH, BONDS, MEMBRANES, NUCLEI } from "./backdropData";

/*
 * Aqueous cellular backdrop: an unlit, static, procedural field drawn on one
 * plane far behind everything else. Pale mint light mottled like a wet mount,
 * cyan illumination lower left, a bright white field upper right, translucent
 * membrane contours, a few deep blue nuclei seen out of focus at the edges,
 * soft bokeh and restrained ball-and-stick silhouettes in navy.
 * No time uniform: the life comes from the existing camera parallax and particles.
 * Fog, lights and tone mapping do not touch it. Backdrop.tsx renders this
 * material once into a texture, so the per-frame cost is one lookup.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uSize;
  uniform float uViewH;
  uniform float uDetail;
  uniform vec3 uIce;
  uniform vec3 uAqua;
  uniform vec3 uCyan;
  uniform vec3 uNavy;
  uniform vec3 uNucleus;
  uniform vec3 uWhite;
  uniform vec4 uBokeh[${BOKEH.length}];
  uniform vec3 uAtoms[${ATOMS.length}];
  uniform vec4 uBonds[${BONDS.length}];
  uniform vec3 uMembranes[${MEMBRANES.length}];
  uniform vec3 uNuclei[${NUCLEI.length}];
  varying vec2 vUv;

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p = p * 2.02 + vec2(13.7, 7.1);
      a *= 0.5;
    }
    return v;
  }
  float sdSeg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }
  float glow(vec2 q, vec2 c, vec2 stretch, float k) {
    vec2 d = (q - c) * stretch;
    return exp(-dot(d, d) * k);
  }
  /* Interface text lives here; the field stays quiet behind it. */
  float quietZones(vec2 q) {
    float z = smoothstep(0.3, 0.38, q.y) * smoothstep(0.1, 0.0, q.x);                  // top bar, left and centre
    z = max(z, smoothstep(0.26, 0.34, q.y) * smoothstep(0.42, 0.52, q.x));            // logo and counter
    float bottom = smoothstep(-0.38, -0.46, q.y);
    z = max(z, bottom * max(smoothstep(-0.2, -0.32, q.x), smoothstep(0.35, 0.45, q.x))); // utilities, hint
    return z;
  }

  void main() {
    vec2 q = (vUv - 0.5) * uSize / uViewH;
    float r = length(q * vec2(0.72, 1.0));

    /* 1. Uneven aqueous field. */
    float n1 = fbm(q * 1.6 + 3.7);
    float n2 = fbm(q * 4.2 + 9.3);
    vec3 col = mix(uIce, uAqua, 0.2 + 0.55 * n1);
    float mottle = 0.78 + 0.44 * n2;
    col = mix(col, uWhite, glow(q, vec2(0.74, 0.44), vec2(1.1, 1.3), 3.0) * 0.6 * mottle);
    col = mix(col, uCyan, glow(q, vec2(-0.66, -0.40), vec2(1.0, 1.25), 2.4) * 0.38 * mottle);
    col = mix(col, uCyan, glow(q, vec2(0.58, -0.22), vec2(1.0, 1.0), 4.5) * 0.16 * mottle);
    col = mix(col, uWhite, glow(q, vec2(0.0, 0.05), vec2(0.7, 1.0), 1.6) * 0.28);
    col = mix(col, uAqua * 0.9, 0.42 * smoothstep(0.55, 1.12, r));

    float detail = 1.0 - 0.85 * quietZones(q);
    float edge = smoothstep(0.26, 0.72, r);

    /* 2. Out-of-focus nuclei: deep blue bodies glimpsed at the far edges. */
    for (int i = 0; i < ${NUCLEI.length}; i++) {
      vec3 nb = uNuclei[i];
      float d = length(q - nb.xy) / nb.z;
      float body = exp(-d * d * 2.2);
      float core = exp(-d * d * 7.0);
      col = mix(col, uNucleus, body * 0.42 * detail);
      col = mix(col, uNavy, core * 0.35 * detail);
      float halo = smoothstep(1.35, 1.0, d) * (1.0 - smoothstep(1.0, 0.85, d));
      col = mix(col, uWhite, halo * 0.35 * detail);
    }

    /* 3. Membranes: white contours with a faint blue shadow, only toward the edges. */
    if (edge > 0.001) {
      float m = fbm(q * 1.15 + 11.0);
      float iso = abs(fract(m * 5.0) - 0.5) / 5.0;
      float line = 1.0 - smoothstep(0.0, 0.0055, iso);
      float halo = 1.0 - smoothstep(0.0, 0.03, iso);
      float breakup = smoothstep(0.4, 0.62, fbm(q * 2.4 + 5.0));
      float membrane = (line * 0.7 + halo * 0.2) * edge * breakup * detail;
      col = mix(col, uWhite, membrane * 0.75);
      col = mix(col, uNucleus, halo * edge * breakup * detail * 0.05);
      float alongBase = fbm(q * 1.7 + 21.0);
      for (int i = 0; i < ${MEMBRANES.length}; i++) {
        vec3 mb = uMembranes[i];
        float d = abs(length(q - mb.xy) - mb.z);
        float wall = (1.0 - smoothstep(0.0, 0.004, d)) + 0.7 * (1.0 - smoothstep(0.0, 0.004, abs(d - 0.012)));
        float along = smoothstep(0.38, 0.6, alongBase + 0.07 * float(i));
        col = mix(col, uWhite, wall * along * edge * detail * 0.8);
      }
    }

    /* 4. Bokeh: soft white discs with a cyan rim. */
    for (int i = 0; i < ${BOKEH.length}; i++) {
      vec4 b = uBokeh[i];
      float d = length(q - b.xy);
      if (d < b.z * 1.08) {
        float disc = smoothstep(b.z, b.z * 0.45, d);
        float ring = smoothstep(b.z * 0.72, b.z * 0.92, d) * (1.0 - smoothstep(b.z * 0.92, b.z * 1.04, d));
        vec3 rim = b.w > 0.0 ? uCyan : uNucleus;
        col = mix(col, uWhite, disc * 0.55 * abs(b.w) * detail);
        col = mix(col, rim, ring * 0.35 * abs(b.w) * detail);
      }
    }

    /* 5. Ball-and-stick silhouettes in navy, lightly. */
    if (uDetail > 0.5) {
      float bond = 0.0;
      for (int i = 0; i < ${BONDS.length}; i++) {
        vec4 s = uBonds[i];
        bond = max(bond, 1.0 - smoothstep(0.0022, 0.0062, sdSeg(q, s.xy, s.zw)));
      }
      float core = 0.0;
      float rim = 0.0;
      for (int i = 0; i < ${ATOMS.length}; i++) {
        vec3 a = uAtoms[i];
        float d = length(q - a.xy);
        core = max(core, 1.0 - smoothstep(a.z * 0.6, a.z, d));
        rim = max(rim, (1.0 - smoothstep(a.z, a.z + 0.006, d)) * smoothstep(a.z * 0.5, a.z * 0.92, d));
      }
      col = mix(col, uNavy, (bond * 0.22 + core * 0.4) * detail);
      col = mix(col, uWhite, rim * 0.5 * detail);
    }

    /* 6. A breath of suspended haze. */
    col += (hash21(gl_FragCoord.xy) - 0.5) * 0.006;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export type BackdropUniforms = { [uniform: string]: THREE.IUniform } & {
  uSize: { value: THREE.Vector2 };
  uViewH: { value: number };
  uDetail: { value: number };
};

export function createBackdropMaterial(size: THREE.Vector2) {
  const uniforms: BackdropUniforms = {
    uSize: { value: size },
    uViewH: { value: 18.64 },
    uDetail: { value: 1 },
    uIce: { value: new THREE.Color("#e3faf5") },
    uAqua: { value: new THREE.Color("#c6f0ef") },
    uCyan: { value: new THREE.Color("#69c9dd") },
    uNavy: { value: new THREE.Color("#08283d") },
    uNucleus: { value: new THREE.Color("#175998") },
    uWhite: { value: new THREE.Color("#f8fcfb") },
    uBokeh: { value: BOKEH.map((b) => new THREE.Vector4(...b)) },
    uAtoms: { value: ATOMS.map((a) => new THREE.Vector3(...a)) },
    uBonds: { value: BONDS.map((b) => new THREE.Vector4(...b)) },
    uMembranes: { value: MEMBRANES.map((m) => new THREE.Vector3(...m)) },
    uNuclei: { value: NUCLEI.map((n) => new THREE.Vector3(...n)) },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    depthWrite: false,
    depthTest: false,
    fog: false,
    toneMapped: false,
  });
  return { material, uniforms };
}
