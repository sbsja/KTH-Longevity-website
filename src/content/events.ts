import type { EventRecord } from "./types";

/**
 * Events the documents actually support. Dates are only structured (iso) when
 * a source states the day. Registration links are only set for confirmed
 * upcoming events with a verified public URL.
 */
export const events: EventRecord[] = [
  {
    slug: "breaking-through-the-blood-brain-barrier",
    title: "Breaking Through the Blood-Brain Barrier",
    subtitle: "With BioArctic",
    status: "past",
    date: { display: "Past event, autumn 2026", precision: "season" },
    venue: "KTH Innovation, Stockholm",
    presentedWith: "BioArctic",
    summary:
      "An evening with BioArctic on treating the brain: why most antibodies never reach it, how researchers engineer ways across the blood-brain barrier, and what anyone can do about dementia risk.",
    description: [
      "KTH Longevity invited the Stockholm biopharma company BioArctic to KTH Innovation for an evening about one of neuroscience's hardest delivery problems. The blood-brain barrier keeps the vast majority of conventional antibodies out of the brain. BioArctic's presenters explained the strategies researchers use to get therapeutic molecules across it, including transport via the transferrin receptor, which cells naturally use to take up iron, and the knob-into-hole approach to assembling bispecific antibodies.",
      "The presenters also covered the ground that makes this work matter: how Alzheimer's disease relates to the wider group of dementias, why brain changes can begin years before symptoms, and how biomarkers such as phosphorylated tau are used to support diagnosis and to select participants for clinical studies. The science presented belongs to BioArctic and its researchers.",
      "A live quiz on dementia and Alzheimer's disease followed, and the evening closed with a talk on how to lower your own dementia risk, then networking.",
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
      id: "blood-brain-barrier",
      alt: "Abstract artwork: two translucent membranes in deep green with a Tiffany-blue thread passing through them.",
      palette: "tiffany",
    },
    sources: [
      { path: "Events/BioArctic/Bioarctic event.pptx", note: "Title in ppt/media/image2.png; schedule in image1.png" },
      { path: "Events/BioArctic/Frågor till mentimeter.docx", note: "Quiz topics" },
      { path: "Meetings/Meeting 2026-09-17.docx", note: "Venue, programme and roles" },
      { path: "Meetings/Meeting 2026-09-29.docx", note: "Evaluation (internally dated 2026-10-01); supports past status" },
    ],
  },
  {
    slug: "measuring-aging",
    title: "Measuring Aging",
    subtitle: "With Karolina Gustavsson, Karolinska Institutet",
    status: "past",
    date: { iso: "2025-02-18", display: "18 February 2025", precision: "day" },
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
      id: "measuring-aging",
      alt: "Abstract artwork: concentric rings like a clock face, drawn in pale yellow light on deep green.",
      palette: "yellow",
    },
    sources: [
      { path: "Events/2025 Feb 18/KTH_Longevity_#2.pptx", note: "Programme, speaker title and talk content" },
    ],
  },
  {
    slug: "kickoff-seed",
    title: "Seed: the KTH Longevity kickoff",
    subtitle: "Stage session with Linus Petersson",
    status: "past",
    date: { iso: "2024-12-17", display: "17 December 2024", precision: "day" },
    venue: "KTH, Stockholm",
    summary:
      "The first KTH Longevity evening: a stage session with Linus Petersson on why students should work on ageing, followed by discussion and networking.",
    description: [
      "KTH Longevity introduced itself as a new student association dedicated to connecting students with longevity innovation: learning from leading researchers, key opinion leaders and companies, and advancing the conversation on longevity research.",
      "Guest speaker Linus Petersson gave a stage session titled \"Why You Should Work on Aging – and Start a Student Longevity Organization\". He argued that ageing is the main risk factor behind most major diseases, surveyed the state of longevity biotech as of 2024, and encouraged students to start and join student longevity organisations. The views and figures in the talk are the speaker's own.",
      "The evening opened with mingling over light snacks and closed with networking.",
    ],
    speakers: [
      {
        name: "Linus Petersson",
        roleAtEvent: "Guest speaker",
        note: "Talk: \"Why You Should Work on Aging – and Start a Student Longevity Organization\"",
      },
    ],
    topics: [
      "Why work on ageing",
      "The longevity industry in 2024",
      "Student longevity organisations",
    ],
    programme: [
      { time: "17:30", title: "Doors open, mingle over light snacks" },
      { time: "18:00", title: "Stage session with Linus Petersson" },
      { time: "18:45", title: "Wrap-up and closing remarks" },
      { time: "19:00", title: "Networking and continued mingling" },
    ],
    registrationUrl: null,
    cover: {
      id: "seed",
      alt: "Abstract artwork: a sphere made of small dots, lit from one side, on deep green.",
      palette: "mixed",
    },
    sources: [
      { path: "Events/2024 Dec-17/KTH Longevity kickoff.pptx", note: "Programme and association intro" },
      { path: "Events/2024 Dec-17/merged KTH longevity kickoff .pptx", note: "Date and talk title" },
    ],
  },
];

export const upcomingEvents: EventRecord[] = events.filter((e) => e.status === "upcoming");

export const pastEvents: EventRecord[] = events
  .filter((e) => e.status === "past")
  .sort((a, b) => {
    // Events without an established day sort first (most recent by season).
    if (!a.date.iso && b.date.iso) return -1;
    if (a.date.iso && !b.date.iso) return 1;
    return (b.date.iso ?? "").localeCompare(a.date.iso ?? "");
  });

export const nextEventNotice = {
  title: "Next event to be announced",
  body: "Dates and registration links are published on Instagram first. Follow @kthlongevity or write to us and we will tell you when the next evening is confirmed.",
};

export function getEvent(slug: string): EventRecord | undefined {
  return events.find((e) => e.slug === slug);
}
