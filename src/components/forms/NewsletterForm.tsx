"use client";

import { useId, useState } from "react";
import { forms } from "@/content/forms";
import { links, mailto } from "@/content/links";
import { submitForm, validateNewsletter, type FieldErrors, type NewsletterField, type NewsletterValues } from "@/lib/forms";
import { CheckboxField, ErrorSummary, OutcomePanel, SubmitButton, TextField, TrapField } from "./fields";
import styles from "./Form.module.css";

const labels: Record<NewsletterField, string> = { email: "Email", name: "Name", consent: "Consent" };

type Phase = { kind: "idle" } | { kind: "invalid"; errors: FieldErrors<NewsletterField> } | { kind: "pending" } | { kind: "subscribed"; note?: string } | { kind: "failed"; reason: "unconfigured" | "rejected" | "network"; message: string };

export function NewsletterForm() {
  const uid = useId();
  const [values, setValues] = useState<NewsletterValues>({ email: "", name: "", consent: false });
  const [trap, setTrap] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const fieldErrors = phase.kind === "invalid" ? phase.errors : {};

  const clearError = (field: NewsletterField) => {
    if (phase.kind === "invalid" && phase.errors[field]) {
      const rest = { ...phase.errors };
      delete rest[field];
      setPhase(Object.keys(rest).length ? { kind: "invalid", errors: rest } : { kind: "idle" });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) return;
    const errors = validateNewsletter(values);
    if (Object.keys(errors).length) {
      setPhase({ kind: "invalid", errors });
      return;
    }
    setPhase({ kind: "pending" });
    const outcome = await submitForm(
      forms.newsletter.endpoint,
      {
        email: values.email.trim(),
        name: values.name.trim(),
        consent: "yes",
        source: "website newsletter page",
      },
      { encoding: forms.newsletter.encoding },
    );
    if (outcome.ok) setPhase({ kind: "subscribed", note: outcome.message });
    else setPhase({ kind: "failed", reason: outcome.reason, message: outcome.message });
  };

  const emailFallback = mailto("Subscribe me to KTH Longevity updates", `Please add ${values.email.trim() || "my address"} to the newsletter.`);

  if (phase.kind === "subscribed") {
    return (
      <OutcomePanel tone="success" title={forms.newsletter.doubleOptIn ? "One more step" : "You are on the list"}>
        <p>
          {forms.newsletter.doubleOptIn
            ? `We have sent an email to ${values.email.trim()}. Open it and confirm, and the subscription is complete.`
            : `${values.email.trim()} will receive the next update from KTH Longevity. You can unsubscribe from any email.`}
        </p>
      </OutcomePanel>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate data-testid="newsletter-form">
      {phase.kind === "invalid" && <ErrorSummary errors={fieldErrors} labels={labels} />}
      {phase.kind === "failed" && (
        <OutcomePanel
          tone="failure"
          title={phase.reason === "unconfigured" ? "Signing up from this page is not available yet" : "The subscription did not go through"}
          actions={
            <>
              {phase.reason !== "unconfigured" && (
                <button type="button" className="btn btn-primary" onClick={() => setPhase({ kind: "idle" })}>
                  Try again
                </button>
              )}
              <a className={phase.reason === "unconfigured" ? "btn btn-primary" : "btn"} href={emailFallback}>
                Subscribe by email instead
              </a>
            </>
          }
        >
          <p>
            {phase.reason === "unconfigured"
              ? `Send a short email to ${links.contactEmail} and we will add you to the list by hand.`
              : `${phase.message} Your details are still in the form.`}
          </p>
        </OutcomePanel>
      )}

      <TextField
        id="newsletter-email"
        name="email"
        type="email"
        inputMode="email"
        label={labels.email}
        value={values.email}
        onChange={(v) => {
          setValues((s) => ({ ...s, email: v }));
          clearError("email");
        }}
        error={fieldErrors.email}
        autoComplete="email"
        required
      />
      <TextField
        id="newsletter-name"
        name="name"
        label={labels.name}
        value={values.name}
        onChange={(v) => setValues((s) => ({ ...s, name: v }))}
        autoComplete="given-name"
        optional
        help="So we can greet you by name."
      />
      <TrapField value={trap} onChange={setTrap} />
      <CheckboxField
        id="newsletter-consent"
        name="consent"
        checked={values.consent}
        onChange={(checked) => {
          setValues((s) => ({ ...s, consent: checked }));
          clearError("consent");
        }}
        error={fieldErrors.consent}
      >
        Yes, send me KTH Longevity updates by email. I can unsubscribe at any time, and my address is used for nothing else.
      </CheckboxField>
      <div className={styles.actions}>
        <SubmitButton pending={phase.kind === "pending"} pendingLabel="Subscribing…">
          Subscribe
        </SubmitButton>
        <p id={`${uid}-note`} className={styles.consentNote}>
          No schedule and no spam: we write when there is something worth telling.
        </p>
      </div>
      <p className="visually-hidden" aria-live="polite">
        {phase.kind === "pending" ? "Subscribing" : ""}
      </p>
    </form>
  );
}
