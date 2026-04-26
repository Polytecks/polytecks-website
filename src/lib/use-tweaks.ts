"use client";

import { useCallback, useEffect, useState } from "react";

export type PillarVariant = "card" | "split";
export type ActiveTheme = "indigo" | "lighter" | "cool";

export type TweakValues = {
  variant: PillarVariant;
  activeTheme: ActiveTheme;
};

export const TWEAK_DEFAULTS: TweakValues = {
  variant: "card",
  activeTheme: "indigo",
};

const STORAGE_KEY = "polytecks:tweaks";

/**
 * Active-pillar background + border for each theme.
 * "indigo" matches the baseline tokens defined in globals.css.
 */
const ACTIVE_THEMES: Record<ActiveTheme, { bg: string; border: string }> = {
  indigo: {
    bg: "rgba(74, 84, 192, 0.08)",
    border: "rgba(168, 176, 243, 0.45)",
  },
  lighter: {
    bg: "rgba(142, 152, 238, 0.16)",
    border: "rgba(168, 176, 243, 0.7)",
  },
  cool: {
    bg: "rgba(255, 255, 255, 0.07)",
    border: "rgba(255, 255, 255, 0.3)",
  },
};

function applyToBody(values: TweakValues) {
  const body = document.body;
  body.dataset.pillarVariant = values.variant;
  const theme = ACTIVE_THEMES[values.activeTheme];
  body.style.setProperty("--tw-active-bg", theme.bg);
  body.style.setProperty("--tw-active-border", theme.border);
}

function readStored(): TweakValues {
  if (typeof window === "undefined") return TWEAK_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return TWEAK_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<TweakValues>;
    return { ...TWEAK_DEFAULTS, ...parsed };
  } catch {
    return TWEAK_DEFAULTS;
  }
}

export function useTweaks() {
  const [values, setValues] = useState<TweakValues>(TWEAK_DEFAULTS);

  useEffect(() => {
    const initial = readStored();
    applyToBody(initial);
    // Hydrating React state from localStorage on mount. setState-in-effect is
    // justified here: without it, the panel's controls render at defaults on
    // first paint instead of the user's persisted values.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(initial);
  }, []);

  const setValue = useCallback(<K extends keyof TweakValues>(key: K, value: TweakValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      applyToBody(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota / private-mode failures
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setValues(TWEAK_DEFAULTS);
    applyToBody(TWEAK_DEFAULTS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { values, setValue, reset };
}

/**
 * Lightweight applier for routes that don't render the panel.
 * Reads stored values once and applies them to document.body so the page
 * matches the last-tweaked state even without ?tweaks=1 in the URL.
 */
export function applyStoredTweaks() {
  if (typeof window === "undefined") return;
  applyToBody(readStored());
}
