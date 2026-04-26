export type PillarVisual =
  | { kind: "image"; src: string; alt: string; objectPosition?: string; filter?: string }
  | { kind: "signal" };

export type PillarContent = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  /** Always rendered. */
  restVisual: PillarVisual;
  /** Rendered, but visually hidden until pillar is active. */
  detailVisual: PillarVisual;
  /** ~40 words. */
  body: string;
};

// NOTE: All `body` strings are placeholder Lorem ipsum.
// Real claims to be supplied later — search for "// TODO: real claim".
export const PILLARS: PillarContent[] = [
  {
    id: "materials",
    number: "01",
    title: "New Materials",
    subtitle: "New sensing possibilities",
    restVisual: {
      kind: "image",
      src: "/assets/array-mosaic.jpg",
      alt: "Cropped detail of the Polytecks electrode array sheet",
      objectPosition: "20% 30%",
      filter: "grayscale(0.4) contrast(1.25) brightness(0.95)",
    },
    detailVisual: {
      kind: "image",
      src: "/assets/array-mosaic.jpg",
      alt: "Wider view of the array sheet showing electrode lattice",
      objectPosition: "center 35%",
      filter: "grayscale(0.2) contrast(1.15) brightness(0.95)",
    },
    // TODO: real claim about conducting-polymer wet-dry electrodes
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod " +
      "tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim " +
      "veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    id: "form",
    number: "02",
    title: "New Form",
    subtitle: "Engineered for ease-of-use",
    restVisual: {
      kind: "image",
      src: "/assets/polytecks-arm-v2.png",
      alt: "Polytecks hexagonal electrode array on forearm",
      objectPosition: "55% 40%",
    },
    detailVisual: {
      kind: "image",
      src: "/assets/polytecks-arm-v2.png",
      alt: "Wider view of the array conforming to forearm anatomy",
      objectPosition: "center center",
    },
    // TODO: real claim about textile-integrated mechanical design
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod " +
      "tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim " +
      "veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    id: "intelligence",
    number: "03",
    title: "New Intelligence",
    subtitle: "Signal made meaningful",
    // TODO: split detailVisual into noisy "wet electrode" trace + clean "Polytecks" trace, stacked
    restVisual: { kind: "signal" },
    detailVisual: { kind: "signal" },
    // TODO: real claim about software / decision-support layer
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod " +
      "tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim " +
      "veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
];
