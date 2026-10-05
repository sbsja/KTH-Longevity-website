import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/page/LegacyRedirect";
import { legacyRoutes } from "@/lib/navigation";

/** Legacy route: the Join page's content now lives in About (participation) and Contact. */
export const metadata: Metadata = {
  title: "Join",
  robots: { index: false, follow: true },
};

export default function JoinRedirect() {
  return <LegacyRedirect to={legacyRoutes["/join/"]} label="how to participate" />;
}
