# Technology Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/technology` with a step-change framing — new hero (`"The electrode, *reinvented*."`), three-pillar character-select section using React state + Framer Motion `layout` prop, proof strip with three user-supplied claims, philosophy paragraph, CTA reusing ChargeLink, and a `?tweaks=1`-gated tweak panel with five sliders that write CSS custom properties on `document.body`.

**Architecture:** A parent `PillarSection` owns `activeId` (driven by hover, focus, and mobile tap). Pillars are `motion.div` elements with `layout` enabled — the flex value on each pillar changes based on `activeId`, and Framer animates the layout transition. A `use-tweaks` hook reads/writes CSS custom properties on `document.body` (no React re-renders for non-pillar elements while sliders move). The panel itself only mounts when `?tweaks=1` is in the URL; values persist via `localStorage` independent of panel visibility.

**Tech Stack:** Next.js 16.2.4 App Router, React 19, Tailwind 4, CSS Modules, Framer Motion (new dep), `next/font` (already wired), `next/image`.

**Spec:** `docs/superpowers/specs/2026-04-26-technology-page-redesign-design.md` is the source of truth. Where this plan and the spec disagree, the spec wins.

**Verification:** Codebase has no test infrastructure. Each component task ends with: type-check (`npx tsc --noEmit`), visual check via the existing `compare/compare-route.mjs` harness, then commit. Final task runs lint, production build, and a multi-breakpoint regression.

---

## File Structure

**Create:**
- `src/lib/use-tweaks.ts` — hook: localStorage ↔ CSS custom properties on `document.body`.
- `src/components/technology/tweak-panel.tsx` + `.module.css` — floating panel UI, gated by `?tweaks=1`.
- `src/components/technology/hero.tsx` + `.module.css` — new hero (replaces tech-hero).
- `src/components/technology/pillars/signal-trace.tsx` — animated SVG line for pillar 03.
- `src/components/technology/pillars/pillar.tsx` + `.module.css` — single pillar (motion.div + layout).
- `src/components/technology/pillars/pillar-section.tsx` + `.module.css` — parent that owns `activeId` and lays out three pillars.
- `src/components/technology/pillars/pillar-data.ts` — three pillars' content + visual paths.
- `src/components/technology/proof-strip.tsx` + `.module.css` — three stat blocks.
- `src/components/technology/philosophy.tsx` + `.module.css` — 80-word paragraph.

**Modify:**
- `package.json` / `package-lock.json` — add `framer-motion`.
- `src/app/technology/page.tsx` — new composition.
- `src/components/home/charge-link.tsx` + `.module.css` — add `variant?: "stacked" | "inline"` prop (default `"stacked"`).

**Delete:**
- `src/components/technology/tech-hero.tsx` + `.module.css`
- `src/components/technology/tech-feature.tsx` + `.module.css`

---

## Pre-flight: dev servers

The `compare/compare-route.mjs` harness expects two servers:

- Next dev on port 3000: `npx next dev --port 3000`
- Legacy static on port 4000: `cd legacy && python -m http.server 4000`

Run both in background before starting (or before the first visual-check step). They can stay up across all tasks.

---

## Task 1: Add framer-motion dependency

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install framer-motion**

Run: `npm install framer-motion`

Expected: framer-motion appears under `dependencies` in `package.json`. If npm prints a peer warning about React 19, ignore it — current framer-motion supports React 19 in production despite the warning.

- [ ] **Step 2: Verify project still compiles**

Run: `npx tsc --noEmit`
Expected: no output (success).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion dep for technology page interactions"
```

---

## Task 2: `use-tweaks` hook

The hook reads stored slider values from `localStorage` on mount and writes them as CSS custom properties on `document.body`. It returns `[values, setters]` for the panel UI to consume. It does **not** render anything.

**Files:**
- Create: `src/lib/use-tweaks.ts`

- [ ] **Step 1: Create `src/lib/use-tweaks.ts`**

```ts
"use client";

import { useCallback, useEffect, useState } from "react";

export type TweakAccent = "indigo" | "cyan" | "green";

export type TweakValues = {
  pillarPop: number;     // 1.0 → 1.8
  siblingDim: number;    // 0 → 0.7 (used as opacity offset; 0 = no dim)
  animMs: number;        // 200 → 600
  accent: TweakAccent;   // swatch
  rhythm: number;        // 0.7 → 1.4 (multiplier on section padding)
};

export const TWEAK_DEFAULTS: TweakValues = {
  pillarPop: 1.6,
  siblingDim: 0.5,
  animMs: 350,
  accent: "indigo",
  rhythm: 1.0,
};

const STORAGE_KEY = "polytecks:tweaks";

const ACCENT_HEX: Record<TweakAccent, string> = {
  indigo: "#6a74dc",
  cyan: "#5cd9e8",
  green: "#34d399",
};

function applyToBody(values: TweakValues) {
  const body = document.body;
  body.style.setProperty("--tw-pillar-pop", String(values.pillarPop));
  body.style.setProperty("--tw-sibling-dim", String(values.siblingDim));
  body.style.setProperty("--tw-anim-ms", `${values.animMs}ms`);
  body.style.setProperty("--tw-rhythm", String(values.rhythm));
  body.style.setProperty("--indigo-bright", ACCENT_HEX[values.accent]);
}

function readStored(): TweakValues {
  if (typeof window === "undefined") return TWEAK_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return TWEAK_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<TweakValues>;
    return { ...TWEAK_DEFAULTS, ...parsed };
  } catch {
    return TWEAK_DEFAULTS;
  }
}

