"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/use-theme";
import styles from "./theme-toggle.module.css";

/**
 * Routes where the dark and light heroes have different `height`
 * values (light = 115 vh, dark = 100 vh). Toggling theme in place
 * caused the hero box to grow / shrink and the cover-fitted
 * background image to visibly re-scale. We hide that with a
 * black flash overlay rather than reloading the page.
 */
const FLASH_PATHS = ["/technology", "/careers"];

const FLASH_IN_MS = 130;
const FLASH_HOLD_MS = 60;
const FLASH_OUT_MS = 130;

/**
 * Sun / moon button that flips between dark and light. The `useTheme`
 * hook persists the choice to localStorage; the inline anti-FOUC
 * script in layout.tsx applies the persisted value to <html> before
 * first paint so the page never flashes the wrong theme on reload.
 *
 * On routes where the hero geometry differs by theme (see
 * FLASH_PATHS), the in-place transition is hidden behind a quick
 * black overlay portaled into <body> so it sits OUTSIDE the
 * fixed top nav.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const pathname = usePathname();
  const next = theme === "dark" ? "light" : "dark";

  const [flashing, setFlashing] = useState(false);
  const busyRef = useRef(false);

  const needsFlash = FLASH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  const handleClick = () => {
    if (busyRef.current) return;

    if (!needsFlash) {
      setTheme(next);
      return;
    }

    busyRef.current = true;
    setFlashing(true);
    // Phase 1: opacity 0 → 1 (FLASH_IN_MS).
    window.setTimeout(() => {
      // Phase 2 (peak): swap theme behind the curtain.
      setTheme(next);
      // Phase 3 (hold + start out): tiny delay so the new layout
      // settles before we fade the curtain back out.
      window.setTimeout(() => {
        setFlashing(false);
        // Phase 4: opacity 1 → 0 (FLASH_OUT_MS) — handled by CSS.
        window.setTimeout(() => {
          busyRef.current = false;
        }, FLASH_OUT_MS);
      }, FLASH_HOLD_MS);
    }, FLASH_IN_MS);
  };

  return (
    <>
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
      <ThemeFlash visible={flashing} />
    </>
  );
}

/**
 * Black overlay covering the page below the top nav. Rendered via a
 * portal to document.body so it isn't captured by the top nav's
 * `backdrop-filter` containing block (which would otherwise clip
 * `position: fixed` to the 72-px nav box).
 */
function ThemeFlash({ visible }: { visible: boolean }) {
  // Portal needs document — only mount on client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: "var(--nav-h, 72px)",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#000",
        opacity: visible ? 1 : 0,
        transition: `opacity ${visible ? FLASH_IN_MS : FLASH_OUT_MS}ms ease`,
        pointerEvents: "none",
        zIndex: 100,
      }}
    />,
    document.body,
  );
}
