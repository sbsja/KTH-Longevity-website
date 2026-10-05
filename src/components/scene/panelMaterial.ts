import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/*
 * Rounded glass panel. One shader serves both the cover (textured) and the
 * slab behind it (tinted): a signed-distance rounded rectangle for the shape,
 * a vignette, a faint moving sheen, an iridescent rim and a touch of grain.
 */
const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform float uOpacity;
  uniform float uActive;
  uniform float uTime;
  uniform vec3 uTint;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uRim;
  varying vec2 vUv;

  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }
  // Sin-free hash: stable on ANGLE/D3D11, where sin() of large arguments bands into rings.
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec2 b = vec2(uAspect * 0.5, 0.5);
    float d = sdRoundRect(p, b, uRadius);
    float aa = fwidth(d) * 1.1;
    float shape = 1.0 - smoothstep(-aa, aa, d);
    if (shape <= 0.002) discard;

    vec3 col;
    if (uHasMap > 0.5) {
      col = texture2D(uMap, vUv).rgb;
      vec3 dimmed = mix(col, vec3(0.78, 0.96, 0.92), 0.5);
      col = mix(dimmed, col, uActive);
      float v = smoothstep(1.15, 0.3, length(p / b));
      col *= 0.9 + 0.1 * v;
      float sheen = smoothstep(0.25, 1.0, (vUv.x * 0.7 + vUv.y * 0.3) + 0.06 * sin(uTime * 0.35));
      col += vec3(0.85, 1.0, 0.97) * sheen * 0.008 * (0.5 + 0.5 * uActive);
    } else {
      col = uTint * (0.85 + 0.3 * vUv.y);
    }

    float inner = smoothstep(-0.022, -0.009, d);
    float outer = 1.0 - smoothstep(-0.003, 0.0, d);
    float rim = inner * outer;
    float hue = 0.5 + 0.5 * sin(uTime * 0.5 + p.x * 1.6 + p.y * 2.4);
    vec3 rimCol = mix(vec3(1.0, 1.0, 1.0), vec3(0.14, 0.58, 0.72), hue);
    col += rimCol * rim * uRim * (0.4 + 0.6 * uActive);

    col += (hash(gl_FragCoord.xy + vec2(fract(uTime) * 61.0)) - 0.5) * 0.006;

    gl_FragColor = vec4(col, shape * uOpacity);
    #include <colorspace_fragment>
  }
`;

export type PanelUniforms = { [uniform: string]: THREE.IUniform } & {
  uMap: { value: THREE.Texture | null };
  uHasMap: { value: number };
  uOpacity: { value: number };
  uActive: { value: number };
  uTime: { value: number };
  uTint: { value: THREE.Color };
  uAspect: { value: number };
  uRadius: { value: number };
  uRim: { value: number };
};

export function createPanelMaterial(opts: { aspect: number; radius?: number; tint?: string; rim?: number }) {
  const uniforms: PanelUniforms = {
    uMap: { value: null },
    uHasMap: { value: 0 },
    uOpacity: { value: 0 },
    uActive: { value: 0 },
    uTime: { value: 0 },
    uTint: { value: new THREE.Color(opts.tint ?? "#f8fcfb") },
    uAspect: { value: opts.aspect },
    uRadius: { value: opts.radius ?? 0.07 },
    uRim: { value: opts.rim ?? 1 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  return { material, uniforms };
}
