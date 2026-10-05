# KTH Longevity website: content map and design plan

> Revised 5 October 2026: the palette below (deep green, Tiffany, pale yellow) was replaced by a
> light cellular palette, the home category list by a full top navigation, and every content page
> gained a return control and backdrop dismissal. See `docs/REVISION-2026-10-05.md`. A second pass
> the same day replaced the content map with six sections (About, Events, Projects, Job board,
> Newsletter, Contact), gave every page the wide centred surface, moved the supplied logo to the
> top left and removed the bottom-left controls. See `docs/REVISION-2026-10-05-SECTIONS.md`. The
> composition and interaction model of the gallery still hold.

Written 3 October 2026, before implementation. Reference studied live in a JavaScript browser at
1440×900 and 390×844: https://activetheory.net/work. On the phone viewport the reference keeps the
same full-viewport 3D scene (spine down the middle, one large panel, side panels at the right,
category list at the bottom); our mobile layout deliberately differs, see "Composition".

## What the reference actually does (desktop, observed)

- Dark environment: near-black with a teal glow bottom-left and a violet glow bottom-right,
  fine film grain over everything.
- A vertical, iridescent, spine-like structure runs through the centre top-to-bottom, wrapped in
  small drifting particles.
- Large rounded glass panels float around the spine at different depths and angles. One panel
  is dominant and roughly centred (slightly left), the next ones are visible behind it to the
  right and left, tilted.
- Wheel movement rotates the arrangement: the next panel swings to the front with a smooth,
  damped motion. The dominant panel carries its title in large mono capitals over the media.
- Clicking a side panel focuses it; clicking the focused panel opens the project route
  (`/work/<slug>`) in place. The scene stays, a compact "<< 7 of 62 >>" counter appears under
  the nav, and the title/meta column sits at the left. Escape returns to the gallery with the
  same position.
- Interface chrome is tiny and technical: a capsule nav top-right ("WORK —— CONTACT" with a
  hairline between), a left-hand category list ("WHAT ARE YOU LOOKING FOR? → WEBSITES …"),
  and a text input bottom-left. We do not reproduce the input (no chatbot).

## Content map

| Route | Content | Source of truth |
|---|---|---|
| `/` | Explore gallery (3D on capable desktops, HTML gallery otherwise) with 7 featured items | `src/content/featured.ts` |
| `/explore` | Always-available list view of the same items, filterable by Events / Research / Community | shared content model |
| `/events` | Upcoming (truthful "to be announced" state) and past events | `src/content/events.ts` |
| `/events/[slug]` | Kickoff (17 Dec 2024), Measuring Aging (18 Feb 2025), Breaking Through the Blood-Brain Barrier (past, date not established) | event decks, Mentimeter doc, Sept 2026 notes |
| `/research` | Curated reading notes with study type, year, summary, DOI link | `Research/*.docx` + verified publisher metadata |
| `/about` | Purpose (statutes §2), how the association works, people (typographic), teams | statutes, May 2026 annual meeting, Sept/Oct 2026 notes |
| `/join` | Join the community, register for events, apply to a team, propose a collaboration | Oct 2026 notes, bank application (contact mailbox only) |

Featured gallery items (one shared model feeds 3D panels, list view and detail pages):

1. Breaking Through the Blood-Brain Barrier, with BioArctic (event, past)
2. Measuring Aging, with Karolina Gustavsson (event, 18 Feb 2025)
3. Seed: the KTH Longevity kickoff, with Linus Petersson (event, 17 Dec 2024)
4. Reading notes on ageing science (research)
5. A student community for longevity science (community → about)
6. Join a team (community → join)
7. Next event to be announced (event, upcoming state → events + updates)

## Design plan

### Palette (from the January 2025 mood board, plus derived darks)

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#060F0E` | Scene black, derived from deep green toward black |
| `--deep` | `#103430` | Brand deep green: surfaces, glow, panel frames |
| `--deep-2` | `#0B2522` | Derived mid-dark for cards and the detail column |
| `--tiffany` | `#81D8D0` | Light, focus ring, active state, links on dark |
| `--pale-yellow` | `#FFEA95` | Warm light, hover accent, the single warm note |
| `--snow` | `#F2F6F4` | Primary text |
| `--mist` | `#A9BAB6` | Secondary text (≥ 7:1 on `--ink`) |

Lighting: Tiffany light from lower left, pale yellow from upper right (mirrors the reference's
two-colour glow), deep green ambient. No violet: the reference's purple is replaced by the
brand's warm yellow so the atmosphere is recognisably KTH Longevity.

### Type

- Display and headings: **Outfit** (OFL, self-hosted via @fontsource-variable). Stand-in for
  Codec Pro, which is a commercial Zetafonts family; the mood board does not supply a webfont
  licence or file. Outfit shares Codec Pro's geometric round forms and open counters.
