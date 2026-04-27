import { PlaceholderGrid } from "@/components/placeholder-grid";
import { StackEntry } from "@/components/stack-entry";
import { Subpage, SubpageHeader } from "@/components/subpage";

const ROLES = [
  { label: "Role · ENG", title: "Analog / RF Engineer", body: "Design amplifier front-ends and sensor readout." },
  { label: "Role · ML", title: "ML Scientist — Signals", body: "Reconstruct source signals from surface arrays." },
  { label: "Role · HW", title: "Mechanical Engineer", body: "Wearable industrial design and enclosures." },
  { label: "Role · CLIN", title: "Clinical Lead", body: "Run early studies with partner institutions." },
] as const;

export default function CareersPage() {
  return (
    <Subpage>
      <StackEntry index={0}>
        <SubpageHeader
          eyebrow="Careers"
          title={
            <>
              Help us make the <em>invisible</em> legible.
            </>
          }
          lede="We're a small, technical team working across electrical engineering, machine learning, neuroscience, and industrial design. Remote-friendly, Boston-based."
        />
      </StackEntry>
      <StackEntry index={1}>
        <PlaceholderGrid items={ROLES} />
      </StackEntry>
    </Subpage>
  );
}
