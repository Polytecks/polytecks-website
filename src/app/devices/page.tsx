import { ApplicationsStrip } from "@/components/devices/applications-strip";
import { FirstDevice } from "@/components/devices/first-device";
import { IndicationsTimeline } from "@/components/devices/indications-timeline";
import { PlatformCta } from "@/components/devices/platform-cta";
import { Subpage, SubpageHeader } from "@/components/subpage";
import styles from "./page.module.css";

export default function DevicesPage() {
  return (
    <Subpage className={styles.subpage}>
      <SubpageHeader
        eyebrow="Devices"
        title={
          <>
            Making disease easier to <em>spot</em>, diagnose, and manage.
          </>
        }
        lede="The Mosaic Sensor platform can bring imaging-level insights into primary care, and even earlier. Across all domains of health."
        boldLede
      />
      <ApplicationsStrip />
      <FirstDevice />
      <IndicationsTimeline />
      <PlatformCta />
    </Subpage>
  );
}
