import styles from "./section-eyebrow.module.css";

type Props = {
  children: React.ReactNode;
  /** `light` switches the gradient flanks for the inverted publications surface. */
  variant?: "dark" | "light";
  className?: string;
};

/**
 * Generalised line-flanked indigo monospace label. Modelled directly on
 * `mission-panel.module.css → .eyebrow`. Used four times on the press page
 * (Featured / Articles / Publications / Press Enquiries).
 */
export function SectionEyebrow({ children, variant = "dark", className }: Props) {
  return (
    <span
      className={[
        styles.eyebrow,
        variant === "light" ? styles.light : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
