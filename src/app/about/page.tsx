import type { Metadata } from "next";
import Link from "next/link";
import { Article, Intro, Section } from "@/components/page/Article";
import { links, mailto } from "@/content/links";
import { advisors, board, peopleAsOf, teams } from "@/content/people";
import { milestones, site } from "@/content/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "KTH Longevity is an independent non-profit student association in Stockholm that connects students with longevity science and innovation: who we are, what we do, the team, our history and how to take part.",
};

export default function AboutPage() {
  return (
    <Article>
      <p className="eyebrow">About</p>
      <h1>A student community for longevity science</h1>
      <Intro>
        <p className="lede">
          KTH Longevity is an {site.history.legalForm} in {site.city}. We connect students with longevity innovation: the
          researchers, clinicians and companies working on a longer, healthier life.
        </p>
        <p>
          In practice that means evenings where someone presents their work on ageing and students get to ask the questions, argue
          about the answers and meet people who work on the same problems. We have been active since our first event in{" "}
          {site.history.firstEvent} and were formally constituted in {site.history.constituted}. The association is run by students
          and is not an official body of the university.
        </p>
      </Intro>

      <Section title="Our purpose and activities" id="purpose">
        <p className={`prose ${styles.purpose}`}>{site.purpose}</p>
        <dl className={styles.facts}>
          <div>
            <dt>Longevity science, in person</dt>
            <dd>
              Talks, discussions and networking with researchers and companies, usually on campus at KTH. A typical evening: doors
              open, a presentation, discussion, mingling. <Link href="/events/">See the events</Link>.
            </dd>
          </div>
          <div>
            <dt>Learning between events</dt>
            <dd>
              Members keep a running list of papers worth talking about, with the kind of study each one is and what it can and
              cannot tell us. <Link href="/research/">Read the reading notes</Link>.
            </dd>
          </div>
          <div>
            <dt>A community</dt>
            <dd>
              Members meet in a WhatsApp community and at events, and anyone who shares the purpose can join. Membership runs for a
              year from registration; its terms, including any fee, are decided by the annual meeting each May.
            </dd>
          </div>
          <div>
            <dt>Projects and collaborations</dt>
            <dd>
              Right now we are building this website, and we have co-hosted a hackathon with KTH AI Society and ABC Labs.{" "}
              <Link href="/projects/">See the projects</Link>.
            </dd>
          </div>
        </dl>
      </Section>

      <Section title="The team" id="team" lead={`Board roles as of ${peopleAsOf}. The board is elected at the annual meeting each May.`}>
        <ul className={styles.people}>
          {board.map((p) => (
            <li key={p.name}>
              <span className={styles.personName}>{p.name}</span>
              <span className={styles.personRole}>{p.role}</span>
              {p.description && <span className={styles.personText}>{p.description}</span>}
            </li>
          ))}
        </ul>
        <h3 className={styles.subheading}>Advisors</h3>
        <ul className={styles.people}>
          {advisors.map((p) => (
            <li key={p.name}>
              <span className={styles.personName}>{p.name}</span>
              <span className={styles.personRole}>{p.role}</span>
              {p.description && <span className={styles.personText}>{p.description}</span>}
            </li>
          ))}
        </ul>
        <h3 className={styles.subheading}>Teams</h3>
        <div className={styles.teams}>
          {teams.map((t) => (
            <article key={t.id} className={styles.team} aria-labelledby={`team-${t.id}`}>
              <h4 id={`team-${t.id}`}>{t.name}</h4>
              {t.lead && <p className={styles.lead}>Led by {t.lead}</p>}
              <p>{t.does}</p>
              <p className={styles.youCould}>As a member you could</p>
              <ul className={styles.tasks}>
                {t.youCould.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Our history" id="history" lead="The milestones so far, from the first evening to the first teams.">
        <ol className={styles.timeline}>
          {milestones.map((m) => (
            <li key={m.sortKey}>
              <span className={`${styles.when} mono`}>{m.when}</span>
              <div>
                <h3 className={styles.milestoneTitle}>{m.title}</h3>
                <p>{m.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="How to participate" id="participate" lead="Coming to an evening, joining, working in a team and collaborating are different things. Pick the one you mean.">
        <div className={styles.routes}>
          <Link href="/events/" className={styles.route}>
            <span className={styles.routeTitle}>Come to an event</span>
            <span className={styles.routeText}>Open to curious students and anyone interested in the science of ageing. Dates are announced as soon as they are fixed.</span>
          </Link>
          <Link href="/projects/" className={styles.route}>
            <span className={styles.routeTitle}>Work on a project</span>
            <span className={styles.routeText}>Help build the website and the association&apos;s digital tools, whatever your level.</span>
          </Link>
          <Link href="/newsletter/" className={styles.route}>
            <span className={styles.routeTitle}>Get the newsletter</span>
            <span className={styles.routeText}>Society updates, upcoming events and project news by email, when there is something to tell.</span>
          </Link>
          <Link href="/contact/" className={styles.route}>
            <span className={styles.routeTitle}>Get in touch</span>
            <span className={styles.routeText}>Join as a member, propose a talk or a collaboration, or ask anything else.</span>
          </Link>
        </div>
        <div className={styles.membership}>
          <h3>Membership and teams</h3>
          <p>
            Anyone who wants to work for the association&apos;s purpose can register as a member; write to us and say a little
            about why you are interested, and we will send the invitation to the members&apos; community. The Partnerships,
            Communications and Digital Development teams recruit in application rounds, usually at the start of a term, with a
            short interview. The autumn 2026 round has closed.
          </p>
          <div className={styles.actions}>
            <a className="btn btn-primary" href={mailto("Joining KTH Longevity")}>
              Ask to join
            </a>
            {links.recruitmentForm ? (
              <a className="btn" href={links.recruitmentForm} rel="noopener noreferrer" target="_blank">
                Apply to a team
              </a>
            ) : (
              <a className="btn" href={mailto("Tell me when team applications open")}>
                Tell me when applications open
              </a>
            )}
          </div>
        </div>
      </Section>
    </Article>
  );
}
