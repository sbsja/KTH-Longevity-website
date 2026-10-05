# Content sources and open questions

Source review of the association's document folder (`KTH Longevity/`, 37 files: 27 .docx, 5 .pptx,
4 .pdf, 1 .xlsx) performed on 3 October 2026 and repeated on 5 October 2026 for the section
revision. Every file was opened programmatically: paragraphs, tables, hyperlinks and comments from
Word; slide text, speaker notes and embedded media from PowerPoint; all three sheets of the
workbook; text and rendered pages of the PDFs. Images that carry text (event titles, the mood
board, the typographic mark) were rendered and inspected visually. The 5 October pass found no file
newer than the 3 October review; the changes below come from reading the same documents for the
new sections and from one public web page.

No personal identity numbers, residential addresses, private email addresses, bank details or
sponsorship terms are reproduced on the site, in its configuration, or in this document.

## Facts used on the site and where they come from

| Fact on the site | Source | Note |
|---|---|---|
| Core message "Connecting students with longevity innovation." | `Events/2024 Dec-17/KTH Longevity kickoff.pptx` slide 2; merged deck slide 2 | Verbatim |
| Purpose statement (About) | `Open bank account/Klar - Stadgar KTH Longevity.docx` §2 | Translated from Swedish |
| Membership runs one year; fee set by the annual meeting | Statutes §4, §5 | No fee amount is recorded anywhere, so none is stated |
| Annual meeting in May elects the board | Statutes §10 | |
| Active since December 2024 | Kickoff decks, dated "Dec 17th, 2024 – KTH" | |
| Constituted as a non-profit association in November 2025 | `Open bank account/Kopia av Konstituerande möte.docx` (3 Nov 2025) | Presented separately from the first-event date, on the About timeline and in the intro |
| Organisation number received, January 2026 | `Meetings/Meeting 2026-01-28.docx` ("Organisationsnummer mottaget") | The number itself is not published |
| Annual meeting 15 May 2026 elected the 2026 board | `Open bank account/Årsmöte 2026.05.15.docx` | |
| Kickoff programme and speaker Linus Petersson | Both decks in `Events/2024 Dec-17` | Talk title from merged deck slide 3 |
| Measuring Aging, 18 Feb 2025, programme, speaker title | `Events/2025 Feb 18/KTH_Longevity_#2.pptx` slides 1–5, 21, 49 | Title attributed "as of February 2025" |
| MedAI Hackathon, 22–28 Sep 2025, co-hosts, venue, challenge, prize | Public event page https://luma.com/kj9a6ciq (KTH AI Society, read 5 Oct 2026); `Meetings/KTH AI Society _ KTH Longevity.docx` (planning: ABC Labs hackathon, jury, prize); `Meetings/Meeting 2024-09-23.docx` (kick-off 22 Sep, hacking 27–28 Sep) | The meeting file is named 2024 but its content (hackathon dates, statutes paperwork before the November 2025 constitution) matches September 2025. The Luma page is linked as "Event page on Luma". No participant names are published |
| BioArctic event title | `Events/BioArctic/Bioarctic event.pptx`, `ppt/media/image2.png` | Text exists only inside the image |
| BioArctic event schedule, venue, registrations (390 registered, 301 approved) | `ppt/media/image1.png`; `Meetings/Meeting 2026-09-17.docx` | Shown as "more than 300 approved registrations" |
| BioArctic topics (blood-brain barrier, transferrin receptor, knob-into-hole, p-tau, dementia) | `Events/BioArctic/Frågor till mentimeter.docx` | Quiz content, used only as topic evidence; figures not published |
| BioArctic event is past | `Meetings/Meeting 2026-09-29.docx` (internally dated 2026-10-01) evaluates it | Exact date not established; shown as "Autumn 2026". The presenters appear in the notes by first name only, so none is published |
| Board roles (Chairperson, Vice Chairperson, Partnerships, Communications, Digital Development Leads) and advisors | `Meetings/Meeting 2026-09-29.docx`, reconciled with `Meeting 2026-09-17.docx` and `Open bank account/Årsmöte 2026.05.15.docx` | Julia Stark is Communications Lead in the latest notes (previously Sara E) |
| Role descriptions on the About page | Responsibilities column of the roles tables (Sept/Oct 2026 notes); treasurer arrangement from the annual meeting §4; welcome by the chair from the 17 Sept programme; hackathon host from the Luma page | Only what the notes say; nothing inferred about individuals |
| Team responsibilities | Roles tables in the September/October 2026 notes | "You could" lists are inferred from planning notes and the interview template |
| First open team recruitment round, autumn 2026 (20 applications, form closed early October) | `Meetings/Meeting 2026-09-29.docx` | Only a Google Forms editor link exists; never exposed |
| Website project milestones | `Meetings/Meeting 2025-04-14 Protokoll.docx` (budget line, domain kthlongevity.com); `Meetings/Meeting 2025-11-03.docx` (website for members after registration); `Meetings/Meeting 2026-01-28.docx` (status, hosting options); this repository (first release, October 2026) | Technologies from `package.json`. No public links: the domain is unverified and the repository's visibility is not documented |
| Instagram `@kthlongevity` | `Meetings/Meeting 2026-01-28.docx`; destination verified live on 3 Oct 2026 (page title "KTH Longevity (@kthlongevity)") | |
| Contact mailbox `kthlongevity@gmail.com` | `Open bank account/Ansökan till sparbankenspira.pdf` (September 2026 application, "e-post där banken kan kontakta er") | Candidate organisation address; confirm before launch |
| Luma used for registration; LinkedIn and TikTok mentioned | `Meetings/Meeting 2025-04-14 Protokoll.docx`, `Meeting 2026-01-28.docx` | No public URLs documented, so none linked |
| WhatsApp community exists, invite-based | `Meetings/Meeting 2026-09-29.docx` | |
| Planned domain kthlongevity.com | `Meetings/Meeting 2025-04-14 Protokoll.docx` | Planned, not verified as owned or deployed; configurable via `NEXT_PUBLIC_SITE_URL` |
| Brand colours #103430, #FFEA95, #81D8D0; Codec Pro, Helvetica, CAT Neuzeit | `Events/KTH Longevity Mood Board.pdf` (Canva, Jan 2025) | Fonts substituted, see below |
| Logo | `Logo/KTH Longevity Logo.png` supplied 5 Oct 2026 (1008 × 480; navy #08283D and nucleus blue #175998 on a mint #E3FAF5 tile) | Copied unchanged to `public/brand/kth-longevity-logo.png`; the header frames the mark's bounding box (x 175–838, y 172–308) with CSS. The source file is untouched |
| KTH logo must not be used by the association | `Graphic Design, Socials etc/KTH Grafisk manual.pdf` p. 6 (students may use it only for theses) | No crest anywhere on the site |
| Research items (13) | `Research/v.4.docx` to `v.12.docx` | Each DOI checked against Crossref / Europe PMC / publisher pages on 3 Oct 2026 for title, venue, year and article type; summaries rewritten; proxy links replaced |

### What was looked for and not found (5 October 2026)

- **Newsletter provider, list or signup URL.** None in any document. Luma is named as the
  registration tool and "Luma - mailutskick" appears once (January 2026) as an idea; no calendar
  or subscribe URL is written down.
- **Contact form service or endpoint.** None. The only form in the documents is the Google Form
  for team applications (editor link only).
- **Job board listings.** No approved vacancy, internship, research position or society role
  intended for public posting. `Sponsors/Företag.xlsx` is an outreach list of companies and
  contacts (not vacancies, and its personal contact details are not reproduced).
  `Recruitment/Interview template.docx` is the internal interview guide for team applicants.
- **Upcoming events.** The 6 November 2026 Bioteknikdagarna morning slot ("venue and start time
  not fixed"), the Yogayama × humm evening planned for 20–21 May 2026, a February 2026 evening with
  Linus Petersson (four candidate dates), the cooking class, yoga and running ideas are proposals
  or plans without a confirmation that they took place; none is listed. A Cellcolabs-hosted
  evening was planned in the 14 April 2025 protocol and `Events/Menti frågor #3.docx` holds
  stem-cell quiz questions that fit it, but no document records that it happened or when.
- **BioArctic presenters.** First names only ("Ken och Susanne") in the 17 September notes.
- **Public application form.** Editor link only.

### Research verification notes

- "Interplay of somatic mutations and epigenetic aging clocks" is a Nature Aging *News & Views* by
  W. Wagner about Koch et al. (2025); the notes treated it as a study. Labelled "Preview article".
- "Everything everywhere all at once" is an Immunity *Preview* of a Science mouse atlas study
  (thirteen organs). Labelled "Preview article", mouse data.
- "Repurposing regulatory toxicology safety data" was a bioRxiv preprint when read. Labelled
  "Preprint, not peer reviewed"; its later status was not checked.
- Items from `v.9-11.docx` (a bare list of ~40 links) were not used.
- The notes' percentages (e.g. "~50 % increase in median lifespan") were not reproduced.

## Font substitution

Codec Pro (Zetafonts) and CAT Neuzeit are commercial families; the mood board does not supply
webfont files or licences. The site uses OFL-licensed, self-hosted families via @fontsource:
Outfit (display, closest match to Codec Pro's geometry), Instrument Sans (body, neutral grotesque)
and JetBrains Mono (compact interface labels only). Swapping in licensed Codec Pro later is a
one-file change in `src/app/layout.tsx`.

## Assets

- All cover artwork, the favicon and the share image are generated from code in the repository
  (`scripts/make-covers.mjs`, `scripts/make-og.mjs`, `scripts/make-backdrop.mjs`). The covers are
  seven original cell-cycle illustrations (interphase to cytokinesis) used as visual motifs for the
  seven gallery cards; they do not describe the sections or events. No deck images were reused: the
  candidates were third-party GIFs, a starfield stock photo, publication figures and company logos.
- The share image (`public/og.png`) now carries the supplied logo, framed the same way as the
  header. The favicon is the cell illustration from the October revision, unchanged.
- Colours: the January 2025 mood board's deep green, pale yellow and Tiffany blue informed the first
  build; on 5 October 2026 the board asked for a light cellular palette (ice mint, aqua, cyan, navy,
  nucleus blue), which the site uses throughout. The supplied logo uses the same navy and nucleus
  blue on the same mint.
- No portraits of members are used or generated.

## Routes: sections, retained pages and redirects

| Route | Status | Notes |
|---|---|---|
| `/about/`, `/events/`, `/projects/`, `/jobs/`, `/newsletter/`, `/contact/` | Primary sections | In the header, the mobile menu, the footer and the home gallery |
| `/events/<slug>/` | Detail pages | One per event record |
| `/research/` | Retained secondary page | The reading notes keep their URL and data; reached from About ("Learning between events") and the footer ("Reading notes"), not from the primary navigation |
| `/explore/` | Redirect to `/` | The list view is gone; the home page lists the same cards in HTML for phones and whenever WebGL is unavailable |
| `/join/` | Redirect to `/about/#participate` | Membership and team information moved into About; participation routes also on Contact |

Redirects are client-side (`router.replace` plus a `<meta http-equiv="refresh">` and a visible
link), because `output: "export"` cannot emit server redirects. Legacy routes are excluded from
the in-session route history so "return to the previous page" never lands on one.

## Forms: integration boundary

Both forms post from the browser to a hosted endpoint configured in `src/content/forms.ts`
(environment variables `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`, `NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT`,
optional `NEXT_PUBLIC_NEWSLETTER_SIGNUP_URL` for a hosted signup page and
`NEXT_PUBLIC_NEWSLETTER_DOUBLE_OPT_IN=true` when the provider confirms by email). The expected
protocol is a JSON POST with `Accept: application/json` and a 2xx answer on success; `encoding:
"form"` is available for providers that only take form encoding. Until an endpoint is set, a
valid submission ends in the visible "not available yet" state with a prefilled email link; the
interface never reports "sent" or "subscribed" without a 2xx from the real service. Only
endpoints designed to be public belong in this file: no API keys.

## Open questions for the board (owner review before publishing)

1. **Contact address.** `kthlongevity@gmail.com` is taken from the bank application. Confirm it is
   the public mailbox and who reads it. Change in `src/content/links.ts`.
2. **Contact form service.** Choose a hosted form service that delivers to that mailbox (any
   service that accepts a JSON POST works; the site has no server) and give the endpoint. Then the
   contact form is tested end to end before launch.
3. **Newsletter service.** Confirm whether the newsletter runs on Luma (a calendar/subscribe URL),
   or on an email provider (its embedded-form endpoint), and whether it uses double opt-in.
4. **Job board scope and first listings.** External longevity/biotech opportunities, internal
   society roles, or both? Provide the first approved listings or where they come from.
5. **BioArctic event date and speakers.** Add the exact date (the documents only bracket it
   between 17 September and 1 October 2026) and the presenters' full names and titles if BioArctic
   agrees. Edit `src/content/events.ts`.
6. **MedAI Hackathon wording.** The record is built from the public Luma page and the planning
   notes. Confirm the wording of KTH Longevity's role and whether the Luma link should stay.
7. **Other past events.** Did the Cellcolabs evening (spring 2025), the February 2026 evening with
   Linus Petersson or the Yogayama × humm evening (20–21 May 2026) take place? If so: date, venue,
   speakers and a sentence on the content, and they are added as past events.
8. **People list.** The May 2026 annual meeting also elected Lilja Kearing (secretary) and
   Sara Erman (board member); the October 2026 role list places both in the Communications team.
   Decide whether to list them and with which roles. Edit `src/content/people.ts`.
9. **Membership terms.** State the fee (or that there is none) once the annual meeting's decision is
   confirmed. Currently the site says terms are set by the annual meeting.
10. **Public registration and application links.** Add the Luma page and the public application form
    URL when they exist (`links.recruitmentForm`, `links.luma`).
11. **Partners.** Cellcolabs appears in planning notes as a prospective funding partner with a
    5 000 SEK contribution referenced in 2026. Nothing is published about partners until the
    relationship and its wording are confirmed.
12. **Next event.** Add an event record with `status: "upcoming"` and a verified registration URL
    when one is confirmed; the Events page and the home gallery switch automatically.
13. **Project links.** Say whether the GitHub repository is public and whether the live domain
    should be linked from the Projects page.
14. **Domain.** Register or confirm kthlongevity.com before setting `NEXT_PUBLIC_SITE_URL`.
15. **Licensed typefaces.** If the board buys Codec Pro web licences, replace Outfit.

## Unreadable or unused material (logged, not guessed)

- Eleven embedded images in the merged kickoff deck are MPO (multi-picture) photos that the
  parser could not decode; they are guest-speaker event photos and were not needed.
- The 26 MB video in the merged deck ("Forever Young Spain") was not opened.
- `Research/v.9-11.docx` contains links only; not curated.
- The bank application PDFs were read only for the organisation mailbox; personal data ignored.
- `Sponsors/Företag.xlsx` and the Cellcolabs meeting notes were read only to confirm that they
  hold no public vacancy or partnership wording; contact details and offers are not reproduced.
