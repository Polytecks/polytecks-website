"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./dive-deeper.module.css";

/** Seconds before a video's `ended` event at which the crossfade begins. */
const CROSSFADE_DURATION_S = 0.5;
/** Hard fallback to <video loop> if the asset is shorter than this. */
const MIN_DURATION_FOR_CROSSFADE_S = 1;

type Props = {
  src: string;
  className?: string;
  /**
   * Poster image — painted as a CSS background on the wrapper so the
   * tile shows a still frame instantly, even before the IntersectionObserver
   * mounts the <video> elements. Also set as the `poster` attribute on
   * each <video> so the same frame covers the period between mount and
   * first decoded frame.
   */
  poster?: string;
};

/**
 * Dual-video seamless loop. Two <video> elements stacked in the same
 * absolute box; we crossfade their opacities over 500 ms in the final
 * stretch of one playback so the loop seam is invisible (a plain
 * `<video loop>` produces a hard cut that is not acceptable here).
 *
 * - Both videos `muted playsInline` so iOS Safari plays them in-place
 *   without launching fullscreen.
 * - `preload="metadata"` because the source is ~14 MB; the video data
 *   loads when play() runs, not on first page paint. This avoids a
 *   measurable hit to LCP on slow networks.
 * - prefers-reduced-motion: render a single static <video> with no
 *   autoplay (browser shows the first frame as its own poster).
 */
export function CrossfadeVideo({ src, className, poster }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const isCrossfadingRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [aVisible, setAVisible] = useState(true);
  // Defer mounting the <video> elements until the section is near the
  // viewport. Two <video> tags eagerly competing with the hero entrance
  // animations was a measurable cause of dropped frames at first paint.
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // No observer available — fall back to mounting immediately.
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      // Pre-mount ~half a viewport before the section reaches the top
      // of the screen so playback is buffered by the time it's visible.
      { rootMargin: "50% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    if (!inView) return;
    const a = videoARef.current;
    const b = videoBRef.current;
    if (!a || !b) return;

    let cancelled = false;
    let crossfadeReleaseTimer: ReturnType<typeof setTimeout> | null = null;

    const startA = () => {
      if (cancelled) return;
      a.currentTime = 0;
      a.play().catch(() => {});
    };

    if (a.readyState >= 1 && isFinite(a.duration)) {
      startA();
    } else {
      a.addEventListener("loadedmetadata", startA, { once: true });
    }

    let useFallbackLoop = false;

    const enableHardLoopFallback = () => {
      // Asset too short for a 500 ms crossfade — fall back to a plain
      // <video loop> on A, hide B entirely.
      useFallbackLoop = true;
      a.loop = true;
      b.pause();
      b.style.display = "none";
    };

    const checkFallback = () => {
      if (!isFinite(a.duration)) return;
      if (a.duration < MIN_DURATION_FOR_CROSSFADE_S) enableHardLoopFallback();
    };

    if (isFinite(a.duration)) checkFallback();
    else a.addEventListener("loadedmetadata", checkFallback, { once: true });

    const handleTimeUpdate = (
      current: HTMLVideoElement,
      other: HTMLVideoElement,
      currentIsA: boolean,
    ) => () => {
      if (useFallbackLoop) return;
      if (isCrossfadingRef.current) return;
      if (!isFinite(current.duration) || current.duration < MIN_DURATION_FOR_CROSSFADE_S) return;
      if (current.currentTime < current.duration - CROSSFADE_DURATION_S) return;

      // Trigger crossfade: kick the other video back to 0 and play it,
      // then flip the visibility flag so the CSS opacity transitions
      // (defined on .video) do the actual fade in/out.
      isCrossfadingRef.current = true;
      other.currentTime = 0;
      other.play().catch(() => {});
      setAVisible(!currentIsA); // when A is fading out, B becomes visible

      // Release the guard so the *next* loop's near-end can fire its own
      // crossfade. Add a small buffer past the fade window.
      if (crossfadeReleaseTimer) clearTimeout(crossfadeReleaseTimer);
      crossfadeReleaseTimer = setTimeout(() => {
        isCrossfadingRef.current = false;
      }, CROSSFADE_DURATION_S * 1000 + 100);
    };

    const handleEnded = (current: HTMLVideoElement) => () => {
      // By the time `ended` fires the video is already faded out — just
      // park it ready for the next swap.
      current.pause();
      current.currentTime = 0;
    };

    const handleAUpdate = handleTimeUpdate(a, b, true);
    const handleBUpdate = handleTimeUpdate(b, a, false);
    const handleAEnded = handleEnded(a);
    const handleBEnded = handleEnded(b);

    a.addEventListener("timeupdate", handleAUpdate);
    b.addEventListener("timeupdate", handleBUpdate);
    a.addEventListener("ended", handleAEnded);
    b.addEventListener("ended", handleBEnded);

    return () => {
      cancelled = true;
      if (crossfadeReleaseTimer) clearTimeout(crossfadeReleaseTimer);
      a.pause();
      b.pause();
      a.removeEventListener("timeupdate", handleAUpdate);
      b.removeEventListener("timeupdate", handleBUpdate);
      a.removeEventListener("ended", handleAEnded);
      b.removeEventListener("ended", handleBEnded);
      a.removeEventListener("loadedmetadata", startA);
      a.removeEventListener("loadedmetadata", checkFallback);
    };
  }, [reducedMotion, src, inView]);

  const wrapClass = [styles.media, styles.videoWrap, className]
    .filter(Boolean)
    .join(" ");

  // Paint the poster directly on the wrapper so the tile shows the
  // still frame instantly — before the IntersectionObserver mounts the
  // <video> elements and before the MP4 has started downloading. The
  // <video> elements sit absolutely on top of this background and
  // cover it once they decode their first frame.
  const wrapStyle: React.CSSProperties | undefined = poster
    ? {
        backgroundImage: `url("${poster}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  if (reducedMotion) {
    return (
      <div ref={wrapRef} className={wrapClass} style={wrapStyle}>
        {inView ? (
          <video
            src={src}
            poster={poster}
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            controlsList="nodownload noremoteplayback nofullscreen"
            className={styles.video}
            aria-hidden="true"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={wrapClass} style={wrapStyle}>
      {inView ? (
        <>
          <video
            ref={videoARef}
            src={src}
            poster={poster}
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            controlsList="nodownload noremoteplayback nofullscreen"
            className={styles.video}
            aria-hidden="true"
            style={{ opacity: aVisible ? 1 : 0, zIndex: 0 }}
          />
          <video
            ref={videoBRef}
            src={src}
            poster={poster}
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            controlsList="nodownload noremoteplayback nofullscreen"
            className={styles.video}
            aria-hidden="true"
            style={{ opacity: aVisible ? 0 : 1, zIndex: 1 }}
          />
        </>
      ) : null}
    </div>
  );
}
