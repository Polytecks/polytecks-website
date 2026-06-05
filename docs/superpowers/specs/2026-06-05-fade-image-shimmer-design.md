# FadeImage Shimmer Placeholder — Design

**Date:** 2026-06-05
**Owner:** Callan
**Status:** Draft, awaiting review

## Problem

On a fresh device with a weak network, non-background images (e.g. the three pillar cards on `/technology`) take noticeable time to download. The existing `FadeImage` wrapper at `src/components/fade-image.tsx` already fades the image in over ~280 ms once `onLoad` fires, but until then the image's footprint is blank. That blank gap reads as "broken" on slow networks.

We want a subtle, animated skeleton sweep painted in the image's footprint while the bytes are in flight — the kind of soft drifting gradient used on Stripe, Vercel, and Linear loading states.

## Goal

Add a shimmer placeholder to every non-background image (every `FadeImage` usage), without touching the 15 call sites. The shimmer should:

- Paint as soon as the wrapper mounts and continue until the image's `onLoad` fires.
- Auto-tint to the surrounding theme (dark page → faint light tint, light page → faint dark tint) without needing per-call-site config.
- Not flash when the image is already cached (browser reports `complete === true` on mount).
- Be removed from the DOM the moment the image fades in, so it doesn't keep painting under loaded images.
- Respect `prefers-reduced-motion` by dropping the sweep animation but keeping the static tint.

## Non-goals

