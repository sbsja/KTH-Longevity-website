import type { Metadata } from "next";
import Link from "next/link";
import { Article, Intro, Section } from "@/components/page/Article";
import { formatJobDate, jobs, jobsIntro, splitJobs } from "@/content/jobs";
import type { JobListing } from "@/content/types";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Job board",
  description: "Roles in KTH Longevity and positions at organisations working on longevity, posted once they are confirmed.",
};

function Listing({ job, expired }: { job: JobListing; expired?: boolean }) {
  return (
    <li className={`${styles.listing} ${expired ? styles.expired : ""}`} data-state={expired ? "expired" : "open"}>
      <div className={styles.listingHead}>
        <p className={`${styles.type} mono`}>
          <span>{job.type}</span>
          {expired && <span className={styles.expiredTag}>Closed</span>}
        </p>
        <h3 className={styles.listingTitle}>{job.title}</h3>
        <p className={styles.org}>{job.organisation}</p>
      </div>
      <dl className={styles.details}>
        <div>
          <dt>Location</dt>
          <dd>
            {job.location}
            {job.arrangement ? `, ${job.arrangement.toLowerCase()}` : ""}
          </dd>
        </div>
        <div>
          <dt>Deadline</dt>
          <dd>{job.deadline ? formatJobDate(job.deadline) : "Until filled"}</dd>
        </div>
        <div>
          <dt>Posted</dt>
          <dd>{formatJobDate(job.postedOn)}</dd>
        </div>
      </dl>
      {job.summary && <p className={styles.summary}>{job.summary}</p>}
      <p className={styles.apply}>
        {expired ? (
          <span className="muted">Applications have closed.</span>
        ) : (
          <a className="btn btn-primary" href={job.applyUrl} rel="noopener noreferrer" target="_blank">
            Apply at {job.organisation}
          </a>
        )}
      </p>
    </li>
  );
}

export default function JobsPage() {
  const { open, expired } = splitJobs(jobs);
  return (
    <Article>
      <p className="eyebrow">Job board</p>
      <h1>{jobsIntro.title}</h1>
      <Intro>
        <p className="lede">{jobsIntro.lede}</p>
      </Intro>

      <Section title="Open opportunities" id="open">
        {open.length === 0 ? (
          <div className={styles.empty} data-testid="jobs-empty">
            <p className={styles.emptyTitle}>Nothing open right now</p>
            <p className="muted">
              When a team recruitment round opens or a partner confirms a position, it is posted here. In the meantime, tell us
              about an opportunity you think belongs on the board, or subscribe to hear when something opens.
            </p>
            <div className={styles.actions}>
              <Link href="/contact/?topic=jobs" className="btn btn-primary">
                Tell us about an opportunity
              </Link>
              <Link href="/newsletter/" className="btn">
                Hear when something opens
              </Link>
            </div>
          </div>
        ) : (
          <ul className={styles.list}>
            {open.map((job) => (
              <Listing key={job.id} job={job} />
            ))}
          </ul>
        )}
      </Section>

      {expired.length > 0 && (
        <Section title="Closed" id="closed" lead="Kept for a while so that an old link still explains what it pointed to.">
          <ul className={styles.list}>
            {expired.map((job) => (
              <Listing key={job.id} job={job} expired />
            ))}
          </ul>
        </Section>
      )}
    </Article>
  );
}
