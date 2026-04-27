import { ChargeLink } from "@/components/home/charge-link";
import { TechnologyHero } from "@/components/technology/hero";
import { Philosophy } from "@/components/technology/philosophy";
import { PillarSection } from "@/components/technology/pillars/pillar-section";
import { ProofSection } from "@/components/technology/proof-section/proof-section";
import { TweakPanel } from "@/components/technology/tweak-panel";

export default function TechnologyPage() {
  return (
    <>
      <TechnologyHero />
      <PillarSection />
      <ProofSection />
      <Philosophy />
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
      <TweakPanel />
    </>
  );
}
