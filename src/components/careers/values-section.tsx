import { StackEntry } from "@/components/stack-entry";
import styles from "./values-section.module.css";

const VALUES = [
  {
    title: "Build and own the category",
    body:
      "Polytecks is not here to follow an existing market. We are building the foundations of a new category in bioelectrical diagnostics, and everyone here will leave fingerprints on what that category becomes.",
  },
  {
    title: "Patients come first",
    body:
      "Everything we build starts with the patients we hope to help. We care about creating technology that improves outcomes, enables earlier intervention, and fits meaningfully into real clinical care.",
  },
  {
    title: "We protect creativity",
    body:
      "Our work exists because people were willing to think beyond the standard playbook. We make space for unusual ideas, new approaches, and the kind of creative thinking that can open entirely new paths in medicine.",
  },
  {
    title: "Strength in range",
    body:
      "Polytecks is built at the intersection of different disciplines, perspectives, and ways of thinking. We believe the best work comes from bringing together scientific depth, engineering, product instinct, and commercial imagination.",
  },
  {
    title: "Low-ego, high-standards",
    body:
      "No divas. No passengers. No “good enough” disguised as pragmatism. We want people who can argue hard for the work without making it about themselves.",
  },
  {
    title: "We look after the room",
    body:
      "Polytecks is a team where people feel supported, trusted, and glad to be building together. We look after one another, share the pressure, celebrate progress, and make space for humour and enjoyment along the way.",
  },
];

export function ValuesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <StackEntry index={0}>
          <h2 className={styles.heading}>Values</h2>
        </StackEntry>
        <div className={styles.grid}>
          {VALUES.map((v, i) => (
            <StackEntry key={v.title} index={i + 1}>
              <div className={styles.value}>
                <div className={styles.icon} aria-hidden="true" />
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueBody}>{v.body}</p>
              </div>
            </StackEntry>
          ))}
        </div>
      </div>
    </section>
  );
}
