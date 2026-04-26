# Technology Page Redesign — Design Spec

**Date:** 2026-04-26
**Goal:** Reframe `/technology` as a step-change announcement — Polytecks rebuilt the bioelectrode from the materials up, not iteratively. The current page is a port of the legacy hifi prototype (mosaic hero + scientist-photo block + four placeholder cards); it reads as "we have nice tech" rather than "we redefined the category." This redesign communicates *category redefinition* through structure, copy, and one bold typographic moment, with a "character-select" pillar interaction as the centerpiece.

---

## Locked decisions

- **Headline:** "The electrode, *reinvented*." (italic-em on *reinvented*, mirroring the home page's *Window* italic for brand rhyme)
- **Subtitle:** "The electrode hasn't fundamentally changed in 80 years. We've reinvented it."
- **Accent color:** existing `--indigo-bright` (#6a74dc) — brand consistency over local optimization. (Cyan / signal-green available in tweak panel for live A/B.)
- **Pillar interaction architecture:** React state (`activeId`) + Framer Motion `layout` prop. Single state machine drives hover, focus, and mobile tap.
- **Animation philosophy:** one easing across the page (`cubic-bezier(0.2, 0.7, 0.2, 1)`); animate only what the eye needs to track; respect `prefers-reduced-motion` for decorative reveals while preserving hover affordance.
- **Tweak panel:** 5 controls (pillar pop, sibling dim, transition speed, accent swatch, vertical rhythm), gated by `?tweaks=1`, persists via `localStorage`.

---

## Architecture

### File structure (delta from current)

```
src/app/technology/page.tsx                 # composes full page (rewritten)
src/components/technology/
  hero.tsx + .module.css                    # NEW — replaces tech-hero.tsx
  pillars/
    pillar-section.tsx + .module.css        # parent — owns activeId
    pillar.tsx + .module.css                # one pillar (motion.div + layout)
    pillar-data.ts                          # 3 pillars' content + visual paths
    signal-trace.tsx                        # animated SVG for pillar 03
  proof-strip.tsx + .module.css             # 3 stat blocks
  philosophy.tsx + .module.css              # 80-word paragraph
  cta-link.tsx                              # reuses ChargeLink (single horizontal layout)
  tweak-panel.tsx + .module.css             # client — gated by ?tweaks=1
src/lib/use-tweaks.ts                       # client hook: localStorage + CSS-var sync
```

**Removed:**
- `src/components/technology/tech-hero.tsx` + `.module.css` → rewritten as `hero.tsx`
- `src/components/technology/tech-feature.tsx` + `.module.css` → deleted (scientist-photo block doesn't fit the new direction)
- `PlaceholderGrid` use in technology page → deleted (component remains, used by careers/contact)

### State distribution

- **`PillarSection`** owns `activeId: string | null`. Set by hover, focus, or mobile tap — one variable, three triggers.
- **`TweakPanel`** writes slider values to CSS custom properties on `document.body` (`--tw-pillar-pop`, `--tw-sibling-dim`, `--tw-anim-ms`, `--tw-rhythm`) and overrides `--indigo-bright` directly for the accent swatch. Components read those variables in CSS — no React re-renders for non-pillar elements while sliders move.
- **Persistence:** `localStorage["polytecks:tweaks"]` holds the values. URL query `?tweaks=1` controls panel *visibility*, not values, so a designer can tweak with the panel visible, then verify the un-paneled view by removing the query string while values stay.

### Dependency

- Add `framer-motion` to `package.json` (used here for the first time in the project).

---

## 1 / Hero

Reuses the current full-bleed `array-mosaic.jpg` background with the existing triple-gradient fade — preserved pixel-identical from the current tech-hero. The mosaic is the visual; the redesign is in typography and copy.

**Headline.**
- "The electrode, *reinvented*."
- Space Grotesk 300, `clamp(56px, 7vw, 132px)` — bigger than the home hero by design (this is the bold typographic moment per the brief).
- Letter-spacing **+0.01em** (slightly loose / editorial — confident-quiet rather than urgent-tight).
- *reinvented* — italic 500, color `--indigo-bright`, `text-shadow: 0 0 28px rgba(106,116,220,0.5)`, plus the same fading gradient underline used on home's *Window*. Visual rhyme.

**Subtitle.**
- "The electrode hasn't fundamentally changed in 80 years. We've reinvented it." — verbatim from the brief.
- Inter 400, `clamp(20px, 1.7vw, 28px)`, color `#c8cad6`, max-width 640px.

**Pillar preview anchor.**
- Bottom-right corner of the mosaic, in indigo-faint mono: `01 / Materials   ·   02 / Form   ·   03 / Intelligence` (~10px JetBrains Mono, letter-spacing 0.25em). Quietly previews the structure below the fold.

**No scroll-down arrow.** Restraint reads as confidence.

---

## 2 / Three Pillars (centerpiece)

### Layout

CSS Grid `1fr 1fr 1fr` at rest. When `activeId !== null`:
- Active pillar → flex value `--tw-pillar-pop` (default 1.6).
- Sibling pillars → flex value `(2 - 1.6) / 2 = 0.7`, opacity `1 - --tw-sibling-dim` (default 0.5), `scale(0.96)`.
- All transitions use `--tw-anim-ms` (default 350ms) with the page's shared easing.

### Pillar internal layout

Each pillar is a `motion.div` with two zones:

- **Persistent zone** (always rendered, opacity 1):
  - Mono number ("01" / "02" / "03") top-left, indigo-bright, JetBrains Mono 11px.
  - Title — Space Grotesk 400, `clamp(24px, 2.4vw, 36px)`, white.
  - Subtitle — Inter 300, `clamp(14px, 1.1vw, 16px)`, color `--ink-dim`.
  - Rest visual — single image, ~16:10 aspect, with a subtle indigo-tinted overlay gradient.
- **Reveal zone** (rendered always for keyboard/SEO, but `opacity: 0` and `translateY: 16px` when inactive; transitions to `opacity: 1` and `translateY: 0` on activation, with a 200ms delay so it arrives *into* the now-wider pillar rather than racing the layout shift):
  - ~40-word description body (Inter 300, 15px, color `--ink-dim`, max-width 360px).
  - Secondary detail visual or, on Pillar 03, the animated signal trace.

### Per-pillar content

Stored in `pillar-data.ts` so copy and visuals can be edited without touching component code. Description bodies are placeholder Lorem ipsum, each clearly marked `// TODO: real claim about <topic>`.

| # | Title | Subtitle | Rest visual | Hover detail | Description placeholder |
|---|---|---|---|---|---|
| 01 | New Materials | New sensing possibilities | Cropped detail of `array-mosaic.jpg` (treated high-contrast / desaturated to read SEM-like) | Wider crop with hairline scale-bar overlay | *Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam quis nostrud exercitation. // TODO: real claim about conducting-polymer wet-dry electrodes* |
| 02 | New Form | Engineered for ease-of-use | Cropped detail of `polytecks-arm-v2.png` (forearm + array, tightly framed) | Wider crop showing the array conforming to anatomy | *Lorem ipsum dolor sit amet, consectetur adipiscing elit. // TODO: real claim about textile-integrated mechanical design* |
| 03 | New Intelligence | Signal made meaningful | Animated signal-trace SVG (one looping line, indigo, on a faint grid) | Before/after: noisy "wet electrode" trace above clean "Polytecks" trace, both SVG | *Lorem ipsum dolor sit amet, consectetur adipiscing elit. // TODO: real claim about software / decision-support layer* |

Visual placeholders use existing assets cropped/treated rather than blank slots, so the layout looks designed immediately. Each crop and treatment is parameterized in `pillar-data.ts` and clearly marked for swap-out.

### Mobile (≤720px)

Pillars stack vertically. Tap-to-expand accordion: one pillar open at a time; tapping a different pillar swaps the open one. No layout-shift dim on mobile (only one pillar is visible meaningfully at once).

### Keyboard accessibility

- Each pillar root is a `<button>` (semantic, focusable by default).
- `focus` sets `activeId` (same code path as hover); `blur` clears it unless another pillar is focused.
- `Escape` clears `activeId` regardless.
- Tab order: pillar 1 → 2 → 3 → next section.

### Cursor-tracking gradient outline

When `activeId === pillarId`, a `::after` pseudo on the pillar renders a thin gradient border whose color stops follow the cursor position (CSS `--cursor-x` / `--cursor-y` set by a lightweight `pointermove` listener on the active pillar only). Reads as a "live" selection state. Disabled under `prefers-reduced-motion` (renders a static indigo glow instead).

---

## 3 / Proof strip

Three stat blocks. No icons (icons clutter; numbers + small labels read confidently). Layout: 3 columns desktop, 1 column mobile (each stat is too long to comfortably read in 2-up).

| Value | Label |
|---|---|
| `~10×` | Non-invasive spatial resolution relative to standard electrodes |
| `0` | Skin preparation needed — no electrode gel required |
| `Days–Weeks` | Continuous wear on the body |

Each block:
- Value — Space Grotesk 400, `clamp(36px, 4vw, 56px)`, color `--ink`.
- Label — Inter 300, `clamp(13px, 1vw, 15px)`, color `--ink-dim`, max-width 280px, text-align left, line-height 1.5.
- Hairline divider (1px `--line`) between blocks (vertical desktop, horizontal mobile).
- No background, no border around each block. Reads as raw fact, not a card.

Each value marked `// TODO: confirm exact figure` in the data file.

---

## 4 / Philosophy paragraph

One paragraph, 80-word target, centered, max-width 720px.

- Inter 300, `clamp(18px, 1.5vw, 22px)`, color `--ink-dim`.
- No headline above it. No decoration. The whitespace around it is the design.

Placeholder copy:
> *Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. // TODO: rewrite as: one sensor platform, many bioelectronic applications. Starting with veterinary cardiology where the regulatory path is fastest, then extending into human ECG, EEG, and EMG as clinical validation matures. The technology beneath is the same — what changes is what we ask it to listen for.*

---

## 5 / CTA

Single line, centered, below the philosophy paragraph: **`See it in action →`** linking to `/devices`.

Reuses the existing `ChargeLink` component from `src/components/home/charge-link.tsx`, repurposed in a single-line horizontal variant (one ChargeLink at narrow width, centered) — so the charge-fill underline animation is consistent with the home page CTAs.

If the existing ChargeLink doesn't compose cleanly in a centered single-line layout without modification, I'll add a `variant?: "horizontal"` prop and switch its label/track layout. No fork.

---

## 6 / Tweak panel

Floating bottom-right, gated by `?tweaks=1` query string. The panel itself only mounts when the query is present; without it, no panel UI exists in the DOM.

### Visual

- 280px wide, dark glass: `background: rgba(15, 16, 22, 0.85); backdrop-filter: blur(12px);`
- 1px `var(--line)` border, 8px radius.
- Top-bar: title "TWEAKS" (mono 11px, uppercase, indigo-bright) + collapse chevron.
- Sliders: native `<input type="range">` with a thin custom-styled track (1px line) and a 14px round indigo thumb.
- Swatch picker (accent): three 24px round buttons, indigo / cyan / signal-green, with a 1px ring on the selected one.
- Each row labeled with mono 10px label and a small mono value readout on the right.

### Five controls

| # | Control | Range | Default | CSS variable written |
|---|---|---|---|---|
| 1 | Pillar pop | 1.0 → 1.8 | 1.6 | `--tw-pillar-pop` |
| 2 | Sibling dim | 0 → 0.7 | 0.5 | `--tw-sibling-dim` (read as opacity offset) |
| 3 | Transition speed | 200 → 600 ms | 350 ms | `--tw-anim-ms` |
| 4 | Accent | indigo / cyan / signal-green | indigo | `--indigo-bright` (overrides root) |
| 5 | Rhythm | 0.7 → 1.4 | 1.0 | `--tw-rhythm` (multiplier on `padding-block`) |

### Hook: `use-tweaks.ts`

- On mount: read `localStorage["polytecks:tweaks"]` (JSON), apply to `document.body` style (CSS variables), return `[values, setters]`.
- On any setter call: update React state, write to `document.body.style.setProperty`, write to localStorage.
- On unmount: leave variables intact (so disabling `?tweaks=1` shows the page with last-set values).
- Reset button in the panel restores defaults and removes the localStorage key.

### Production posture

The panel only renders when `?tweaks=1` is in the URL. The `use-tweaks` hook reads localStorage values regardless and applies them as CSS variables — meaning a tweaked-state page can be shared via URL (without `?tweaks=1`) and look the same. Once we settle on values, baking them as the new defaults in CSS becomes a one-liner. Until then, this is a designer affordance, not user-facing.

---

## 7 / Animation choreography

- **Single easing curve:** `cubic-bezier(0.2, 0.7, 0.2, 1)` for every transition on the page.
- **Pillar layout transition:** `--tw-anim-ms` (default 350ms).
- **Pillar reveal-zone fade:** 250ms, delayed 200ms after layout starts.
- **Section entry on first scroll-into-view:** fade + 12px translate-up over 600ms, staggered ~80ms between sibling sections. Driven by an `IntersectionObserver` (root margin -10%, threshold 0.1). One reveal per section, never re-fires on re-entry.
- **Signal-trace SVG (pillar 03):** `pathLength` 0→1 over 2s on first viewport entry, then a 4s slow opacity shimmer loop.
- **Cursor-tracking outline on active pillar:** updated via `pointermove` on the pillar element only (not document) → CSS variables → `::after` gradient stops.
- **`prefers-reduced-motion: reduce`:** entry reveals + signal trace draw + outline tracking all disabled (replaced by static states); pillar layout transition remains because it's UX feedback, not decoration.

---

## Out of scope

- Real imagery / SEM micrographs / signal recordings — placeholder crops of existing assets, marked `// TODO: swap with real X` in `pillar-data.ts`.
- Real proof-strip figures — the three claims are content-locked but the exact numbers (~10×, days–weeks) need confirmation; marked `// TODO: confirm exact figure`.
- Real philosophy-paragraph copy — Lorem ipsum with the user's intent captured in a TODO block.
- Tweak panel "save preset" / "share preset URL" features — out of scope. localStorage + manual URL sharing covers the iteration use case.
- Production removal of the tweak panel — left in place behind the `?tweaks=1` gate. Once values stabilize, follow-up work bakes them into CSS and deletes the panel.
- Any redesign of `/devices`, home, or other routes.
- Any real-data integration (live signal capture, etc.) — pillar 03's signal trace is a hand-authored SVG.

---

## Spec self-review

- **Placeholder scan:** All copy placeholders explicitly marked `// TODO`. Real proof figures explicitly flagged. No "TBD" hiding in section descriptions.
- **Internal consistency:** Architecture's CSS-variable approach is consistent across the panel hook, pillar styling, and rhythm scaling. Single easing variable referenced everywhere. Single `activeId` state machine handles hover/focus/tap.
- **Scope:** Single page, single implementation plan. Fits one execution session. No decomposition needed.
- **Ambiguity:** "~10×" vs "10×" wording for proof strip — using "~10×" verbatim per user instruction. "Days–Weeks" formatted as one value with em-dash, not two stats.
