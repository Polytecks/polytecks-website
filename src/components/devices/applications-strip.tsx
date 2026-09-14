import type { CSSProperties } from "react";
import { FadeImage as Image } from "@/components/fade-image";
import { StackEntry } from "@/components/stack-entry";
import styles from "./applications-strip.module.css";

type Application = { label: string; src: string };

const APPLICATIONS: readonly Application[] = [
  { label: "Cardiac Signals",         src: "/assets/heartpoly (1).png" },
  { label: "Neural Activity",         src: "/assets/brainpoly (1).png" },
  { label: "Muscle Function",         src: "/assets/musclepoly (1).png" },
  { label: "Gut Electrophysiology",   src: "/assets/gutpoly (1).png" },
  { label: "Autonomic Control",       src: "/assets/autonomicpoly (1).png" },
  { label: "Oncological Signatures",  src: "/assets/ribbonpoly (1).png" },
] as const;

export function ApplicationsStrip() {
  return (
    <div className={styles.strip}>
      {APPLICATIONS.map((app, i) => (
        <StackEntry key={app.label}>
          <div
            className={styles.item}
            style={{ ["--icon-i" as string]: i } as CSSProperties}
          >
            <div className={styles.iconWrap}>
              <Image
                src={app.src}
                alt=""
                width={256}
                height={256}
                className={styles.iconImg}
              />
            </div>
            <p className={styles.label}>
              {app.label.split(" ").map((word, idx, arr) => (
                <span key={idx} className={styles.labelLine}>
                  {word}
                  {idx < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          </div>
        </StackEntry>
      ))}
    </div>
  );
}
