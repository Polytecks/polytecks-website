import { ApplicationsStrip } from "@/components/devices/applications-strip";
import { FirstDevice } from "@/components/devices/first-device";
import { IndicationsTimeline } from "@/components/devices/indications-timeline";
import { PlatformCta } from "@/components/devices/platform-cta";
import { Subpage, SubpageHeader } from "@/components/subpage";
import styles from "./page.module.css";

export const metadata = {
  title: "Devices",
};

export default function DevicesPage() {
  return (
    <Subpage className={styles.subpage}>
      <SubpageHeader
        title={
          <>
            Making disease easier to <em>spot</em>, diagnose, and manage.
          </>
        }
        lede={
          <>
            The Mosaic Sensor platform can bring{" "}
            <em>imaging-level insights</em> into primary care, and even
            earlier. Across all domains of health.
          </>
        }
        editorialLede
      />
      <ApplicationsStrip />
      <FirstDevice />
      <IndicationsTimeline />
      <PlatformCta />
    </Subpage>
  );
}
