import Image from "next/image";
import styles from "./veterinary-panel.module.css";

const SPECS = [
  { label: "Channels", value: "19", note: "Hexagonal chest-patch array" },
  { label: "Electrode spacing", value: "15", unit: "mm", note: "~6–8× denser than 12-lead ECG" },
  { label: "Sampling rate", value: ">1", unit: "kHz", note: "Per channel, wireless" },
  { label: "Session duration", value: "1–3", unit: "min", note: "Gel-free, shaving only" },
  { label: "Training", value: "~30", unit: "min", note: "Vet or vet nurse" },
  { label: "Cost per scan", value: "~£10", note: "Reusable electrodes, multi-year shelf life" },
] as const;

const FEATURES = [
  "Hexagonal textile patch conforms across chest morphologies — small, medium, large straps",
  "Conducting-polymer wet-dry electrodes — no gel, no skin prep beyond shaving",
  "Reusable electrodes with no observed performance degradation over 1+ year of use",
  "Battery-powered wireless acquisition, ~4 hours continuous runtime",
  "Motion tolerance comparable or superior to standard ECG",
  "On-device decision support — classification result with probability + visual feature map",
] as const;

export function VeterinaryPanel() {
  return (
    <>
      <div className={styles.productHero}>
        <div className={styles.productImage}>
          <Image
            src="/assets/clinic-kit.png"
            alt="Polytecks SwiftStage clinic kit — five hexagonal textile electrode patches, cable, and acquisition unit"
            width={1600}
            height={1200}
            sizes="(max-width: 860px) 100vw, 50vw"
          />
        </div>
        <div>
          <div className={styles.eyebrow}>Product · Veterinary</div>
          <h3 className={styles.productTitle}>
            SwiftStage<sup>™</sup>
          </h3>
          <p className={styles.productLede}>
            A non-invasive, high-density cardiac electrical mapping device for
            dogs — designed as a rapid in-clinic triage tool for myxomatous
            mitral valve disease (MMVD).
          </p>
          <p className={styles.productBody}>
            SwiftStage combines a reusable textile electrode array, portable
            wireless electronics, and decision-support software to extract
            spatial electrical biomarkers from the canine thorax that are not
            accessible with a standard ECG. It fits into the normal flow of a
            first-opinion consult: place the patch, record for two minutes, and
            get a probability-backed staging result on the spot.
          </p>
        </div>
      </div>

      <div className={styles.specGrid}>
        {SPECS.map((spec) => (
          <div key={spec.label} className={styles.specCard}>
            <div className={styles.specLabel}>{spec.label}</div>
            <div className={styles.specValue}>
              {spec.value}
              {"unit" in spec ? <span>{spec.unit}</span> : null}
            </div>
            <div className={styles.specNote}>{spec.note}</div>
          </div>
        ))}
      </div>

      <div className={styles.featureList}>
        <h4>Key capabilities</h4>
        <ul>
          {FEATURES.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
