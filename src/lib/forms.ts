/**
 * Form validation and delivery, kept free of React so it can be unit-tested.
 *
 * Delivery posts to a hosted form endpoint from the browser (the site has no
 * server). The outcome is only "ok" when the endpoint answered with a 2xx
 * status; client-side validation never counts as success.
 */
import type { FormEncoding } from "@/content/forms";

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export type ContactField = "name" | "email" | "subject" | "message";
export type NewsletterField = "email" | "name" | "consent";

export interface ContactValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterValues {
  email: string;
  name: string;
  consent: boolean;
}

/** Pragmatic email check: one @, something on both sides, a dot in the domain, no spaces. */
export function isEmail(value: string): boolean {
  const v = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export function validateContact(values: ContactValues): FieldErrors<ContactField> {
  const errors: FieldErrors<ContactField> = {};
  if (!values.name.trim()) errors.name = "Enter your name so we know who is writing.";
  if (!values.email.trim()) errors.email = "Enter the email address we should reply to.";
  else if (!isEmail(values.email)) errors.email = "Enter an email address in the form name@example.com.";
  if (!values.subject.trim()) errors.subject = "Give your message a subject.";
  if (!values.message.trim()) errors.message = "Write your message.";
  else if (values.message.trim().length < 10) errors.message = "Write a little more, at least a sentence.";
  return errors;
}

export function validateNewsletter(values: NewsletterValues): FieldErrors<NewsletterField> {
  const errors: FieldErrors<NewsletterField> = {};
  if (!values.email.trim()) errors.email = "Enter the email address to subscribe.";
  else if (!isEmail(values.email)) errors.email = "Enter an email address in the form name@example.com.";
  if (!values.consent) errors.consent = "Tick the box to confirm you want to receive our emails.";
  return errors;
}

export type SubmitOutcome =
  | { ok: true; message?: string }
  | { ok: false; reason: "unconfigured" | "rejected" | "network"; message: string };

export interface SubmitOptions {
  encoding?: FormEncoding;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

/**
 * POST a payload to a hosted form endpoint.
 * - No endpoint configured: "unconfigured" (the interface shows the email route).
 * - 2xx: ok. The optional JSON body may carry a `message`.
 * - Other statuses: "rejected", with the provider's message when it sends one.
 * - Network failure or timeout: "network".
 */
export async function submitForm(
  endpoint: string | null,
  payload: Record<string, string>,
  { encoding = "json", fetchImpl, timeoutMs = 15_000 }: SubmitOptions = {},
): Promise<SubmitOutcome> {
  if (!endpoint) {
    return { ok: false, reason: "unconfigured", message: "Sending from this page is not available yet." };
  }
  const doFetch = fetchImpl ?? (typeof fetch === "function" ? fetch : undefined);
  if (!doFetch) return { ok: false, reason: "network", message: "Your browser could not send the form." };

  const controller = typeof AbortController === "function" ? new AbortController() : undefined;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined;
  try {
    const init: RequestInit =
      encoding === "form"
        ? {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new URLSearchParams(payload),
            signal: controller?.signal,
          }
        : {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller?.signal,
          };
    const response = await doFetch(endpoint, init);
    const body = await readJson(response);
    if (response.ok) {
      return { ok: true, message: body?.message };
    }
    return { ok: false, reason: "rejected", message: providerMessage(body) ?? `The service answered with status ${response.status}.` };
  } catch {
    return { ok: false, reason: "network", message: "The message could not be sent. Check your connection and try again." };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

interface ProviderBody {
  message?: string;
  error?: string;
  errors?: { message?: string; field?: string }[];
}

async function readJson(response: Response): Promise<ProviderBody | null> {
  try {
    const text = await response.text();
    if (!text) return null;
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as ProviderBody) : null;
  } catch {
    return null;
  }
}

function providerMessage(body: ProviderBody | null): string | undefined {
  if (!body) return undefined;
  if (Array.isArray(body.errors) && body.errors.length) {
    const parts = body.errors.map((e) => e.message).filter((m): m is string => typeof m === "string" && m.length > 0);
    if (parts.length) return parts.join(" ");
  }
  if (typeof body.message === "string" && body.message) return body.message;
  if (typeof body.error === "string" && body.error) return body.error;
  return undefined;
}
