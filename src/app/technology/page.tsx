import { PlaceholderGrid } from "@/components/placeholder-grid";
import { Subpage } from "@/components/subpage";
import { TechFeature } from "@/components/technology/tech-feature";
import { TechHero } from "@/components/technology/tech-hero";

const FIGURES = [
  { label: "Figure · Sensor array", title: "Electrode topology", body: "Diagram of the 19-channel hex lattice." },
  { label: "Figure · Signal pipeline", title: "Acquisition pipeline", body: "From skin → amplifier → reconstruction → app." },
  { label: "Spec · Performance", title: "Specs & validation", body: "Sampling rate, SNR, clinical benchmarks." },
  { label: "Section · IP", title: "Patents & publications", body: "List of filings and peer-reviewed work." },
] as const;

export default function TechnologyPage() {
  return (
    <>
      <TechHero />
      <Subpage>
        <TechFeature />
        <PlaceholderGrid items={FIGURES} />
      </Subpage>
    </>
  );
}
