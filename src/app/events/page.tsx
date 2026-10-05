import type { Metadata } from "next";
import Link from "next/link";
import { Article, Intro, Section } from "@/components/page/Article";
import { nextEventNotice, pastEvents, upcomingEvents } from "@/content/events";
import { links } from "@/content/links";
import type { EventRecord } from "@/content/types";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Events",
  description: "Talks, discussions and networking evenings on longevity science in Stockholm: what is coming up and what we have hosted so far.",
};

function EventCard({ e, upcoming }: { e: EventRecord; upcoming?: boolean }) {
  return (
    <li className={styles.row}>
      <Link href={`/events/${e.slug}/`} className={styles.thumbLink} tabIndex={-1} aria-hidden="true">
        <img src={`/covers/${e.cover.id}.svg`} alt="" width={1200} height={750} loading="lazy" />
      </Link>
      <div className={styles.rowBody}>
        <p className={`${styles.meta} mono`}>
          <span>{e.date.display}</span>
          {e.format && <span>{e.format}</span>}
          {e.venue && <span>{e.venue}</span>}
        </p>
        <h3 className={styles.rowTitle}>
          <Link href={`/events/${e.slug}/`}>{e.title}</Link>
        </h3>
        {e.subtitle && <p className={styles.subtitle}>{e.subtitle}</p>}
        <p className={styles.summary}>{e.summary}</p>
        <p className={styles.rowActions}>
          <Link href={`/events/${e.slug}/`} className="btn">
            {upcoming ? "About the event" : "Read about the event"}
          </Link>
          {upcoming && e.registrationUrl && (
            <a className="btn btn-primary" href={e.registrationUrl} rel="noopener noreferrer" target="_blank">
              Register
            </a>
          )}
          {e.externalUrl && (
            <a className={styles.external} href={e.externalUrl} rel="noopener noreferrer" target="_blank">
              {e.externalLabel ?? "Event page"}
            </a>
          )}
        </p>
      </div>
    </li>
  );
}

export default function EventsPage() {
  return (
    <Article>
      <p className="eyebrow">Events</p>
      <h1>Evenings about a longer, healthier life</h1>
      <Intro>
        <p className="lede">
          A typical evening: doors open, a researcher or a company presents, then discussion and networking. Most take place on
          campus at KTH in Stockholm, and all of them are open to curious students.
        </p>
      </Intro>

      <Section title="Upcoming events" id="upcoming">
        {upcomingEvents.length === 0 ? (
          <div className={styles.notice} data-testid="upcoming-empty">
            <p className={styles.noticeTitle}>{nextEventNotice.title}</p>
            <p className="muted">{nextEventNotice.body}</p>
            <div className={styles.noticeActions}>
              <Link className="btn btn-primary" href="/newsletter/">
                Get the newsletter
              </Link>
              <a className="btn" href={links.instagram} rel="noopener noreferrer" target="_blank">
                Follow {links.instagramHandle}
              </a>
            </div>
          </div>
        ) : (
          <ul className={styles.list}>
            {upcomingEvents.map((e) => (
              <EventCard key={e.slug} e={e} upcoming />
            ))}
          </ul>
        )}
      </Section>

      <Section title="Past events" id="past" lead="Newest first. Each page keeps the programme, the speakers and the topics of the evening.">
        <ul className={styles.list}>
          {pastEvents.map((e) => (
            <EventCard key={e.slug} e={e} />
          ))}
        </ul>
      </Section>
    </Article>
  );
}
