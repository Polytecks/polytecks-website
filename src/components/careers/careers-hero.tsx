import { FadeImage } from "@/components/fade-image";
import { StackEntry } from "@/components/stack-entry";
import styles from "./careers-hero.module.css";

export function CareersHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.bg}>
        <FadeImage
          src="/assets/Careers.png"
          alt="Polytecks team"
          fill
          priority
          sizes="100vw"
          className={styles.bgImage}
        />
        <div className={styles.bgOverlay} aria-hidden="true" />
      </div>
      <StackEntry index={0} className={styles.content}>
        <div className={styles.eyebrow}>Careers</div>
        <h1 className={styles.title}>
          Help us build the future of <em>bioelectrical sensing.</em>
        </h1>
        <p className={styles.lede}>
          We&apos;re a highly technical team working across material science,
          electrical engineering, machine learning, and medicine. Based in
          Cambridge, UK.
        </p>
      </StackEntry>
    </section>
  );
}
