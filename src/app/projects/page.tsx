import type { Metadata } from "next";
import Link from "next/link";
import { Article, Intro, Section } from "@/components/page/Article";
import { links, mailto } from "@/content/links";
import { projects } from "@/content/projects";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Projects",
  description: "What KTH Longevity is building right now: the association's website, its purpose, status and how to contribute.",
};

export default function ProjectsPage() {
  return (
    <Article>
      <p className="eyebrow">Projects</p>
      <h1>What we are building</h1>
      <Intro>
        <p className="lede">
          One project at the moment: this website. Here is what it is for, where it stands and how to help. New projects are
          added here when the board starts them.
        </p>
      </Intro>

      {projects.map((p) => (
        <article key={p.slug} className={styles.project} aria-labelledby={`project-${p.slug}`}>
          <header className={styles.header}>
            <p className={`${styles.meta} mono`}>
              <span className={styles.status} data-status={p.status}>
                {p.status}
              </span>
              <span>{p.team} team</span>
              {p.lead && <span>Led by {p.lead}</span>}
            </p>
            <h2 id={`project-${p.slug}`} className={styles.projectTitle}>
              {p.title}
            </h2>
            <p className={`prose ${styles.projectSummary}`}>{p.summary}</p>
          </header>

          <div className={styles.columns}>
            <Section title="Why it exists" id={`${p.slug}-purpose`}>
              <div className="prose">
                {p.purpose.map((para) => (
                  <p key={para.slice(0, 24)}>{para}</p>
                ))}
              </div>
            </Section>
            <Section title="What the site provides" id={`${p.slug}-provides`}>
              <ul className={styles.provides}>
                {p.provides.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Section>
          </div>

          <div className={styles.columns}>
            <Section title="Milestones" id={`${p.slug}-milestones`}>
              <ol className={styles.milestones}>
                {p.milestones.map((m) => (
                  <li key={m.when}>
                    <span className={`${styles.when} mono`}>{m.when}</span>
                    <span>{m.what}</span>
                  </li>
                ))}
              </ol>
            </Section>
            <Section title="Built with" id={`${p.slug}-tech`}>
              <ul className={styles.chips}>
                {p.technologies.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              {p.links.length > 0 && (
                <ul className={styles.links}>
                  {p.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} rel="noopener noreferrer" target="_blank">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          <Section title="Contribute" id={`${p.slug}-contribute`}>
            <div className={styles.contribute}>
              <p className="prose">
                The {p.team} team is small and the backlog is not. Members at any level can propose a feature, fix a page, keep
                content current or improve accessibility and performance. Tell us what you would like to work on and what you
                already know; we will take it from there.
              </p>
              <div className={styles.actions}>
                <Link href="/contact/?topic=website" className="btn btn-primary">
                  Write to us about contributing
                </Link>
                <a className="btn" href={mailto(p.contactSubject)}>
                  Email {links.contactEmail}
                </a>
              </div>
            </div>
          </Section>
        </article>
      ))}
    </Article>
  );
}
