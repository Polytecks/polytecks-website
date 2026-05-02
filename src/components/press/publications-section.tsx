"use client";

import { useState } from "react";
import { PUBLICATIONS } from "@/data/press";
import { SectionEyebrow } from "./section-eyebrow";
import { PagerArrows } from "./pager-arrows";
import { PublicationBlock } from "./publication-block";
import styles from "./publications-section.module.css";

const PAGE_SIZE = 10;

/**
 * Light/inverted "And in the record." section. Paper-tone surface (#f4f4ee
 * — kept scoped here rather than promoted to a global token, per the
 * handoff). Pager uses the light variant so it reads on the warmer
 * background.
 */
export function PublicationsSection() {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(PUBLICATIONS.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = PUBLICATIONS.slice(start, start + PAGE_SIZE);

  return (
    <section id="publications" className={styles.section}>
      <div className={styles.head}>
        <SectionEyebrow variant="light">Publications</SectionEyebrow>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            And in the <em>record.</em>
          </h2>
          <PagerArrows
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            variant="light"
          />
        </div>
      </div>
      <div className={styles.list}>
        {items.map((pub, i) => (
          <PublicationBlock key={pub.id} pub={pub} n={start + i + 1} />
        ))}
      </div>
    </section>
  );
}
