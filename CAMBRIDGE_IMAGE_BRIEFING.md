# Cambridge Image — About Us Page — Implementation Briefing

This document explains how the "From Origins at the University of Cambridge" section on the **About Us** page is coded. It is intended as a self-contained handoff so another Claude session can pick up and continue work without re-discovering the architecture.

---

## 1. Where it lives

**Page entry point:** `src/app/about/page.tsx`

```tsx
import { CambridgeSection } from "@/components/about/cambridge-section";
import { StackEntry } from "@/components/stack-entry";

<StackEntry index={3}>
  <CambridgeSection />
</StackEntry>
```

The section is rendered as the third element in the page's stagger-reveal sequence. `StackEntry` is a wrapper that fades + slides its child up on mount (and replays on a `polytecks:replay-page` event). It does **not** affect static layout — only the entry animation.

**Component files:**

| File | Purpose |
| --- | --- |
| `src/components/about/cambridge-section.tsx` | Top-level component. Branches desktop vs mobile via `useIsMobile()`. |
| `src/components/about/cambridge-section.module.css` | Desktop styles (full-bleed image, two absolutely-positioned floating callouts). |
| `src/components/about/mobile-cambridge-section.tsx` | Mobile variant — different DOM, flow-positioned. |
| `src/components/about/mobile-cambridge-section.module.css` | Mobile styles (4:3 aspect-locked image, callout as a normal `<p>` below image). |

**Image asset:** `/public/assets/cambridge.png` (2400 × 1350 source, rendered through `next/image`).

---

## 2. Architectural pattern — Tier 3 component branching

The Cambridge section is a **Tier 3** mobile component per `MOBILE_STRATEGY.md §4.7`. That means: rather than re-styling the desktop layout with media queries, mobile gets a **separate component** with different DOM.

```tsx
export function CambridgeSection() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileCambridgeSection />;
  return <DesktopCambridgeSection />;
}
```

`useIsMobile()` is SSR-safe — defaults to `false` server-side, hydrates to the actual viewport on the client. Both variants live in the same folder so they evolve together.

**Why branching, not CSS:** the desktop has two floating callouts absolutely positioned over the image at viewport-relative percentages. That pattern is fragile on touch screens; mobile rebuilds it as flow-positioned text below the image. Trying to do both with `@media` queries proved error-prone — the layout primitives don't survive translation.

---

## 3. Desktop layout

### DOM structure
```tsx
<section className={styles.section}>
  <h2 className={styles.title}>
    From Origins at the <em>University of Cambridge</em>
  </h2>

  <div className={styles.body}>
    <div className={styles.media}>
      <Image src="/assets/cambridge.png" width={2400} height={1350} sizes="100vw" preload />
      <p className={styles.bodyText}>Polytecks grew out of the Cambridge ecosystem…</p>
      <p className={styles.calloutText}>
        The ECG was first made in Cambridge over a century ago.{" "}
        <em>The next chapter starts here too.</em>
      </p>
    </div>
  </div>
</section>
```

Key choice: **both callouts are children of `.media`, not `.section`.** This anchors their `top` / `left` percentages to the **image box**, not the 100 vw section. Without this, on viewports wider than the image's max-width cap, the callouts drift off the image.

### `.section` — full-bleed breakout
```css
.section {
  margin-top: 380px;           /* Distance below the page header / lede */
  margin-bottom: var(--sp-about-cambridge-to-team, 160px);
  margin-left: calc(50% - 50vw);   /* Negative margin breakout — */
  margin-right: calc(50% - 50vw);  /* escapes the parent's max-width gutter */
  position: relative;
  width: 100vw;
}
```
The `calc(50% - 50vw)` trick lets the section span the full viewport even though it lives inside a `max-width` content column.

The 380 px top margin is hardcoded (not from a tweak var) because old cached localStorage values from the tweak panel would otherwise override the design intent.

### `.title`
- Font: `--font-display` (Space Grotesk), weight 300, `clamp(28px, 3vw, 44px)`.
- `<em>University of Cambridge</em>` is styled italic-500 in `--indigo-bright`. This is the **identity-critical** accent treatment used across the site for `<em>` inside headings.
- Horizontal margins use `max(40px, calc(50vw - 530px))` to keep the title aligned to the centred 1060 px content column even though `.section` is 100 vw.

### `.media` — image container
```css
.media {
  position: relative;
  width: max-content;   /* Critical — sizes to the image, not the section */
  margin: 0 auto;
  overflow: visible;
}
```
`width: max-content` is what makes the absolutely-positioned callout children measure their percentages against the image box.

### `.media img` — the image itself

