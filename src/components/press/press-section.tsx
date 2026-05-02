"use client";

import { useState } from "react";
import { PRESS_ITEMS } from "@/data/press";
import { SectionEyebrow } from "./section-eyebrow";
import { PagerArrows } from "./pager-arrows";
import { PressRow } from "./press-row";
import styles from "./press-section.module.css";

const PAGE_SIZE = 10;

/**
 * Paginated "In the conversation." press list. Local pagination state — no
 * server data, no global store. With current sample data both sections fit
 * on a single page; the disabled state on Next is the intended visual.
 */
export function PressSection() {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(PRESS_ITEMS.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = PRESS_ITEMS.slice(start, start + PAGE_SIZE);

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <SectionEyebrow>Articles</SectionEyebrow>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            In the <em>conversation.</em>
          </h2>
          <PagerArrows page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <PressRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
