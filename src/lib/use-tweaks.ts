"use client";

import { useCallback, useEffect, useState } from "react";

export type TweakAccent = "indigo" | "cyan" | "green";

export type TweakValues = {
  pillarPop: number;     // 1.0 → 1.8
  siblingDim: number;    // 0 → 0.7 (used as opacity offset; 0 = no dim)
  animMs: number;        // 200 → 600
  accent: TweakAccent;   // swatch
  rhythm: number;        // 0.7 → 1.4 (multiplier on section padding)
};

export const TWEAK_DEFAULTS: TweakValues = {
  pillarPop: 1.6,
  siblingDim: 0.5,
  animMs: 350,
  accent: "indigo",
  rhythm: 1.0,
};

const STORAGE_KEY = "polytecks:tweaks";

const ACCENT_HEX: Record<TweakAccent, string> = {
  indigo: "#6a74dc",
  cyan: "#5cd9e8",
  green: "#34d399",
};

function applyToBody(values: TweakValues) {
  const body = document.body;
  body.style.setProperty("--tw-pillar-pop", String(values.pillarPop));
  body.style.setProperty("--tw-sibling-dim", String(values.siblingDim));
  body.style.setProperty("--tw-anim-ms", `${values.animMs}ms`);
  body.style.setProperty("--tw-rhythm", String(values.rhythm));
  body.style.setProperty("--indigo-bright", ACCENT_HEX[values.accent]);
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
    // justified here: without it, the panel's sliders render at defaults on
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
