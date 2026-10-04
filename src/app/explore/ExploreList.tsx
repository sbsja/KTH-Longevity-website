"use client";

import { useState } from "react";
import { HtmlGallery } from "@/components/gallery/HtmlGallery";
import { categories, itemsFor } from "@/content/featured";
import type { Category } from "@/content/types";
import styles from "./ExploreList.module.css";

export function ExploreList() {
  const [category, setCategory] = useState<Category | "all">("all");
  const items = itemsFor(category);
  return (
    <div className={styles.wrap}>
      <div className={styles.filters} role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.chip} mono`}
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">
        {items.length} items shown
      </p>
      <HtmlGallery items={items} headingLevel={2} />
    </div>
  );
}
