import Image from "next/image";
import styles from "./tech-feature.module.css";

export function TechFeature() {
  return (
    <div className={styles.feature}>
      <div className={styles.image}>
        <Image
          src="/assets/tech-scientist.jpg"
          alt="Polytecks scientist holding the hexagonal sensor array"
          width={1600}
          height={1200}
          sizes="(max-width: 860px) 100vw, 50vw"
        />
      </div>
      <div className={styles.copy}>
        <div className={styles.eyebrow}>Built in the lab</div>
        <h3 className={styles.heading}>
          From first principles to first patients.
        </h3>
        <p>
          Every array is designed, characterised, and validated in-house. Our
          conducting-polymer wet-dry electrodes, hexagonal geometry, and custom
          acquisition electronics are the product of years of iteration across
          electrical engineering, materials chemistry, and clinical pilots.
        </p>
      </div>
    </div>
  );
}
