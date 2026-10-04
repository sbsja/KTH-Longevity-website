"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertex = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.16 + aPhase) * 0.28;
    p.x += cos(uTime * 0.11 + aPhase * 1.7) * 0.16;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Appearance: larger, softer discs; the big ones read as out-of-focus material.
    gl_PointSize = aSize * uPixelRatio * (9.0 / max(1.0, -mv.z)) * 1.6;
    vColor = aColor;
    float depthFade = smoothstep(28.0, 6.0, -mv.z);
    float twinkle = 0.45 + 0.55 * abs(sin(uTime * 0.35 + aPhase * 3.1));
    float defocus = mix(1.0, 0.45, smoothstep(6.0, 16.0, aSize));
    vAlpha = depthFade * twinkle * defocus;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    // Gaussian core with a wide faint halo: suspended, softly lit material, not a star.
    float core = exp(-d2 * 16.0);
    float halo = exp(-d2 * 5.0);
    float a = (core * 0.7 + halo * 0.3) * vAlpha * 0.6;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }
`;

/* Same four slots as before (the seeded picker is unchanged); only the hues moved
   from pure brand lights to pale, slightly desaturated tints of them. */
const PALETTE = [new THREE.Color("#a7e3dc"), new THREE.Color("#f1e6b4"), new THREE.Color("#dfeeea"), new THREE.Color("#79b8b0")];

/** Drifting motes around the spine. Soft, depth-faded, cheap. */
export function Particles({ count, drift }: { count: number; drift: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const time = useRef(0);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const rnd = mulberry32(42);
    for (let i = 0; i < count; i++) {
      // Shell around the spine axis (x≈1, z≈-1.9), biased toward the middle heights.
      const r = 1.1 + Math.pow(rnd(), 0.6) * 6.5;
      const a = rnd() * Math.PI * 2;
      const y = (rnd() - 0.5) * 17;
      pos[i * 3] = 1.0 + Math.cos(a) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = -1.9 + Math.sin(a) * r * 0.7;
      const big = rnd() > 0.93;
      size[i] = big ? 7 + rnd() * 9 : 1.6 + rnd() * 3.2;
      const c = PALETTE[rnd() > 0.65 ? 2 : rnd() > 0.5 ? 0 : rnd() > 0.5 ? 1 : 3];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      phase[i] = rnd() * Math.PI * 2;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.computeBoundingSphere();
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    [],
  );

  useEffect(() => {
    material.uniforms.uPixelRatio.value = dpr;
  }, [dpr, material]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame((_, dtRaw) => {
    if (drift) time.current += Math.min(dtRaw, 0.05);
    if (matRef.current) matRef.current.uniforms.uTime.value = time.current;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <primitive object={material} attach="material" ref={matRef} />
    </points>
  );
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
