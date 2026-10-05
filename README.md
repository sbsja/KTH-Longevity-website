# KTH Longevity website

The public website of KTH Longevity, a student association in Stockholm that connects students
with longevity science and innovation. The home page is a spatial "Explore" gallery (React Three
Fiber) around a procedural DNA helix whose seven cards reach the six sections of the site and the
latest event; every card also exists as plain HTML, so the site works without WebGL, with reduced
motion, and on phones with normal scrolling.

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
| `npm test` | Vitest unit tests: content model, navigation, gallery store and panel maths, form validation and delivery, job board rules |
| `npm run e2e` | Playwright end-to-end suite against `./out` in headless Microsoft Edge (build first) |
| `npm run check` | lint + typecheck + unit tests |
| `npm run screenshots` | Captures every section, an event page and the open menu at 1440 / 1024 / 768 / 390 px into `docs/screenshots` |
| `node scripts/make-og.mjs` | Regenerates `public/og.png` (with the supplied logo) and `src/app/favicon.ico` |
| `node scripts/make-backdrop.mjs` | Regenerates the cellular backdrop data and `public/backdrop.svg` |
| `node scripts/make-covers.mjs` | Regenerates the seven cell-cycle covers in `public/covers/` |

Playwright uses the Edge that is already installed on Windows (`channel: "msedge"`), so no browser
download is needed. On another machine, install a Chromium build or change the channel in
`playwright.config.ts`.

## Sections and routes

| Route | Section | Content file |
|---|---|---|
| `/` | Explore gallery (seven cards: the latest event and the six sections) | `src/content/featured.ts` |
| `/about/` | Who we are, purpose and activities, the team, history, how to participate | `people.ts`, `site.ts` |
| `/events/`, `/events/<slug>/` | Upcoming and past events, one page per event | `events.ts` |
| `/projects/` | Current projects (one: this website) | `projects.ts` |
| `/jobs/` | Job board with open and closed listings | `jobs.ts` |
| `/newsletter/` | What subscribers get, signup form | `forms.ts` |
| `/contact/` | Contact form and public contact details | `forms.ts`, `links.ts` |
| `/research/` | Retained reading notes (not in the primary navigation) | `research.ts` |
| `/explore/`, `/join/` | Legacy routes that redirect to `/` and `/about/#participate` | `src/lib/navigation.ts` |

## Where things live

```
src/content/        The content model. Edit these to change the site.
  site.ts           Name, tagline, description, history facts and the About timeline
  links.ts          Every external URL and the contact mailbox (single source of truth)
  forms.ts          Contact and newsletter delivery endpoints (null until configured)
  events.ts         Event records: dates, programme, speakers, topics, cover, sources
  projects.ts       Project records (purpose, status, milestones, technologies)
  jobs.ts           Job board listings and the open/closed rules
  research.ts       Curated papers with study type, summary, caveat and DOI
  people.ts         Board roles, advisors, teams
  featured.ts       The seven gallery cards, built from the records above
src/components/
  scene/            The WebGL scene: SceneHost (loading, WebGL detection, route → mode),
                    Scene (canvas), Backdrop + backdropMaterial (molecular field, baked once),
                    Spine (helix), Particles, PanelRing + panelMaterial (glass panels),
                    CameraRig, Lighting, layout.ts (pure placement maths)
  gallery/          GalleryHud (the interface over the scene), HtmlGallery (fallback cards),
                    useGalleryInput (wheel, keys, swipe)
  chrome/           Nav (logo, centred section bar, Events submenu, narrow-width menu), Logo,
                    Footer, RouteTracker
  page/             Article + PageShell (the wide reading surface, return button, Escape, gutter
                    dismissal, heading focus), LegacyRedirect
  forms/            ContactForm, NewsletterForm, shared fields and states
src/lib/            galleryStore (position), sceneStore (status, mode), navigation (sections,
                    legacy routes, current states), routeHistory, escapeStack, forms (validation
                    and delivery), hooks
src/app/            Routes, see the table above
public/brand/       The supplied logo, unchanged
public/covers/      Procedural cover artwork (SVG), used by the 3D panels and the HTML cards
docs/               DESIGN-PLAN.md, CONTENT-SOURCES.md (sources, open questions, routes, forms),
                    REVISION-*.md (what changed and what was checked), screenshots
e2e/, tests/        Playwright and Vitest suites
```

## Editing content

- **Add an event:** append a record to `src/content/events.ts`. Set `date.iso` only when the day is
  certain (use `date.sortKey` for ordering otherwise), `status: "upcoming"` plus `registrationUrl`
  only for a confirmed public link. The home gallery features the next upcoming event, or the most
  recent past one, automatically.
- **Add a job listing:** append a record to `src/content/jobs.ts` with a verified `applyUrl`. It is
  open until its deadline day and then moves to "Closed" by itself.
- **Add a project:** append to `src/content/projects.ts`; the Projects page lists each record.
- **Connect the forms:** set the endpoints in `src/content/forms.ts` (or the `NEXT_PUBLIC_*`
  environment variables it reads). Until then a valid submission shows the "not available yet"
  state with a prefilled email link; the forms never claim success without a 2xx from the service.
- **Add a cover:** drop a 1200×750 SVG (or PNG) into `public/covers/` and reference its id.
- **Change a link or the mailbox:** `src/content/links.ts`. Null values switch the interface to an
  honest email route instead of a dead button.
- **Change the site URL:** set `NEXT_PUBLIC_SITE_URL` at build time (defaults to the planned
  domain, which is not verified as deployed).

## Design and accessibility notes

- Palette (October 2026 revision): ice mint, pale aqua, cyan, deep navy and nucleus blue, applied to
  the WebGL field, materials, covers and interface alike. Type: Codec Pro and CAT Neuzeit are
  replaced by OFL-licensed Outfit, Instrument Sans and JetBrains Mono (see
  `docs/CONTENT-SOURCES.md`). The KTH crest is deliberately absent.
- Header: the supplied logo at the top left (the PNG is framed to its mark, not re-drawn), the six
  sections centred on the viewport, an Events submenu that reaches every event page, and below
  980 px a labelled menu with the same six sections.
- Every content page uses one wide, centred frosted surface. "Back to Explore" and Escape return
  to the gallery at its last position; clicking the exposed gutter outside the surface returns to
  the previous internal page, or home on a direct load. Nothing inside the surface dismisses it.
- Desktop: the home route is a single non-scrolling screen; the wheel, arrow and page keys,
  on-screen previous/next buttons and touch swipes all travel the ring. Enter or a click opens the
  active card; Escape returns to the same position; focus is managed in both directions.
- Below 1024 px the scene is a hero and the page scrolls normally, with the full HTML list beneath.
- `prefers-reduced-motion` renders a still scene and instant changes. There is no manual pause
  control, no list link, no audio and no loading counter.
- Without WebGL (or if the scene throws) the HTML gallery is shown over a static backdrop
  (`public/backdrop.svg`, generated from the same data as the 3D field).

## Deploying

`npm run build` produces a fully static site in `./out`. Upload that folder to any static host
(Cloudflare Pages, Netlify, GitHub Pages, an S3 bucket). Trailing-slash URLs are used
(`/events/measuring-aging/`), and `404.html` is provided for hosts that use it. Configure the form
endpoints before the first deployment; see `docs/CONTENT-SOURCES.md` for the open questions.
