import { AboutHeaderBackground } from "@/components/about/about-header-background";
import { CambridgeSection } from "@/components/about/cambridge-section";
import { TeamSection } from "@/components/about/team-section";
import { HexGradientDefs } from "@/components/hex-portrait";
import { StackEntry } from "@/components/stack-entry";

export const metadata = {
  title: "About",
};
import { Subpage, SubpageHeader } from "@/components/subpage";
import subpageStyles from "@/components/subpage.module.css";

export default function AboutPage() {
  return (
    <Subpage className={subpageStyles.cambridgeAligned}>
      <AboutHeaderBackground />
      <HexGradientDefs />
      <SubpageHeader
        eyebrow="About Us"
        title={
          <>
            We are building the <em>sensing layer</em> for next-generation
            healthcare.
          </>
        }
        lede={
          <>
            Polytecks is developing flexible bioelectrical mapping technology
            that turns the body’s <em>natural signals</em> into a new,
            non-invasive view of disease.
          </>
        }
        editorialLede
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
