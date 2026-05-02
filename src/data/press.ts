export type PressItem = {
  id: string;
  type: "press" | "podcast";
  outlet: string;
  title: string;
  /** Human-readable date, e.g. "March 2026". */
  date: string;
  /** Sortable ISO date, e.g. "2026-03-04". */
  iso: string;
  href: string;
  /** Reserved — not currently rendered, kept for future. */
  excerpt?: string;
  featured?: boolean;
  /** Mark items invented for prototyping; renders a FAB tag and is removed on real content. */
  fabricated?: boolean;
  /** Companion to `fabricated` — left as-is from the handoff data. */
  real?: boolean;
};

export type Publication = {
  id: string;
  authors: string[];
  title: string;
  journal: string;
  volume: string;
  pages: string;
  year: number;
  doi: string;
  affiliation: string;
  fabricated?: boolean;
};

export const PRESS_ITEMS: PressItem[] = [
  {
    id: "p1",
    real: true,
    type: "press",
    outlet: "Eureka Magazine",
    title: "New wearable sensor could transform cardiac monitoring during pregnancy",
    date: "May 2026",
    iso: "2026-05-12",
    href: "#",
    excerpt:
      "Researchers at Cambridge spin-out Polytecks have demonstrated a soft, gel-free electrode array capable of separating fetal and maternal cardiac signals through the abdominal wall — without ultrasound.",
    featured: true,
  },
  {
    id: "p2",
    real: true,
    type: "press",
    outlet: "Department of Engineering, Cambridge",
    title: "From lab to market: Department spin-out develops wearable e-textile tech",
    date: "April 2026",
    iso: "2026-04-22",
    href: "#",
    excerpt:
      "Polytecks, founded by Department of Engineering alumni, raises seed funding to commercialise conducting-polymer textiles for continuous cardiac monitoring outside the clinic.",
    featured: true,
  },
  {
    id: "p3",
    real: true,
    type: "press",
    outlet: "Photonics CDT",
    title: "CDT graduate presents novel health tech at House of Lords",
    date: "March 2026",
    iso: "2026-03-04",
    href: "#",
    excerpt:
      "Polytecks co-founder presented bioelectrical sensing research to peers and policy-makers at a House of Lords reception on UK deep-tech translation.",
    featured: true,
  },
  {
    id: "p4",
    real: true,
    type: "podcast",
    outlet: "The Project Cambridge Show",
    title: "Episode 5: From Pets to Patients — Bioelectronic Cardio",
    date: "February 2026",
    iso: "2026-02-18",
    href: "#",
    excerpt:
      "Co-founders walk through the unusual path from veterinary pilots to a maternal-health platform, and what bioelectronic mapping can detect that ultrasound cannot.",
    featured: true,
  },
  {
    id: "p5",
    fabricated: true,
    type: "press",
    outlet: "Wired Health",
    title: "The skin is becoming a high-resolution interface to the heart",
    date: "January 2026",
    iso: "2026-01-30",
    href: "#",
    excerpt:
      "A new wave of UK deep-tech startups is treating the body's surface as a sensor array — and Polytecks is building the fabric to read it.",
    featured: true,
  },
  {
    id: "p6",
    fabricated: true,
    type: "press",
    outlet: "Med-Tech News",
    title: "Polytecks expands clinical pilot for ambulatory arrhythmia mapping",
    date: "December 2025",
    iso: "2025-12-10",
    href: "#",
    excerpt:
      "The Cambridge-based start-up will run a 200-patient feasibility study with two NHS trusts, comparing high-density surface mapping against 12-lead Holter recordings.",
  },
  {
    id: "p7",
    fabricated: true,
    type: "press",
    outlet: "BBC Cambridgeshire",
    title: "Cambridge-based startup making waves in maternal health",
    date: "November 2025",
    iso: "2025-11-04",
    href: "#",
    excerpt:
      "Local broadcast piece on a Cambridgeshire deep-tech team developing wearable patches that aim to bring imaging-grade insight to community antenatal care.",
  },
  {
    id: "p8",
    fabricated: true,
    type: "press",
    outlet: "Nature Outlook",
    title: "Bioelectronic textiles graduate from the lab bench",
    date: "September 2025",
    iso: "2025-09-15",
    href: "#",
    excerpt:
      "A feature on the move from rigid silicon electrodes to soft polymer fabrics — and the small set of teams (including Polytecks) bringing them to clinical readiness.",
  },
];

export const PUBLICATIONS: Publication[] = [
  {
    id: "pub1",
    fabricated: true,
    authors: ["Mateos Serrano R.", "MacDonald C.", "Brunt C.", "Malliaras G. G."],
    title:
      "High-density conducting-polymer textile arrays for non-invasive fetal electrocardiography across gestation",
    journal: "Nature Electronics",
    year: 2026,
    volume: "9",
    pages: "412–423",
    doi: "10.1038/s41928-026-01147-x",
    affiliation: "University of Cambridge · Imperial College London",
  },
  {
    id: "pub2",
    fabricated: true,
    authors: ["Mateos R.", "Hampton D.", "Patiño-Jiménez D.", "et al."],
    title:
      "Soft mosaic electrode arrays enable spatial mapping of atrial arrhythmias in primary care settings",
    journal: "Nature Biomedical Engineering",
    year: 2025,
    volume: "9",
    pages: "1284–1297",
    doi: "10.1038/s41551-025-01489-2",
    affiliation: "University of Cambridge · UCL · Durham University",
  },
  {
    id: "pub3",
    fabricated: true,
    authors: ["MacDonald C.", "Mateos Serrano R.", "Richardson J.", "Malliaras G. G."],
    title:
      "PEDOT:PSS e-textiles with stable skin-electrode impedance over 72-hour ambulatory recording",
    journal: "Advanced Materials",
    year: 2025,
    volume: "37",
    pages: "2401189",
    doi: "10.1002/adma.202401189",
    affiliation: "University of Cambridge",
  },
  {
    id: "pub4",
    fabricated: true,
    authors: ["Brunt C.", "Mateos Serrano R.", "et al."],
    title:
      "Blind-source separation of maternal–fetal bioelectrical signals using transformer-based time-frequency models",
    journal: "Biosensors and Bioelectronics",
    year: 2024,
    volume: "248",
    pages: "115903",
    doi: "10.1016/j.bios.2024.115903",
    affiliation: "Imperial College London · University of Cambridge",
  },
  {
    id: "pub5",
    fabricated: true,
    authors: ["Patiño-Jiménez D.", "Hampton D.", "Mateos R."],
    title:
      "Beat-to-beat estimation of fetal heart-rate variability from a 64-channel abdominal patch",
    journal: "Science Advances",
    year: 2024,
    volume: "10",
    pages: "eadk7421",
    doi: "10.1126/sciadv.adk7421",
    affiliation: "UCL · University of Cambridge",
  },
];

export function getFeaturedPressItems(): PressItem[] {
  return PRESS_ITEMS.filter((i) => i.featured);
}