- Shimmer for background images (CSS `background-image`) or for `<video>` elements.
- Per-call-site shimmer tuning beyond an opt-out flag and a coarse tone override.
- Blur-up / LQIP placeholders (Next/Image's built-in `placeholder="blur"` is unaffected and can still be used per-call where desired).
- Animated transition out (the shimmer simply unmounts as the image fade-in completes; the visual handoff is the image's existing 280 ms opacity fade).

## Architecture

One file is modified, one CSS module is added. No call site changes.

### `src/components/fade-image.tsx`

Two new optional props on `FadeImage`:

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `shimmer` | `boolean` | `true` | Render the skeleton sweep until the image loads. Set `false` to opt out for a specific call site. |
| `shimmerTone` | `"auto" \| "light" \| "dark"` | `"auto"` | Overrides auto-tinting in the rare case where the surrounding text color (used by `currentColor`) isn't representative of what's behind the image. |

Render structure (replaces the current single `<Image>` return):

```tsx
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
    className={className}              {/* unchanged — stays on the <img> */}
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
```

### Wrapper layout strategy — `display: contents`

**Critical decision:** the consumer's `className` continues to land on the `<Image>` (i.e., the `<img>`), because:

- Several call sites pass classNames whose rules only make sense on `<img>` — `object-fit`, `object-position`, `filter` etc. Examples:
  - `home/latest-news.tsx` → `styles.image` sets `object-fit: cover; object-position: center; filter: grayscale(0)`.
  - `technology/hero.tsx` → `styles.bgImage` sets `object-fit: cover; object-position: center; z-index: 0`.
  - `careers/careers-hero.tsx` → `styles.bgImage` sets `object-fit: cover; object-position: center 65%`.
- Other call sites style the image via descendant selectors that reach past `FadeImage` (e.g. `.imageZone img { width: 100%; height: 100% }` in `technology/pillars/pillar.module.css`). Those keep working because the `<img>` is still a descendant; an intermediate `<span>` doesn't break descendant selectors.

But if we wrap with a normal `<span>`, two things break:

1. The `<span>` becomes the new layout box. In width/height mode where the descendant selector forces `width: 100%; height: 100%` on the image, a default `inline-block` wrapper collapses to zero (image is 100% of wrapper, wrapper sizes to content → degenerate).
2. In `fill` mode, the wrapper would have to take the parent's full size to act as the positioned ancestor — but that requires the wrapper to know it's in fill mode, which is doable but adds complexity.

**The fix is `display: contents` on the wrapper.** This removes the wrapper's own box from layout entirely — the `<img>` and `<span class="shimmer">` become layout-level siblings under the wrapper's parent. All existing CSS targeting the `<img>` (whether via className or descendant selector) continues to apply exactly as before. The shimmer absolutely-positions itself against the closest positioned ancestor — which is the image's parent (the same box that `<Image fill>` would have been positioned against, and that other call sites already use to contain the image).

`display: contents` is well-supported (Chrome 65+, Firefox 37+, Safari 11.1+) with one historical accessibility caveat: some older browsers stripped the wrapper from the a11y tree, which could affect interactive content. Our wrapper contains only a decorative shimmer (`aria-hidden`) and a regular `<img>` — neither is interactive — so this caveat doesn't apply here.

**Pre-requisite this introduces:** every call site's *parent* of `FadeImage` must be a positioned ancestor (have `position: relative` or equivalent). For `fill`-mode usages this is already a hard requirement of Next/Image. For `width/height` usages, all current call sites I audited (pillars, hex portraits, news cards, etc.) already have a positioned containing element. The implementation step includes a grep to confirm; if any usage is found without one, we add a one-line `position: relative` to the containing element's CSS.

### `src/components/fade-image.module.css` (new)

```css
.fadeImageWrap {
  display: contents;
}

.shimmer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--shimmer-bg, color-mix(in srgb, currentColor 6%, transparent));
  border-radius: inherit; /* respect rounded corners on the parent */
  z-index: 0;
  pointer-events: none;
  /* Cached images set loaded=true in useEffect on mount, which unmounts
     the shimmer within ~1 frame. Delay the fade-in so the shimmer is
     invisible during that single frame and only becomes visible for
     genuinely slow loads. */
  opacity: 0;
  animation: fadeImageShimmerWarmup 200ms ease-out 150ms forwards;
}

.shimmer::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, currentColor 8%, transparent) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: fadeImageShimmerSweep 1.6s ease-in-out infinite;
}

.fadeImageWrap[data-tone="light"] .shimmer { --shimmer-bg: rgba(255, 255, 255, 0.06); }
.fadeImageWrap[data-tone="light"] .shimmer::after {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.10), transparent);
}
.fadeImageWrap[data-tone="dark"] .shimmer { --shimmer-bg: rgba(0, 0, 0, 0.06); }
.fadeImageWrap[data-tone="dark"] .shimmer::after {
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.10), transparent);
}

@keyframes fadeImageShimmerWarmup {
  to { opacity: 1; }
}
@keyframes fadeImageShimmerSweep {
  to { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .shimmer { animation: none; opacity: 1; }
  .shimmer::after { display: none; }
}
```

Notes:

- `color-mix(... currentColor ...)` derives the shimmer color from the surrounding text color — on this site text color tracks theme closely enough for it to read correctly without per-call config.
- `border-radius: inherit`: when the parent (e.g. `.imageWrap` on a news card, `.clip` on a hex portrait) has rounded corners, the shimmer matches.
- `pointer-events: none` so the shimmer never blocks clicks on cards.
- The 150 ms warm-up plus 200 ms fade is what handles the cached-image case without needing `useLayoutEffect` gymnastics: a cached image's `useEffect` flips `loaded` to `true` well within 150 ms (typically <5 ms), the shimmer unmounts before its opacity animation even begins, and the user sees no flash.

### Stacking

The image's `<img>` element doesn't get an explicit z-index, so it stacks above the shimmer by source order (the shimmer is rendered first in the JSX and has `z-index: 0`, which is enough to keep it below `<img>` whose default `z-index: auto` participates in the same stacking context). For call sites that put the image inside a positioned ancestor with overflow, this is straightforward. The technology hero (`bgImage` with `z-index: 0`) is the one case where the image's class sets z-index explicitly — that still wins over the shimmer's `z-index: 0` due to the explicit declaration on the actual image element being painted later. Verify during smoke test.

## Behavior over time

1. **Cached image (already in browser cache):**
   First render: `loaded = false`, shimmer JSX evaluates to true, shimmer mounts with `opacity: 0; animation-delay: 150ms`. `useEffect` runs, sees `imgRef.current.complete === true`, calls `setLoaded(true)`. Next render: shimmer JSX evaluates to false, shimmer unmounts. Entire sequence completes inside one animation frame; the shimmer's opacity is still 0 throughout. User sees no flash.

2. **Uncached image, slow network:**
   First render: shimmer mounts, image renders at `opacity: 0`. ~150 ms later the shimmer fades to opacity 1 and the sweep starts. When bytes arrive and `onLoad` fires, `setLoaded(true)` runs, shimmer unmounts, image transitions to `opacity: 1` over 280 ms. Visually: shimmer disappears as the image becomes visible.

3. **`shimmer={false}` opt-out:**
   The shimmer JSX never renders. Existing fade-in-only behavior preserved exactly.

4. **`prefers-reduced-motion: reduce`:**
   Shimmer base tint paints immediately (opacity 1, no warm-up animation, no sweep). Provides the "something is here" affordance without any motion.

## Risks and mitigations

1. **`display: contents` accessibility tree edge cases.** Modern Chrome/Safari/Firefox handle `display: contents` correctly for non-interactive content. The wrapper contains only `aria-hidden` decoration and an `<img>` — neither is interactive — so the historical bug (interactive content disappearing from a11y tree) does not apply. **Mitigation:** none required, but the implementation PR should include a manual axe/Lighthouse a11y check on `/technology` to confirm no regression.

2. **Positioned-ancestor pre-requisite.** The shimmer's `position: absolute; inset: 0` positions against the nearest positioned ancestor — which in a `display: contents` wrapper is the consumer's parent element. **Mitigation:** during implementation, grep every FadeImage call site, walk one level up in the JSX, and confirm the parent CSS sets `position: relative` (or absolute/fixed/sticky). For `fill`-mode usages this is already a hard Next/Image requirement, so they're all good. For `width/height` usages, expected to also be true based on the call sites already audited (pillars have `.imageZone` with `position: relative`, hex portraits have `.clip` with `position: relative`, etc.). Any holdouts get a one-line `position: relative` added.

3. **Shimmer covers the full positioned ancestor, which may be larger than the image.** In width/height mode where the parent box is larger than the image's intrinsic display size (e.g. an image centered in a card with padding), the shimmer would tint the entire parent, not just the image footprint. **Mitigation:** for the call sites we've audited, the image fills its positioned parent (`width: 100%; height: 100%` either via descendant selector or via `fill` mode), so the shimmer footprint matches. If a future call site centers a smaller image in a larger parent, the fix is either (a) wrap the image in a tighter positioned span at the call site, or (b) add a `shimmer={false}` for that case.

4. **Next.js 16 specifics.** `AGENTS.md` mandates reading `node_modules/next/dist/docs/` before touching Next code. **Mitigation:** during implementation, skim the Image component doc to confirm no API changes to `fill`, `ref`, or `onLoad` behavior since FadeImage was originally written.

5. **The shimmer warm-up timing (150 ms) is a heuristic.** Browsers vary in how quickly `useEffect` fires after mount. **Mitigation:** if testing reveals the shimmer flashes for cached images, increase the warm-up to 250 ms — that's still imperceptible for slow-network UX but generous enough to absorb effect latency on slower devices.

## Testing plan

Manual smoke test on `pnpm dev`:

1. **Hard reload `/technology` with the network throttled to Slow 3G in devtools.** Confirm the three pillar cards show shimmering placeholders, then the images fade in over them. Confirm no layout shift.
2. **Reload again with no throttling.** Confirm cached images don't produce a visible shimmer flash.
3. **Toggle `prefers-reduced-motion`** (devtools → Rendering → emulate). Reload with throttling. Confirm a static tint shows but the sweep is gone.
4. **Visit `/devices`, `/`, `/about`, `/careers`, `/press`** with throttling and confirm no visual regressions on any FadeImage usage. Pay particular attention to:
   - Technology hero (full-bleed background image with `z-index: 0` — shimmer must stack below).
   - Latest news cards (`fill` mode inside `.imageWrap`).
   - Hex portraits (rounded `.clip`, `border-radius: inherit` must work).
   - Pillar visuals (width/height mode with descendant-selector sizing).
5. **Toggle the light theme** (whatever surfaces it — check the header). Confirm shimmer tint inverts sensibly via `color-mix(currentColor)`.
6. **Lighthouse / axe a11y pass** on `/technology` to verify `display: contents` doesn't introduce a11y regressions.

No automated tests added — the behavior is purely visual and load-timing dependent, and we don't have a visual regression harness set up.

## Out of scope, deferred

- Configurable shimmer speed / direction / intensity (let's see if anyone asks).
- Shimmer for `<video>` elements in pillar cards (currently a black box until first frame paints — same problem, but video loading is a different beast and worth its own design).
- A standalone `<Shimmer>` component for non-image skeletons (text blocks, charts). If we want that, the CSS module here is the natural extraction point.
- An `imgClassName` escape hatch on `FadeImage` for the case where someone wants to style the image and the wrapper differently. Not needed today; add if and when a call site demands it.
