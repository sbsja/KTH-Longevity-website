import type { Metadata } from "next";
import Link from "next/link";
import { Article, Section } from "@/components/page/Article";
import { links, mailto } from "@/content/links";
import { teams } from "@/content/people";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Join",
  description: "Join the KTH Longevity community, hear about events first, apply to a team, or propose a talk or collaboration.",
};

export default function JoinPage() {
  return (
    <>
      <Article wide>
        <p className="eyebrow">Join</p>
        <h1>Four ways in</h1>
        <p className={`prose lede ${styles.lede}`}>
          Coming to an evening, joining the community, working in a team and proposing a collaboration are different things.
          Pick the one you mean; none of them commits you to the others.
        </p>

        <div className={styles.routes}>
          <Section title="Come to an event" id="events">
            <p>
              Events are open to curious students and anyone interested in the science of ageing. Dates and registration links
              are published on Instagram first; registration is free of charge unless an event page says otherwise.
            </p>
            <div className={styles.actions}>
              <a className="btn btn-primary" href={links.instagram} rel="noopener noreferrer" target="_blank">
                Follow {links.instagramHandle}
              </a>
              <Link className="btn" href="/events/">
                See events
              </Link>
            </div>
          </Section>

          <Section title="Join the community" id="community">
            <p>
              Members get the invitations and the discussions between events. We keep a members&apos; WhatsApp community;
              invitations are sent personally, so write to us and say a little about why you are interested. Membership terms,
              including whether there is a fee, are set by the annual meeting.
            </p>
            <div className={styles.actions}>
              <a className="btn btn-primary" href={mailto("I would like to join KTH Longevity")}>
                Ask to join
              </a>
            </div>
          </Section>

          <Section title="Apply to a team" id="teams">
            <p>
              The {teams.map((t) => t.name).join(", ").replace(/, ([^,]*)$/, " and $1")} teams recruit in application rounds,
              usually at the start of a term, with a short interview. The autumn 2026 round has closed. Email us and we will tell
              you when the next one opens.
            </p>
            <ul className={styles.teamList}>
              {teams.map((t) => (
                <li key={t.id}>
                  <span className={styles.teamName}>{t.name}</span>
                  <span className="muted">{t.does}</span>
                </li>
              ))}
            </ul>
            <div className={styles.actions}>
              {links.recruitmentForm ? (
                <a className="btn btn-primary" href={links.recruitmentForm} rel="noopener noreferrer" target="_blank">
                  Apply now
                </a>
              ) : (
                <a className="btn btn-primary" href={mailto("Tell me when team applications open")}>
                  Tell me when applications open
                </a>
              )}
              <Link className="btn" href="/about/#teams">
                What the teams do
              </Link>
            </div>
          </Section>

          <Section title="Propose a talk or collaboration" id="collaborate">
            <p>
              Researchers, clinicians and companies working on ageing: we would like to hear from you. An evening typically
              means a 30 to 45 minute presentation followed by discussion, in front of an engaged student audience in
              Stockholm. We also welcome sponsorship of individual events.
            </p>
            <div className={styles.actions}>
              <a className="btn btn-primary" href={mailto("Collaboration with KTH Longevity")}>
                Write to the Partnerships team
              </a>
            </div>
          </Section>
        </div>

        <p className={`muted ${styles.contact}`}>
          All routes go to one mailbox, <a href={`mailto:${links.contactEmail}`}>{links.contactEmail}</a>, read by the board.
        </p>
      </Article>
    </>
  );
}
