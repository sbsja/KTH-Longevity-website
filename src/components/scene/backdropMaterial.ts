import * as THREE from "three";
import { ATOMS, BOKEH, BONDS, MEMBRANES } from "./backdropData";

/*
 * Molecular microscopy backdrop: an unlit, static, procedural field drawn on one
 * plane far behind everything else. Soft uneven illumination in the brand lights,
 * faint membrane contours and out-of-focus discs toward the edges, and a few
 * ball-and-stick silhouettes. No time uniform: the life comes from the existing
 * camera parallax and particles. Fog, lights and tone mapping do not touch it.
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
  uniform vec3 uInk;
  uniform vec3 uDeep;
  uniform vec3 uTiffany;
  uniform vec3 uYellow;
  uniform vec3 uSnow;
  uniform vec4 uBokeh[${BOKEH.length}];
  uniform vec3 uAtoms[${ATOMS.length}];
  uniform vec4 uBonds[${BONDS.length}];
  uniform vec3 uMembranes[${MEMBRANES.length}];
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
    float z = smoothstep(0.26, 0.34, q.y) * smoothstep(-0.25, -0.35, q.x);            // intro, top-left
    z = max(z, smoothstep(0.26, 0.34, q.y) * smoothstep(0.22, 0.32, q.x));            // nav and counter
    z = max(z, smoothstep(-0.12, -0.2, q.y) * smoothstep(-0.38, -0.5, q.x));          // category list
    float bottom = smoothstep(-0.38, -0.46, q.y);
    z = max(z, bottom * max(smoothstep(-0.2, -0.32, q.x), smoothstep(0.35, 0.45, q.x))); // utilities, hint
    return z;
  }

  void main() {
    vec2 q = (vUv - 0.5) * uSize / uViewH;
    float r = length(q * vec2(0.72, 1.0));

    /* 1. Uneven field: deep green over near-black, mottled like a wet mount. */
    float n1 = fbm(q * 1.6 + 3.7);
    float n2 = fbm(q * 4.2 + 9.3);
    vec3 col = mix(uInk, uDeep, 0.15 + 0.3 * n1);
    float mottle = 0.68 + 0.64 * n2;
    col += uTiffany * glow(q, vec2(-0.66, -0.40), vec2(1.0, 1.25), 2.4) * 0.105 * mottle;
    col += uYellow * glow(q, vec2(0.74, 0.44), vec2(1.1, 1.3), 3.0) * 0.075 * mottle;
    col += uTiffany * glow(q, vec2(0.58, -0.22), vec2(1.0, 1.0), 4.5) * 0.035 * mottle;
    col += uDeep * glow(q, vec2(0.0, 0.0), vec2(0.7, 1.0), 1.4) * 0.42;
    col *= 1.0 - 0.42 * smoothstep(0.55, 1.12, r);

    float detail = 1.0 - 0.85 * quietZones(q);
    vec3 lightInk = mix(uTiffany, uSnow, 0.4);

    /* 2. Membranes: noise isolines and large double-walled arcs, only toward the edges. */
    float edge = smoothstep(0.26, 0.72, r);
    if (edge > 0.001) {
      float m = fbm(q * 1.15 + 11.0);
      float iso = abs(fract(m * 5.0) - 0.5) / 5.0;
      float line = 1.0 - smoothstep(0.0, 0.0055, iso);
      float halo = 1.0 - smoothstep(0.0, 0.03, iso);
      float breakup = smoothstep(0.4, 0.62, fbm(q * 2.4 + 5.0));
      float membrane = (line * 0.6 + halo * 0.18) * edge * breakup * detail;
      col += mix(uTiffany, uYellow, 0.35) * membrane * 0.07;
      float alongBase = fbm(q * 1.7 + 21.0);
      for (int i = 0; i < ${MEMBRANES.length}; i++) {
        vec3 mb = uMembranes[i];
        float d = abs(length(q - mb.xy) - mb.z);
        float wall = (1.0 - smoothstep(0.0, 0.004, d)) + 0.7 * (1.0 - smoothstep(0.0, 0.004, abs(d - 0.012)));
        float along = smoothstep(0.38, 0.6, alongBase + 0.07 * float(i));
        col += lightInk * wall * along * edge * detail * 0.055;
      }
    }

    /* 3. Out-of-focus discs around the edges. */
    for (int i = 0; i < ${BOKEH.length}; i++) {
      vec4 b = uBokeh[i];
      float d = length(q - b.xy);
      if (d < b.z * 1.08) {
        float disc = smoothstep(b.z, b.z * 0.45, d);
        float ring = smoothstep(b.z * 0.72, b.z * 0.92, d) * (1.0 - smoothstep(b.z * 0.92, b.z * 1.04, d));
        vec3 bc = b.w > 0.0 ? mix(uTiffany, uSnow, 0.35) : mix(uYellow, uSnow, 0.3);
        col += bc * (disc * 0.5 + ring * 0.55) * abs(b.w) * 0.05 * detail;
      }
    }

    /* 4. Ball-and-stick silhouettes: dark cores, faint lit rims and bonds. */
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
      col = mix(col, col * 0.5, core * 0.9 * detail);
      col += lightInk * (rim * 0.085 + bond * 0.055) * detail;
    }

    /* 5. A breath of suspended haze, far below visibility as a pattern. */
    col += (hash21(gl_FragCoord.xy) - 0.5) * 0.0035;

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
    uInk: { value: new THREE.Color("#060f0e") },
    uDeep: { value: new THREE.Color("#103430") },
    uTiffany: { value: new THREE.Color("#81d8d0") },
    uYellow: { value: new THREE.Color("#ffea95") },
    uSnow: { value: new THREE.Color("#f2f6f4") },
    uBokeh: { value: BOKEH.map((b) => new THREE.Vector4(...b)) },
    uAtoms: { value: ATOMS.map((a) => new THREE.Vector3(...a)) },
    uBonds: { value: BONDS.map((b) => new THREE.Vector4(...b)) },
    uMembranes: { value: MEMBRANES.map((m) => new THREE.Vector3(...m)) },
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
