import type { Metadata } from "next";
import { Article, Section } from "@/components/page/Article";
import { research, researchByTopic, researchIntro } from "@/content/research";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Research reading notes",
  description:
    "A curated reading list on ageing science from KTH Longevity members: ageing clocks, telomeres, immune ageing, diet and environment, with the kind of study each one is.",
};

const typeTone: Record<string, string> = {
  "Human cohort study": "human",
  "Human observational study": "human",
  "Mouse study": "animal",
  "Cell study": "cell",
  Review: "review",
  "Preview article": "review",
  "Preprint, not peer reviewed": "preprint",
};

export default function ResearchPage() {
  const groups = researchByTopic();
  return (
    <>
      <Article wide>
        <p className="eyebrow">Research</p>
        <h1>{researchIntro.title}</h1>
        <p className={`prose lede ${styles.lede}`}>{researchIntro.lede}</p>
        <p className={`prose muted ${styles.note}`}>{researchIntro.note}</p>

        <p className={`${styles.legend} mono`} aria-label="Study types">
          <span data-tone="human">Human studies</span>
          <span data-tone="animal">Animal studies</span>
          <span data-tone="cell">Cell studies</span>
          <span data-tone="review">Reviews and previews</span>
          <span data-tone="preprint">Preprints</span>
        </p>

        {groups.map((g) => (
          <Section key={g.topic} title={g.topic} id={g.topic.toLowerCase().replace(/\s+/g, "-")}>
            <ul className={styles.items}>
              {g.items.map((r) => (
                <li key={r.id} className={styles.item}>
                  <p className={`${styles.type} mono`} data-tone={typeTone[r.studyType]}>
                    {r.studyType}
                  </p>
                  <h3 className={styles.title}>
                    <a href={r.url} rel="noopener noreferrer" target="_blank">
                      {r.title}
                    </a>
                  </h3>
                  <p className={`${styles.venue} muted`}>
                    {r.journal}, {r.year}
                  </p>
                  <p className={styles.summary}>{r.summary}</p>
                  {r.caveat && (
                    <p className={styles.caveat}>
                      <span className={`${styles.caveatLabel} mono`}>Keep in mind</span> {r.caveat}
                    </p>
                  )}
                  <p className={`${styles.doi} mono`}>
                    <a href={r.url} rel="noopener noreferrer" target="_blank">
                      doi:{r.doi}
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        ))}

        <p className={`muted ${styles.count}`}>
          {research.length} papers, checked against publisher metadata in October 2026. Suggest one by email.
        </p>
      </Article>
    </>
  );
}
