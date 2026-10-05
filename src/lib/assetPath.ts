/**
 * Base path support for hosts that serve the site under a sub-folder, such as a
 * GitHub Pages project site (https://<user>.github.io/<repo>/).
 *
 * Next.js prefixes its own routes, scripts and fonts with `basePath` on its own.
 * Plain `<img src>`, CSS `url()` and texture URLs are not rewritten, so those go
 * through `asset()`. Open Graph image paths stay plain: Next.js joins them with
 * `metadataBase`, which already carries the sub-path.
 *
 * Locally and on a host that serves from the domain root the value is empty.
 * Set NEXT_PUBLIC_BASE_PATH="/KTH-Longevity-website" at build time for Pages.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