export function useTweaks() {
  const [values, setValues] = useState<TweakValues>(TWEAK_DEFAULTS);

  // Load from localStorage and apply on mount.
  useEffect(() => {
    const initial = readStored();
    setValues(initial);
    applyToBody(initial);
  }, []);

  const setValue = useCallback(<K extends keyof TweakValues>(key: K, value: TweakValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      applyToBody(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota / private-mode failures
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setValues(TWEAK_DEFAULTS);
    applyToBody(TWEAK_DEFAULTS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { values, setValue, reset };
}

/**
 * Lightweight applier for routes that don't render the panel.
 * Reads stored values once and applies them to document.body so the page
 * matches the last-tweaked state even without ?tweaks=1 in the URL.
 */
export function applyStoredTweaks() {
  if (typeof window === "undefined") return;
  applyToBody(readStored());
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/lib/use-tweaks.ts
git commit -m "feat(technology): add use-tweaks hook for CSS-var-driven design panel"
```

---

## Task 3: Tweak panel UI

The panel is a client component that mounts only when `?tweaks=1` is in the URL. It uses `useTweaks` to read/write values and writes the live CSS custom properties via the hook.

**Files:**
- Create: `src/components/technology/tweak-panel.module.css`
- Create: `src/components/technology/tweak-panel.tsx`

- [ ] **Step 1: Create `tweak-panel.module.css`**

```css
.panel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 280px;
  z-index: 999;
  background: rgba(15, 16, 22, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: var(--font-mono);
  color: var(--ink);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--line);
}

.title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--indigo-bright);
}

.toggle, .reset {
  appearance: none;
  background: transparent;
  border: 0;
  color: var(--ink-dim);
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 4px 8px;
}

.toggle:hover, .reset:hover { color: var(--ink); }

.body { padding: 14px; display: grid; gap: 14px; }
.body[data-collapsed="true"] { display: none; }

.row { display: grid; gap: 6px; }

.rowLabel {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-dim);
}

.value { color: var(--ink); font-weight: 500; }

.slider {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 18px;
  background: transparent;
  cursor: pointer;
  margin: 0;
}

.slider::-webkit-slider-runnable-track {
  height: 1px;
  background: var(--line-strong);
}

.slider::-moz-range-track {
  height: 1px;
  background: var(--line-strong);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--indigo-bright);
  border: 2px solid var(--bg);
  margin-top: -7px;
  cursor: grab;
  box-shadow: 0 0 0 1px var(--indigo-bright);
}

.slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--indigo-bright);
  border: 2px solid var(--bg);
  cursor: grab;
  box-shadow: 0 0 0 1px var(--indigo-bright);
}

.swatches { display: flex; gap: 8px; }

.swatch {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 0;
  cursor: pointer;
  outline: 1px solid transparent;
  outline-offset: 2px;
  transition: outline-color 0.2s;
}

.swatch[data-active="true"] {
  outline-color: var(--ink);
}
```

- [ ] **Step 2: Create `tweak-panel.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTweaks, type TweakAccent } from "@/lib/use-tweaks";
import styles from "./tweak-panel.module.css";

const ACCENT_PREVIEW: Record<TweakAccent, string> = {
  indigo: "#6a74dc",
  cyan: "#5cd9e8",
  green: "#34d399",
};

