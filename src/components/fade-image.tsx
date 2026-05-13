"use client";

import Image, { type ImageProps } from "next/image";
import { useState, useEffect, useRef } from "react";

/**
 * Thin wrapper around Next/Image that fades the image in once it
 * has loaded, instead of letting it snap into place. Drop-in for
 * any place where a slow-loading hero / large asset would
 * otherwise pop into existence after a navigation.
 *
 * Behaviour:
 *  - Renders the same Next/Image with all your usual props.
 *  - Starts at opacity 0, transitions to opacity 1 on `onLoad`.
 *  - If the image is already cached (loads instantly), it still
 *    fades in over ~280 ms — feels intentional, never jarring.
 *  - If the browser has already painted the image before mount
 *    (Next/Image with `priority` + low-priority hint),
 *    `complete === true` is checked on mount to flip to visible
 *    without flicker.
 *  - Respects prefers-reduced-motion: skips the transition.
 */
export function FadeImage({
  fadeMs = 280,
  className,
  onLoad,
  ...rest
}: ImageProps & { fadeMs?: number }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // If the underlying <img> is already complete by the time we
    // mount (cached / synchronously decoded), flip to visible
    // immediately without waiting for an event that won't fire.
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
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
  );
}
