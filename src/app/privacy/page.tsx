import { Subpage, SubpageHeader } from "@/components/subpage";

export const metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <Subpage>
      <SubpageHeader
        eyebrow="Legal"
        title={<>Privacy Policy</>}
        lede="Coming soon."
      />
    </Subpage>
  );
}
