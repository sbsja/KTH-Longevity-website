# Content sources and open questions

Source review of the association's document folder (`KTH Longevity/`, 37 files: 27 .docx, 5 .pptx,
4 .pdf, 1 .xlsx) performed on 3 October 2026. Every file was opened programmatically: paragraphs,
tables, hyperlinks and comments from Word; slide text, speaker notes and embedded media from
PowerPoint; all three sheets of the workbook; text and rendered pages of the PDFs. Images that carry
text (event titles, the mood board, the typographic mark) were rendered and inspected visually.

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
| Constituted as a non-profit association in November 2025 | `Open bank account/Kopia av Konstituerande möte.docx` (3 Nov 2025) | Presented separately from the first-event date |
| Kickoff programme and speaker Linus Petersson | Both decks in `Events/2024 Dec-17` | Talk title from merged deck slide 3 |
| Measuring Aging, 18 Feb 2025, programme, speaker title | `Events/2025 Feb 18/KTH_Longevity_#2.pptx` slides 1–5, 21, 49 | Title attributed "as of February 2025" |
| BioArctic event title | `Events/BioArctic/Bioarctic event.pptx`, `ppt/media/image2.png` | Text exists only inside the image |
| BioArctic event schedule and venue | `ppt/media/image1.png`; `Meetings/Meeting 2026-09-17.docx` | |
| BioArctic topics (blood-brain barrier, transferrin receptor, knob-into-hole, p-tau, dementia) | `Events/BioArctic/Frågor till mentimeter.docx` | Quiz content, used only as topic evidence; figures not published |
| BioArctic event is past | `Meetings/Meeting 2026-09-29.docx` (internally dated 2026-10-01) evaluates it | Exact date not established; shown as "Past event, autumn 2026" |
| Board roles (Chairperson, Vice Chairperson, Partnerships, Communications, Digital Development Leads) and advisors | `Meetings/Meeting 2026-09-29.docx`, reconciled with `Meeting 2026-09-17.docx` and `Open bank account/Årsmöte 2026.05.15.docx` | Julia Stark is Communications Lead in the latest notes (previously Sara E) |
| Team responsibilities | Roles tables in the September/October 2026 notes | "You could" lists are inferred from planning notes and the interview template |
| Instagram `@kthlongevity` | `Meetings/Meeting 2026-01-28.docx`; destination verified live on 3 Oct 2026 (page title "KTH Longevity (@kthlongevity)") | |
| Contact mailbox `kthlongevity@gmail.com` | `Open bank account/Ansökan till sparbankenspira.pdf` (September 2026 application) | Candidate organisation address; confirm before launch |
| Luma used for registration; LinkedIn and TikTok mentioned | `Meetings/Meeting 2025-04-14 Protokoll.docx`, `Meeting 2026-01-28.docx` | No public URLs documented, so none linked |
| Recruitment round closed early October 2026 | `Meetings/Meeting 2026-09-29.docx` ("Formuläret stänger 23:59") | Only a Google Forms editor link exists; never exposed |
| WhatsApp community exists, invite-based | `Meetings/Meeting 2026-09-29.docx` | |
| Planned domain kthlongevity.com | `Meetings/Meeting 2025-04-14 Protokoll.docx` | Planned, not verified as owned or deployed; configurable via `NEXT_PUBLIC_SITE_URL` |
| Brand colours #103430, #FFEA95, #81D8D0; Codec Pro, Helvetica, CAT Neuzeit | `Events/KTH Longevity Mood Board.pdf` (Canva, Jan 2025) | Fonts substituted, see below |
| Typographic mark (LONGEVITY crossed by K/T/H) | BioArctic cover image | Recreated as live text |
| KTH logo must not be used by the association | `Graphic Design, Socials etc/KTH Grafisk manual.pdf` p. 6 (students may use it only for theses) | No crest anywhere on the site |
| Research items (13) | `Research/v.4.docx` to `v.12.docx` | Each DOI checked against Crossref / Europe PMC / publisher pages on 3 Oct 2026 for title, venue, year and article type; summaries rewritten; proxy links replaced |

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

- All cover artwork, the favicon and the share image are generated from code
  (`scripts/make-og.mjs`; covers from a one-off generator kept outside the repo and reproducible
  from `docs/DESIGN-PLAN.md`). No deck images were reused: the candidates were third-party GIFs,
  a starfield stock photo, publication figures and company logos.
- No portraits of members are used or generated.

## Open questions for the board (owner review before publishing)

1. **Contact address.** `kthlongevity@gmail.com` is taken from the bank application. Confirm it is
   the public mailbox and who reads it. Change in `src/content/links.ts`.
2. **BioArctic event date and speakers.** Add the exact date (the documents only bracket it
   between 17 September and 1 October 2026) and the presenters' full names and titles if BioArctic
   agrees. Edit `src/content/events.ts`.
3. **People list.** The May 2026 annual meeting also elected Lilja Kearing (secretary) and
   Sara Erman (board member); the October 2026 role list does not name them. Decide whether to list
   them and with which roles. Edit `src/content/people.ts`.
4. **Membership terms.** State the fee (or that there is none) once the annual meeting's decision is
   confirmed. Currently the site says terms are set by the annual meeting.
5. **Public registration and application links.** Add the Luma page and the public application form
   URL when they exist; the Join page switches from the email route automatically
   (`links.recruitmentForm`, `links.luma`).
6. **Partners.** Cellcolabs appears in planning notes as a prospective funding partner with a
   5 000 SEK contribution referenced in 2026. Nothing is published about partners until the
   relationship and its wording are confirmed.
7. **Next event.** The 6 November 2026 Bioteknikdagarna morning slot, the cooking class, yoga and
   running ideas are proposals without settled details and are not listed. Add an event record with
   `status: "upcoming"` and a verified registration URL when confirmed.
8. **Domain.** Register or confirm kthlongevity.com before setting `NEXT_PUBLIC_SITE_URL`.
9. **Licensed typefaces.** If the board buys Codec Pro web licences, replace Outfit.

## Unreadable or unused material (logged, not guessed)

- Eleven embedded images in the merged kickoff deck are MPO (multi-picture) photos that the
  parser could not decode; they are guest-speaker event photos and were not needed.
- The 26 MB video in the merged deck ("Forever Young Spain") was not opened.
- `Research/v.9-11.docx` contains links only; not curated.
- The bank application PDFs were read only for the organisation mailbox; personal data ignored.
