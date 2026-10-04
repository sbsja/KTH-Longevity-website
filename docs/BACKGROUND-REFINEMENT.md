# Background refinement: molecular microscopy field

Date: 4 October 2026. Scope: the environment behind the gallery only. Everything that moves
(panels, helix, particles, camera) keeps its code paths, parameters and timing.

## What changed

| File | Change |
|---|---|
| `src/components/scene/Backdrop.tsx` | New. One plane 22 units behind the scene, drawn first with depth writes and tests off. Renders the procedural field once into a 2560×1829 (desktop) or 1536×1097 (phone) sRGB texture and shows that texture; no per-frame shading cost (60 fps with and without it on an Intel UHD in headless Edge). |
| `src/components/scene/backdropMaterial.ts` | New. The static field: deep-green base mottled with value noise, Tiffany light lower left, pale-yellow light upper right, a soft green lift in the middle, membrane contours (noise isolines plus three double-walled arcs) toward the edges, eighteen out-of-focus discs, and three ball-and-stick silhouettes. A quiet-zone function keeps the field calm behind the intro text, nav, counter, category list and utilities. No time uniform. |
| `src/components/scene/backdropData.ts` | Generated. Positions of the discs, atoms, bonds and arcs in view units, shared by the shader and the SVG fallback. |
| `scripts/make-backdrop.mjs` | New. Writes `backdropData.ts` and `public/backdrop.svg` from the same data so the CSS fallback matches the scene. |
| `public/backdrop.svg` | Generated. Static 1920×1200 rendering of the same field. |
| `src/components/scene/Scene.tsx` | One line: mounts `<Backdrop desktop={desktop} />` after the fog. Camera, fog, lights, tone mapping and exposure untouched. |
| `src/components/scene/Particles.tsx` | Appearance only: pale desaturated tints in the same four palette slots, Gaussian core with a wide faint halo instead of a hard disc, normal instead of additive blending, point size ×1.6, and a defocus term that makes large particles fainter. Positions, count, seed, drift equations, twinkle timing and the pause/time accumulator are byte-for-byte the same. |
| `src/components/scene/SceneHost.module.css` | The always-present backdrop now uses `backdrop.svg` over the previous gradients; the old no-WebGL overlay that reused the research cover (a helix) is gone. |
| `scripts/screenshots.mjs` | `OUT_DIR` and `NO_WEBGL` options for the before/after and fallback captures. |

Not touched: `CameraRig.tsx`, `PanelRing.tsx`, `layout.ts`, `Spine.tsx`, `Lighting.tsx`,
`panelMaterial.ts`, the gallery and scene stores, input handling, content, routes, styles of
interface elements.

## How the existing animation is preserved

- The backdrop is a separate mesh with its own unlit material (`fog: false`,
  `toneMapped: false`, `depthTest: false`, `depthWrite: false`, `renderOrder: -10`). It cannot
  receive the scene's lights, cannot be fogged, cannot occlude anything and nothing is sorted
  against it. The drei `Environment` that gives the helix its reflections is a separate render
  and does not see the plane.
- No new `useFrame`, timer or GSAP timeline. The field is rendered once in an effect; the only
  motion it shows is the existing pointer parallax of the camera, which moves the far plane by
  about two percent of the view.
- In `Particles.tsx` the seeded `mulberry32(42)` loop is unchanged, including the order and
  number of random draws per particle, so every position, size class, colour slot and phase is
  identical. The vertex drift equations and the `uTime` accumulation (which stops on
  "Pause motion" and under reduced motion) are unchanged; only the fragment look, the blending
  mode and a constant size multiplier moved.
- `Scene.tsx` keeps the same camera, fog, exposure and frameloop logic; the one added line
  mounts the backdrop.

## Verification

- Before/after captures at identical viewports and the default gallery item:
  `docs/screenshots/before/` and `docs/screenshots/after/` (home and event page at 1440, 1024,
  768 and 390 px). Fallback without WebGL: `docs/screenshots/after-no-webgl/`.
- `npm run check` (lint, types, 20 unit tests), `npm run build`, `npm run e2e` (33 Playwright
  tests in headless Edge with hardware WebGL: key/wheel/button travel, open and Escape with
  focus restore, category filters, Pause motion, reduced motion, no-WebGL fallback, phone
  scrolling).
- Frame-rate probe in headless Edge at 1440×900: 60.5 fps with the backdrop, 60.5 fps without
  (the unbaked shader cost 10 fps, which is why it is baked).
