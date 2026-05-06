"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type TweakAccent = "indigo" | "cyan" | "green";
export type ActiveTheme = "indigo" | "lighter" | "cool";
export type ImageStyle = "framed" | "banner" | "background";
export type CardId = "materials" | "form" | "intelligence";
export type ImageState = "rest" | "active";
export type TitleAnim = "wipe" | "cascade" | "stack";
export type EasingMode = "linear" | "eased" | "aggressive";
export type PanelTone = "pure" | "off-white" | "paper";
export type LabelWeight = 300 | 400 | 500;

export type ImageTweak = {
  scale: number;       // 1.0 → 2.5 (transform: scale on the img element)
  posX: number;        // 0 → 100 (object-position-x %)
  posY: number;        // 0 → 100 (object-position-y %)
  /** Active-state only: image-window width as % of available card width. */
  widthPct: number;    // 40 → 100
  /** Active-state only: image-window height in px. */
  heightPx: number;    // 120 → 400
  /** Active-state only: card's min-height — controls how far the active card extends downwards. */
  cardHeightPx: number; // 480 → 800
};

export type CardImageTweaks = Record<ImageState, ImageTweak>;

export type TweakValues = {
  pillarPop: number;
  siblingDim: number;
  animMs: number;
  accent: TweakAccent;
  rhythm: number;
  activeTheme: ActiveTheme;
  imageStyle: ImageStyle;
  /** Per-card per-state image positioning. */
  imageTweaks: Record<CardId, CardImageTweaks>;

  // Proof section (Tab 2)
  pinScrollMult: number;       // 1.5 → 4
  cardNumberSize: number;       // 60 → 200 (px)
  cardLabelSize: number;        // 14 → 32 (px)
  easing: EasingMode;
  phaseOverlap: number;        // 0 → 0.25
  vignette: number;            // 0 → 0.6
  panelTone: PanelTone;
  labelWeight: LabelWeight;

  // Page Fx (Tab 3)
  titleAnim: TitleAnim;
  titleDurationMs: number;     // 300 → 1500
  titleStaggerMs: number;      // 0 → 200
  topoLinesOnWhite: boolean;
  stackDurationMs: number;     // 200 → 1500
  stackOverlapPct: number;     // 0 → 100 (% overlap with previous element's animation)
  pillarCardStaggerMs: number; // 0 → 500
  devicesIconStaggerMs: number; // 20 → 250 (ms between each icon entry)

  // Cambridge callout text position (relative to the image)
  // Wider ranges so the callout can be placed anywhere over/around the image.
  cambridgeCalloutTopVh: number;   // 0 → 100 (vh — top offset from image top)
  cambridgeCalloutLeftVw: number;  // 0 → 100 (vw — left offset from image left)
  // Cambridge body callout ("Polytecks grew out of…") — positioned
  // independently from the ECG callout so the two can sit side-by-side.
  cambridgeBodyCalloutTopVh: number;   // 0 → 100 (vh)
  cambridgeBodyCalloutLeftVw: number;  // 0 → 100 (vw)
  // Cambridge image fade controls
  cambridgeImgScale: number;     // 0.4 → 1.5, default 1 (multiplier on base size)
  cambridgeCropBottom: number;   // 0 → 0.6, default 0 (fraction trimmed from bottom)
  cambridgeCropSides: number;    // 0 → 0.4, default 0 (fraction trimmed from sides)
  cambridgeSideFadePct: number;  // 0 → 30, default 8 (% reach inward from each side)
  cambridgeBottomFadePct: number;// 0 → 50, default 15 (% reach upward from bottom)


  // Contact image — independent: image scale, offset, spotlight position, spotlight size
  contactImgScale: number;       // 0.5 → 2.0, default 1 (multiplier on rendered width/height)
  contactImgOffsetXPct: number;  // 0 → 40, default 0 (% of image width shifted right, off-screen)
  contactSpotXPct: number;       // 30 → 100, default 67 (X centre of spotlight, viewport-anchored)
  contactSpotYPct: number;       // 20 → 80, default 50 (Y centre of spotlight, viewport-anchored)
  contactSpotSizePct: number;    // 30 → 120, default 80 (radial-gradient size, both axes)

  // Landing entry animation timing
  landingArmDelayMs: number;       // 0 → 3000
  landingSubDelayMs: number;       // 0 → 3000
  landingCta1DelayMs: number;      // 0 → 3000
  landingCta2DelayMs: number;      // 0 → 3000
  landingElemDurationMs: number;   // 200 → 2000
  landingHeroShiftPx: number;      // 0 → 200, default 0

  proofPulseIntensity: number;         // 0 → 0.15, default 0.04 (legacy — kept for backward compat with stored snapshots; no longer used)

  // Spacing controls (Tab 4) — vertical gaps in px
  homeMissionMargin: number;          // 0 → 200, default 80
  homeRibbonMargin: number;           // 0 → 200, default 80
  aboutHeaderToCambridge: number;     // 100 → 600, default 320 (matches existing)
  aboutCambridgeToTeam: number;       // 0 → 300, default 80
  aboutTeamGap: number;               // 0 → 200, default 80
  techHeroToPillars: number;          // 0 → 200, default 0
  techPillarsToProof: number;         // 0 → 200, default 0
  techProofToPhilosophy: number;      // 0 → 200, default 0
  devicesHeaderToStrip: number;       // 0 → 160, default 32 (px above icon strip)
  devicesStripGapBelow: number;       // 0 → 160, default 32 (px below icon strip, before tabs)
  devicesIconRowGapY: number;         // 12 → 64, default 12 (px between icon and label inside strip)
  careersValuesBottom: number;        // 80 → 480, default 200 (px black-panel padding under values grid before fade)
};

