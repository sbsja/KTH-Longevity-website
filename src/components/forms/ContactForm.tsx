"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { forms } from "@/content/forms";
import { links, mailto } from "@/content/links";
import { getProject } from "@/content/projects";
import { submitForm, validateContact, type ContactField, type ContactValues, type FieldErrors } from "@/lib/forms";
import { CheckboxField, ErrorSummary, OutcomePanel, SubmitButton, TextField, TrapField } from "./fields";
import styles from "./Form.module.css";

const labels: Record<ContactField, string> = { name: "Name", email: "Email", subject: "Subject", message: "Message" };

export const contactPurposes = ["General enquiry", "Collaboration or sponsorship", "Giving a talk", "Joining or participating", "Website feedback"];

/** Pre-fills the subject from ?topic=…, so a "Contribute" button elsewhere lands on a ready form. */
function subjectFor(topic: string | null): string {
  if (topic === "website") return getProject("website")?.contactSubject ?? "";
  if (topic === "jobs") return "An opportunity for the job board";
  if (topic === "newsletter") return "Subscribe me to KTH Longevity updates";
  if (topic === "join") return "Joining KTH Longevity";
  return "";
}

type Phase = { kind: "idle" } | { kind: "invalid"; errors: FieldErrors<ContactField> } | { kind: "pending" } | { kind: "sent"; note?: string } | { kind: "failed"; reason: "unconfigured" | "rejected" | "network"; message: string };

export function ContactForm() {
  const params = useSearchParams();
  const uid = useId();
  const [values, setValues] = useState<ContactValues>(() => ({
    name: "",
    email: "",
    subject: subjectFor(params.get("topic")),
    message: "",
  }));
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const fieldErrors: FieldErrors<ContactField> & { consent?: string } = phase.kind === "invalid" ? phase.errors : {};

  const update = (field: ContactField) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (phase.kind === "invalid" && phase.errors[field]) {
      const rest = { ...phase.errors };
      delete rest[field];
      setPhase(Object.keys(rest).length ? { kind: "invalid", errors: rest } : { kind: "idle" });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) return; // a robot filled the hidden field
    const errors: FieldErrors<ContactField> & { consent?: string } = validateContact(values);
    if (!consent) errors.consent = "Tick the box so we may use your details to reply.";
    if (Object.keys(errors).length) {
      setPhase({ kind: "invalid", errors });
      return;
    }
    setPhase({ kind: "pending" });
    const outcome = await submitForm(
      forms.contact.endpoint,
      {
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        _replyto: values.email.trim(),
        _subject: `Website contact: ${values.subject.trim()}`,
      },
      { encoding: forms.contact.encoding },
    );
    if (outcome.ok) setPhase({ kind: "sent", note: outcome.message });
    else setPhase({ kind: "failed", reason: outcome.reason, message: outcome.message });
  };

  const emailFallback = mailto(values.subject.trim() || "Message to KTH Longevity", values.message.trim() || undefined);

  if (phase.kind === "sent") {
    return (
      <OutcomePanel
        tone="success"
        title="Message sent"
        actions={
          <button type="button" className="btn" onClick={() => setPhase({ kind: "idle" })}>
            Send another message
          </button>
        }
      >
        <p>
          Thank you, {values.name.trim() || "we have your message"}. It has reached the board&apos;s mailbox and someone will reply to {values.email.trim()}.
        </p>
      </OutcomePanel>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-describedby={`${uid}-privacy`} data-testid="contact-form">
      {phase.kind === "invalid" && <ErrorSummary errors={fieldErrors} labels={{ ...labels, consent: "Permission to reply" }} />}
      {phase.kind === "failed" && (
        <OutcomePanel
          tone="failure"
          title={phase.reason === "unconfigured" ? "Sending from this page is not available yet" : "The message was not sent"}
          actions={
            <>
              {phase.reason !== "unconfigured" && (
                <button type="button" className="btn btn-primary" onClick={() => setPhase({ kind: "idle" })}>
                  Try again
                </button>
              )}
              <a className={phase.reason === "unconfigured" ? "btn btn-primary" : "btn"} href={emailFallback}>
                Send it by email instead
              </a>
            </>
          }
        >
          <p>
            {phase.reason === "unconfigured"
              ? `Your message is still in the form. Send it to ${links.contactEmail} instead; the button below opens your email app with everything filled in.`
              : `${phase.message} Your message is still in the form, so you can try again or send it by email.`}
          </p>
        </OutcomePanel>
      )}

      <div className={styles.row}>
        <TextField id="name" name="name" label={labels.name} value={values.name} onChange={update("name")} error={fieldErrors.name} autoComplete="name" required />
        <TextField
          id="email"
          name="email"
          type="email"
          inputMode="email"
          label={labels.email}
          value={values.email}
          onChange={update("email")}
          error={fieldErrors.email}
          autoComplete="email"
          required
        />
      </div>
      <TextField
        id="subject"
        name="subject"
        label={labels.subject}
        value={values.subject}
        onChange={update("subject")}
        error={fieldErrors.subject}
        list={`${uid}-purposes`}
        help="A few words on what it is about. Pick a suggestion or write your own."
        required
      />
      <datalist id={`${uid}-purposes`}>
        {contactPurposes.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      <TextField id="message" name="message" label={labels.message} value={values.message} onChange={update("message")} error={fieldErrors.message} multiline rows={7} required />
      <TrapField value={trap} onChange={setTrap} />
      <CheckboxField id="consent" name="consent" checked={consent} onChange={setConsent} error={fieldErrors.consent}>
        KTH Longevity may use my name and email address to reply to this message. They are used for nothing else.
      </CheckboxField>
      <div className={styles.actions}>
        <SubmitButton pending={phase.kind === "pending"} pendingLabel="Sending…">
          Send message
        </SubmitButton>
        <p id={`${uid}-privacy`} className={styles.consentNote}>
          Or write directly to <a href={`mailto:${links.contactEmail}`}>{links.contactEmail}</a>.
        </p>
      </div>
      <p className="visually-hidden" aria-live="polite">
        {phase.kind === "pending" ? "Sending your message" : ""}
      </p>
    </form>
  );
}
