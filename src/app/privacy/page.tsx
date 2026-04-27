import { StackEntry } from "@/components/stack-entry";
import { Subpage, SubpageHeader } from "@/components/subpage";

export default function PrivacyPage() {
  return (
    <Subpage>
      <StackEntry index={0}>
        <SubpageHeader
          eyebrow="Legal"
          title={<>Privacy Policy</>}
          lede="Coming soon."
        />
      </StackEntry>
    </Subpage>
  );
}
