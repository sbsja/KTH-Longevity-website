"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Form.module.css";

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 3.6v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7" cy="10.2" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className={styles.error}>
      <ErrorIcon />
      <span>{message}</span>
    </p>
  );
}

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "email";
  autoComplete?: string;
  required?: boolean;
  optional?: boolean;
  help?: string;
  placeholder?: string;
  list?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  inputMode?: "email" | "text";
}

/** A labelled input or textarea with its error and helper text connected through aria-describedby. */
export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  required,
  optional,
  help,
  placeholder,
  list,
  multiline,
  rows = 6,
  disabled,
  inputMode,
}: TextFieldProps) {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name,
    value,
    required,
    disabled,
    placeholder,
    autoComplete,
    "aria-invalid": error ? ("true" as const) : undefined,
    "aria-describedby": describedBy,
    className: styles.input,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>
      {help && (
        <p id={helpId} className={styles.help}>
          {help}
        </p>
      )}
      {multiline ? <textarea {...common} rows={rows} /> : <input {...common} type={type} list={list} inputMode={inputMode} />}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function CheckboxField({
  id,
  name,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <div className={styles.check}>
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.checked)}
        />
        <label htmlFor={id}>{children}</label>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

/** Honeypot: a field people never see or fill; robots usually do. */
export function TrapField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.trap} aria-hidden="true">
      <label htmlFor="company-website">Company website</label>
      <input id="company-website" name="company" type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/** Error summary shown after a failed submit; receives focus so screen readers announce it. */
export function ErrorSummary({ errors, labels }: { errors: Record<string, string | undefined>; labels: Record<string, string> }) {
  const ref = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors).filter((e): e is [string, string] => typeof e[1] === "string");
  useEffect(() => {
    ref.current?.focus();
  }, []);
  if (!entries.length) return null;
  return (
    <div ref={ref} className={styles.summary} role="alert" tabIndex={-1}>
      <p className={styles.summaryTitle}>
        {entries.length === 1 ? "One thing to fix before sending" : `${entries.length} things to fix before sending`}
      </p>
      <ul>
        {entries.map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`}>{labels[field] ?? field}</a>: {message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OutcomePanel({
  tone,
  title,
  children,
  actions,
}: {
  tone: "success" | "failure";
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div ref={ref} className={`${styles.panel} ${tone === "success" ? styles.panelSuccess : styles.panelFailure}`} role={tone === "failure" ? "alert" : "status"} tabIndex={-1}>
      <p className={styles.panelTitle}>
        {tone === "success" ? (
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="m5.5 9.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <ErrorIcon />
        )}
        {title}
      </p>
      {children}
      {actions && <div className={styles.panelActions}>{actions}</div>}
    </div>
  );
}

export function SubmitButton({ pending, children, pendingLabel }: { pending: boolean; children: ReactNode; pendingLabel: string }) {
  return (
    <button type="submit" className={`btn btn-primary ${styles.submit}`} aria-disabled={pending} aria-busy={pending}>
      {pending && <span className={styles.spinner} aria-hidden="true" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
