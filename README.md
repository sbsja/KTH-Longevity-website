# KTH Longevity website

The public website of KTH Longevity, a student association in Stockholm that connects students
with longevity science and innovation. The main experience is a spatial "Explore" gallery
(React Three Fiber) around a procedural DNA helix; every item also exists as plain HTML, so the
site works without WebGL, with reduced motion, and on phones with normal scrolling.

Built with Next.js 16 (App Router, static export), React 19, TypeScript, Three.js via
@react-three/fiber and @react-three/drei, and GSAP for the interface entrance. No CMS, no
database, no analytics: content lives in TypeScript files.

## Run it

Requires Node 20 or newer (developed on Node 24).

```bash
npm install
npm run dev
```

Open http://localhost:3000. The dev server also powers `npm run screenshots` and `scripts/probe.mjs`
(both expect http://localhost:3010 by default; pass another base URL as the first argument).

Production build and local preview of the exact files a static host would serve:

```bash
npm run build          # writes ./out
npm run start          # serves ./out at http://localhost:3011
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Static export to `./out` (one HTML file per route) |
| `npm run start` | Tiny static server for `./out` (port 3011) |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript rules) |
| `npm run typecheck` | Regenerates route types, then `tsc --noEmit` |
| `npm test` | Vitest unit tests for the content model, gallery store and panel layout maths |
| `npm run e2e` | Playwright end-to-end suite against `./out` in headless Microsoft Edge (build first) |
| `npm run check` | lint + typecheck + unit tests |
| `npm run screenshots` | Captures every route at 1440 / 1024 / 768 / 390 px into `docs/screenshots` |
| `node scripts/make-og.mjs` | Regenerates `public/og.png` and `src/app/favicon.ico` |
| `node scripts/make-backdrop.mjs` | Regenerates the molecular backdrop data and `public/backdrop.svg` |

Playwright uses the Edge that is already installed on Windows (`channel: "msedge"`), so no browser
download is needed. On another machine, install a Chromium build or change the channel in
`playwright.config.ts`.

## Where things live

```
src/content/        The content model. Edit these to change the site.
  site.ts           Name, tagline, description, history facts
  links.ts          Every external URL and the contact mailbox (single source of truth)
  events.ts         Event records: dates, programme, speakers, topics, cover, sources
  research.ts       Curated papers with study type, summary, caveat and DOI
  people.ts         Board roles, advisors, teams
  featured.ts       The seven gallery items, built from the records above
src/components/
  scene/            The WebGL scene: SceneHost (loading, WebGL detection, route → mode),
                    Scene (canvas), Backdrop + backdropMaterial (molecular field, baked once),
                    Spine (helix), Particles, PanelRing + panelMaterial (glass panels),
                    CameraRig, Lighting, layout.ts (pure placement maths)
  gallery/          GalleryHud (the interface over the scene), HtmlGallery (list cards),
                    useGalleryInput (wheel, keys, swipe)
  chrome/           Nav capsule, Wordmark, Footer
  page/             Article layout, BackToExplore (Escape / focus handling)
src/lib/            galleryStore (position, filter, pause), sceneStore (status, mode), hooks
src/app/            Routes: /, /explore, /events, /events/[slug], /research, /about, /join
public/covers/      Procedural cover artwork (SVG), used by the 3D panels and the HTML
docs/               DESIGN-PLAN.md, CONTENT-SOURCES.md (sources + open questions), screenshots
e2e/, tests/        Playwright and Vitest suites
```

## Editing content

- **Add an event:** append a record to `src/content/events.ts`. Set `date.iso` only when the day is
  certain, `status: "upcoming"` plus `registrationUrl` only for a confirmed public link. Add it to
  `featured.ts` if it should appear in the gallery (keep the ring at six to eight items).
- **Add a cover:** drop a 1200×750 SVG (or PNG) into `public/covers/` and reference its id. Keep
  the base dark; the panel shader expects dark artwork with bright accents.
- **Change a link or the mailbox:** `src/content/links.ts`. Null values switch the interface to an
  honest email route instead of a dead button.
- **Change the site URL:** set `NEXT_PUBLIC_SITE_URL` at build time (defaults to the planned
  domain, which is not verified as deployed).

## Design and accessibility notes

- Palette and type come from the association's January 2025 mood board; Codec Pro and CAT Neuzeit
  are replaced by OFL-licensed Outfit, Instrument Sans and JetBrains Mono (see
  `docs/CONTENT-SOURCES.md`). The KTH crest is deliberately absent.
- Desktop: the home route is a single non-scrolling screen; the wheel, arrow and page keys,
  on-screen previous/next buttons and touch swipes all travel the ring. Enter or a click opens the
  active item; Escape returns to the same position; focus is managed in both directions.
- Below 1024 px the scene is a hero and the page scrolls normally, with the full HTML list beneath.
- `prefers-reduced-motion` renders a still scene and instant changes; "Pause motion" stops the
  continuous drift for everyone else. There is no audio and no loading counter.
- Without WebGL (or if the scene throws) the HTML gallery is shown over a static backdrop
  (`public/backdrop.svg`, generated from the same data as the 3D field; see
  `docs/BACKGROUND-REFINEMENT.md`).

## Deploying

`npm run build` produces a fully static site in `./out`. Upload that folder to any static host
(Cloudflare Pages, Netlify, GitHub Pages, an S3 bucket). Trailing-slash URLs are used
(`/events/measuring-aging/`), and `404.html` is provided for hosts that use it.
