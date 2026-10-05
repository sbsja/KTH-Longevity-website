"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./Article.module.css";

/**
 * A retained legacy route. The static export cannot answer with an HTTP
 * redirect, so the page replaces itself client-side as soon as it loads, and
 * carries a meta refresh plus a visible link for browsers without JavaScript.
 * Legacy routes are never recorded in the route history (see RouteTracker).
 */
export function LegacyRedirect({ to, label }: { to: string; label: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return (
    <div className={`page ${styles.article}`}>
      <meta httpEquiv="refresh" content={`0;url=${to}`} />
      <meta name="robots" content="noindex" />
      <div className={styles.column}>
        <p className="eyebrow">This page has moved</p>
        <h1>Taking you to {label}</h1>
        <p className="prose lede" style={{ marginTop: "var(--s-4)" }}>
          If nothing happens, <Link href={to}>continue to {label}</Link>.
        </p>
      </div>
    </div>
  );
}
