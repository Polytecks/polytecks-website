"use client";

import { useEffect, useState } from "react";

/**
 * Theme values:
 *   dark    — default, no data-theme attribute on <html>.
 *   light   — full light; data-theme="light" on <html>.
 *   hybrid  — mostly dark, but specific scopes (partners ribbon + the
 *             devices page) opt into light via <ThemeScope>. <html>
 *             carries data-theme="hybrid"; CSS rules for [data-theme=
 *             "light"] do NOT match the html itself, so the rest of
 *             the site behaves as dark.
 */
export type Theme = "dark" | "light" | "hybrid";

const STORAGE_KEY = "polytecks:theme";

function readDocumentTheme(): Theme {
  const v = document.documentElement.dataset.theme;
  if (v === "light") return "light";
  if (v === "hybrid") return "hybrid";
  return "dark";
}

/**
 * Source of truth is `document.documentElement.dataset.theme`, set first
 * by the inline anti-FOUC script in layout.tsx, then mutated by
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
    setThemeState(readDocumentTheme());
    // Keep in sync if anything else (inline script, cross-tab) mutates the attr.
    const observer = new MutationObserver(() => {
      setThemeState(readDocumentTheme());
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
      document.documentElement.dataset.theme = next;
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
