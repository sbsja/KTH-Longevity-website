import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/page/LegacyRedirect";
import { legacyRoutes } from "@/lib/navigation";

/**
 * Legacy route: the separate list view is gone. The home page shows the same
 * items as the gallery and lists them as plain HTML whenever the 3D scene is
 * not available.
 */
export const metadata: Metadata = {
  title: "Explore",
  robots: { index: false, follow: true },
};

export default function ExploreRedirect() {
  return <LegacyRedirect to={legacyRoutes["/explore/"]} label="the home page" />;
}
