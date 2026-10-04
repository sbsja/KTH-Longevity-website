import type { Metadata } from "next";
import Link from "next/link";
import { Article, Section } from "@/components/page/Article";
import { nextEventNotice, pastEvents, upcomingEvents } from "@/content/events";
import { links, mailto } from "@/content/links";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Events",
  description: "Talks, discussions and networking evenings on longevity science in Stockholm: what is coming up and what we have hosted so far.",
};

export default function EventsPage() {
  return (
    <>
      <Article wide>
        <p className="eyebrow">Events</p>
        <h1>Evenings about a longer, healthier life</h1>
        <p className={`prose lede ${styles.lede}`}>
          A typical evening: doors open, a researcher or a company presents, then discussion and networking. Most take place on
          campus at KTH in Stockholm.
        </p>

        <Section title="Upcoming" id="upcoming">
          {upcomingEvents.length === 0 ? (
            <div className={styles.notice}>
              <p className={styles.noticeTitle}>{nextEventNotice.title}</p>
              <p className="muted">{nextEventNotice.body}</p>
              <div className={styles.noticeActions}>
                <a className="btn btn-primary" href={links.instagram} rel="noopener noreferrer" target="_blank">
                  Follow {links.instagramHandle}
                </a>
                <a className="btn" href={mailto("Tell me about the next KTH Longevity event")}>
                  Email us to be told
                </a>
              </div>
            </div>
          ) : (
            <ul className={styles.list}>
              {upcomingEvents.map((e) => (
                <li key={e.slug}>
                  <Link href={`/events/${e.slug}/`}>{e.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Past events" id="past">
          <ul className={styles.list}>
            {pastEvents.map((e) => (
              <li key={e.slug} className={styles.row}>
                <img src={`/covers/${e.cover.id}.svg`} alt="" width={1200} height={750} loading="lazy" />
                <div>
                  <p className={`${styles.meta} mono`}>
                    <span>{e.date.display}</span>
                    {e.venue && <span>{e.venue}</span>}
                  </p>
                  <h3 className={styles.rowTitle}>
                    <Link href={`/events/${e.slug}/`}>{e.title}</Link>
                  </h3>
                  {e.subtitle && <p className="muted">{e.subtitle}</p>}
                  <p className={styles.summary}>{e.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </Article>
    </>
  );
}
