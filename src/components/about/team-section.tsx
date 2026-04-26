import Image from "next/image";
import { HexPortrait } from "@/components/hex-portrait";
import styles from "./team-section.module.css";

const TEAM = [
  { src: "/assets/team-ruben.png", name: "Ruben Ruiz Mateos Serrano", role: "Co-Founder and CEO" },
  { src: "/assets/team-callan.png", name: "Callan MacDonald", role: "Co-Founder and COO" },
  { src: "/assets/team-charlie.png", name: "Charlie Brunt", role: "Founding Engineer" },
] as const;

const ADVISORS = [
  { src: "/assets/advisor-malliaras.png", name: "Prof. George Malliaras", role: "Scientific Advisor" },
  { src: "/assets/advisor-novo-matos.png", name: "Prof. Jose Novo Matos", role: "Clinical Advisor" },
  { src: "/assets/advisor-fairen-jimenez.png", name: "Prof. David Fairen-Jimenez", role: "Scientific Advisor" },
  { src: "/assets/advisor-hampton.png", name: "Dr. David Hampton", role: "Clinical Advisor" },
  { src: "/assets/advisor-richardson.png", name: "Jen Richardson", role: "Marketing Advisor" },
] as const;

export function TeamSection() {
  return (
    <div className={styles.section}>
      <h3 className={styles.title}>
        The Team Behind
        <Image
          className={styles.titleLogo}
          src="/assets/polytecks-logo-white.png"
          alt="Polytecks"
          width={2500}
          height={720}
        />
      </h3>

      <div className={styles.subheading}>Executive</div>
      <div className={styles.teamGrid}>
        {TEAM.map((m) => (
          <HexPortrait key={m.src} src={m.src} alt={m.name} name={m.name} role={m.role} />
        ))}
      </div>

      <div className={styles.advisors}>
        <div className={styles.subheading}>Advisors</div>
        <div className={styles.advisorsRow}>
          {ADVISORS.map((a) => (
            <HexPortrait key={a.src} src={a.src} alt={a.name} name={a.name} role={a.role} variant="advisor" />
          ))}
        </div>
      </div>
    </div>
  );
}
