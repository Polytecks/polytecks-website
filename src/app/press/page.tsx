import { PRESS_ITEMS } from "@/data/press";
import { FeaturedCarousel } from "@/components/press/featured-carousel";
import { PressSection } from "@/components/press/press-section";
import { PublicationsSection } from "@/components/press/publications-section";
import { PressContact } from "@/components/press/press-contact";
import styles from "./page.module.css";

export const metadata = {
  title: "Press & Publications — Polytecks",
  description:
    "Press coverage and peer-reviewed publications from Polytecks, the Cambridge bioelectrical sensing start-up.",
};

/**
 * /press — Press & Publications page. Composed of:
 *   - page header (this file)
 *   - <FeaturedCarousel/>      [client]
 *   - <PressSection/>          [client]   "In the conversation."
 *   - <PublicationsSection/>   [client]   light/paper-tone inverted surface
 *   - <PressContact/>
 *
 * TopNav and Footer come from the root layout — do not re-render them here.
 */
export default function PressPage() {
  return (
    <>
      <section className={styles.head}>
        <div className={styles.eyebrow}>Press &amp; Publications</div>
        <h1 className={styles.headline}>
          Capturing signals from the body. <em>Generating signals in the world.</em>
        </h1>
      </section>

      <FeaturedCarousel items={PRESS_ITEMS} />

      <PressSection />

      <PublicationsSection />

      <PressContact />
    </>
  );
}
