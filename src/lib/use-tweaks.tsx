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
};

const DEFAULT_IMAGE_TWEAK: ImageTweak = {
  scale: 1.0,
  posX: 50,
  posY: 50,
  widthPct: 100,
  heightPx: 200,
  cardHeightPx: 520,
};

export const TWEAK_DEFAULTS: TweakValues = {
  pillarPop: 1.6,
  siblingDim: 0.5,
  animMs: 350,
  accent: "indigo",
  rhythm: 1.0,
  activeTheme: "cool",
  imageStyle: "framed",
  imageTweaks: {
    materials: { rest: { ...DEFAULT_IMAGE_TWEAK }, active: { ...DEFAULT_IMAGE_TWEAK } },
    form: { rest: { ...DEFAULT_IMAGE_TWEAK }, active: { ...DEFAULT_IMAGE_TWEAK } },
    intelligence: { rest: { ...DEFAULT_IMAGE_TWEAK }, active: { ...DEFAULT_IMAGE_TWEAK } },
  },
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

function applyToBody(values: TweakValues) {
  const body = document.body;
  body.style.setProperty("--tw-pillar-pop", String(values.pillarPop));
  body.style.setProperty("--tw-sibling-dim", String(values.siblingDim));
  body.style.setProperty("--tw-anim-ms", `${values.animMs}ms`);
  body.style.setProperty("--tw-rhythm", String(values.rhythm));
  body.style.setProperty("--indigo-bright", ACCENT_HEX[values.accent]);

  const theme = ACTIVE_THEMES[values.activeTheme];
  body.style.setProperty("--tw-active-bg", theme.bg);
  body.style.setProperty("--tw-active-border", theme.border);

  body.dataset.imageStyle = values.imageStyle;
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
};

const TweaksContext = createContext<TweaksAPI | null>(null);

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<TweakValues>(TWEAK_DEFAULTS);

  useEffect(() => {
    const initial = readStored();
    applyToBody(initial);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(initial);
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
    <TweaksContext.Provider value={{ values, setValue, setCardImageTweak, reset }}>
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
