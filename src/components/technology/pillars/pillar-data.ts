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
    body:
      "Polytecks has developed a new group of conductive materials designed to " +
      "replace the conventional electrode. Soft, conformable and gel-free, they " +
      "allow us to collect richer bioelectrical signals from the body, opening " +
      "the door to diagnostic possibilities that standard electrodes were never " +
      "built to reach.",
  },
  {
    id: "form",
    title: "New Form",
    subtitle: "Flexible, conformable arrays",
    visual: {
      kind: "image",
      // Filename has a space — URL-encoded so Next/Image accepts it cleanly.
      src: "/assets/Polytecks%20Form.png",
      alt: "Polytecks textile-integrated electrode array",
      width: 1600,
      height: 1000,
    },
    body:
      "We integrate our sensing materials directly into flexible fabrics, " +
      "turning electrode arrays into wearable surfaces rather than rigid " +
      "devices. This makes high-density bioelectrical mapping easier to apply, " +
      "easier to repeat and far better suited to point-of-care and ambulatory " +
      "use.",
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
    body:
      "High-resolution signals are only useful if they can be understood. " +
      "Mosaic transforms dense bioelectrical data into spatial maps and " +
      "decision-support tools, helping reveal physiological patterns that " +
      "conventional recordings often miss.",
  },
];
