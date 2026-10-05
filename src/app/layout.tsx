import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/chrome/Footer";
import { Nav } from "@/components/chrome/Nav";
import { RouteTracker } from "@/components/chrome/RouteTracker";
import { SceneHost } from "@/components/scene/SceneHost";
import { links } from "@/content/links";
import { site } from "@/content/site";
import "./globals.css";

/*
 * Self-hosted, OFL-licensed stand-ins for the mood board's typefaces:
 * Outfit for Codec Pro (display), Instrument Sans for Helvetica / CAT Neuzeit (body),
 * JetBrains Mono for the compact technical interface labels.
 */
const outfit = localFont({
  src: "../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2",
  variable: "--font-outfit",
  weight: "100 900",
  display: "swap",
});
const instrument = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-italic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-instrument",
  weight: "400 700",
  display: "swap",
});
const jetbrains = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(links.siteUrl),
  title: {
    default: `${site.name}: ${site.tagline.replace(/\.$/, "")}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name}: ${site.tagline.replace(/\.$/, "")}`,
    description: site.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name}: ${site.tagline}` }],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#e3faf5",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SceneHost />
        <div className="vignette" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <RouteTracker />
        <Nav />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
