import Link from "next/link";
import { Article } from "@/components/page/Article";

export default function NotFound() {
  return (
    <>
      <Article>
        <p className="eyebrow">Not found</p>
        <h1>That page is not here</h1>
        <p className="prose lede" style={{ marginTop: "var(--s-4)" }}>
          The link may be old, or the page may have moved. Everything on this site is reachable from the gallery or the list.
        </p>
        <p style={{ marginTop: "var(--s-5)", display: "flex", gap: "var(--s-3)", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">
            Back to Explore
          </Link>
          <Link href="/explore/" className="btn">
            Browse as a list
          </Link>
        </p>
      </Article>
    </>
  );
}
