import { Subpage, SubpageHeader } from "@/components/subpage";

export const metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <Subpage>
      <SubpageHeader
        title={<>Terms of Service</>}
        lede="Coming soon."
      />
    </Subpage>
  );
}
