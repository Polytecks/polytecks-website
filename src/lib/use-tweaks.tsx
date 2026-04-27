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
  giantVh: number;             // 18 → 40 (vh)
  settleScale: number;         // 0.15 → 0.45
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
  giantVh: 30,
  settleScale: 0.25,
  easing: "eased",
  phaseOverlap: 0,
  vignette: 0.2,
  panelTone: "pure",
  labelWeight: 400,

  titleAnim: "wipe",
  titleDurationMs: 700,
  titleStaggerMs: 60,
  topoLinesOnWhite: true,
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
  body.style.setProperty("--tw-giant-vh", `${values.giantVh}vh`);
  body.style.setProperty("--tw-settle-scale", String(values.settleScale));
  body.style.setProperty("--tw-vignette", String(values.vignette));
  body.style.setProperty("--tw-panel-tone", PANEL_TONES[values.panelTone]);
  body.style.setProperty("--tw-label-weight", String(values.labelWeight));

  // Page Fx
  body.style.setProperty("--tw-title-duration", `${values.titleDurationMs}ms`);
  body.style.setProperty("--tw-title-stagger", `${values.titleStaggerMs}ms`);
  body.dataset.titleAnim = values.titleAnim;
  body.style.setProperty(
    "--mission-panel-bg",
    values.topoLinesOnWhite ? "transparent" : "#000",
  );
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