Width formula (≤1599 px viewports):
```css
width: calc(
  min(clamp(900px, 70vw, 1100px), 100vw)
  * var(--tw-cb-scale, 1)
  * (1 - var(--tw-cb-crop-sides, 0))
);
```
At common breakpoints:
- 1100 px → 900 px wide
- 1280 px → 900 px wide (clamp floor)
- 1440 px → 1008 px wide (70 vw)
- 1599 px → 1100 px wide (clamp ceiling)

Above 1600 px viewports, a media query lifts the cap to 1400 px:
```css
@media (min-width: 1600px) {
  .media img { width: calc(min(1400px, 100vw) * var(--tw-cb-scale, 1) * (1 - var(--tw-cb-crop-sides, 0))); }
}
```

Aspect ratio:
```css
aspect-ratio: 1100 / calc(619 * (1 - var(--tw-cb-crop-bottom, 0.18)));
height: auto;
object-fit: cover;
object-position: center top;
```
The 1100 / 619 ratio matches the source image. The `--tw-cb-crop-bottom` variable (default 0.18, design value 0.16) **widens the aspect ratio** — effectively shortening the box from the bottom. Because the object-position is `center top`, this clips the bottom of the photograph, not the top spires of King's College.

### Mask fades (the soft dissolve)

The image dissolves into the page on its bottom edge using a CSS mask. Below 1600 px (full-bleed), bottom-only:
```css
mask-image: linear-gradient(
  to top,
  transparent 0%,
  black var(--tw-cb-bottom-fade, 15%),
  black 100%
);
```
At ≥1600 px viewports (image is inset with bg on each side), side fades are added too and the two gradients are composited with `mask-composite: intersect`:
```css
mask-image:
  linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%),
  linear-gradient(to top, transparent 0%, black 15%, black 100%);
mask-composite: intersect;
```
The webkit-prefixed equivalents (`-webkit-mask-image`, `-webkit-mask-composite: source-in`) are written alongside the spec versions.

### The two floating callouts

Both `.bodyText` and `.calloutText` are absolutely positioned over the image. They share the same typography:
```css
font-family: var(--font-sans);
font-weight: 300;
font-size: calc(clamp(11px, 0.85vw, 15px) * var(--tw-cb-scale, 1));
line-height: 1.5;
color: var(--ink);
text-shadow: 0 2px 12px rgba(0, 0, 0, 0.55);  /* Halo for readability over photo */
pointer-events: none;
max-width: 480px;
```
Their positions are driven by CSS custom properties from the tweak panel (defaults / design values below):

| Variable | Default in CSS | Design value (use-tweaks) | Notes |
| --- | --- | --- | --- |
| `--tw-cb-body-callout-top` | `10%` | `31%` | Body text vertical offset (within `.media`) |
| `--tw-cb-body-callout-left` | `8%` | `7%` | Body text horizontal offset |
| `--tw-cb-callout-top` | `10%` | `17%` | ECG callout vertical offset |
| `--tw-cb-callout-left` | `54%` | `61%` | ECG callout horizontal offset |

The ECG callout's closing sentence (`<em>The next chapter starts here too.</em>`) gets the same italic-500 `--indigo-bright` treatment as the heading `<em>` — site-wide identity consistency.

---

## 4. Mobile layout

The mobile component (`mobile-cambridge-section.tsx`) is shorter and structurally simpler. Key differences from desktop:

