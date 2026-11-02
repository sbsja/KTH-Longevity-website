# Logo motion lab: notes

Written 6 October 2026. Companion to the lab in this folder (see README.md for how to run it).

## The artwork and its vector representation

- **Source of truth:** `Logo/KTH Longevity Logo.png` in the association folder, identical to
  `public/brand/kth-longevity-logo.png` (1008 × 480, mint tile `#e3faf5` with rounded corners).
  The files under `Logo/svg` depict the older typographic mark (LONGEVITY crossed by K/T/H) and
  were not used. The PNG was read only, never modified.
- **Colours in the PNG are exact site tokens:** navy `#08283d`, blue `#175998`, tile `#e3faf5`.
- **Mark box** x 175–838, y 172–308 (the frame the site's header uses). Symbol x 179–312, wordmark
  x 379–834. The lettering is never redrawn: every concept shows the PNG's own pixels for the
  words, and the final frame of every concept is the PNG for the symbol too.
- **Animation-only vector strokes** (`geometry/logo-geometry.json`), derived by unmixing each
  pixel of the symbol into navy and blue coverage, taking column centroids, fitting one cubic
  Bézier per stroke and refining control points, width and end points by rendering candidates and
  minimising the per-pixel error against the PNG:
  - navy `M185.6 206.14 C235.24 210.94 257.59 269.81 306.4 273.74`, width 11.71, round caps
  - blue `M185.6 273.83 C234.53 269.61 258.34 209.7 306.47 206.3`, width 11.69, round caps
  - blue passes **over** navy at the crossing (246, 240): the navy stroke's mass drops to 7 % there,
    the blue stroke's does not.
- **Fidelity:** rendered with librsvg, the vector symbol differs from the PNG by a mean of
  **0.97 / 255** per channel over the symbol area; 311 of 13 671 pixels differ by more than 16,
  all on anti-aliased edges (`geometry/fidelity-check.png`: original, vector, difference).
  In Microsoft Edge, the frame just before the handoff and the final PNG frame differ by a mean
  of **0.77 / 255**; 117 of 14 391 compared pixels differ by more than 24. No visible jump.
- **Transparent derivative:** `assets/logo-mark.png` is the mark box with the mint tile turned
  into alpha (alpha = ink coverage, colour = the navy/blue mix), so the logo can sit on the
  cellular backdrop without a flat rectangle. Same ink pixels as the source.
- **Remaining limitation:** the mark is 663 px wide in the PNG. At hero size on a high-DPI screen
  the final frame is an upscaled raster (the animated strokes are vectors and stay crisp). A
  production intro should get a vector or 2× master of the lettering from the designer. Until
  then, the handoff to the PNG is the honest end state and is what the lab shows.

## The six concepts

All six are fully implemented; none is a placeholder. Durations are each concept's native
design duration; speed changes playback only.

| # | Concept | Native | Built with | Approximated? |
|---|---|---|---|---|
| 1 | Two strands meet | 1.40 s | SVG dash drawing on the traced strokes, GSAP | No |
| 2 | Microscope focus | 1.30 s | CSS blur/scale via GSAP proxy, SVG membrane and cell discs | No |
| 3 | Cell division reveals the logo | 1.80 s | Procedural SVG (Cassini oval), point-wise arc → strand morph | No |
| 4 | Molecules assemble | 1.80 s | Three.js instanced spheres on a transparent canvas, SVG fallback | No (fallback labelled in the lab) |
| 5 | Glass-and-light reveal | 0.90 s | SVG light band masked by the logo alpha, feDisplacementMap lens, one ripple | No |
| 6 | Logo connects to the six sections | 1.60 s | SVG dash drawing, curves measured from the live label positions | No |

### 1 · Two strands meet
Navy draws from its top-left end, blue from its top-right end, so they approach the crossing
from opposite directions and pass with blue over navy. `power3.inOut` easing, round caps, no
bounce, no rotation. The lettering wipes in with a feathered edge (0.6–1.15 s); the strokes
crossfade to the PNG symbol over the last 0.2 s.
Strengths: the cleanest statement of "two strands become one identity"; cheapest to ship.
Limitations: nothing dimensional; relies on the traced geometry (sub-pixel here).

### 2 · Microscope focus
The complete logo starts at blur 14 px and scale 1.05 behind a translucent membrane; the focus
racks to 2.4 px, drifts to 3.6 px (a small overshoot, like a fine-focus knob), then settles to
zero with `power3.out`. Seven blurred cell discs around the logo sharpen from 26 px to 9 px blur,
then fade so the end frame matches the common background. Filters are removed, not left at 0.
Strengths: one unmistakable action, nothing redrawn.
Limitations: large blur radii on a big element are GPU-heavy on weak devices; the overshoot
must stay small or it reads as shake.

### 3 · Cell division reveals the logo
A Cassini oval drives the membrane: circle → elongated → pinched (b just above c) → two loops
(b below c), while the whole cell scales from 2.6× down to strand size. Two soft nuclei separate
with it. After the split, the inner (facing) arcs of the two daughters are sampled as polylines
and morphed point-wise into the four half-strands of the symbol: left-upper and right-lower arcs
become navy, the other two blue, meeting at the crossing. Stroke width grows from 2.6 to 11.7
while the membrane colour turns into the ink colours; the outer arcs and nuclei fade. Wordmark
wipe from 1.15 s, handoff 1.6–1.8 s.
Strengths: the pinch and the transformation are legible and genuinely organic; it fits the
cellular covers.
Limitations: longest of the six; a stylised reading of division; the morphing halves are
polylines until the handoff (no visual seam at this size).

### 4 · Molecules assemble
24 beads per strand travel along the traced curves (navy from the top-left end, blue from the
top-right end) and park at evenly spaced stations with a small lateral wobble that dies as each
bead settles. Positions are a pure function of time (deterministic schedule, seeded ambient
beads), so replay and scrubbing are identical. Three.js renders them with a physical material
(clearcoat), a cool key light, an aqua fill and a hemisphere light; a long-lens camera gives
subtle parallax from the beads' z offsets. The strokes surface beneath the parked beads at
0.98 s and the beads sink into them; 14 ambient beads disperse into the background. Rendering
happens only on timeline updates (no animation loop), and the renderer, geometry and material
are disposed when you switch concepts. Without WebGL, the same positions are drawn as SVG discs
with gradient shading and the lab says so in the status line.
Strengths: the only concept with real light and depth; restrained (no sparks or starfield).
Limitations: a WebGL context and a 1.2 MB library for one intro; the bead-to-stroke merge is a
crossfade, not geometric fusion.

### 5 · Glass-and-light reveal
The finished PNG is in place throughout. A 150 px cyan/white light band, skewed 16°, slides
across inside a mask made from the logo's own alpha, so only the ink is lit. A displacement
filter whose map is a travelling 1-D lens profile refracts the raster locally (scale 0 → 7 → 0
between 0.1 and 0.76 s); when the scale falls below 0.02 the filter is removed so the end frame
is the untouched PNG. One ring expands behind the logo from 30 to 320 px and fades.
Strengths: quietest and shortest; type stays readable; no handoff needed.
Limitations: the refraction softens the raster while active; it is one notch away from a
generic shine if the band is made brighter or wider.

### 6 · Logo connects to the six sections
Both strands draw in 0.55 s and the wordmark follows. The six connection curves are computed
from the live positions of the labels: in homepage context on desktop they end on the bottom
edge of the real header links; in logo-only mode on a quiet label row above the mark; on phones
on two columns below the logo, where each line swings into the free middle corridor while still
above the labels, runs straight down it and turns into the facing edge of its chip. Lines draw
(0.42–1.06 s), a short cyan dash runs along each one to its label (0.78–1.35 s) and the label
briefly turns navy and back without moving, then the lines retract towards the labels and fade.
Labels are links the whole time; the Playwright check samples every line and confirms it never
enters a label's box.
Strengths: ties the mark to the site's structure; adapts to the real layout.
Limitations: in production the targets must be measured after fonts load and on resize; on
phones the real site keeps the six labels in a Menu panel, so the compact arrangement is a lab
construction to be confirmed with the mobile design.

## Shared behaviour demonstrated in the lab

- Lifecycle per concept: create → play / pause / seek / restart → dispose. Switching concepts
  kills the old timelines, removes every extra DOM node and canvas, disposes WebGL, and rebuilds
  the logo composition from scratch. Rapid switching is covered by a test (one composition, no
  stray layers, exactly one timeline on GSAP's global timeline).
- Every tween is a `fromTo` with explicit values, so any scrubber position is a pure function of
  time. Replay (`restart`) therefore resets transforms, particles, blur, masks, text and lines.
- Reduced motion: with `prefers-reduced-motion: reduce` the lab opens on the still preview (the
  finished logo); an explicit Replay or Play starts the sample and says so. The lab itself never
  applies once-per-session suppression; Replay always works.
- Homepage context keeps the header usable: clicking a section label finishes the intro at once
  (`progress(1)`) and shows the simulated route. The "Settle into header" ending moves only the
  logo (FLIP-style transform on the logo root, 0.7 s, `power3.inOut`) and hands over to the
  header's own image, which has identical framing and pixels; no other page content moves.

## How a chosen intro would go to production (not done)

Mount the chosen concept's module in a small client component over the usable homepage,
measured against the real header; respect `prefers-reduced-motion` by rendering the final frame;
remember completion in `sessionStorage` so internal navigation never replays it; finish instantly
on any navigation; keep the header's logo as the end state. The geometry JSON, `lib/logo.js`
helpers and the chosen concept module are the parts to carry over.

## Verification performed

- Headless Microsoft Edge (Playwright, `channel: "msedge"`, D3D11 WebGL): 17 checks pass
  (`tests/lab.e2e.mjs`); review frames of every concept at several positions, desktop and phone,
  logo-only and homepage context (`tests/capture-frames.mjs`), inspected one by one.
- No console errors, no failed requests, in the tests and the frame capture.
- `npm run check` (ESLint, TypeScript, Vitest) passes with the lab folder present; the lab is not
  part of `next build` or the static export.
- Performance: not measured as a frame rate. What is checked is structural: a single composition,
  no leaked timelines or canvases after switching, WebGL rendering only on timeline updates. The
  desktop app's own browser pane throttles hidden tabs, so judge smoothness in a normal browser
  window; concept 2 (large blurs) and concept 4 (WebGL) are the two to watch on weaker machines.
