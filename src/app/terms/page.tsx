import { StackEntry } from "@/components/stack-entry";
import { Subpage, SubpageHeader } from "@/components/subpage";

export default function TermsPage() {
  return (
    <Subpage>
      <StackEntry index={0}>
        <SubpageHeader
          eyebrow="Legal"
          title={<>Terms of Service</>}
          lede="Coming soon."
        />
      </StackEntry>
    </Subpage>
  );
}
