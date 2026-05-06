"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/use-theme";
import styles from "./theme-toggle.module.css";

/**
 * Routes where the dark and light heroes have different `height`
 * values (the light hero is 115 vh to push the fade band past the
 * fold on first paint, the dark hero is 100 vh). Toggling theme on
 * these routes would smoothly animate the hero's height + cause
 * the cover-fitted background image to re-scale, producing a
 * visible jump. Force a full reload on these routes — the
 * inline anti-FOUC script in layout.tsx then renders the new theme
 * cleanly from scratch.
 */
const RELOAD_PATHS = ["/technology", "/careers"];

/**
 * Sun / moon button that flips between dark and light. The `useTheme`
 * hook persists the choice to localStorage; the inline anti-FOUC
 * script in layout.tsx applies the persisted value to <html> before
 * first paint so the page never flashes the wrong theme on reload.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const pathname = usePathname();
  const next = theme === "dark" ? "light" : "dark";

  const handleClick = () => {
    setTheme(next);
    const needsReload = RELOAD_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    if (needsReload) {
      // rAF gives the localStorage write + data-theme attribute set
      // a frame to land before the navigation kicks in.
      requestAnimationFrame(() => window.location.reload());
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={styles.btn}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === "dark" ? (
        // Sun glyph — shown while dark theme is active (click → light).
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
          <circle cx="10" cy="10" r="3.4" />
          <path d="M10 2.5v1.6M10 15.9v1.6M2.5 10h1.6M15.9 10h1.6M4.7 4.7l1.1 1.1M14.2 14.2l1.1 1.1M15.3 4.7l-1.1 1.1M5.8 14.2l-1.1 1.1" />
        </svg>
      ) : (
        // Moon glyph — shown while light theme is active (click → dark).
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16.2 12.4A6.4 6.4 0 0 1 7.6 3.8a6.4 6.4 0 1 0 8.6 8.6Z" />
        </svg>
      )}
    </button>
  );
}
