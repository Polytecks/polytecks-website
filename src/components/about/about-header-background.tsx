"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTheme, type Theme } from "@/lib/use-theme";
import styles from "./about-header-background.module.css";

const FADE_MS = 80;

/**
 * Two background images stacked in the same wrap; the active one's
 * opacity is animated to 1, the inactive's stays 0. On initial mount
 * the active image fades in from 0; on theme change the current one
 * fades to 0 first, then after FADE_MS the displayedTheme swaps and
 * the new image fades to 1 — sequential, not a cross-fade. Both
 * images are mounted at all times so neither has to load during the
 * transition.
 */
export function AboutHeaderBackground() {
  const [theme] = useTheme();
  // displayedTheme controls WHICH image is the "active" one. It lags
  // `theme` during the fade-out → swap → fade-in cycle.
  const [displayedTheme, setDisplayedTheme] = useState<Theme>("dark");
  // 0 → 1 fade-in / 1 → 0 fade-out applied to whichever image
  // displayedTheme is currently pointing at.
  const [opacity, setOpacity] = useState(0);
  const firstMount = useRef(true);

  useEffect(() => {
    // First mount: sync displayedTheme to the real theme without
    // animation, then fade the active image in from 0.
    if (firstMount.current) {
      firstMount.current = false;
      const initial =
        typeof document !== "undefined" &&
        document.documentElement.dataset.theme === "light"
          ? "light"
          : "dark";
      setDisplayedTheme(initial);
      requestAnimationFrame(() => setOpacity(1));
      return;
    }

    if (theme === displayedTheme) return;

    // Theme changed → fade out current image, swap, fade in new.
    setOpacity(0);
    const id = setTimeout(() => {
      setDisplayedTheme(theme);
      requestAnimationFrame(() => setOpacity(1));
    }, FADE_MS);
    return () => clearTimeout(id);
  }, [theme, displayedTheme]);

  return (
    <div className={styles.wrap} aria-hidden="true">
      <Image
        src="/assets/about-us-background.png"
        alt=""
        fill
        sizes="(max-width: 720px) 100vw, min(60vw, 1100px)"
        className={styles.image}
        priority
        unoptimized
        style={{
          opacity: displayedTheme === "dark" ? opacity : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      />
      <Image
        src="/assets/about-us-background-white.png"
        alt=""
        fill
        sizes="(max-width: 720px) 100vw, min(60vw, 1100px)"
        className={styles.image}
        priority
        unoptimized
        style={{
          opacity: displayedTheme === "light" ? opacity : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      />
    </div>
  );
}
