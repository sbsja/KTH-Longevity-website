import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Article, Intro, Section } from "@/components/page/Article";
import { forms } from "@/content/forms";
import { links } from "@/content/links";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Society updates, upcoming events and project news from KTH Longevity by email. Subscribe with your email address.",
};

export default function NewsletterPage() {
  const hosted = forms.newsletter.hostedSignupUrl;
  return (
    <Article>
      <p className="eyebrow">Newsletter</p>
      <h1>Hear about the next evening first</h1>
      <Intro>
        <p className="lede">
          Subscribers get society updates, upcoming events, project news and other things from KTH Longevity worth knowing about,
          by email. We write when there is something to tell, not on a schedule.
        </p>
      </Intro>

      <div className={styles.layout}>
        <Section title="Subscribe" id="subscribe">
          {hosted ? (
            <div className={styles.hosted}>
              <p className="prose">Sign up on our hosted page. It takes an email address and nothing more.</p>
              <p className={styles.hostedAction}>
                <a className="btn btn-primary" href={hosted} rel="noopener noreferrer" target="_blank">
                  {forms.newsletter.hostedSignupLabel}
                </a>
              </p>
              <p className={`muted ${styles.or}`}>Or leave your address here:</p>
              <NewsletterForm />
            </div>
          ) : (
            <NewsletterForm />
          )}
        </Section>

        <aside className={styles.aside} aria-labelledby="newsletter-aside-title">
          <h2 id="newsletter-aside-title" className={styles.asideTitle}>
            What to expect
          </h2>
          <ul className={styles.expect}>
            <li>Announcements of upcoming events, with registration details as soon as they are fixed</li>
            <li>What we have hosted, with the recap and the speaker&apos;s topics</li>
            <li>News from projects such as this website, and ways to take part</li>
            <li>Application rounds for the teams and other opportunities</li>
          </ul>
          <h2 className={styles.asideTitle}>Privacy</h2>
          <p className={styles.asideText}>
            Your address is used to send these updates and for nothing else. Every email has an unsubscribe link, and you can
            also ask us to remove you at any time.
          </p>
          <h2 className={styles.asideTitle}>Elsewhere</h2>
          <p className={styles.asideText}>
            Dates also appear on Instagram at{" "}
            <a href={links.instagram} rel="noopener noreferrer" target="_blank">
              {links.instagramHandle}
            </a>
            , and the <Link href="/events/">Events page</Link> always has the current list.
          </p>
        </aside>
      </div>
    </Article>
  );
}
