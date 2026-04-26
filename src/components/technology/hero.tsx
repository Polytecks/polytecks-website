import Image from "next/image";
import { SubpageHeader } from "@/components/subpage";
import styles from "./hero.module.css";

export function TechnologyHero() {
  return (
    <div className={styles.hero}>
      <div className={styles.banner}>
        <Image
          src="/assets/array-mosaic.jpg"
          alt="Polytecks electrode array mosaic sheet"
          width={2400}
          height={1600}
          sizes="100vw"
          priority
        />
        <div className={styles.fade} aria-hidden="true" />
        <div className={styles.header}>
          <SubpageHeader
            eyebrow="Technology"
            title={
              <>
                The electrode, <em>reinvented</em>.
              </>
            }
            lede="A new frontier in bioelectrical mapping."
          />
        </div>
      </div>
    </div>
  );
}
