import { CambridgeSection } from "@/components/about/cambridge-section";
import { TeamSection } from "@/components/about/team-section";
import { HexGradientDefs } from "@/components/hex-portrait";
import { StackEntry } from "@/components/stack-entry";
import { Subpage, SubpageHeader } from "@/components/subpage";

export default function AboutPage() {
  return (
    <Subpage>
      <HexGradientDefs />
      <SubpageHeader
        eyebrow="About Us"
        title={
          <>
            We are building the <em>sensing layer</em> for next-generation
            healthcare.
          </>
        }
        lede="Polytecks is a medical technology start-up developing bioelectrical mapping for a novel non-invasive information source into disease."
      />
      <StackEntry index={3}>
        <CambridgeSection />
      </StackEntry>
      <StackEntry index={4}>
        <TeamSection />
      </StackEntry>
    </Subpage>
  );
}
