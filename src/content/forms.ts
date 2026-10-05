/**
 * Form delivery configuration.
 *
 * The site is a static export: there is no server to receive a form, so each
 * form posts directly from the browser to a hosted form endpoint. Both
 * endpoints are `null` until the board chooses a service; until then the forms
 * render in full and report honestly that delivery is not available yet, next
 * to the email route.
 *
 * Only endpoints that are designed to be public (hosted form IDs, embedded
 * newsletter signup URLs) belong here. API keys never do: anything in this
 * file ships to every visitor's browser.
 *
 * Expected protocol: HTTP POST with a JSON body and `Accept: application/json`,
 * a 2xx response on success, and an optional JSON body with `message` or
 * `errors[].message` on failure (Formspree-style). Providers that only accept
 * form encoding can be served with `encoding: "form"`.
 */

export type FormEncoding = "json" | "form";

export interface FormEndpoint {
  /** Full URL to POST to, or null when no service is configured. */
  endpoint: string | null;
  encoding: FormEncoding;
}

const encoding = (value: string | undefined): FormEncoding => (value === "form" ? "form" : "json");

export const forms = {
  contact: {
    endpoint: process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT ?? null,
    encoding: encoding(process.env.NEXT_PUBLIC_CONTACT_FORM_ENCODING),
  } satisfies FormEndpoint,

  newsletter: {
    endpoint: process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT ?? null,
    encoding: encoding(process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ENCODING),
    /**
     * A hosted signup page (for example a Luma calendar or the provider's own
     * form). When set, the page offers it as the primary signup route.
     */
    hostedSignupUrl: process.env.NEXT_PUBLIC_NEWSLETTER_SIGNUP_URL ?? null,
    hostedSignupLabel: process.env.NEXT_PUBLIC_NEWSLETTER_SIGNUP_LABEL ?? "Sign up",
    /** Set to true when the provider sends a confirmation email (double opt-in). */
    doubleOptIn: process.env.NEXT_PUBLIC_NEWSLETTER_DOUBLE_OPT_IN === "true",
  },
};
