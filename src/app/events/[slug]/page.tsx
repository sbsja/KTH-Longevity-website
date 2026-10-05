import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Article, Section } from "@/components/page/Article";
import { events, getEvent, pastEvents, upcomingEvents } from "@/content/events";
import styles from "./page.module.css";

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(props: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const e = getEvent(slug);
  if (!e) return {};
  const title = e.subtitle ? `${e.title}, ${e.subtitle.replace(/^With /, "with ")}` : e.title;
  return {
    title,
    description: e.summary,
    openGraph: { title, description: e.summary, type: "article", images: [{ url: "/og.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: e.summary, images: ["/og.png"] },
  };
}

export default async function EventPage(props: PageProps<"/events/[slug]">) {
  const { slug } = await props.params;
  const e = getEvent(slug);
  if (!e) notFound();
  const others = [...upcomingEvents, ...pastEvents].filter((x) => x.slug !== e.slug);
  const statusLabel = e.status === "past" ? "Past event" : e.status === "upcoming" ? "Upcoming event" : "To be announced";

  return (
    <Article>
      <p className={`${styles.meta} mono`}>
        <span>{statusLabel}</span>
        <span>{e.date.display}</span>
        {e.format && <span>{e.format}</span>}
        {e.venue && <span>{e.venue}</span>}
      </p>
      <h1 id="event-title" tabIndex={-1} className={styles.title}>
        {e.title}
      </h1>
      {e.subtitle && <p className={styles.subtitle}>{e.subtitle}</p>}

      <div className={styles.hero}>
        <img className={styles.cover} src={`/covers/${e.cover.id}.svg`} alt={e.cover.alt} width={1200} height={750} />
        <div className={`prose ${styles.lead}`}>
          <p className="lede">{e.summary}</p>
          {e.description.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
          {(e.registrationUrl || e.externalUrl) && (
            <p className={styles.links}>
              {e.status === "upcoming" && e.registrationUrl && (
                <a className="btn btn-primary" href={e.registrationUrl} rel="noopener noreferrer" target="_blank">
                  Register
                </a>
              )}
              {e.externalUrl && (
                <a className="btn" href={e.externalUrl} rel="noopener noreferrer" target="_blank">
                  {e.externalLabel ?? "Event page"}
                </a>
              )}
            </p>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {(e.speakers.length > 0 || e.presentedWith) && (
          <Section title={e.speakers.length > 1 ? "Speakers" : e.speakers.length === 1 ? "Speaker" : "Hosts"} id="speakers">
            {e.speakers.length > 0 && (
              <ul className={styles.plainList}>
                {e.speakers.map((s) => (
                  <li key={s.name}>
                    <p className={styles.speakerName}>{s.name}</p>
                    {s.roleAtEvent && <p className="muted">{s.roleAtEvent}</p>}
                    {s.affiliationAtEvent && <p className="muted">{s.affiliationAtEvent}</p>}
                    {s.note && <p className={`muted ${styles.note}`}>{s.note}</p>}
                  </li>
                ))}
              </ul>
            )}
            {e.presentedWith && <p className={`muted ${styles.note}`}>Presented with {e.presentedWith}.</p>}
          </Section>
        )}

        <Section title="Topics" id="topics">
          <ul className={styles.topics}>
            {e.topics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Section>

        <Section title="Programme" id="programme">
          <ol className={styles.programme}>
            {e.programme.map((p) => (
              <li key={`${p.time}-${p.title}`}>
                {p.time && <span className={`${styles.time} mono`}>{p.time}</span>}
                <span>{p.title}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <Section title="More events" id="more">
        <ul className={styles.more}>
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/events/${o.slug}/`}>{o.title}</Link>
              <span className="muted"> · {o.date.display}</span>
            </li>
          ))}
          <li>
            <Link href="/events/">All events, upcoming and past</Link>
          </li>
        </ul>
      </Section>
    </Article>
  );
}
