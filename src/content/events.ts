import type { EventRecord } from "./types";

/**
 * Events the documents actually support. Dates are only structured (iso) when
 * a source states the day. Registration links are only set for confirmed
 * upcoming events with a verified public URL. Meeting proposals (a cooking
 * class, yoga, a running club, a Bioteknikdagarna morning slot) are not events
 * and are not listed.
 */
export const events: EventRecord[] = [
  {
    slug: "breaking-through-the-blood-brain-barrier",
    title: "Breaking Through the Blood-Brain Barrier",
    subtitle: "With BioArctic",
    status: "past",
    date: { display: "Autumn 2026", precision: "season", sortKey: "2026-09-24" },
    venue: "KTH Innovation, Stockholm",
    format: "Talk, quiz and networking",
    presentedWith: "BioArctic",
    summary:
      "An evening with BioArctic on treating the brain: why most antibodies never reach it, how researchers engineer ways across the blood-brain barrier, and what anyone can do about dementia risk.",
    description: [
      "KTH Longevity invited the Stockholm biopharma company BioArctic to KTH Innovation for an evening about one of neuroscience's hardest delivery problems. The blood-brain barrier keeps the vast majority of conventional antibodies out of the brain. BioArctic's presenters explained the strategies researchers use to get therapeutic molecules across it, including transport via the transferrin receptor, which cells naturally use to take up iron, and the knob-into-hole approach to assembling bispecific antibodies.",
      "The presenters also covered the ground that makes this work matter: how Alzheimer's disease relates to the wider group of dementias, why brain changes can begin years before symptoms, and how biomarkers such as phosphorylated tau are used to support diagnosis and to select participants for clinical studies. The science presented belongs to BioArctic and its researchers.",
      "A live quiz on dementia and Alzheimer's disease followed, and the evening closed with a talk on how to lower your own dementia risk, then networking. More than 300 registrations were approved for the venue, which made it the association's largest evening so far.",
    ],
    speakers: [
      {
        name: "Speakers from BioArctic",
        roleAtEvent: "Presenting",
        note: "Two members of BioArctic's team presented. Their full names will be added once confirmed.",
      },
    ],
    topics: [
      "The blood-brain barrier",
      "Antibody engineering for brain delivery",
      "Alzheimer's disease and dementia",
      "Lowering dementia risk",
    ],
    programme: [
      { time: "17:00", title: "Doors open and registration" },
      { time: "17:30", title: "Welcome from KTH Longevity" },
      { time: "17:45", title: "BioArctic on treating the brain" },
      { time: "18:30", title: "Live quiz on dementia" },
      { time: "18:40", title: "How to lower your dementia risk" },
      { time: "19:00", title: "Event ends, networking" },
    ],
    registrationUrl: null,
    cover: {
      id: "stage-1-interphase",
      alt: "Illustration: a translucent cell in interphase, its nucleus intact with diffuse chromatin, before division begins.",
      palette: "tiffany",
    },
    sources: [
      { path: "Events/BioArctic/Bioarctic event.pptx", note: "Title in ppt/media/image2.png; schedule in image1.png" },
      { path: "Events/BioArctic/Frågor till mentimeter.docx", note: "Quiz topics" },
      { path: "Meetings/Meeting 2026-09-17.docx", note: "Venue, programme, roles and registration count (390 registered, 301 approved)" },
      { path: "Meetings/Meeting 2026-09-29.docx", note: "Evaluation (internally dated 2026-10-01); supports past status" },
    ],
  },
  {
    slug: "medai-hackathon",
    title: "MedAI Hackathon",
    subtitle: "With KTH AI Society and ABC Labs",
    status: "past",
    date: { iso: "2025-09-22", display: "22 to 28 September 2025", precision: "day" },
    venue: "ABC Labs at Forskaren and KTH Innovation, Stockholm",
    format: "One-week hackathon",
    presentedWith: "KTH AI Society, ABC Labs and KTH Innovation",
    summary:
      "A one-week machine-learning hackathon co-hosted with KTH AI Society and ABC Labs: teams built models to identify negative drug-testing samples in diagnostics data, from a kick-off at ABC Labs to a demo day.",
    description: [
      "Together with KTH AI Society, the diagnostics company ABC Labs and KTH Innovation, KTH Longevity co-hosted a hackathon on a real problem in laboratory automation. Thousands of drug-test samples analysed by liquid chromatography and mass spectrometry (LC-MS) need manual review so that nothing is missed. Teams of up to four were asked to build a machine-learning model that confidently identifies the negative samples, so that human reviewers can concentrate on the rest.",
      "The week opened with a kick-off at ABC Labs' office in Forskaren, continued with a sprint weekend at KTH Innovation and ended with a demo day. The winning team shared a prize of 10,000 SEK. The challenge and the data belonged to ABC Labs; the hackathon was organised and hosted by KTH AI Society with KTH Longevity as a partner.",
    ],
    speakers: [],
    topics: ["Machine learning for diagnostics", "LC-MS drug testing", "Laboratory automation", "Student hackathons"],
    programme: [
      { time: "22 Sep", title: "Kick-off at ABC Labs, Forskaren" },
      { time: "27–28 Sep", title: "Sprint weekend at KTH Innovation" },
      { time: "2 Oct", title: "Demo day" },
    ],
    registrationUrl: null,
    externalUrl: "https://luma.com/kj9a6ciq",
    externalLabel: "Event page on Luma",
    cover: {
      id: "stage-3-prometaphase",
      alt: "Illustration: a cell in prometaphase, spindle fibres reaching scattered chromosomes after the nuclear envelope has gone.",
      palette: "mixed",
    },
    sources: [
      { path: "https://luma.com/kj9a6ciq", note: "Public event page by KTH AI Society: dates, venue, challenge, prize, co-hosts (read 5 October 2026)" },
      { path: "Meetings/KTH AI Society _ KTH Longevity.docx", note: "Planning of the ABC Labs hackathon with KTH AI Society" },
      { path: "Meetings/Meeting 2024-09-23.docx", note: "Kick-off 22 Sep and hacking 27–28 Sep; the file name says 2024 but the content matches September 2025" },
    ],
  },
  {
    slug: "measuring-aging",
    title: "Measuring Aging",
    subtitle: "With Karolina Gustavsson, Karolinska Institutet",
    status: "past",
    date: { iso: "2025-02-18", display: "18 February 2025", precision: "day" },
    format: "Talk and discussion",
    summary:
      "How do you measure how fast someone is ageing? Karolina Gustavsson on biological age, ageing clocks and what they reveal about dementia risk.",
    description: [
      "KTH Longevity's second event asked a deceptively simple question: how do you measure ageing? Karolina Gustavsson, at the time a PhD student in the Hägg group at Karolinska Institutet and a former KTH biotechnology student, walked through the difference between chronological and biological age, the generations of epigenetic and physiological ageing clocks, and why different clocks capture different aspects of ageing.",
      "The second half turned to her doctoral project on biological ageing and the risk of dementia, built on Swedish cohort and registry data. Her take-home messages: different clocks predict outcomes differently, and in the data she presented, higher physiological biological age in mid-life was associated with increased risk of several dementia types. The research belongs to her and her supervisors at Karolinska Institutet and KTH.",
      "She closed with resources for curious students, and the evening continued with an interactive discussion and networking.",
    ],
    speakers: [
      {
        name: "Karolina Gustavsson",
        roleAtEvent: "Speaker",
        affiliationAtEvent: "PhD student in the Hägg group, Karolinska Institutet, as of February 2025",
      },
    ],
    topics: [
      "Biological versus chronological age",
      "Epigenetic and physiological ageing clocks",
      "Biological ageing and dementia risk",
      "Registry-based research in Sweden",
    ],
    programme: [
      { time: "17:30", title: "Doors open" },
      { time: "18:00", title: "Presentation by Karolina Gustavsson" },
      { time: "18:30", title: "Interactive discussion" },
      { time: "19:00", title: "Networking and continued mingling" },
    ],
    registrationUrl: null,
    cover: {
      id: "stage-2-prophase",
      alt: "Illustration: a cell in prophase, chromosomes condensing inside the nucleus while two centrosomes move apart.",
      palette: "yellow",
    },
    sources: [{ path: "Events/2025 Feb 18/KTH_Longevity_#2.pptx", note: "Programme, speaker title and talk content" }],
  },
  {
    slug: "kickoff-seed",
    title: "Seed: the KTH Longevity kickoff",
    subtitle: "Stage session with Linus Petersson",
    status: "past",
    date: { iso: "2024-12-17", display: "17 December 2024", precision: "day" },
    venue: "KTH, Stockholm",
    format: "Talk and networking",
    summary:
      "The first KTH Longevity evening: a stage session with Linus Petersson on why students should work on ageing, followed by discussion and networking.",
    description: [
      "KTH Longevity introduced itself as a new student association dedicated to connecting students with longevity innovation: learning from leading researchers, key opinion leaders and companies, and advancing the conversation on longevity research.",
      'Guest speaker Linus Petersson gave a stage session titled "Why You Should Work on Aging – and Start a Student Longevity Organization". He argued that ageing is the main risk factor behind most major diseases, surveyed the state of longevity biotech as of 2024, and encouraged students to start and join student longevity organisations. The views and figures in the talk are the speaker\'s own.',
      "The evening opened with mingling over light snacks and closed with networking.",
    ],
    speakers: [
      {
        name: "Linus Petersson",
        roleAtEvent: "Guest speaker",
        note: 'Talk: "Why You Should Work on Aging – and Start a Student Longevity Organization"',
      },
    ],
    topics: ["Why work on ageing", "The longevity industry in 2024", "Student longevity organisations"],
    programme: [
      { time: "17:30", title: "Doors open, mingle over light snacks" },
      { time: "18:00", title: "Stage session with Linus Petersson" },
      { time: "18:45", title: "Wrap-up and closing remarks" },
      { time: "19:00", title: "Networking and continued mingling" },
    ],
    registrationUrl: null,
    cover: {
      id: "stage-4-metaphase",
      alt: "Illustration: a cell in metaphase, chromosomes lined up on the equator between two spindle poles.",
      palette: "mixed",
    },
    sources: [
      { path: "Events/2024 Dec-17/KTH Longevity kickoff.pptx", note: "Programme and association intro" },
      { path: "Events/2024 Dec-17/merged KTH longevity kickoff .pptx", note: "Date and talk title" },
    ],
  },
];

/** Ordering key: the established day, otherwise the approximate sort key, otherwise the end of time. */
export function eventSortKey(e: EventRecord): string {
  return e.date.iso ?? e.date.sortKey ?? "9999-12-31";
}

/** Confirmed upcoming events, soonest first. */
export const upcomingEvents: EventRecord[] = events
  .filter((e) => e.status === "upcoming")
  .sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)));

/** Past events, newest first. */
export const pastEvents: EventRecord[] = events
  .filter((e) => e.status === "past")
  .sort((a, b) => eventSortKey(b).localeCompare(eventSortKey(a)));

export const nextEventNotice = {
  title: "No confirmed upcoming events yet",
  body: "Dates are announced as soon as they are fixed. Subscribe to the newsletter to hear first, or follow @kthlongevity on Instagram.",
};

export function getEvent(slug: string): EventRecord | undefined {
  return events.find((e) => e.slug === slug);
}

/** The event the home gallery features: the most recent past event, unless an upcoming one is confirmed. */
export const featuredEvent: EventRecord = upcomingEvents[0] ?? pastEvents[0];
