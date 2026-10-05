import Link from "next/link";
import { Article } from "@/components/page/Article";
import { primaryNav } from "@/lib/navigation";

export default function NotFound() {
  return (
    <Article>
      <p className="eyebrow">Not found</p>
      <h1>That page is not here</h1>
      <p className="prose lede" style={{ marginTop: "var(--s-4)" }}>
        The link may be old, or the page may have moved. Everything on this site is one of the sections below, and the button
        above takes you back to the gallery.
      </p>
      <ul style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: "var(--s-3)", marginTop: "var(--s-5)" }}>
        {primaryNav.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="btn">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </Article>
  );
}
