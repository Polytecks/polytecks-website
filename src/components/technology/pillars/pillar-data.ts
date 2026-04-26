export type PillarVisual =
  | { kind: "image"; src: string; alt: string; width: number; height: number }
  | { kind: "video"; src: string; alt: string };

export type PillarContent = {
  id: string;
  title: string;
  subtitle: string;
  visual: PillarVisual;
  /** ~40 words. */
  body: string;
};

// NOTE: All `body` strings are placeholder Lorem ipsum.
// Real claims to be supplied later — search for "// TODO: real claim".
export const PILLARS: PillarContent[] = [
  {
    id: "materials",
    title: "New Materials",
    subtitle: "New sensing possibilities",
    visual: {
      kind: "image",
      // Filename has a capital M but no spaces — used verbatim.
      src: "/assets/Materials.jpg",
      alt: "Polytecks electrode material — close-up texture",
      width: 1600,
      height: 1000,
    },
    // TODO: real claim about conducting-polymer wet-dry electrodes
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod " +
      "tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim " +
      "veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    id: "form",
    title: "New Form",
    subtitle: "Engineered for ease-of-use",
    visual: {
      kind: "image",
      // Filename has a space — URL-encoded so Next/Image accepts it cleanly.
      src: "/assets/Polytecks%20Form.png",
      alt: "Polytecks textile-integrated electrode array",
      width: 1600,
      height: 1000,
    },
    // TODO: real claim about textile-integrated mechanical design
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod " +
      "tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim " +
      "veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    id: "intelligence",
    title: "New Intelligence",
    subtitle: "Signal made meaningful",
    visual: {
      kind: "video",
      src: "/assets/information.webm",
      alt: "Bioelectric signal reconstruction — animated visualisation",
    },
    // TODO: real claim about software / decision-support layer
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod " +
      "tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim " +
      "veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
];
