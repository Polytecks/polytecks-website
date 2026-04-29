"use client";

// Usage:
//   const isMobile = useIsMobile();      // defaults to 720px (the primary
//                                        // mobile breakpoint per
//                                        // WEBSITE_REFERENCE.md §3.4)
//   const isNarrow = useIsMobile(560);   // custom breakpoint

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe viewport-width hook. Returns true when the viewport is at or
 * below `breakpointPx` — matches the existing `@media (max-width: Xpx)`
 * convention used throughout the site's CSS Modules.
 *
 * Server render: always returns false (no hydration mismatch).
 * Client mount: hydrates to the actual viewport state and re-renders on
 * matchMedia change events (viewport resize, orientation change).
 *
 * Built on `useSyncExternalStore` rather than `useState`+`useEffect`
 * because the latter pattern flashes `false` on first client paint
 * before the effect runs — which would briefly mount a desktop variant
 * on a phone in Tier 3 component-branching scenarios. The pattern here
 * matches what proof-section.tsx already uses for the same problem.
 */
export function useIsMobile(breakpointPx: number = 720): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [breakpointPx],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(`(max-width: ${breakpointPx}px)`).matches,
    [breakpointPx],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Server snapshot — module-scoped constant so its identity is stable
// across renders, which keeps useSyncExternalStore from re-subscribing
// unnecessarily.
function getServerSnapshot(): boolean {
  return false;
}
