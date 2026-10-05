/**
 * Every configurable external destination lives here.
 *
 * Values that are `null` have no verified public URL in the association's
 * documents. The interface shows an honest contact-based route instead of a
 * dead button. See docs/CONTENT-SOURCES.md for where each value comes from.
 */

export const links = {
  /** Planned domain from the April 2025 meeting notes. Not verified as deployed. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kthlongevity.com",

  /** Verified to exist on 3 October 2026 (page title "KTH Longevity (@kthlongevity)"). */
  instagram: "https://www.instagram.com/kthlongevity/",
  instagramHandle: "@kthlongevity",

  /**
   * Organisation mailbox as stated in the September 2026 bank application.
   * Confirm with the board before launch; never substitute a private address.
   */
  contactEmail: "kthlongevity@gmail.com",

  /** Luma is used for registration, but no general public page URL is documented. */
  luma: null as string | null,

  /** LinkedIn is mentioned in planning notes, but no page URL is documented. */
  linkedin: null as string | null,

  /**
   * Team applications ran through a Google Form in autumn 2026. Only the
   * editor link exists in the documents, so nothing is exposed here. Set a
   * verified public form URL when a recruitment round opens.
   */
  recruitmentForm: null as string | null,

  /** The WhatsApp community is invite-based; there is no public invite link. */
  whatsappCommunity: null as string | null,
} as const;

export type Links = typeof links;

export function mailto(subject: string, body?: string): string {
  const params = new URLSearchParams({ subject });
  if (body) params.set("body", body);
  return `mailto:${links.contactEmail}?${params.toString().replace(/\+/g, "%20")}`;
}
