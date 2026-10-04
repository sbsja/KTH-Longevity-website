import { GalleryHud } from "@/components/gallery/GalleryHud";
import { HtmlGallery } from "@/components/gallery/HtmlGallery";
import { featured } from "@/content/featured";
import { site } from "@/content/site";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <h1 className="visually-hidden">
        {site.name}: {site.tagline}
      </h1>
      <GalleryHud />
      {/* Full list of the same items. Shown under the scene on phones and tablets,
          and on desktop whenever the 3D gallery is not available. */}
      <section className={styles.list} aria-labelledby="all-items-heading">
        <div className="page-inner">
          <h2 id="all-items-heading" className={styles.listHeading}>
            Everything in the gallery
          </h2>
          <HtmlGallery items={featured} />
        </div>
      </section>
    </>
  );
}
