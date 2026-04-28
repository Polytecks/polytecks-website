import { AppBlock } from "@/components/devices/app-block";
import { ApplicationsStrip } from "@/components/devices/applications-strip";
import { DevicesTabs } from "@/components/devices/devices-tabs";
import { VeterinaryPanel } from "@/components/devices/veterinary-panel";
import { StackEntry } from "@/components/stack-entry";
import { Subpage, SubpageHeader } from "@/components/subpage";

const ClinicalPanel = () => (
  <>
    <AppBlock
      imageLabel="Image · Fetal Monitoring"
      eyebrow="Clinical Application · 01"
      title="Fetal Monitoring"
    >
      <p>
        Polytecks&apos; high-density maternal-abdomen array separates fetal and
        maternal bioelectrical signals non-invasively, continuously, and
        without ultrasound. Our hexagonal sensor fabric conforms to the bump
        across gestational ages, enabling long-duration antepartum surveillance
        and earlier detection of fetal arrhythmia, growth restriction, and
        labour-risk markers — all from a single gel-free patch.
      </p>
    </AppBlock>

    <AppBlock
      reverse
      imageLabel="Image · Arrhythmia Mapping"
      eyebrow="Clinical Application · 02"
      title="Arrhythmia Mapping"
    >
      <p>
        By sampling the chest at millimetre resolution, Polytecks reconstructs
        the spatial propagation of cardiac electrical activity — not just the
        12 lead projections of a standard ECG. The result is a triage-ready
        view of atrial and ventricular arrhythmias in primary care, with the
        sensitivity to catch conditions that today require a cath-lab or
        extended Holter study to uncover.
      </p>
    </AppBlock>
  </>
);

const TABS = [
  { id: "clinical", label: "Clinical", panel: <ClinicalPanel /> },
  { id: "veterinary", label: "Veterinary", panel: <VeterinaryPanel /> },
];

export default function DevicesPage() {
  return (
    <Subpage>
      <SubpageHeader
        eyebrow="Devices"
        title={
          <>
            Making disease easier to <em>spot</em>, diagnose, and manage.
          </>
        }
        lede="The Mosaic Sensor platform can bring imaging-level insights into primary care — and even earlier. Across all domains of health."
      />
      <ApplicationsStrip />
      <StackEntry index={3}>
        <DevicesTabs tabs={TABS} />
      </StackEntry>
    </Subpage>
  );
}