| Concern | Desktop | Mobile |
| --- | --- | --- |
| Body paragraph | Absolutely positioned overlay (`.bodyText`) at ~7%/31% on image | Normal flow `<p>` above the image |
| ECG callout | Absolutely positioned overlay (`.calloutText`) at ~61%/17% on image | Normal flow `<p>` below the image |
| Image crop | `1100 / 619` (cinematic 16:9-ish) | `aspect-ratio: 4 / 3` (more square) |
| Image width | Capped at 1100 / 1400 px | Always 100 vw |
| Side fade | Yes (≥1600 px) | None — image touches both viewport edges |
| Bottom fade | Yes (`mask-image`) | Yes (preserved) |
| Top fade | None | None (King's College spires cut clean) |
| Image `next/image` prop | `preload` | `priority` |

The mobile callout uses the same indigo-bright `<em>` treatment on the closing phrase — preserved per the identity check in `MOBILE_STRATEGY.md §3`.

---

## 5. The tweak panel — runtime tuning

The Cambridge section is wired up to `use-tweaks.tsx`, a dev tool that exposes runtime sliders for non-engineer tuning. The relevant fields:

```ts
cambridgeCalloutTopVh: 17,        // ECG callout top — % of .media
cambridgeCalloutLeftVw: 61,       // ECG callout left
cambridgeBodyCalloutTopVh: 31,    // Body callout top
cambridgeBodyCalloutLeftVw: 7,    // Body callout left
cambridgeImgScale: 1.5,           // Multiplier on image width (also scales font size)
cambridgeCropBottom: 0.16,        // Fraction trimmed from image bottom
cambridgeCropSides: 0,            // Fraction trimmed from image sides
cambridgeSideFadePct: 7,          // % reach of side mask fade
cambridgeBottomFadePct: 12,       // % reach of bottom mask fade
aboutHeaderToCambridge: 190,      // Vertical spacing above the section (writes to var, but CSS hardcodes 380 — see note in CSS)
aboutCambridgeToTeam: 200,        // Vertical spacing below the section
```

These are emitted onto `document.body` as CSS custom properties (`--tw-cb-*` and `--sp-about-*`). The CSS reads them with fallback defaults, so even if the tweak panel never runs, the layout still works with sensible values baked in.

**Important nuance:** `--sp-about-header-to-cambridge` is **written** to the body by the tweak panel but the `.section` CSS no longer **reads** it — it hardcodes `margin-top: 380px`. This is deliberate: users with old cached localStorage values from the old `280px` design would otherwise see the pre-bump spacing.

---

## 6. Quick-reference: things that surprised me / pitfalls

1. **`.media` must be `width: max-content`.** The two absolutely-positioned callouts measure their `top` / `left` against this box. If `.media` is full width (or `100%`), the callouts drift off the image on viewports wider than 1100/1400 px because their percentages are computed against a wider container than the image itself.

2. **The aspect ratio is mutated by the bottom-crop slider, not by clipping height.** Increasing `--tw-cb-crop-bottom` widens the aspect ratio numerator, which makes the box shorter in proportion to its width. `object-fit: cover` + `object-position: center top` then keeps the top of the image pinned and clips the bottom.

3. **`mask-composite: intersect` (spec) and `-webkit-mask-composite: source-in` (legacy webkit)** are not synonyms in general, but for two same-direction "show inside, hide outside" gradients they are equivalent. Both are written so Safari + Chromium both render the corner fades correctly.

4. **Side fade only kicks in ≥1600 px.** Below that, the image is full-bleed and a side fade would just dim the leftmost/rightmost pixels of the photograph against the page bg — looks like an artifact, not a soft dissolve. Above 1600 px the image is capped and there's genuine page bg on each side to fade into.

5. **`FadeImage` wraps `next/image`.** It starts at opacity 0 and fades to 1 on `onLoad`, so the cathedral never pops in. It also checks `img.complete` on mount to avoid waiting for an `onLoad` event that won't fire for cached/synchronously-decoded images.

6. **The mobile component uses `priority` on `<Image>`; the desktop component uses `preload`.** `priority` is a valid `next/image` prop; `preload` is not a standard `next/image` prop and is silently ignored. If preloading the desktop image matters, this should be changed to `priority`.

7. **`StackEntry` wraps the whole section** (`index={3}`) — meaning the entire Cambridge block fades + slides on page load (and replays via the `polytecks:replay-page` custom event). The section itself doesn't know about the entry animation.

---

## 7. Touching the section safely — a checklist

If you're about to change anything here:

- [ ] Are you changing desktop, mobile, or both? They are separate components.
- [ ] If moving a callout: are you editing the CSS default **and** the `use-tweaks.tsx` default? They should agree.
- [ ] If changing image width: does the `≥1600px` media query also need updating?
- [ ] If changing the crop: does the `aspect-ratio: 1100 / calc(619 * …)` formula still match the source image's natural ratio (2400 × 1350 → 1.778 → 1100 / 619)?
- [ ] If touching the `<em>` accent treatment: same treatment lives in `mobile-cambridge-section.module.css` and in the heading rules across the site. Don't drift them.
- [ ] If changing top spacing: do you want to bump the hardcoded `380px` in `.section`, or change the design intent recorded in `aboutHeaderToCambridge` in `use-tweaks.tsx`, or both? The CSS no longer reads the var.

---

## 8. File map (clickable in editor)

- `src/app/about/page.tsx` — page entry, wraps section in `<StackEntry index={3}>`
- `src/components/about/cambridge-section.tsx` — branching component
- `src/components/about/cambridge-section.module.css` — desktop styles
- `src/components/about/mobile-cambridge-section.tsx` — mobile component
- `src/components/about/mobile-cambridge-section.module.css` — mobile styles
- `src/components/fade-image.tsx` — `<Image>` wrapper with opacity fade-in
- `src/components/stack-entry.tsx` — stagger-reveal wrapper
- `src/lib/use-is-mobile.ts` — SSR-safe viewport hook (Tier 3 branching)
- `src/lib/use-tweaks.tsx` — runtime tuning CSS variables
- `MOBILE_STRATEGY.md §4.7` — design spec for the mobile rebuild
- `public/assets/cambridge.png` — the image (2400 × 1350)
