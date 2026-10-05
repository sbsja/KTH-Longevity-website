import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Article, Intro, Section } from "@/components/page/Article";
import { links } from "@/content/links";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to KTH Longevity: general enquiries, collaborations and sponsorship, giving a talk, joining or taking part.",
};

export default function ContactPage() {
  return (
    <Article>
      <p className="eyebrow">Contact</p>
      <h1>Talk to us</h1>
      <Intro>
        <p className="lede">
          Questions, a collaboration idea, a talk you would like to give or hear, or a word about joining: write to the board and
          someone will answer. One mailbox, read by the people who run the association.
        </p>
      </Intro>

      <div className={styles.layout}>
        <Section title="Send a message" id="form">
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </Section>

        <aside className={styles.aside} aria-labelledby="contact-details-title">
          <h2 id="contact-details-title" className={styles.asideTitle}>
            Reach us directly
          </h2>
          <dl className={styles.details}>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${links.contactEmail}`}>{links.contactEmail}</a>
              </dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>
                <a href={links.instagram} rel="noopener noreferrer" target="_blank">
                  {links.instagramHandle}
                </a>
              </dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>KTH Campus, Stockholm. Events usually take place at KTH Innovation.</dd>
            </div>
          </dl>

          <h2 className={styles.asideTitle}>Good reasons to write</h2>
          <ul className={styles.reasons}>
            <li>
              <strong>General enquiries</strong> about the association, an event or the website.
            </li>
            <li>
              <strong>Collaboration and sponsorship:</strong> researchers, clinicians and companies working on ageing who would
              like to present or host an evening, or support one.
            </li>
            <li>
              <strong>Participation:</strong> joining as a member, hearing when the teams recruit, or proposing a project.{" "}
              <Link href="/about/#participate">How participation works</Link>.
            </li>
          </ul>
        </aside>
      </div>
    </Article>
  );
}