- Body: **Instrument Sans** (OFL, self-hosted). Neutral grotesque in the Helvetica / CAT Neuzeit
  spirit of the mood board's body text. Comfortable at 17–18 px with 1.6 line height.
- Interface labels: **JetBrains Mono** (OFL, self-hosted), 11–12 px, used only for the compact
  technical chrome that matches the reference (nav capsule, counter, category list, metadata).
  Not used for body text.
- Scale: 12 / 14 / 17 / 20 / 26 / 34 / 48 / 64 (minor third-ish, display steps larger).

### Composition

Desktop (≥ 1024):

```
┌────────────────────────────────────────────────────────────────────┐
│ ⌜KTH LONGEVITY mark⌝  short line of intro        [Explore — About — Join]│
│                                                     ‹  2 / 7  ›     │
│                       ░░ spine ░░                                  │
│        ╭────────────────────────────╮   ╭───────╮                  │
│ What are you  │   DOMINANT PANEL     │ ╱  next  ╱  (tilted, deeper)│
│ looking for?  │   cover artwork      │╱        ╱                   │
│ → Events      │                      │                             │
│ → Research    ╰────────────────────────────╯                        │
│ → Community   Title of the active item (display type)              │
│               Event · 18 Feb 2025 · Open                            │
│ [Browse as a list]  [Pause motion]                      ░ grain ░   │
└────────────────────────────────────────────────────────────────────┘
```

- Items sit on a helix around the central form; travel rotates and lifts the ring so the active
  item lands at a fixed front position. Neighbours remain visible at angles on both sides and
  further back, which is the reference's signature.
- Active title and metadata are HTML, positioned under/over the dominant panel: crisp,
  selectable, zoomable, screen-reader friendly.
- Detail state: the ring rotates ~35° and recedes right; a left-aligned reading column
  (max 62ch) slides in over a translucent deep-green backdrop. The scene never unmounts.

Mobile (< 768): a 62svh scene hero (spine + one readable panel, swipe or arrows to change
item) followed by normal page scroll: category chips and the HTML list of items. No scroll
hijacking. Tablet (768–1023): same as mobile with two columns in the list.

### Interaction model

- Travel: wheel/trackpad (accumulated delta with threshold), ← → ↑ ↓ PageUp/PageDown, visible
  prev/next buttons, swipe on touch. Enter or click on the dominant panel opens it; clicking a
  side panel focuses it. All without drag or hover requirements.
- Routing: real routes for every item (`/events/<slug>`, `/research`, `/about`, `/join`),
  direct links and reload supported; the gallery index persists in a client store so Back and
  Escape restore the previous position. Focus moves to the detail heading on open and back to
  the trigger on close.
- Motion budget: one entrance sequence (canvas fade, panels settle, text reveal ≈ 1.2 s), damped
  travel, subtle pointer parallax (±2°), one detail transition. Reduced motion: static scene,
  instant switches, parallax off. A visible "Pause motion" toggle stops the continuous drift.
- No audio. No loading counter: HTML nav and text are present before the 3D code loads.

### Assets

- Procedural cover artwork per item: layered SVG gradients/noise in brand colours, used both as
  3D textures and HTML images (`public/covers/*.svg`). No event photography is reused because
  the only candidates are third-party GIFs, publication figures and a starfield stock photo.
- The association's typographic mark (LONGEVITY crossed by K/T/H at the T, seen on the BioArctic
  cover) is recreated as inline SVG text in Outfit. No KTH crest anywhere (the KTH manual limits
  student use of the logo to theses).
- Favicon (`app/icon.svg`) and a share image (`public/og.png`) derived from the mark.

### Principles

1. The gallery is the product: depth, light and travel first; pages second.
2. Every pixel of chrome is small and technical; every pixel of content is calm and readable.
3. Brand light, not brand paint: Tiffany and yellow appear as light and focus, never as fills
   over large areas.
4. Say only what the documents support; empty states are honest and point somewhere useful.

## Review against generic defaults (frontend-design pass)

- Dark + single acid accent is a known tell. Ours is dark + two brand lights (cool and warm),
  with deep green as the actual surface colour, which is the brief's own palette.
- Mono labels are a tell; here they are required by the reference and limited to chrome.
- Removed from the first draft: an eyebrow label above every heading, numbered 01/02/03 team
  markers (teams are not a sequence), card grid with identical shadows on the About page
  (replaced by a typographic people list and a three-column team description without cards).
- Rejected ui-ux-pro-max design-system output: "Scroll-Triggered Storytelling" pattern, pure
  black/white palette, Archivo/Space Grotesk. None describe the reference. Kept from the skill:
  reduced-motion handling, pixel-ratio cap, dispose rules, focus/escape rules, 44 px targets.