const DEFAULT_IMAGE_TWEAK: ImageTweak = {
  scale: 1.0,
  posX: 50,
  posY: 50,
  widthPct: 100,
  heightPx: 200,
  cardHeightPx: 520,
};

// Locked-in defaults from tweaks-snapshot.json (2026-04-27).
export const TWEAK_DEFAULTS: TweakValues = {
  pillarPop: 1.45,
  siblingDim: 0.25,
  animMs: 600,
  accent: "indigo",
  rhythm: 1.3,
  activeTheme: "lighter",
  imageStyle: "background",
  imageTweaks: {
    materials: {
      rest:   { scale: 1.0, posX: 58, posY: 0,  widthPct: 100, heightPx: 200, cardHeightPx: 520 },
      active: { scale: 1.0, posX: 64, posY: 96, widthPct: 72,  heightPx: 275, cardHeightPx: 620 },
    },
    form: {
      rest:   { scale: 1.0, posX: 38, posY: 34, widthPct: 100, heightPx: 200, cardHeightPx: 520 },
      active: { scale: 1.2, posX: 80, posY: 50, widthPct: 66,  heightPx: 260, cardHeightPx: 600 },
    },
    intelligence: {
      rest:   { scale: 1.55, posX: 50, posY: 50, widthPct: 100, heightPx: 200, cardHeightPx: 520 },
      active: { scale: 1.0,  posX: 50, posY: 50, widthPct: 70,  heightPx: 350, cardHeightPx: 630 },
    },
  },

  pinScrollMult: 3,
  cardNumberSize: 120,
  cardLabelSize: 22,
  easing: "eased",
  phaseOverlap: 0,
  vignette: 0.2,
  panelTone: "pure",
  labelWeight: 400,
  proofPulseIntensity: 0.04,

  titleAnim: "wipe",
  titleDurationMs: 700,
  titleStaggerMs: 60,
  topoLinesOnWhite: true,
  stackDurationMs: 600,
  stackOverlapPct: 30,
  pillarCardStaggerMs: 120,
  devicesIconStaggerMs: 80,

  cambridgeCalloutTopVh: 10,
  cambridgeCalloutLeftVw: 54,
  cambridgeBodyCalloutTopVh: 10,
  cambridgeBodyCalloutLeftVw: 8,
  cambridgeImgScale: 1,
  cambridgeCropBottom: 0.18,
  cambridgeCropSides: 0,
  cambridgeSideFadePct: 8,
  cambridgeBottomFadePct: 15,


  contactImgScale: 1,
  contactImgOffsetXPct: 0,
  contactSpotXPct: 67,
  contactSpotYPct: 50,
  contactSpotSizePct: 80,

  landingArmDelayMs: 800,
  landingSubDelayMs: 1600,
  landingCta1DelayMs: 1800,
  landingCta2DelayMs: 1950,
  landingElemDurationMs: 900,
  landingHeroShiftPx: 0,

  homeMissionMargin: 80,
  // Aligned with WEBSITE_REFERENCE.md §3.3 default (0 px). Was 80 px,
  // which stacked on top of .ribbon's 80 px padding-top to put 161 px
  // of dead black space between the white mission panel and the
  // "AFFILIATIONS AND PARTNERS" eyebrow on every viewport.
  homeRibbonMargin: 0,
  aboutHeaderToCambridge: 380,
  aboutCambridgeToTeam: 160,
  aboutTeamGap: 120,
  techHeroToPillars: 0,
  techPillarsToProof: 0,
  techProofToPhilosophy: 0,
  devicesHeaderToStrip: 32,
  devicesStripGapBelow: 90,
  devicesIconRowGapY: 12,
  careersValuesBottom: 240,
};

