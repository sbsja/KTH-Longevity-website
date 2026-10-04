import type { Metadata } from "next";
import { Article } from "@/components/page/Article";
import { ExploreList } from "./ExploreList";

export const metadata: Metadata = {
  title: "Browse everything",
  description: "Every event, research note and way to get involved with KTH Longevity, as a plain list.",
};

export default function ExplorePage() {
  return (
    <>
      <Article wide>
        <p className="eyebrow">List view</p>
        <h1>Browse everything</h1>
        <p className="prose lede" style={{ marginTop: "var(--s-4)" }}>
          The same items as the gallery, as a list. Filter by what you are looking for.
        </p>
        <ExploreList />
      </Article>
    </>
  );
}
