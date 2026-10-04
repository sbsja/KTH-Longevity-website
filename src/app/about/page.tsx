import type { Metadata } from "next";
import Link from "next/link";
import { Article, Section } from "@/components/page/Article";
import { advisors, board, peopleAsOf, teams } from "@/content/people";
import { site } from "@/content/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "KTH Longevity is an independent non-profit student association in Stockholm that connects students with longevity science and innovation through talks and a community.",
};

export default function AboutPage() {
  return (
    <>
      <Article wide>
        <p className="eyebrow">About</p>
        <h1>{site.tagline}</h1>
        <div className={`prose ${styles.intro}`}>
          <p className="lede">{site.purpose}</p>
          <p>
            In practice that means evenings where a researcher, a clinician or a company presents their work on ageing, and
            students get to ask the questions, argue about the answers and meet people who work on the same problems.
            Speakers present their own research; we host the conversation.
          </p>
          <p>
            KTH Longevity has been active since its first event in {site.history.firstEvent} and was formally constituted as
            an {site.history.legalForm} in {site.history.constituted}. It is run by students and is not an official body of
            the university.
          </p>
        </div>

        <Section title="How it works" id="how">
          <dl className={styles.facts}>
            <div>
              <dt>Events</dt>
              <dd>Talks, discussions and networking, usually on campus at KTH. Doors, a presentation, discussion, mingling.</dd>
            </div>
            <div>
              <dt>Members</dt>
              <dd>
                Anyone who registers as a member and wants to work for the association&apos;s purpose. Membership runs for a
                year from registration; terms, including any fee, are decided by the annual meeting each May.
              </dd>
            </div>
            <div>
              <dt>Teams</dt>
              <dd>Three small teams run the association between events. Team members are recruited in application rounds.</dd>
            </div>
            <div>
              <dt>Partners</dt>
              <dd>
                Companies and research groups take part by speaking at or hosting an evening. Write to the Partnerships team to
                propose one.
              </dd>
            </div>
          </dl>
        </Section>

        <Section title="People" id="people">
          <p className={`muted ${styles.asOf}`}>Board roles as of {peopleAsOf}. The board is elected at the annual meeting each May.</p>
          <ul className={styles.people}>
            {board.map((p) => (
              <li key={p.name}>
                <span className={styles.personName}>{p.name}</span>
                <span className={styles.personRole}>{p.role}</span>
              </li>
            ))}
            {advisors.map((p) => (
              <li key={p.name}>
                <span className={styles.personName}>{p.name}</span>
                <span className={styles.personRole}>{p.role}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Teams" id="teams">
          <div className={styles.teams}>
            {teams.map((t) => (
              <article key={t.id} className={styles.team} aria-labelledby={`team-${t.id}`}>
                <h3 id={`team-${t.id}`}>{t.name}</h3>
                {t.lead && <p className={`${styles.lead} mono`}>Lead: {t.lead}</p>}
                <p>{t.does}</p>
                <p className={`${styles.youCould} mono`}>As a member you could</p>
                <ul className={styles.tasks}>
                  {t.youCould.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className={styles.joinLine}>
            <Link href="/join/" className="btn btn-primary">
              How to get involved
            </Link>
          </p>
        </Section>
      </Article>
    </>
  );
}
