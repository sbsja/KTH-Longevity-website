# Logo motion lab

A local comparison page for six intro animations of the KTH Longevity logo. All six end on the
same artwork (the supplied PNG), at the same size, on the same background, so the motion itself
can be judged. Nothing here is wired into the website: the folder is outside `src/`, outside the
static export, and the preview server only runs when you start it.

## Launch

```bash
node experiments/logo-motion/serve.mjs
```

Then open **http://localhost:3020/**. Another port: `node experiments/logo-motion/serve.mjs 3025`.
The server binds to 127.0.0.1 and serves this folder plus an explicit allowlist: the logo PNG and
the cellular backdrop from `public/`, GSAP and Three.js from `node_modules/`, and the three
self-hosted fonts. (In the Claude desktop app the entry `logo-motion-lab` in `.claude/launch.json`
starts the same server.)

## Using the lab

- **Concepts** (left): six radio cards, keyboard arrows move between them. Selecting a concept
  shows its finished frame; nothing auto-plays. The star shortlists a concept; the shortlist is
  kept in this browser's `localStorage` only and has no effect on the website.
- **Replay** always plays from the start, in the controls bar and on the stage. **Play/Pause**,
  **First frame**, a labelled scrubber with current and total time, and **0.5× / 1× / 1.5×** speed
  (the note under it states the design duration and the resulting playback time).
- **Presentation**: *Logo only* or *Homepage context* (the site's header with the six section
  labels, the cellular backdrop, grain and vignette). In context mode the labels are real links:
  clicking one finishes the intro immediately and reports the simulated route.
- **Preview width**: Desktop (1440 × 900) or Phone (390 × 844); the simulated viewport is scaled
  to fit, so the logo is reframed rather than shrunk. On phones the six labels sit in two columns
  below the logo with a free corridor between them.
- **Still preview**: the finished logo and no animation, as visitors who prefer reduced motion
  would see it. If your system prefers reduced motion the lab opens in this state. Replay plays
  the sample on request.
- **Settle into header** (homepage context): an optional ending in which the completed logo
  moves and scales into the header's logo slot. The same ending is appended to every concept.
- Keyboard: Space plays or pauses, R replays (when focus is not on a control).
- Deep links: `?concept=division&context=home&device=phone&settle=1`. `&svgbeads=1` forces the
  SVG fallback of concept 4 for comparison.

## Files

| Path | What it is |
|---|---|
| `index.html`, `lab.css`, `lab.js` | The page, its styles, and the player / UI controller |
| `lib/stage.js` | Simulated viewport, header, section labels, logo composition, measurements |
| `lib/logo.js` | Shared helpers: stroke drawing, wordmark wipe, vector → PNG handoff, geometry maths |
| `concepts/*.js` | One module per concept with its description and timeline; `index.js` lists them |
| `geometry/extract-logo-geometry.mjs` | Derives the stroke geometry from the PNG and checks it (see NOTES.md) |
| `geometry/logo-geometry.json`, `geometry/fidelity-check.png` | The traced strokes and the pixel comparison sheet |
| `assets/logo-mark.png` | The PNG's mark box with its mint tile turned into transparency (derived, source untouched) |
| `tests/lab.e2e.mjs`, `tests/playwright.config.mjs` | Focused Playwright checks of controls and lifecycle |
| `tests/capture-frames.mjs` | Writes review frames of every concept to `review/` and measures the handoff |
| `NOTES.md` | Concept notes, fidelity statement, limitations, how the intro would go to production |

## Checks

```bash
npx playwright test -c experiments/logo-motion/tests/playwright.config.mjs
```

Starts its own copy of the server on port 3021 and runs 17 checks in headless Microsoft Edge:
still frame and six named concepts, each concept playing to its native duration and ending on
the shared artwork, speed versus design duration, exact seeking in both directions, rapid
switching without leftovers or running timelines, homepage-context navigation and the header
handoff, phone connection lines never crossing a label, reduced motion, shortlist persistence,
keyboard access.

```bash
node experiments/logo-motion/tests/capture-frames.mjs            # review frames → experiments/logo-motion/review/
node experiments/logo-motion/geometry/extract-logo-geometry.mjs  # regenerate the geometry and fidelity sheet
```

The repository's own `npm run check` (lint, typecheck, unit tests) still covers this folder's
JavaScript through ESLint and passes.
