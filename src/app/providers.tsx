"use client";

import { useEffect, type ReactNode } from "react";
import { TweaksProvider } from "@/lib/use-tweaks";
import { TweakPanel } from "@/components/technology/tweak-panel";

export function Providers({ children }: { children: ReactNode }) {
  // Reset scroll on every page load. Browsers default to
  // history.scrollRestoration: "auto" which restores the previous
  // scroll position on refresh — feels broken on landing-style sites
  // where you expect to start at the hero. Switching to "manual" plus
  // an explicit scrollTo(0,0) on first paint gives a consistent
  // "always start at the top" behaviour without affecting in-app
  // navigation (Next router handles its own scroll on route change).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <TweaksProvider>
      {children}
      <TweakPanel />
    </TweaksProvider>
  );
}
