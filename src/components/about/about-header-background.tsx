"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTheme, type Theme } from "@/lib/use-theme";
import styles from "./about-header-background.module.css";

// Page-entry fade — matches the StackEntry duration so the
// background appears alongside the rest of the page's load-in
// cascade instead of snapping in. The delay holds the silhouette
// invisible long enough for the eyebrow + title to settle before
// the bg starts blooming in. Theme-swap fade stays fast so the
// dark↔light hand-off remains snappy.
const ENTRY_FADE_MS = 700;
const ENTRY_DELAY_MS = 350;
const SWAP_FADE_MS = 80;

/**
 * Two background images stacked in the same wrap; the active one's
 * opacity is animated to 1, the inactive's stays 0. On initial mount
 * the active image fades in from 0 over ENTRY_FADE_MS so it joins
 * the page-entry cascade. On theme change the current one fades to
 * 0 first, then after SWAP_FADE_MS the displayedTheme swaps and the
 * new image fades to 1 — sequential, not a cross-fade. Both images
 * are mounted at all times so neither has to load during the
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
  // Tracks which timing the next CSS transition should use.
  const [fadeMs, setFadeMs] = useState(ENTRY_FADE_MS);
  const firstMount = useRef(true);

  useEffect(() => {
    // First mount: sync displayedTheme to the real theme without
    // animation, then — after a brief hold so the title can
    // settle in first — fade the active image in over the longer
    // entry timing.
    //
    // We intentionally DO NOT return a cleanup from this branch.
    // The very next thing React does after this effect run is
    // process the setDisplayedTheme state update; if the resolved
    // theme differs from the initial state value, displayedTheme
    // (an effect dependency) changes and React tears down this
    // effect run, calling our cleanup. Clearing the timeout in
    // cleanup would cancel the entrance fade entirely — exactly
    // the bug that left the background invisible until the user
    // toggled themes. The setTimeout below is one-shot and safe
    // to leave running.
    if (firstMount.current) {
      firstMount.current = false;
      const initial =
        typeof document !== "undefined" &&
        document.documentElement.dataset.theme === "light"
          ? "light"
          : "dark";
      setDisplayedTheme(initial);
      setFadeMs(ENTRY_FADE_MS);
      setTimeout(() => {
        requestAnimationFrame(() => setOpacity(1));
      }, ENTRY_DELAY_MS);
      return;
    }

    if (theme === displayedTheme) return;

    // Theme changed → fade out current image, swap, fade in new.
    // Use the snappier swap timing for this branch.
    setFadeMs(SWAP_FADE_MS);
    setOpacity(0);
    const id = setTimeout(() => {
      setDisplayedTheme(theme);
      requestAnimationFrame(() => setOpacity(1));
    }, SWAP_FADE_MS);
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
          transition: `opacity ${fadeMs}ms ease`,
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
          transition: `opacity ${fadeMs}ms ease`,
        }}
      />
    </div>
  );
}
