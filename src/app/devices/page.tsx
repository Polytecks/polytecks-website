import { ApplicationsStrip } from "@/components/devices/applications-strip";
import { FirstDevice } from "@/components/devices/first-device";
import { IndicationsTimeline } from "@/components/devices/indications-timeline";
import { PlatformCta } from "@/components/devices/platform-cta";
import { Subpage, SubpageHeader } from "@/components/subpage";
import { ThemeScope } from "@/components/theme-scope";
import styles from "./page.module.css";

export default function DevicesPage() {
  // ThemeScope renders this entire page in the light palette under
  // the "hybrid" theme; on pure dark/light it follows the html-level
  // theme as usual. Footer lives in the global layout outside this
  // wrapper, so it stays under whatever theme the html carries.
  return (
    <ThemeScope>
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
    </ThemeScope>
  );
}
