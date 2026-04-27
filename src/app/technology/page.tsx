import { ChargeLink } from "@/components/home/charge-link";
import { StackEntry } from "@/components/stack-entry";
import { TechnologyHero } from "@/components/technology/hero";
import { Philosophy } from "@/components/technology/philosophy";
import { PillarSection } from "@/components/technology/pillars/pillar-section";
import { ProofSection } from "@/components/technology/proof-section/proof-section";

export default function TechnologyPage() {
  return (
    <>
      {/* TechnologyHero wraps its SubpageHeader in StackEntry index={0} internally */}
      <TechnologyHero />
      {/* PillarSection handles its own per-card stagger (right-to-left, indices 1–3) */}
      <PillarSection />
      <StackEntry index={4}>
        <ProofSection />
      </StackEntry>
      <StackEntry index={5}>
        <Philosophy />
      </StackEntry>
      <StackEntry index={6}>
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