const STORAGE_KEY = "polytecks:tweaks";

const ACCENT_HEX: Record<TweakAccent, string> = {
  indigo: "#6a74dc",
  cyan: "#5cd9e8",
  green: "#34d399",
};

const ACTIVE_THEMES: Record<ActiveTheme, { bg: string; border: string }> = {
  indigo:  { bg: "rgba(74, 84, 192, 0.08)",  border: "rgba(168, 176, 243, 0.45)" },
  lighter: { bg: "rgba(142, 152, 238, 0.16)", border: "rgba(168, 176, 243, 0.7)"  },
  cool:    { bg: "rgba(255, 255, 255, 0.07)", border: "rgba(255, 255, 255, 0.3)"  },
};

const PANEL_TONES: Record<PanelTone, string> = {
  "pure":      "#ffffff",
  "off-white": "#fafaf8",
  "paper":     "#f4f1ea",
};

function applyToBody(values: TweakValues) {
  const body = document.body;
  body.style.setProperty("--tw-pillar-pop", String(values.pillarPop));
  body.style.setProperty("--tw-sibling-dim", String(values.siblingDim));
  body.style.setProperty("--tw-anim-ms", `${values.animMs}ms`);
  body.style.setProperty("--tw-rhythm", String(values.rhythm));
  body.style.setProperty("--tw-accent", ACCENT_HEX[values.accent]);

  const theme = ACTIVE_THEMES[values.activeTheme];
  body.style.setProperty("--tw-active-bg", theme.bg);
  body.style.setProperty("--tw-active-border", theme.border);

  body.dataset.imageStyle = values.imageStyle;

  // Proof section knobs (consumed by ProofSection / ProofCard CSS)
  body.style.setProperty("--tw-pin-scroll", String(values.pinScrollMult));
  body.style.setProperty("--tw-proof-height", `${values.pinScrollMult * 100}vh`);
  body.style.setProperty("--tw-card-number-size", `${values.cardNumberSize}px`);
  body.style.setProperty("--tw-card-label-size", `${values.cardLabelSize}px`);
  body.style.setProperty("--tw-vignette", String(values.vignette));
  body.style.setProperty("--tw-panel-tone", PANEL_TONES[values.panelTone]);
  body.style.setProperty("--tw-label-weight", String(values.labelWeight));
  body.style.setProperty("--proof-pulse-intensity", String(values.proofPulseIntensity));

  // Page Fx
  body.style.setProperty("--tw-title-duration", `${values.titleDurationMs}ms`);
  body.style.setProperty("--tw-title-stagger", `${values.titleStaggerMs}ms`);
  body.dataset.titleAnim = values.titleAnim;
  body.style.setProperty(
    "--mission-panel-bg",
    values.topoLinesOnWhite ? "transparent" : "#000",
  );

  // Stack animation
  body.style.setProperty("--stack-duration-ms", `${values.stackDurationMs}ms`);
  // Stagger = duration * (1 - overlapPct/100). 0% overlap = each starts after previous finishes; 100% = simultaneous.
  const staggerMs = Math.round(values.stackDurationMs * (1 - values.stackOverlapPct / 100));
  body.style.setProperty("--stack-stagger-ms", `${staggerMs}ms`);
  body.style.setProperty("--pillar-card-stagger-ms", `${values.pillarCardStaggerMs}ms`);
  body.style.setProperty("--devices-icon-stagger-ms", `${values.devicesIconStaggerMs}ms`);

  // Cambridge callout text position — emitted as `%` so the value
  // resolves against the parent .media (the image container) rather
  // than the viewport. With the previous `vh`/`vw` units the callouts
  // drifted off the image on wider screens once the image hit its
  // max-width cap (image stops growing, viewport keeps growing,
  // viewport-relative offsets keep growing past the image edge).
  body.style.setProperty("--tw-cb-callout-top", `${values.cambridgeCalloutTopVh}%`);
  body.style.setProperty("--tw-cb-callout-left", `${values.cambridgeCalloutLeftVw}%`);
  body.style.setProperty("--tw-cb-body-callout-top", `${values.cambridgeBodyCalloutTopVh}%`);
  body.style.setProperty("--tw-cb-body-callout-left", `${values.cambridgeBodyCalloutLeftVw}%`);

  // Cambridge image — single source of truth: the box.
  body.style.setProperty("--tw-cb-scale", String(values.cambridgeImgScale));
  body.style.setProperty("--tw-cb-crop-bottom", String(values.cambridgeCropBottom));
  body.style.setProperty("--tw-cb-crop-sides", String(values.cambridgeCropSides));
  body.style.setProperty("--tw-cb-side-fade", `${values.cambridgeSideFadePct}%`);
  body.style.setProperty("--tw-cb-bottom-fade", `${values.cambridgeBottomFadePct}%`);


  // Contact image — scale, offset, spotlight (all independent)
  body.style.setProperty("--tw-contact-img-scale", String(values.contactImgScale));
  body.style.setProperty("--tw-contact-img-offset-x", `${values.contactImgOffsetXPct}%`);
  body.style.setProperty("--tw-contact-spot-x", `${values.contactSpotXPct}%`);
  body.style.setProperty("--tw-contact-spot-y", `${values.contactSpotYPct}%`);
  body.style.setProperty("--tw-contact-spot-size", `${values.contactSpotSizePct}%`);

  // Spacing
  body.style.setProperty("--sp-home-mission", `${values.homeMissionMargin}px`);
  body.style.setProperty("--sp-home-ribbon", `${values.homeRibbonMargin}px`);
  body.style.setProperty("--sp-about-header-to-cambridge", `${values.aboutHeaderToCambridge}px`);
  body.style.setProperty("--sp-about-cambridge-to-team", `${values.aboutCambridgeToTeam}px`);
  body.style.setProperty("--sp-about-team-gap", `${values.aboutTeamGap}px`);
  body.style.setProperty("--sp-tech-hero-to-pillars", `${values.techHeroToPillars}px`);
  body.style.setProperty("--sp-tech-pillars-to-proof", `${values.techPillarsToProof}px`);
  body.style.setProperty("--sp-tech-proof-to-philosophy", `${values.techProofToPhilosophy}px`);
  body.style.setProperty("--sp-devices-header-to-strip", `${values.devicesHeaderToStrip}px`);
  body.style.setProperty("--sp-devices-strip-gap-below", `${values.devicesStripGapBelow}px`);
  body.style.setProperty("--sp-devices-icon-row-gap", `${values.devicesIconRowGapY}px`);
  body.style.setProperty("--sp-careers-values-bottom", `${values.careersValuesBottom}px`);

  // Landing entry animation timing
  body.style.setProperty("--landing-arm-delay", `${values.landingArmDelayMs}ms`);
  body.style.setProperty("--landing-sub-delay", `${values.landingSubDelayMs}ms`);
  body.style.setProperty("--landing-cta1-delay", `${values.landingCta1DelayMs}ms`);
  body.style.setProperty("--landing-cta2-delay", `${values.landingCta2DelayMs}ms`);
  body.style.setProperty("--landing-elem-duration", `${values.landingElemDurationMs}ms`);
  body.style.setProperty("--landing-hero-shift", `${values.landingHeroShiftPx}px`);
}

