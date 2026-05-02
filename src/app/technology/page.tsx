import { ChargeLink } from "@/components/home/charge-link";
import { StackEntry } from "@/components/stack-entry";
import { TechnologyHero } from "@/components/technology/hero";
import { Philosophy } from "@/components/technology/philosophy";
import { PillarSection } from "@/components/technology/pillars/pillar-section";
import { ProofSection } from "@/components/technology/proof-section/proof-section";

/* Top-down page sequence (absolute delays in ms):
 *   Hero eyebrow:    0    (SubpageHeader internal index 0)
 *   Hero title:      ~stack-stagger-ms  (index 1)
 *   Hero lede:       ~2*stack-stagger-ms (index 2)
 *   Pillar title:    1500
 *   Pillar cards:    1750 + i × pillar-card-stagger-ms  (handled in PillarSection)
 *   Proof section:   2700
 *   Philosophy:      3000
 *   Charge link:     3300
 *
 * Each section anchors itself to a fixed clock offset so the visual order
 * is strict top-down regardless of the global stack-stagger setting. */
export default function TechnologyPage() {
  return (
    <>
      {/* TechnologyHero contains the SubpageHeader (eyebrow/title/lede at
          internal indices 0/1/2). No outer StackEntry wrapper — those
          internal indices already provide the staggered entry. */}
      <TechnologyHero />
      <PillarSection />
      <StackEntry delayMs={2700}>
        <ProofSection />
      </StackEntry>
      <StackEntry delayMs={2900}>
        <section
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "calc(24px * var(--tw-rhythm, 1)) 40px calc(40px * var(--tw-rhythm, 1))",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ChargeLink
            href="/press#publications"
            label="Read our peer-reviewed work"
            variant="inline"
          />
        </section>
      </StackEntry>
      <StackEntry delayMs={3000}>
        <Philosophy />
      </StackEntry>
      <StackEntry delayMs={3300}>
        <section
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "calc(40px * var(--tw-rhythm, 1)) 40px calc(96px * var(--tw-rhythm, 1))",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ChargeLink href="/devices" label="See it in action" variant="inline" />
        </section>
      </StackEntry>
    </>
  );
}
