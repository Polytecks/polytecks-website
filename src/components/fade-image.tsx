"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./fade-image.module.css";

/**
 * Thin wrapper around Next/Image that:
 *  1. Renders a subtle drifting skeleton shimmer behind the image while
 *     it downloads, so slow-network loads don't show a blank box.
 *  2. Fades the image in once it has loaded, instead of snapping it
 *     into place.
 *
 * Behaviour:
 *  - The shimmer is a sibling of the <img>, positioned absolutely
 *    against the nearest positioned ancestor (same parent the consumer
 *    already provides for <Image fill> or via their layout CSS).
 *  - The wrapper uses `display: contents` so it doesn't perturb layout
 *    or break consumer classNames that target the <img> element
 *    (object-fit, object-position, filter, etc).
 *  - Cached images set loaded=true synchronously inside useEffect; a
 *    150ms animation-delay on the shimmer's fade-in means the cached
 *    case never produces a visible flash.
 *  - prefers-reduced-motion: keeps the static base tint, drops the
 *    sweep animation.
 *  - Opt-out via `shimmer={false}` for the rare call site that needs it.
 */
export function FadeImage({
  fadeMs = 280,
  className,
  onLoad,
  shimmer = true,
  shimmerTone = "auto",
  ...rest
}: ImageProps & {
  fadeMs?: number;
  shimmer?: boolean;
  shimmerTone?: "auto" | "light" | "dark";
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // If the underlying <img> is already complete by the time we
    // mount (cached / synchronously decoded), flip to visible
    // immediately without waiting for an event that won't fire.
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <span
      className={styles.fadeImageWrap}
      data-tone={shimmerTone === "auto" ? undefined : shimmerTone}
    >
      {shimmer && !loaded ? (
        <span className={styles.shimmer} aria-hidden="true" />
      ) : null}
      <Image
        {...rest}
        ref={imgRef}
        className={className}
        style={{
          ...rest.style,
          opacity: loaded ? 1 : 0,
          transition: `opacity ${fadeMs}ms ease-out`,
        }}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
      />
    </span>
  );
}
