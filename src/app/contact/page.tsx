import { PlaceholderGrid } from "@/components/placeholder-grid";
import { StackEntry } from "@/components/stack-entry";
import { Subpage, SubpageHeader } from "@/components/subpage";

const CHANNELS = [
  { label: "Channel · Email", title: "hello@polytecks.com", body: "General inquiries. We respond within two business days." },
  { label: "Channel · Press", title: "press@polytecks.com", body: "Media and speaking requests." },
] as const;

export default function ContactPage() {
  return (
    <Subpage>
      <StackEntry index={0}>
        <SubpageHeader
          eyebrow="Contact"
          title={
            <>
              Start a <em>conversation</em>.
            </>
          }
          lede="Partnerships, clinical collaborations, press, and investor inquiries."
        />
      </StackEntry>
      <StackEntry index={1}>
        <PlaceholderGrid items={CHANNELS} />
      </StackEntry>
    </Subpage>
  );
}