function readStored(): TweakValues {
  if (typeof window === "undefined") return TWEAK_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return TWEAK_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<TweakValues>;

    // Deep-merge imageTweaks all the way down to per-state ImageTweak fields,
    // so a stored snapshot from before we added a new field (e.g. cardHeightPx)
    // doesn't leave that field undefined and turn `${value}px` into "undefinedpx".
    const cardIds = Object.keys(TWEAK_DEFAULTS.imageTweaks) as CardId[];
    const mergedImageTweaks = cardIds.reduce<Record<CardId, CardImageTweaks>>((acc, cardId) => {
      const stored = parsed.imageTweaks?.[cardId];
      acc[cardId] = {
        rest:   { ...DEFAULT_IMAGE_TWEAK, ...(stored?.rest ?? {}) },
        active: { ...DEFAULT_IMAGE_TWEAK, ...(stored?.active ?? {}) },
      };
      return acc;
    }, {} as Record<CardId, CardImageTweaks>);

    return {
      ...TWEAK_DEFAULTS,
      ...parsed,
      imageTweaks: mergedImageTweaks,
    };
  } catch {
    return TWEAK_DEFAULTS;
  }
}

type TweaksAPI = {
  values: TweakValues;
  setValue: <K extends keyof TweakValues>(key: K, value: TweakValues[K]) => void;
  setCardImageTweak: (
    cardId: CardId,
    state: ImageState,
    patch: Partial<ImageTweak>,
  ) => void;
  reset: () => void;
  hydrated: boolean;
};

