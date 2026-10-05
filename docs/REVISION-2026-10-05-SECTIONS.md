# Revision, 5 October 2026 (second pass): sections, wide layout, header, logo

Static build: `npm run build` then `npm run start` (http://localhost:3011). Dev server: `npm run dev`.
Screenshots of the production build at 1440, 1024, 768 and 390 px: `docs/screenshots/sections/`
(home, About, Events, an event page, Projects, Job board, Newsletter, Contact, the open menu at 768
and 390); the no-WebGL fallback of home and an event page: `docs/screenshots/sections-no-webgl/`.
The earlier captures in `docs/screenshots/` and `revision-*` document the previous state.

The visual identity is unchanged: palette, type, cellular backdrop, helix, cell-cycle covers, glass
surfaces, the gallery's camera, ring motion, parallax, damping and wheel/keyboard/swipe input.

## 1. Six sections

| Label | Route | Content file |
|---|---|---|
| About | `/about/` | `people.ts`, `site.ts` (milestones) |
| Events | `/events/` | `events.ts` |
| Projects | `/projects/` | `projects.ts` (new) |
| Job board | `/jobs/` | `jobs.ts` (new) |
| Newsletter | `/newsletter/` | `forms.ts` (new) |
| Contact | `/contact/` | `forms.ts`, `links.ts` |

`src/lib/navigation.ts` defines the six sections, the current-state rules, the legacy routes and
the retained secondary page. Research, Get involved and Browse all left the primary navigation:

- `/research/` stays as a secondary page with all 13 reading notes, linked from About ("Learning
  between events") and the footer ("Reading notes").
- `/join/` redirects to `/about/#participate` (membership and team information now live there;
  participation routes also appear on Contact). `/explore/` redirects to `/`. Both are client-side
  (`router.replace` + `<meta http-equiv="refresh">` + a visible link) because the static export
  cannot issue HTTP redirects; both carry `noindex` and are excluded from the in-session route
  history, so "return to the previous page" never lands on one.

The home gallery keeps seven cards and its seven cell-cycle covers in order: the latest documented
event (BioArctic, "Latest event") followed by About, Events, Projects, Job board, Newsletter and
Contact, each linking to its section. `featured.ts` derives the event card from the event records
(an upcoming event takes the slot automatically when one is confirmed). Route → card mapping:
exact match, then the Events card for any event page that is not itself featured; legacy and
unknown routes leave the ring where it is. The counter stays "01 / 07".

## 2. Content

- **About**: who we are, purpose and activities (events, reading notes, community, projects), the
  team (five board roles with one-line descriptions from the board's own notes, two advisors, three
  teams), a history timeline of eight documented milestones (first evening December 2024 and formal
  constitution November 2025 kept apart), and four participation routes plus membership and team
  recruitment facts. Structure follows the reference About page (intro, team, history); no
  academic-year selector, team filters or annual report, since the material does not exist.
- **Events**: "Upcoming events" (honest empty state with a Newsletter button and Instagram) and
  "Past events" newest first, each with cover, date, format, venue, summary and links. A fourth past
  event was added from a public record: the **MedAI Hackathon, 22–28 September 2025**, co-hosted
  with KTH AI Society and ABC Labs (KTH AI Society's Luma page, corroborated by the planning notes
  in `Meetings/KTH AI Society _ KTH Longevity.docx` and the mis-dated `Meeting 2024-09-23.docx`).
  Registration buttons render only for `status: "upcoming"` with a verified URL; none exists.
  Ordering uses the established day or an approximate `sortKey` that is never displayed.
- **Projects**: one entry, the website, with purpose, status "Ongoing", what the site provides,
  four documented milestones, technologies from `package.json`, and a contribute route that
  pre-fills the contact form (`/contact/?topic=website`). No filters, percentages, deadlines,
  contributors or links to unverified destinations.
- **Job board**: `jobs.ts` holds `JobListing` records (title, organisation, location, arrangement,
  type, deadline, apply link, posted date). Listings are open through their deadline day and move
  to "Closed" afterwards (`splitJobs`). No approved listings exist, so the page shows an honest
  empty state with Contact and Newsletter routes.
- **Newsletter**: what subscribers receive (society updates, upcoming events, project news, other
  relevant information), no schedule promise, an email-required / name-optional form with explicit
  consent, and an aside on privacy and Instagram. A hosted signup page can be shown instead of or
  beside the form (`NEXT_PUBLIC_NEWSLETTER_SIGNUP_URL`).
- **Contact**: name, email, subject (with suggested purposes), message, a consent checkbox, the
  verified public details (mailbox pending confirmation, Instagram, campus), and reasons to write.

## 3. Forms and the integration boundary

`src/lib/forms.ts` (validation and delivery, no React) and `src/components/forms/*` (fields, error
summary, outcome panels, ContactForm, NewsletterForm). Behaviour:

- Validation on submit with specific messages under each field (`aria-invalid`,
  `aria-describedby`), a focused error summary (`role="alert"`) linking to each field, errors
  clearing as fields change, a honeypot, semantic input types and autocomplete.
- Delivery: POST JSON (or form encoding) to the configured endpoint with `Accept: application/json`.
  Pending state disables the button (`aria-busy`); success and failure panels receive focus; the
  provider's error message is shown when it sends one; the entered text is kept on failure.
- Unconfigured (the current state): a valid submission ends in a visible "not available yet" panel
  with a prefilled `mailto:` alternative. The interface never shows "Message sent" or "You are on
  the list" without a 2xx from the real service. `doubleOptIn` switches the success copy to
  "check your inbox".
- No server actions, API routes or secrets: only public endpoints belong in `forms.ts`.

## 4. Wide layout for every content page

`Article.module.css` lost the desktop `.detail .column` rule (44 rem, left-aligned) that produced
the narrow event panel. Every page, including event pages, now uses the one 72 rem frosted surface
centred in the viewport (`data-testid="page-surface"`), with `.prose` keeping paragraphs at reading
width and grids and forms using the full width. The event page shows its cover inside the surface
(text 7/12, cover 5/12 on desktop; stacked below 1024 px).

Scene: `layout.ts` makes the detail mode a calm variant of ambient (the ring recedes behind the
surface; the opened card stays faintly present behind the glass instead of standing beside it),
and `CameraRig` uses the ambient camera on every content page. `SceneHost`, the gallery store and
position restore are unchanged. The exposed gutter still dismisses to the previous internal page;
whitespace inside the surface, text selection, drags across its edge, header clicks and form use
never do (covered by tests).

## 5. Header and logo

- `public/brand/kth-longevity-logo.png` is the supplied file, byte for byte; the source in `Logo/`
  is untouched. `components/chrome/Logo.tsx` frames the mark's bounding box (x 175–838, y 172–308
  of the 1008 × 480 image) with CSS at a 30 px mark height (26 px below 640 px) on a 44 px tile
  whose background is the PNG's own mint, so no crop edge shows. Link to `/` named "KTH Longevity,
  home". Nothing is redrawn; no second name or tagline.
- The header is a `minmax(0,1fr) auto minmax(0,1fr)` grid: logo top left, the six-section bar
  centred on the viewport (verified: bar centre within 6 px of the viewport centre at 1440 and
  1024), Events submenu with every event page retained. Below 980 px the bar hides and a labelled
  "Menu" button at the top right opens a panel with the same six sections and the event pages; no
  overlap or horizontal overflow at 768 or 390 px.
- `scripts/make-og.mjs` places the same framed logo on the share image; the favicon is unchanged.

## 6. Removed controls

"Browse as a list", "Pause motion" and the keyboard hint's bottom row are gone from the home
interface, and "Browse all" from the navigation and footer. Nothing replaced them at the bottom
left; the travel hint now sits under the previous/next controls. The manual pause state was removed
from the gallery store and scene; continuous drift follows `prefers-reduced-motion` only. The HTML
list under the scene remains for phones, tablets and the no-WebGL fallback.

## Files

New: `src/content/projects.ts`, `jobs.ts`, `forms.ts`; `src/lib/forms.ts`;
`src/components/chrome/Logo.tsx` + `.module.css`; `src/components/forms/*`;
`src/components/page/LegacyRedirect.tsx`; `src/app/{projects,jobs,newsletter,contact}/`;
`public/brand/kth-longevity-logo.png`; `tests/forms.test.ts`, `tests/jobs.test.ts`,
`e2e/forms.spec.ts`; `docs/screenshots/sections*/`; this file.

Changed: `src/content/{types,site,links,events,featured,people}.ts`; `src/lib/{navigation,galleryStore}.ts`;
`src/components/chrome/{Nav,Footer,RouteTracker}.tsx`, `Nav.module.css`;
`src/components/gallery/GalleryHud.tsx` + `.module.css`; `src/components/page/{PageShell,Article}.tsx`,
`Article.module.css`; `src/components/scene/{layout,CameraRig,Scene}.tsx|ts`;
`src/app/{about,events,events/[slug],research,join,explore}/page.tsx` and styles, `not-found.tsx`,
`globals.css`; `scripts/{screenshots,make-og}.mjs`, `public/og.png`; `tests/*`, `e2e/site.spec.ts`;
`README.md`, `docs/CONTENT-SOURCES.md`.

Removed: `src/components/chrome/Wordmark.tsx` + `.module.css`, `src/app/explore/ExploreList.*`.

## Checks that ran

| Check | Result |
|---|---|
| `npm run check` (ESLint, `tsc`, Vitest) | 0 errors, 48 unit tests pass (content model and card mapping, navigation and legacy routes, route history, Escape ordering, gallery store, panel maths, form validation and delivery outcomes, job-board rules) |
| `npm run build` | static export, 18 routes |
| `npm run e2e` (Playwright, headless Edge, hardware WebGL, desktop 1440×900 and phone 390×844) | 67 passed, 19 skipped as viewport- or configuration-specific. Covers gallery travel and the seven card destinations, removed controls, no-WebGL fallback, reduced motion, header order/centring/logo/current states, Events submenu, return control on every page, heading focus, wide surface identical across Research, About, Contact and event pages, gutter dismissal and its exceptions (surface whitespace, selection, drags, form use), direct-load fallback, Back/Forward, every page's heading/banner/footer with no horizontal overflow, About structure and dates, Events order and empty state, Projects, Job board, contact prefill, legacy redirects, DOI links, 404, metadata, footer, mobile menu, phone layout, form validation and the unconfigured outcome |
| Forms with a configured endpoint (`FORMS_E2E=1` against a build with `https://forms.example.test/*`, network mocked with `page.route`) | Pending → success, provider rejection with its message, and network failure for the contact form; success and HTTP 500 for the newsletter form. This proves the interface, not delivery: no real service exists yet |
| Visual inspection of `docs/screenshots/sections/` | Header, wide surface and gallery as described above at all four widths |

## Not verified, by design

- Real delivery of either form and real newsletter signup: no service or endpoint is documented.
- The exact BioArctic date and presenters; the MedAI Hackathon wording from the board's side.
- Firefox and Safari were not exercised; verification used Edge (Chromium).
- The browser console shows 404s for Next.js segment prefetches (`/<route>/__next.<segment>.__PAGE__.txt`)
  because the static export writes those payloads as `__next.<segment>/__PAGE__.txt`. This comes
  from the framework's router and export layout, not from site code; the router falls back to the
  full `index.txt` payload, and every client-side navigation in the end-to-end suite passes.
