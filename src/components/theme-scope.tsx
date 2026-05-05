"use client";

import { type ReactNode } from "react";
import { useTheme } from "@/lib/use-theme";

/**
 * Wraps a region of the page in `data-theme="light"` when the active
 * site theme is "light" OR "hybrid". Used by the partners ribbon and
 * the devices page so they render in the light palette under the
 * hybrid theme without affecting the rest of the dark-by-default
 * site.
 *
 * When the wrapper is "active" (theme is light or hybrid):
 *   - data-theme="light" is applied to the wrapper, so all CSS rules
 *     of the form `:global([data-theme="light"]) .X` match by virtue
 *     of attribute-on-ancestor.
 *   - background and color are painted explicitly so any region of
 *     the wrapper that doesn't have its own bg (e.g. the Subpage
 *     container) still shows the light page bg through.
 *
 * When inactive (pure dark theme):
 *   - The wrapper renders as `display: contents` — the wrapper box
 *     is removed from the layout tree so it has zero visual /
 *     positional impact. Descendants inherit the html-level theme
 *     (dark default).
 */
export function ThemeScope({ children }: { children: ReactNode }) {
  const [theme] = useTheme();
  const active = theme === "light" || theme === "hybrid";
  if (!active) {
    return <div style={{ display: "contents" }}>{children}</div>;
  }
  return (
    <div
      data-theme="light"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      {children}
    </div>
  );
}
