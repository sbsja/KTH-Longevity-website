"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isLegacyRoute } from "@/lib/navigation";
import { routeHistory } from "@/lib/routeHistory";

/**
 * Keeps the in-session record of internal routes up to date. Legacy routes,
 * which only redirect, are never recorded, so returning from a page cannot
 * land on one. Renders nothing.
 */
export function RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onPop = () => routeHistory.markPop();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (isLegacyRoute(pathname)) return;
    routeHistory.record(pathname);
  }, [pathname]);

  return null;
}
