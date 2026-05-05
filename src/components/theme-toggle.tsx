"use client";

import { useTheme, type Theme } from "@/lib/use-theme";
import styles from "./theme-toggle.module.css";

/**
 * 3-state theme button. Cycles dark → light → hybrid → dark.
 * Hybrid is "mostly dark with the partners ribbon and the devices
 * page rendered in the light palette" — see <ThemeScope/>.
 *
 * The `useTheme` hook persists the choice to localStorage; the
 * inline anti-FOUC script in layout.tsx applies the persisted value
 * to <html> before first paint so the page never flashes the wrong
 * theme on reload.
 */
const NEXT: Record<Theme, Theme> = {
  dark: "light",
  light: "hybrid",
  hybrid: "dark",
};

const LABEL: Record<Theme, string> = {
  dark: "Dark",
  light: "Light",
  hybrid: "Hybrid",
};

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const next = NEXT[theme];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={styles.btn}
      aria-label={`Switch to ${LABEL[next]} theme (current: ${LABEL[theme]})`}
      title={`Switch to ${LABEL[next]} theme`}
    >
      {theme === "dark" ? (
        // Sun glyph — shown while dark theme is active (next click → light).
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
          <circle cx="10" cy="10" r="3.4" />
          <path d="M10 2.5v1.6M10 15.9v1.6M2.5 10h1.6M15.9 10h1.6M4.7 4.7l1.1 1.1M14.2 14.2l1.1 1.1M15.3 4.7l-1.1 1.1M5.8 14.2l-1.1 1.1" />
        </svg>
      ) : theme === "light" ? (
        // Moon glyph — shown while light theme is active (next click → hybrid).
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16.2 12.4A6.4 6.4 0 0 1 7.6 3.8a6.4 6.4 0 1 0 8.6 8.6Z" />
        </svg>
      ) : (
        // Half-disc glyph — shown while hybrid theme is active (next click → dark).
        // Solid left half + outlined right half signals the "split" composition.
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <circle cx="10" cy="10" r="6.6" />
          <path d="M10 3.4 A 6.6 6.6 0 0 0 10 16.6 Z" fill="currentColor" stroke="none" />
        </svg>
      )}
    </button>
  );
}
