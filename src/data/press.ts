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
  /** Path under /public, e.g. "/assets/press-foo.jpeg". Rendered in the
   *  featured carousel; falls back to striped placeholder when absent. */
  image?: string;
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
    featured: true,
    type: "press",
    outlet: "Cambridge Judge Business School",
    title: "EnterpriseTECH community recognised in 21toWatch Top21.2026 awards",
    date: "March 2026",
    iso: "2026-03-10",
    href: "https://www.jbs.cam.ac.uk/2026/enterprisetech-community-recognised-in-21towatch-top21-2026-awards/",
    image: "/assets/press-cambridge-judge.jpeg",
    excerpt:
      "The 2026 winners of the 21toWatch awards include many alumni, innovations and companies supported by the Cambridge Judge Entrepreneurship Centre.",
  },
  {
    id: "p2",
    real: true,
    type: "press",
    outlet: "#21toWatch",
    title: "#21toWatch 2026 Winners Revealed",
    date: "March 2026",
    iso: "2026-03-06",
    href: "https://www.21towatch.com/21towatch-2026-winners-revealed-deeptech-founders-tackling-societys-toughest-health-and-climate-challenges",
    excerpt:
      "The #21toWatch Top21.2026 winners have been announced at an awards ceremony at The Glasshouse innovation hub in Cambridge.",
  },
  {
    id: "p3",
    real: true,
    featured: true,
    type: "press",
    outlet: "Photonics CDT",
    title: "CDT graduate presents novel health tech at House of Lords",
    date: "November 2025",
    iso: "2025-11-04",
    href: "https://www.pes-cdt.org/news/cdt-graduate-presents-novel-health-tech-at-house-of-lords",
    image: "/assets/press-photonics-cdt.jpeg",
    excerpt:
      "Ruben Ruiz-Mateos Serrano, a recent graduate of the EPSRC Centre for Doctoral Training in Connected Electronic and Photonic Systems (CEPS CDT) at the University of Cambridge, was invited to speak at the UK House of Lords.",
  },
  {
    id: "p4",
    real: true,
    type: "podcast",
    outlet: "The Project Cambridge Show",
    title:
      "Episode 5 — From Pets to Patients: Bioelectronic Cardio Innovation with Polytecks",
    date: "October 2025",
    iso: "2025-10-01",
    href: "https://podcasts.apple.com/nz/podcast/episode-5-from-pets-to-patients-bioelectronic-cardio/id1826949606?i=1000729456270",
    excerpt:
      "Podcast Episode · The Project Cambridge Show · 1 October 2025 · 31 min.",
  },
  {
    id: "p5",
    real: true,
    type: "press",
    outlet: "Eureka Magazine",
    title: "Polytecks Launches Wearable E-Textiles for Heart Diagnostics",
    date: "September 2025",
    iso: "2025-09-22",
    href: "https://www.eurekamagazine.co.uk/content/news/polytecks-launches-wearable-e-textiles-for-heart-diagnostics",
    excerpt:
      "Polytecks develops wearable e-textiles to deliver faster, more precise heart diagnostics.",
  },
  {
    id: "p6",
    real: true,
    type: "press",
    outlet: "Department of Engineering, Cambridge",
    title:
      "From lab to market: Department spin-out to develop wearable e-textile tech for early detection of heart defects",
    date: "September 2025",
    iso: "2025-09-17",
    href: "https://www.eng.cam.ac.uk/polytecks",
    excerpt:
      "Spun out of the Department of Engineering in 2025, Polytecks uses wearable e-textile high-density electrode arrays to capture high-resolution bioelectrical signals from the body’s surface. These signals are transmitted wirelessly and processed into detailed spatiotemporal maps using AI.",
  },
  {
    id: "p7",
    real: true,
    type: "press",
    outlet: "Cambridge Independent",
    title: "First SPARK intake adds King’s College to incubator narrative",
    date: "August 2025",
    iso: "2025-08-28",
    href: "https://www.cambridgeindependent.co.uk/business/first-spark-intake-adds-king-s-college-to-incubator-narrativ-9431504/",
    excerpt:
      "First cohort announced in accelerator with Founders at the University of Cambridge.",
  },
  {
    id: "p8",
    real: true,
    featured: true,
    type: "press",
    outlet: "University of Cambridge",
    title: "Startups to receive support in new programme",
    date: "August 2025",
    iso: "2025-08-20",
    href: "https://www.cam.ac.uk/news/startups-to-receive-support-in-new-programme",
    image: "/assets/press-cam-startups.jpeg",
    excerpt:
      "King’s Entrepreneurship Lab (King’s E-Lab) and Founders at the University of Cambridge revealed the 24 startups that will join King’s College’s first-ever incubator cohort.",
  },
];

export const PUBLICATIONS: Publication[] = [
  {
    id: "pub1",
    authors: [
      "Ruiz-Mateos Serrano R.",
      "Picchio M. L.",
      "Mantione D.",
      "Mecerreyes D.",
      "Malliaras G. G.",
    ],
    title:
      "Direct Gravity-Induced Modulation of Cardiac Conduction Pathways Evidenced Through Propagation Features in Electrophysiological Mapping",
    journal: "Advanced Materials Technologies",
    year: 2026,
    volume: "",
    pages: "e02642",
    doi: "10.1002/admt.202502642",
    affiliation:
      "University of Cambridge · POLYMAT, University of the Basque Country (UPV/EHU)",
  },
  {
    id: "pub2",
    authors: ["Ruiz-Mateos Serrano R."],
    title:
      "High-Density Electrode Arrays for Cutaneous Electrophysiology and Body Surface Potential Mapping: Design, fabrication and biomedical applications",
    journal: "PhD Thesis, University of Cambridge (Apollo Repository)",
    year: 2025,
    volume: "",
    pages: "",
    doi: "10.17863/CAM.122242",
    affiliation: "University of Cambridge",
  },
  {
    id: "pub3",
    authors: [
      "Ruiz-Mateos Serrano R.",
      "Farina D.",
      "Malliaras G. G.",
    ],
    title:
      "Body Surface Potential Mapping: A Perspective on High-Density Cutaneous Electrophysiology",
    journal: "Advanced Science",
    year: 2024,
    volume: "12",
    pages: "2411087",
    doi: "10.1002/advs.202411087",
    affiliation: "University of Cambridge · Imperial College London",
  },
  {
    id: "pub4",
    authors: [
      "Ruiz-Mateos Serrano R.",
      "Velasco-Bosom S.",
      "Dominguez-Alfaro A.",
      "Picchio M. L.",
      "Mantione D.",
      "Mecerreyes D.",
      "Malliaras G. G.",
    ],
    title:
      "High Density Body Surface Potential Mapping with Conducting Polymer-Eutectogel Electrode Arrays for ECG Imaging",
    journal: "Advanced Science",
    year: 2023,
    volume: "11",
    pages: "2301176",
    doi: "10.1002/advs.202301176",
    affiliation:
      "University of Cambridge · POLYMAT, University of the Basque Country (UPV/EHU)",
  },
];

export function getFeaturedPressItems(): PressItem[] {
  return PRESS_ITEMS.filter((i) => i.featured);
}