export function TweakPanel() {
  const [enabled, setEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { values, setValue, reset } = useTweaks();

  // Mount only when ?tweaks=1 is present. Re-check on URL change (SPA nav).
  useEffect(() => {
    const check = () => {
      const params = new URLSearchParams(window.location.search);
      setEnabled(params.get("tweaks") === "1");
    };
    check();
    window.addEventListener("popstate", check);
    return () => window.removeEventListener("popstate", check);
  }, []);

  if (!enabled) return null;

  return (
    <div className={styles.panel} role="dialog" aria-label="Design tweaks">
      <div className={styles.bar}>
        <span className={styles.title}>Tweaks</span>
        <div>
          <button type="button" className={styles.reset} onClick={reset}>Reset</button>
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
          >
            {collapsed ? "Show" : "Hide"}
          </button>
        </div>
      </div>

      <div className={styles.body} data-collapsed={collapsed}>
        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Pillar pop</span>
            <span className={styles.value}>{values.pillarPop.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={1}
            max={1.8}
            step={0.05}
            value={values.pillarPop}
            onChange={(e) => setValue("pillarPop", Number(e.target.value))}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Sibling dim</span>
            <span className={styles.value}>{Math.round(values.siblingDim * 100)}%</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={0.7}
            step={0.05}
            value={values.siblingDim}
            onChange={(e) => setValue("siblingDim", Number(e.target.value))}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Transition</span>
            <span className={styles.value}>{values.animMs}ms</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={200}
            max={600}
            step={25}
            value={values.animMs}
            onChange={(e) => setValue("animMs", Number(e.target.value))}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Accent</span>
            <span className={styles.value}>{values.accent}</span>
          </div>
          <div className={styles.swatches}>
            {(Object.keys(ACCENT_PREVIEW) as TweakAccent[]).map((accent) => (
              <button
                key={accent}
                type="button"
                className={styles.swatch}
                aria-label={`Accent: ${accent}`}
                data-active={values.accent === accent}
                style={{ background: ACCENT_PREVIEW[accent] }}
                onClick={() => setValue("accent", accent)}
              />
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Rhythm</span>
            <span className={styles.value}>{values.rhythm.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={0.7}
            max={1.4}
            step={0.05}
            value={values.rhythm}
            onChange={(e) => setValue("rhythm", Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/technology/tweak-panel.tsx src/components/technology/tweak-panel.module.css
git commit -m "feat(technology): add tweak panel UI gated by ?tweaks=1"
```

---

## Task 4: Hero component

Full-bleed hero replacing the existing `tech-hero`. Reuses `array-mosaic.jpg` with the same triple-gradient fade. Headline is the bold typographic moment.

**Files:**
- Create: `src/components/technology/hero.module.css`
- Create: `src/components/technology/hero.tsx`

- [ ] **Step 1: Create `hero.module.css`**

```css
.hero {
  position: relative;
  z-index: 5;
  padding: 0;
  max-width: none;
  margin: 0;
}

.mosaic {
  position: relative;
  width: 100%;
  height: clamp(620px, 80vh, 880px);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.mosaic img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
  filter: contrast(1.15) brightness(0.85);
}

.fade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to bottom, rgba(10, 10, 14, 0.7) 0%, rgba(10, 10, 14, 0.4) 120px, rgba(10, 10, 14, 0.15) 240px, transparent 320px),
    linear-gradient(to top, rgba(10, 10, 14, 0.95) 0%, rgba(10, 10, 14, 0.6) 35%, transparent 70%),
    linear-gradient(to right, rgba(10, 10, 14, 0.55) 0%, rgba(10, 10, 14, 0.2) 45%, transparent 75%);
}

.inner {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 100px 40px 72px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}

.copy { max-width: 920px; }

.headline {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(56px, 7vw, 132px);
  letter-spacing: 0.01em;
  line-height: 1.0;
  color: #fff;
  margin: 0 0 28px 0;
  text-wrap: balance;
}

.headline em {
  font-style: italic;
  font-weight: 500;
  color: var(--indigo-bright);
  text-shadow: 0 0 28px rgba(106, 116, 220, 0.5);
  position: relative;
  display: inline-block;
}

.headline em::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.06em;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(106, 116, 220, 0.75), transparent);
}

.subtitle {
  font-family: var(--font-sans);
  font-weight: 400;
  font-size: clamp(20px, 1.7vw, 28px);
  line-height: 1.45;
  color: #c8cad6;
  max-width: 640px;
  margin: 0;
}

.anchor {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(168, 176, 243, 0.55);
  display: flex;
  gap: 18px;
  align-items: center;
  margin-bottom: 6px;
}

.anchor span { white-space: nowrap; }
.anchor span + span::before {
  content: "·";
  margin-right: 18px;
  color: rgba(168, 176, 243, 0.3);
}

@media (max-width: 860px) {
  .mosaic { height: clamp(520px, 80vh, 720px); }
  .inner { padding: 90px 20px 48px; flex-direction: column; align-items: flex-start; }
  .anchor { font-size: 9px; gap: 12px; }
  .anchor span + span::before { margin-right: 12px; }
}
```

- [ ] **Step 2: Create `hero.tsx`**

```tsx
import Image from "next/image";
import styles from "./hero.module.css";

export function TechnologyHero() {
  return (
    <div className={styles.hero}>
      <div className={styles.mosaic}>
        <Image
          src="/assets/array-mosaic.jpg"
          alt="Polytecks electrode array mosaic sheet"
          width={2400}
          height={1600}
          sizes="100vw"
          priority
        />
        <div className={styles.fade} aria-hidden="true" />
        <div className={styles.inner}>
          <div className={styles.copy}>
            <h1 className={styles.headline}>
              The electrode, <em>reinvented</em>.
            </h1>
            <p className={styles.subtitle}>
              The electrode hasn&apos;t fundamentally changed in 80 years.
              We&apos;ve reinvented it.
            </p>
          </div>
          <div className={styles.anchor} aria-hidden="true">
            <span>01 / Materials</span>
            <span>02 / Form</span>
            <span>03 / Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/technology/hero.tsx src/components/technology/hero.module.css
git commit -m "feat(technology): new hero with The electrode, reinvented headline"
```

---

## Task 5: Signal trace SVG

A single-path SVG that draws itself in over 2 seconds via `pathLength` interpolation, then loops a slow opacity shimmer. Used inside Pillar 03's reveal zone.

**Files:**
- Create: `src/components/technology/pillars/signal-trace.tsx`

- [ ] **Step 1: Create `signal-trace.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";

/**
 * Hand-authored signal trace. The path data approximates an idealized
 * cardiac waveform (P, QRS, T). Replace with real captured data when
 * available.
 */
const TRACE_PATH =
  "M0 60 L40 60 L60 58 L80 60 L120 60 L130 56 L140 60 L150 22 L156 92 L162 60 L180 60 L200 50 L220 60 L260 60 L280 56 L300 60 L320 60";

export function SignalTrace({ animate = true }: { animate?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 100"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {/* Faint background grid */}
      <defs>
        <pattern id="signal-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        </pattern>
      </defs>
      <rect width="320" height="100" fill="url(#signal-grid)" />

      <motion.path
        d={TRACE_PATH}
        fill="none"
        stroke="var(--indigo-bright)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgba(106,116,220,0.6))" }}
        initial={animate ? { pathLength: 0, opacity: 0.2 } : { pathLength: 1, opacity: 1 }}
        animate={animate ? {
          pathLength: 1,
          opacity: [0.2, 1, 0.85, 1, 0.85],
        } : undefined}
        transition={animate ? {
          pathLength: { duration: 2, ease: [0.2, 0.7, 0.2, 1] },
          opacity: { duration: 4, repeat: Infinity, repeatType: "reverse", delay: 2 },
        } : undefined}
      />
    </svg>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/technology/pillars/signal-trace.tsx
git commit -m "feat(technology): add animated signal-trace SVG for pillar 03"
```

---

## Task 6: Pillar data

Static data file for the three pillars' content. Keeps copy and visual paths out of component code so they can be edited without touching JSX.

**Files:**
- Create: `src/components/technology/pillars/pillar-data.ts`

- [ ] **Step 1: Create `pillar-data.ts`**

```ts
export type PillarVisual =
  | { kind: "image"; src: string; alt: string; objectPosition?: string; filter?: string }
  | { kind: "signal" };

export type PillarContent = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  /** Always rendered. */
  restVisual: PillarVisual;
  /** Rendered, but visually hidden until pillar is active. */
  detailVisual: PillarVisual;
  /** ~40 words. */
  body: string;
};

// NOTE: All `body` strings are placeholder Lorem ipsum.
// Real claims to be supplied later — search for "// TODO: real claim".
export const PILLARS: PillarContent[] = [
  {
    id: "materials",
    number: "01",
    title: "New Materials",
    subtitle: "New sensing possibilities",
    restVisual: {
      kind: "image",
      src: "/assets/array-mosaic.jpg",
      alt: "Cropped detail of the Polytecks electrode array sheet",
      objectPosition: "20% 30%",
      filter: "grayscale(0.4) contrast(1.25) brightness(0.95)",
    },
    detailVisual: {
      kind: "image",
      src: "/assets/array-mosaic.jpg",
      alt: "Wider view of the array sheet showing electrode lattice",
      objectPosition: "center 35%",
      filter: "grayscale(0.2) contrast(1.15) brightness(0.95)",
    },
    // TODO: real claim about conducting-polymer wet-dry electrodes
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod " +
      "tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim " +
      "veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    id: "form",
    number: "02",
    title: "New Form",
    subtitle: "Engineered for ease-of-use",
    restVisual: {
      kind: "image",
      src: "/assets/polytecks-arm-v2.png",
      alt: "Polytecks hexagonal electrode array on forearm",
      objectPosition: "55% 40%",
    },
    detailVisual: {
      kind: "image",
      src: "/assets/polytecks-arm-v2.png",
      alt: "Wider view of the array conforming to forearm anatomy",
      objectPosition: "center center",
    },
    // TODO: real claim about textile-integrated mechanical design
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod " +
      "tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim " +
      "veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    id: "intelligence",
    number: "03",
    title: "New Intelligence",
    subtitle: "Signal made meaningful",
    restVisual: { kind: "signal" },
    detailVisual: { kind: "signal" },
    // TODO: real claim about software / decision-support layer
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod " +
      "tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim " +
      "veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
];
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/technology/pillars/pillar-data.ts
git commit -m "feat(technology): add pillar-data with placeholder copy + assets"
```

---

## Task 7: Single Pillar component

The internal layout of one pillar. The pillar is a `<button>` (so focus works for free) wrapped in a `motion.div` with `layout` enabled. Persistent zone is always visible; reveal zone fades in when active.

**Files:**
- Create: `src/components/technology/pillars/pillar.module.css`
- Create: `src/components/technology/pillars/pillar.tsx`

- [ ] **Step 1: Create `pillar.module.css`**

```css
.pillar {
  appearance: none;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0;
  cursor: pointer;
  color: inherit;
  font: inherit;
  text-align: left;

  position: relative;
  display: flex;
  flex-direction: column;
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;

  min-width: 0;
  overflow: hidden;

  background-color: rgba(255, 255, 255, 0.012);

  transition: border-color var(--tw-anim-ms, 350ms) cubic-bezier(0.2, 0.7, 0.2, 1),
              background-color var(--tw-anim-ms, 350ms) cubic-bezier(0.2, 0.7, 0.2, 1);
}

.pillar:focus-visible {
  outline: 2px solid var(--indigo-bright);
  outline-offset: 4px;
}

.pillar[data-active="true"] {
  border-color: rgba(168, 176, 243, 0.45);
  background-color: rgba(74, 84, 192, 0.06);
}

.cursorOutline {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 250ms cubic-bezier(0.2, 0.7, 0.2, 1);
  background:
    radial-gradient(
      circle at var(--cursor-x, 50%) var(--cursor-y, 50%),
      rgba(168, 176, 243, 0.3) 0%,
      transparent 35%
    );
  mix-blend-mode: screen;
  z-index: 1;
}

.pillar[data-active="true"] .cursorOutline { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .cursorOutline {
    background: radial-gradient(circle at 50% 50%, rgba(168, 176, 243, 0.18) 0%, transparent 50%);
  }
}

.persistent {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px 24px 0;
}

.number {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--indigo-bright);
}

.title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(24px, 2.4vw, 36px);
  line-height: 1.1;
  letter-spacing: -0.015em;
  color: var(--ink);
  margin: 0;
}

.subtitle {
  font-family: var(--font-sans);
  font-weight: 300;
  font-size: clamp(14px, 1.1vw, 16px);
  line-height: 1.5;
  color: var(--ink-dim);
  margin: 0;
}

.restVisual {
  position: relative;
  margin: 16px 24px 24px;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 4px;
  background: #0d0e14;
}

.restVisual img,
.restVisual svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.restVisualOverlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(74, 84, 192, 0.12), transparent 55%);
}

.reveal {
  position: relative;
  z-index: 2;
  padding: 4px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.body {
  font-family: var(--font-sans);
  font-weight: 300;
  font-size: 15px;
  line-height: 1.6;
  color: var(--ink-dim);
  max-width: 360px;
  margin: 0;
}

.detailVisual {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 4px;
  background: #0d0e14;
}

.detailVisual img,
.detailVisual svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (max-width: 720px) {
  .persistent { padding: 20px 18px 0; gap: 10px; }
  .restVisual { margin: 14px 18px 18px; aspect-ratio: 16 / 9; }
  .reveal { padding: 4px 18px 20px; }
}
```

- [ ] **Step 2: Create `pillar.tsx`**

```tsx
"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import type { PillarContent, PillarVisual } from "./pillar-data";
import { SignalTrace } from "./signal-trace";
import styles from "./pillar.module.css";

function Visual({ visual, signalAnimate }: { visual: PillarVisual; signalAnimate: boolean }) {
  if (visual.kind === "signal") return <SignalTrace animate={signalAnimate} />;
  return (
    <Image
      src={visual.src}
      alt={visual.alt}
      width={1600}
      height={1000}
      sizes="(max-width: 720px) 100vw, 33vw"
      style={{
        objectPosition: visual.objectPosition ?? "center center",
        filter: visual.filter,
      }}
    />
  );
}

export function Pillar({
  content,
  isActive,
  anyActive,
  popRatio,
  siblingDim,
  animMs,
  onActivate,
  onDeactivate,
}: {
  content: PillarContent;
  isActive: boolean;
  anyActive: boolean;
  popRatio: number;
  siblingDim: number;
  animMs: number;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  // Cursor-tracking gradient outline (active pillars only).
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isActive || reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--cursor-x", `${x}%`);
    el.style.setProperty("--cursor-y", `${y}%`);
  }, [isActive, reduced]);

  // Sibling pillars (anyActive && !isActive) shrink + dim. Inactive-but-no-one-active stays neutral.
  const flexGrow = !anyActive ? 1 : isActive ? popRatio : (2 - popRatio) / 2;
  const opacity = !anyActive ? 1 : isActive ? 1 : 1 - siblingDim;
  const scale = !anyActive ? 1 : isActive ? 1 : 0.96;

  return (
    <motion.button
      ref={ref}
      type="button"
      className={styles.pillar}
      data-active={isActive}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      onPointerMove={onPointerMove}
      onClick={onActivate}
      aria-expanded={isActive}
      style={{ flexGrow }}
      animate={{ opacity, scale }}
      transition={{ duration: animMs / 1000, ease: [0.2, 0.7, 0.2, 1] }}
      layout
    >
      <span className={styles.cursorOutline} aria-hidden="true" />

      <div className={styles.persistent}>
        <span className={styles.number}>{content.number}</span>
        <h3 className={styles.title}>{content.title}</h3>
        <p className={styles.subtitle}>{content.subtitle}</p>
      </div>

      <div className={styles.restVisual}>
        <Visual visual={content.restVisual} signalAnimate={false} />
        <span className={styles.restVisualOverlay} aria-hidden="true" />
      </div>

      <motion.div
        className={styles.reveal}
        initial={false}
        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 16 }}
        transition={{
          duration: 0.25,
          delay: isActive ? 0.2 : 0,
          ease: [0.2, 0.7, 0.2, 1],
        }}
        aria-hidden={!isActive}
      >
        <p className={styles.body}>{content.body}</p>
        <div className={styles.detailVisual}>
          <Visual visual={content.detailVisual} signalAnimate={isActive && content.id === "intelligence"} />
        </div>
      </motion.div>
    </motion.button>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/technology/pillars/pillar.tsx src/components/technology/pillars/pillar.module.css
git commit -m "feat(technology): single pillar with motion-driven flex + reveal zone"
```

---

## Task 8: PillarSection parent

Container that owns `activeId` and lays out the three pillars side by side. Reads tweak values via CSS custom properties on body (`--tw-pillar-pop`, `--tw-sibling-dim`, `--tw-anim-ms`) by sampling them on mount + on a `MutationObserver` watching `document.body.style`. Deactivates `activeId` on `Escape`.

**Files:**
- Create: `src/components/technology/pillars/pillar-section.module.css`
- Create: `src/components/technology/pillars/pillar-section.tsx`

- [ ] **Step 1: Create `pillar-section.module.css`**

```css
.section {
  position: relative;
  z-index: 5;
  max-width: 1400px;
  margin: 0 auto;
  padding: calc(96px * var(--tw-rhythm, 1)) 40px calc(96px * var(--tw-rhythm, 1));
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--indigo-bright);
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.eyebrow::before {
  content: "";
  width: 28px;
  height: 1px;
  background: var(--indigo-bright);
  opacity: 0.6;
}

.lede {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(28px, 3vw, 44px);
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--ink);
  max-width: 720px;
  margin: 0 0 56px 0;
}

.row {
  display: flex;
  gap: clamp(16px, 1.6vw, 28px);
  align-items: stretch;
  min-height: 480px;
}

@media (max-width: 720px) {
  .section { padding: calc(64px * var(--tw-rhythm, 1)) 20px calc(64px * var(--tw-rhythm, 1)); }
  .row { flex-direction: column; min-height: 0; }
}
```

- [ ] **Step 2: Create `pillar-section.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pillar } from "./pillar";
import { PILLARS } from "./pillar-data";
import styles from "./pillar-section.module.css";

function readTweakNumber(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.body).getPropertyValue(name).trim();
  if (!raw) return fallback;
  const num = parseFloat(raw);
  return Number.isFinite(num) ? num : fallback;
}

export function PillarSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Re-sample tweak values when they change. The TweakPanel writes to
  // document.body.style, so a MutationObserver on the body's style attr
  // is the cheapest hook into "any tweak changed".
  useEffect(() => {
    const obs = new MutationObserver(() => setTick((t) => t + 1));
    obs.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => obs.disconnect();
  }, []);

  const tweaks = useMemo(() => ({
    popRatio: readTweakNumber("--tw-pillar-pop", 1.6),
    siblingDim: readTweakNumber("--tw-sibling-dim", 0.5),
    animMs: readTweakNumber("--tw-anim-ms", 350),
  }), [tick]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setActiveId(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  return (
    <section className={styles.section} aria-label="Three pillars of the technology">
      <div className={styles.eyebrow}>Three Pillars</div>
      <p className={styles.lede}>
        Materials, form, and intelligence — rebuilt from first principles.
      </p>
      <div className={styles.row}>
        {PILLARS.map((p) => (
          <Pillar
            key={p.id}
            content={p}
            isActive={activeId === p.id}
            anyActive={activeId !== null}
            popRatio={tweaks.popRatio}
            siblingDim={tweaks.siblingDim}
            animMs={tweaks.animMs}
            onActivate={() => setActiveId(p.id)}
            onDeactivate={() => {
              // Deactivate only if THIS pillar is the currently-active one.
              setActiveId((curr) => (curr === p.id ? null : curr));
            }}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/technology/pillars/pillar-section.tsx src/components/technology/pillars/pillar-section.module.css
git commit -m "feat(technology): PillarSection parent with activeId state machine"
```

---

## Task 9: Proof strip

Three stat blocks. No icons. Hairline dividers between blocks. 3-up desktop, 1-up mobile (each label is too long to comfortably read in 2-up).

**Files:**
- Create: `src/components/technology/proof-strip.module.css`
- Create: `src/components/technology/proof-strip.tsx`

- [ ] **Step 1: Create `proof-strip.module.css`**

```css
.section {
  position: relative;
  z-index: 5;
  max-width: 1400px;
  margin: 0 auto;
  padding: calc(56px * var(--tw-rhythm, 1)) 40px calc(80px * var(--tw-rhythm, 1));
}

.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}

.block {
  padding: 0 32px;
  border-left: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.block:first-child {
  padding-left: 0;
  border-left: 0;
}

.value {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(36px, 4vw, 56px);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.value sup {
  font-size: 0.4em;
  font-weight: 500;
  vertical-align: super;
  margin-left: 2px;
  color: var(--indigo-bright);
}

.label {
  font-family: var(--font-sans);
  font-weight: 300;
  font-size: clamp(13px, 1vw, 15px);
  line-height: 1.55;
  color: var(--ink-dim);
  max-width: 280px;
  margin: 0;
}

@media (max-width: 860px) {
  .row { grid-template-columns: 1fr; gap: 24px; }
  .block { padding: 16px 0 0; border-left: 0; border-top: 1px solid var(--line); }
  .block:first-child { padding-top: 0; border-top: 0; }
}
```

- [ ] **Step 2: Create `proof-strip.tsx`**

Each value is marked `// TODO: confirm exact figure` — the wording is locked per the brief but the precise numbers may need adjustment.

```tsx
import styles from "./proof-strip.module.css";

type Stat = {
  /** Display value. Use {sup: "x"} for superscripts. */
  value: React.ReactNode;
  label: string;
};

const STATS: Stat[] = [
  // TODO: confirm exact figure (~10× claim)
  { value: <>~10<sup>×</sup></>, label: "Non-invasive spatial resolution relative to standard electrodes" },
  // TODO: confirm wording (gel-free is the substantive claim)
  { value: <>0</>,                label: "Skin preparation needed — no electrode gel required" },
  // TODO: confirm range (days–weeks span)
  { value: <>Days–Weeks</>,       label: "Continuous wear on the body" },
];

export function ProofStrip() {
  return (
    <section className={styles.section} aria-label="Performance claims">
      <div className={styles.row}>
        {STATS.map((stat, i) => (
          <div key={i} className={styles.block}>
            <div className={styles.value}>{stat.value}</div>
            <p className={styles.label}>{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/technology/proof-strip.tsx src/components/technology/proof-strip.module.css
git commit -m "feat(technology): proof strip with 3 user-supplied claims"
```

---

## Task 10: Philosophy paragraph

Single 80-word paragraph, centered, max-width 720px. No headline. No decoration.

**Files:**
- Create: `src/components/technology/philosophy.module.css`
- Create: `src/components/technology/philosophy.tsx`

- [ ] **Step 1: Create `philosophy.module.css`**

```css
.section {
  position: relative;
  z-index: 5;
  max-width: 1400px;
  margin: 0 auto;
  padding: calc(56px * var(--tw-rhythm, 1)) 40px calc(80px * var(--tw-rhythm, 1));
  display: flex;
  justify-content: center;
}

.copy {
  font-family: var(--font-sans);
  font-weight: 300;
  font-size: clamp(18px, 1.5vw, 22px);
  line-height: 1.65;
  color: var(--ink-dim);
  max-width: 720px;
  text-align: center;
  text-wrap: pretty;
  margin: 0;
}

@media (max-width: 720px) {
  .section { padding: calc(40px * var(--tw-rhythm, 1)) 20px calc(56px * var(--tw-rhythm, 1)); }
}
```

- [ ] **Step 2: Create `philosophy.tsx`**

Body is placeholder Lorem ipsum — keep the whitespace and rhythm correct so swap-in is trivial.

```tsx
import styles from "./philosophy.module.css";

export function Philosophy() {
  return (
    <section className={styles.section}>
      <p className={styles.copy}>
        {/* TODO: rewrite as: one sensor platform, many bioelectronic applications.
            Starting with veterinary cardiology where the regulatory path is fastest,
            then extending into human ECG, EEG, and EMG as clinical validation matures.
            The technology beneath is the same — what changes is what we ask it to listen for. */}
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/technology/philosophy.tsx src/components/technology/philosophy.module.css
git commit -m "feat(technology): platform philosophy paragraph (placeholder copy)"
```

---

## Task 11: ChargeLink inline variant + CTA

Add a `variant?: "stacked" | "inline"` prop to `ChargeLink`. Default keeps current behavior. New `"inline"` variant lays label and arrow as a tight horizontal pair with the underline track flush below the line.

**Files:**
- Modify: `src/components/home/charge-link.tsx`
- Modify: `src/components/home/charge-link.module.css`

- [ ] **Step 1: Modify `charge-link.module.css`**

Add the inline variant rules at the bottom of the file (above the `@media (prefers-reduced-motion)` block):

```css
/* Inline variant: tight horizontal label + arrow, narrow track flush below.
   Used by the technology page CTA. */
.link[data-variant="inline"] {
  display: inline-block;
  width: auto;
}

.link[data-variant="inline"] .label {
  justify-content: flex-start;
  gap: 12px;
  padding: 6px 0 8px;
}

.link[data-variant="inline"] .track {
  height: 6px;
}
```

- [ ] **Step 2: Modify `charge-link.tsx`**

Replace the existing `ChargeLink` component definition with:

```tsx
import Link from "next/link";
import styles from "./charge-link.module.css";

export type ChargeLinkVariant = "stacked" | "inline";

export function ChargeLink({
  href,
  label,
  variant = "stacked",
}: {
  href: string;
  label: string;
  variant?: ChargeLinkVariant;
}) {
  return (
    <Link href={href} className={styles.link} data-variant={variant}>
      <span className={styles.label}>
        <span>{label}</span>
        <span className={styles.arrow} aria-hidden="true">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5" />
          </svg>
        </span>
      </span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.fill} />
      </span>
    </Link>
  );
}
```

- [ ] **Step 3: Verify the home page CTA still renders identically**

Run: `node compare/compare.mjs`
Expected: zero console errors, no new diffs versus the existing baseline (the `data-variant="stacked"` default leaves the home CTAs visually unchanged).

- [ ] **Step 4: Commit**

```bash
git add src/components/home/charge-link.tsx src/components/home/charge-link.module.css
git commit -m "feat(home): add inline variant to ChargeLink for reuse on technology"
```

---

## Task 12: Compose new technology/page.tsx + delete old components

Wire all sections together, mount the tweak panel, and remove the old `tech-hero` and `tech-feature` files.

**Files:**
- Modify: `src/app/technology/page.tsx`
- Delete: `src/components/technology/tech-hero.tsx`
- Delete: `src/components/technology/tech-hero.module.css`
- Delete: `src/components/technology/tech-feature.tsx`
- Delete: `src/components/technology/tech-feature.module.css`

- [ ] **Step 1: Replace `src/app/technology/page.tsx`**

```tsx
import { ChargeLink } from "@/components/home/charge-link";
import { TechnologyHero } from "@/components/technology/hero";
import { Philosophy } from "@/components/technology/philosophy";
import { PillarSection } from "@/components/technology/pillars/pillar-section";
import { ProofStrip } from "@/components/technology/proof-strip";
import { TweakPanel } from "@/components/technology/tweak-panel";

export default function TechnologyPage() {
  return (
    <>
      <TechnologyHero />
      <PillarSection />
      <ProofStrip />
      <Philosophy />
      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "calc(40px * var(--tw-rhythm, 1)) 40px calc(96px * var(--tw-rhythm, 1))",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ChargeLink href="/devices" label="See it in action" variant="inline" />
      </section>
      <TweakPanel />
    </>
  );
}
```

- [ ] **Step 2: Delete obsolete files**

Run:
```bash
rm src/components/technology/tech-hero.tsx
rm src/components/technology/tech-hero.module.css
rm src/components/technology/tech-feature.tsx
rm src/components/technology/tech-feature.module.css
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: success. (If you see errors about missing imports of the deleted files anywhere, grep for them and fix — but the only known references were inside the previous `technology/page.tsx`, which is now replaced.)

- [ ] **Step 4: Visual check (default state, no `?tweaks=1`)**

Run: `node compare/compare-route.mjs '//technology'`
Expected: `Wrote compare/technology-new.png and compare/technology-legacy.png`. Console errors `new: 0`. Open `compare/technology-new.png` and verify:
- Hero: "The electrode, *reinvented*." with italic indigo on *reinvented*; subtitle below; "01 / Materials · 02 / Form · 03 / Intelligence" anchor in the bottom-right of the mosaic.
- Three pillars side-by-side at equal width (no active state in screenshot).
- Proof strip with three stats: ~10×, 0, Days–Weeks.
- Philosophy paragraph centered.
- "See it in action →" CTA at the bottom.
- No Tweak panel visible (URL had no `?tweaks=1`).

- [ ] **Step 5: Visual check with `?tweaks=1`**

Hit `http://localhost:3000/technology?tweaks=1` manually in a real browser and verify:
- Tweak panel appears bottom-right.
- Dragging the "Pillar pop" slider expands a pillar more aggressively when hovered.
- Clicking the cyan or green accent swatch updates the indigo-bright accents (italic-em on hero, eyebrow color, signal trace, etc.) in real time.
- Reload preserves slider values.
- Reset button restores defaults and clears localStorage.

- [ ] **Step 6: Commit**

```bash
git add src/app/technology/page.tsx
git rm src/components/technology/tech-hero.tsx src/components/technology/tech-hero.module.css src/components/technology/tech-feature.tsx src/components/technology/tech-feature.module.css
git commit -m "feat(technology): compose redesigned page; remove old tech-hero/tech-feature"
```

---

## Task 13: Final verification

End-to-end check across all routes (the redesign shares state via `--indigo-bright` so accent changes affect every page) and across breakpoints.

- [ ] **Step 1: Type-check**

Run: `npx tsc --noEmit`
Expected: success.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: 0 errors. (The pre-existing `'side' is defined but never used` warning in `compare/compare.mjs` may persist — that's fine.)

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds. Note any warnings about `next/image` or Framer Motion bundle size — the framer-motion dep should be tree-shaken into the technology route bundle only.

- [ ] **Step 4: Home regression**

Run: `node compare/compare.mjs`
Expected: no new diffs introduced by the home `ChargeLink` variant change. Console errors `new: 0`.

- [ ] **Step 5: Cross-route accent consistency**

In a browser, with `?tweaks=1` in the URL, switch to cyan accent and navigate to `/about`, `/devices`, `/`. Verify:
- Indigo-bright accents on every route now render in cyan (eyebrow badges, italic-em headings, hex-portrait ring glows, partner ribbon items, etc.).
- Reset on the technology page restores indigo across all pages.

- [ ] **Step 6: Mobile check (≤414px)**

Run: `node compare/compare-route.mjs '//technology'` after temporarily editing it to a 414×900 viewport, OR manually: in a real browser, open DevTools, toggle iPhone Pro emulation, and verify:
- Hero stacks (headline above the anchor row).
- Pillars stack vertically.
- Tap on a pillar expands its reveal zone (description + detail visual). Tapping a different pillar swaps the open one.
- Proof-strip is single column with horizontal hairline dividers.
- CTA is centered and tappable.

- [ ] **Step 7: Reduced-motion check**

In DevTools (Rendering tab → "Emulate CSS media feature prefers-reduced-motion: reduce"), reload `/technology`. Verify:
- Pillar hover/focus still expands (UX feedback preserved).
- Signal trace renders in a static, fully-drawn state (no `pathLength` animation, no shimmer).
- Cursor-tracking gradient is replaced by a static glow.
- Section entry reveals (if any were added later) don't fire — fully visible at first paint.

- [ ] **Step 8: Final commit if anything changed during verification**

If any of the steps surfaced a fix:
```bash
git add -A
git commit -m "fix(technology): address verification findings"
```

If nothing changed, skip. The redesign is complete.

---

## Self-review

**Spec coverage:**
- Hero with locked headline + subtitle + 01/02/03 anchor row → Task 4. ✅
- Three-pillar character-select interaction with React state + Framer `layout` → Tasks 7+8. ✅
- Pillar internal layout (persistent + reveal zones) → Task 7. ✅
- Per-pillar visuals (placeholder via existing assets) → Task 6. ✅
- Mobile accordion + keyboard accessibility (Escape) → Tasks 7+8. ✅
- Cursor-tracking gradient outline → Task 7 (CSS in module + pointer handler in component). ✅
- Proof strip with three user-supplied claims → Task 9. ✅
- Philosophy paragraph (placeholder) → Task 10. ✅
- CTA reusing ChargeLink (new inline variant) → Task 11 + Task 12 step 1. ✅
- Tweak panel gated by `?tweaks=1`, 5 controls, localStorage persistence → Tasks 2+3. ✅
- `--indigo-bright` overridden by accent swatch (affects whole site intentionally) → Task 2 (`applyToBody`). ✅
- Vertical rhythm slider applied via `--tw-rhythm` multiplier on padding → applied in pillar-section/proof-strip/philosophy CSS. ✅
- Single easing curve `cubic-bezier(0.2, 0.7, 0.2, 1)` everywhere → enforced in every CSS module added. ✅
- `prefers-reduced-motion` exempts the pillar layout transition (UX feedback) but disables decorative animation → handled in `useReducedMotion` (signal trace) + CSS modules (cursor outline). ✅
- Removal of old tech-hero / tech-feature → Task 12. ✅

**Placeholder scan:**
- All `body` strings in `pillar-data.ts` are Lorem ipsum + `// TODO: real claim ...`. Intentional — content placeholder.
- Philosophy copy is Lorem ipsum + `// TODO: rewrite as ...`. Intentional.
- Proof-strip values marked `// TODO: confirm exact figure`. Intentional.
- No "TBD" / "implement later" / "add appropriate error handling" / "similar to Task N" patterns in any task step.

**Type consistency:**
- `TweakValues` type (Task 2) is consumed verbatim by `useTweaks` and the panel (Task 3). No drift.
- `PillarContent` / `PillarVisual` types (Task 6) consumed verbatim by `Pillar` (Task 7) and `PillarSection` (Task 8) via `PILLARS` import. No drift.
- `ChargeLinkVariant` type (Task 11) used in Task 12 step 1 with the literal `"inline"`.

**Scope:**
- Single page, single execution session. Sized appropriately. No decomposition needed.
