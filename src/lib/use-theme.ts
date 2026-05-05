"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "polytecks:theme";

/**
 * Theme hook. Source of truth is `document.documentElement.dataset.theme`,
 * set first by the inline anti-FOUC script in layout.tsx, then mutated by
 * `setTheme` and persisted to localStorage.
 *
 * Initial state is "dark" to match SSR (which has no localStorage and so
 * always emits the default markup). After mount we read the actual
 * data-theme attribute and update — this can briefly flash the toggle
 * icon's wrong state on first render but never affects the page colours,
 * which the inline script applies before paint.
 */
export function useTheme(): [Theme, (next: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setThemeState(current);
    // Keep in sync if anything else (inline script, cross-tab) mutates the attr.
    const observer = new MutationObserver(() => {
      const next = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      setThemeState(next);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const setTheme = (next: Theme) => {
    if (next === "dark") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = "light";
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore quota / private-mode errors */
    }
    setThemeState(next);
  };

  return [theme, setTheme];
}
