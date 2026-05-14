import { FadeImage as Image } from "@/components/fade-image";
import { HexPortrait } from "@/components/hex-portrait";
import styles from "./team-section.module.css";

const TEAM = [
  {
    src: "/assets/team-ruben.png",
    name: "Ruben Ruiz Mateos Serrano",
    role: "Co-Founder and CEO",
    href: "https://www.linkedin.com/in/ruben-ruiz-mateos-serrano-96ba271b2/",
  },
  {
    src: "/assets/team-callan.png",
    name: "Callan MacDonald",
    role: "Co-Founder and COO",
    href: "https://www.linkedin.com/in/callan-macdonald/",
  },
  {
    src: "/assets/team-charlie.png",
    name: "Charles Hoang",
    role: "Founding Engineer",
    href: "https://www.linkedin.com/in/cwhbrunt/",
  },
] as const;

const ADVISORS = [
  {
    src: "/assets/advisor-malliaras.png",
    name: "Prof. George Malliaras",
    role: "Scientific Advisor",
    href: "https://www.eng.cam.ac.uk/profiles/gm603",
  },
  {
    src: "/assets/advisor-novo-matos.png",
    name: "Prof. Jose Novo Matos",
    role: "Clinical Advisor",
    href: "https://www.hospital.vet.cam.ac.uk/staff/matos",
  },
  {
    src: "/assets/advisor-fairen-jimenez.png",
    name: "Prof. David Fairen-Jimenez",
    role: "Scientific Advisor",
    href: "https://www.ceb.cam.ac.uk/directory/david-fairen-jimenez",
  },
  {
    src: "/assets/advisor-hampton.png",
    name: "Dr. David Hampton",
    role: "Clinical Advisor",
    href: "https://www.linkedin.com/in/drhamptn/",
  },
  {
    src: "/assets/advisor-richardson.png",
    name: "Jen Richardson",
    role: "Marketing Advisor",
    href: "https://www.linkedin.com/in/thejenrichardson/",
  },
] as const;

export function TeamSection() {
  return (
    <div id="team" className={styles.section}>
      <h2 className={styles.title}>
        The Team Behind
        <Image
          className={`themeDarkOnly ${styles.titleLogo}`}
          src="/assets/polytecks-logo-white.png"
          alt="Polytecks"
          width={2500}
          height={720}
        />
        <Image
          className={`themeLightOnly ${styles.titleLogo}`}
          src="/assets/Polytecksblack.png"
          alt="Polytecks"
          width={2500}
          height={720}
        />
      </h2>

      <div className={styles.subheading}>Executive</div>
      <div className={styles.teamGrid}>
        {TEAM.map((m) => (
          <HexPortrait
            key={m.src}
            src={m.src}
            alt={m.name}
            name={m.name}
            role={m.role}
            href={m.href}
          />
        ))}
      </div>

      <div className={styles.advisors}>
        <div className={styles.subheading}>Advisors</div>
        <div className={styles.advisorsRow}>
          {ADVISORS.map((a) => (
            <HexPortrait
              key={a.src}
              src={a.src}
              alt={a.name}
              name={a.name}
              role={a.role}
              variant="advisor"
              href={a.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
