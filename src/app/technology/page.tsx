import { ChargeLink } from "@/components/home/charge-link";
import { StackEntry } from "@/components/stack-entry";
import { TechnologyHero } from "@/components/technology/hero";
import { Philosophy } from "@/components/technology/philosophy";
import { PillarSection } from "@/components/technology/pillars/pillar-section";
import { ProofSection } from "@/components/technology/proof-section/proof-section";

export const metadata = {
  title: "Technology",
};

/* Everything renders in place on load except the pillar cards, which keep
 * their staggered entry (handled in PillarSection). */
export default function TechnologyPage() {
  return (
    <>
      <TechnologyHero />
      <PillarSection />
      <StackEntry>
        <ProofSection />
      </StackEntry>
      <StackEntry>
        <Philosophy />
      </StackEntry>
      <StackEntry>
        <section
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "calc(40px * var(--tw-rhythm, 1)) 40px calc(96px * var(--tw-rhythm, 1))",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "calc(20px * var(--tw-rhythm, 1))",
          }}
        >
          <ChargeLink href="/devices" label="See it in action" variant="inline" />
          <ChargeLink
            href="/press#publications"
            label="Read our Publications"
            variant="inline"
          />
        </section>
      </StackEntry>
    </>
  );
}
