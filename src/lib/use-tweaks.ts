"use client";

import { useCallback, useEffect, useState } from "react";

export type TweakAccent = "indigo" | "cyan" | "green";
export type ActiveTheme = "indigo" | "lighter" | "cool";
export type ImageStyle = "framed" | "banner" | "background";

export type TweakValues = {
  pillarPop: number;     // 1.0 → 1.8 (active grows by this multiplier)
  siblingDim: number;    // 0 → 0.7 (opacity offset for siblings)
  animMs: number;        // 200 → 600 (transition speed)
  accent: TweakAccent;   // global brand accent
  rhythm: number;        // 0.7 → 1.4 (vertical-padding multiplier)
  activeTheme: ActiveTheme; // active-pillar background+border
  imageStyle: ImageStyle;   // per-pillar image layout at rest
  imageScale: number;       // 1.0 → 2.0 (object-scale within container)
  imagePosY: number;        // 0 → 100 (object-position Y%)
};

export const TWEAK_DEFAULTS: TweakValues = {
  pillarPop: 1.6,
  siblingDim: 0.5,
  animMs: 350,
  accent: "indigo",
  rhythm: 1.0,
  activeTheme: "cool",
  imageStyle: "framed",
  imageScale: 1.0,
  imagePosY: 50,
};

const STORAGE_KEY = "polytecks:tweaks";

const ACCENT_HEX: Record<TweakAccent, string> = {
  indigo: "#6a74dc",
  cyan: "#5cd9e8",
  green: "#34d399",
};

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
  body.style.setProperty("--tw-pillar-pop", String(values.pillarPop));
  body.style.setProperty("--tw-sibling-dim", String(values.siblingDim));
  body.style.setProperty("--tw-anim-ms", `${values.animMs}ms`);
  body.style.setProperty("--tw-rhythm", String(values.rhythm));
  body.style.setProperty("--indigo-bright", ACCENT_HEX[values.accent]);

  const theme = ACTIVE_THEMES[values.activeTheme];
  body.style.setProperty("--tw-active-bg", theme.bg);
  body.style.setProperty("--tw-active-border", theme.border);

  body.dataset.imageStyle = values.imageStyle;
  body.style.setProperty("--tw-img-scale", String(values.imageScale));
  body.style.setProperty("--tw-img-pos-y", `${values.imagePosY}%`);
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

export function applyStoredTweaks() {
  if (typeof window === "undefined") return;
  applyToBody(readStored());
}