const TweaksContext = createContext<TweaksAPI | null>(null);

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<TweakValues>(TWEAK_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = readStored();
    applyToBody(initial);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(initial);
    setHydrated(true);
  }, []);

  const persistAndApply = useCallback((next: TweakValues) => {
    applyToBody(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota / private-mode failures
    }
  }, []);

  const setValue = useCallback(<K extends keyof TweakValues>(key: K, value: TweakValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      persistAndApply(next);
      return next;
    });
  }, [persistAndApply]);

  const setCardImageTweak = useCallback(
    (cardId: CardId, state: ImageState, patch: Partial<ImageTweak>) => {
      setValues((prev) => {
        const next: TweakValues = {
          ...prev,
          imageTweaks: {
            ...prev.imageTweaks,
            [cardId]: {
              ...prev.imageTweaks[cardId],
              [state]: { ...prev.imageTweaks[cardId][state], ...patch },
            },
          },
        };
        persistAndApply(next);
        return next;
      });
    },
    [persistAndApply],
  );

  const reset = useCallback(() => {
    setValues(TWEAK_DEFAULTS);
    applyToBody(TWEAK_DEFAULTS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <TweaksContext.Provider value={{ values, setValue, setCardImageTweak, reset, hydrated }}>
      {children}
    </TweaksContext.Provider>
  );
}

/**
 * Consume the tweaks context. Falls back to defaults (no-op setters) when
 * called outside the provider — keeps SSR / non-tweaked-page renders safe.
 */
export function useTweaks(): TweaksAPI {
  const ctx = useContext(TweaksContext);
  if (ctx) return ctx;
  return {
    values: TWEAK_DEFAULTS,
    setValue: () => {},
    setCardImageTweak: () => {},
    reset: () => {},
    hydrated: false,
  };
}

/**
 * Apply stored tweaks to document.body. Useful for pages that don't render
 * the panel or section but should still reflect the persisted accent/etc.
 */
export function applyStoredTweaks() {
  if (typeof window === "undefined") return;
  applyToBody(readStored());
}
