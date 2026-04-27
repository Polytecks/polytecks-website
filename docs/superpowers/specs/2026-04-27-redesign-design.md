# Redesign — April 2026

**Status:** Approved during brainstorming, ready for implementation planning.
**Snapshot:** Pre-redesign state preserved as git tag and branch `legacy-pre-redesign` at commit `8878e5d`. Revert with `git checkout legacy-pre-redesign`.

## Goals

A coherent visual + interaction pass over the current site:

- Tighten visual mass: contain banner imagery to the same 1400px the rest of the content sits in, with a clean gradient taper to the page background beyond it. Add a mild vignette to white-background sections.
- Upgrade the technology page's three proof points from a static row into a scroll-pinned cinematic introduction.
- Extend the topo-line motif so it crosses white sections cleanly (lines re-color to dark when over white panels).
- Add page-title load-in animations on subpages (3 styles, picked at runtime via the tweak menu).
- Add a site-wide footer.
- Sweep through small polish items: dead UI, clearer copy, smoother hover physics.
- Restructure the tweak menu into 3 tabbed pages to host all the new design knobs.

## Non-goals

- Pillar-card text z-order behind image (considered, dropped — the pillars already work as desired).
- Pillar visual / interaction changes (unchanged).
- New routes, new top-nav items.

---

## Section 1 — Tweak menu becomes 3 pages

The current single panel becomes a 3-tab panel. Tab strip sits at the top of the panel body, between the title bar and the controls.

Tabs:
- **Pillars** — exact contents of today's panel (pillar pop, sibling dim, transition, accent, rhythm, active color, image style, per-card image positioning). Behavioral identity preserved.
- **Proof** — the 8 controls listed in §4 for the new scroll-pinned proof points section.
- **Page Fx** — title animation style (3-way segmented), duration slider, stagger slider, topo-lines-on-white toggle.

The `?tweaks=1` query param continues to gate visibility. The active tab persists in localStorage (`polytecks:tweaks:tab`). Snapshot save serializes everything regardless of which tab is open.

**Affected files:**
- `src/components/technology/tweak-panel.tsx` — refactor into a tab host with three child components.
- New: `src/components/technology/tweak-tabs/pillars-tab.tsx`, `proof-tab.tsx`, `page-fx-tab.tsx`.
- `src/components/technology/tweak-panel.module.css` — add `.tabs`, `.tab`, `.tab[data-active="true"]` styles.
- `src/lib/use-tweaks.tsx` — extend `TweakValues` with the new fields (proof-section knobs, title animation knobs, topo-lines toggle). Update `TWEAK_DEFAULTS`. Update `applyToBody` to publish new CSS variables (`--tw-pin-scroll`, `--tw-giant-vh`, `--tw-settle-scale`, `--tw-vignette`, etc.).

The tweak panel already lives only on the technology page today. The new title-animation and topo controls need to apply *site-wide*, not just on technology. Solution: `applyStoredTweaks()` (which already exists for non-tweaked-page renders) is invoked unconditionally from `Providers` in `src/app/providers.tsx`, so every page picks up the persisted CSS variables. The panel itself stays technology-only, but the values it persists affect every page.

---

## Section 2 — Subpage title animations

The home hero headline keeps its existing `unblur` animation (locked in, not configurable). All subpage titles (`SubpageHeader.title` — currently a plain `<h2>`) gain a runtime-selectable animation from the Page Fx tab.

**New component:** `src/components/animated-title.tsx`. Wraps the title's React children, splits text nodes into spans (line / word / character depending on the active style), and animates them via Framer Motion variants. Survives `<em>` accents inside the title — walks the React children tree and wraps text content while preserving the styled wrapper.

**Three styles:**

- **Wipe** *(default)* — Each line is wrapped in an inline-block with `clip-path: inset(0 100% 0 0)`, animated to `inset(0 0 0 0)` left-to-right. Letters do not move.
- **Cascade** — Each character: `opacity: 0; translateY: 0.4em` → `opacity: 1; translateY: 0`. Per-character stagger.
- **Stack** — Each line in an `overflow: hidden` parent; the line itself: `translateY: 100%; opacity: 0` → `translateY: 0; opacity: 1`. Per-line stagger.

**Sliders (Page Fx tab):**
- `Duration` — 300–1500 ms, default 700 ms. Per-unit motion duration.
- `Stagger` — 0–200 ms, default 60 ms. Gap between successive units.

**Reduced motion:** All three short-circuit to a single-frame fade-in (no transforms). Detected via `prefers-reduced-motion` media query.

**Affected files:**
- New: `src/components/animated-title.tsx` + `.module.css`.
- `src/components/subpage.tsx` — `SubpageHeader.title` rendered through `<AnimatedTitle>`.
- `src/lib/use-tweaks.tsx` — add `titleAnim: "wipe" | "cascade" | "stack"`, `titleDurationMs: number`, `titleStaggerMs: number` to `TweakValues`.

---

## Section 3 — Topo lines, mix-blend approach

**Architecture revision (post-spec, pre-plan):** the original spec proposed region-aware coloring inside the canvas. During plan-writing, file inspection revealed that `mission-panel.module.css` already uses `mix-blend-mode: difference` on a near-white `.fill` over a black `.panel` background to produce the "white panel" appearance. Leveraging this existing infrastructure makes the line-inversion behavior fall out for free.

**The change is two CSS one-liners:**

1. `src/lib/topo-canvas.ts` — `draw()` currently does `ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H)` to clear each frame. Change to `ctx.clearRect(0, 0, W, H)` so the canvas is transparent; lines are drawn on transparency, the body's `--bg` color shows through behind them.

2. `src/components/home/mission-panel.module.css` — `.panel { background: #000 }` → `.panel { background: var(--mission-panel-bg, transparent) }`. With the canvas now transparent and the panel transparent, the `.fill` element with `mix-blend-mode: difference` blends against the canvas (white lines + dark `--bg`), producing the inverted-line effect automatically: dark areas → near-white panel, white-line areas → near-black lines.

**Tweak toggle.** `topoLinesOnWhite: boolean` in `TweakValues`, default `true`.
- `true` → `--mission-panel-bg: transparent` (canvas shows through, lines invert via existing mix-blend)
- `false` → `--mission-panel-bg: #000` (panel opaque, canvas hidden behind it as today)

**Why this works without a new canvas API:** mix-blend-mode's "backdrop" definition includes the painted result of all elements behind the blending element in painting order, including across stacking contexts when no `isolation: isolate` is in play. The `.fill` blends against the canvas's actual rendered pixels — dark transparent + white lines — and produces the inverse exactly where the lines are.

**Affected files:**
- `src/lib/topo-canvas.ts` — `fillRect` → `clearRect`.
- `src/components/home/mission-panel.module.css` — `.panel` background uses CSS variable.
- `src/lib/use-tweaks.tsx` — add `topoLinesOnWhite: boolean` (default `true`); `applyToBody` sets `--mission-panel-bg`.

**Note:** this approach is per-section opt-in via mix-blend-mode setup, not via a `data-topo-invert` attribute. Mission panel is the only section needing this today; if a future white section needs the same treatment, it copies mission panel's `mix-blend-mode: difference` fill pattern. The `data-topo-invert` attribute mentioned elsewhere in this spec (e.g., §7) is now decorative — it documents intent but isn't read by code.

---

## Section 4 — Scroll-pinned proof points

Replaces `<ProofStrip>` on the technology page, sitting between `<PillarSection>` and `<Philosophy>`. Three stat cards introduced one at a time as the user scrolls through a pinned section, each zooming in giant in the center then settling into its slot in a left-to-right row.

### Choreography

- **Land-and-rest.** Each card has one journey: hidden → giant-in-center → settled-in-its-slot. Once a card lands, it stays put. Card 2 zooms while card 1 sits in its left slot; card 3 zooms while cards 1 & 2 sit in their slots.
- **Visual state at peak ("giant"):** number ~30vh tall (configurable 18–40vh), descriptor below in mid-size display type, both readable. Both shrink together into the slot at settle.
- **Final beat:** all three cards in the row, fully settled. Outer container's bottom hits viewport bottom → sticky releases naturally → user continues scrolling into Philosophy.

### Desktop DOM

```
<section ref={outerRef} style={{ height: `${pinScroll * 100}vh` }}>   // 150–400vh tweakable
  <div className={styles.sticky}>                                      // position: sticky; top: 0; height: 100vh
    <div className={styles.panel}>                                     // white bg + vignette
      {[0,1,2].map(i => <ProofCard index={i} />)}                      // absolutely positioned, motion-driven
    </div>
  </div>
</section>
```

The outer's height drives total scroll budget; the sticky child pins for the duration; sticky releases when the outer's bottom hits the viewport bottom.

### Scroll → animation mapping (Framer Motion)

```ts
const { scrollYProgress } = useScroll({ target: outerRef, offset: ["start start", "end end"] });
```

For each card `i ∈ {0, 1, 2}`:

- Zoom-in sub-progress: `(i / 3) - overlap*phaseLen` to `(i + 0.7) / 3`
- Move-to-slot sub-progress: `(i + 0.7) / 3` to `(i + 1) / 3`

`useTransform` derives:
- `opacity` — 0 → 1 across zoom-in, stays 1 after
- `scale` — 0.5 → 1 across zoom-in, → `settleScale` across move-to-slot
- `x` — 0 across zoom-in, → slot offset (−33vw / 0 / +33vw) across move-to-slot
- `y` — 0 throughout

Easing per phase comes from the 3-way segmented control: linear (raw scroll), eased (`cubic-bezier(0.2, 0.7, 0.2, 1)` mapped through Framer's `useTransform` ease option), or aggressive (`cubic-bezier(0.85, 0, 0.15, 1)`).

### Per-card visual state

| Progress | Card 1 | Card 2 | Card 3 |
|---|---|---|---|
| 0 → 0.33 | hidden→giant→settling-left | hidden | hidden |
| 0.33 → 0.66 | settled left | hidden→giant→settling-middle | hidden |
| 0.66 → 1.0 | settled left | settled middle | hidden→giant→settling-right |
| 1.0 | settled left | settled middle | settled right |

Cards in giant state get `z-index: 2`; settled cards get `z-index: 1`. Brief overlap during zoom-in is intentional — eye follows the moving/scaling element.

### Number + label sizing

Each card has a CSS variable `--card-scale` driven by the motion value. `font-size: calc(var(--giant-vh, 30vh) * var(--card-scale))` for the number; descriptor scales proportionally. Settle scale ≈ 0.25× of giant by default.

### White panel + vignette

- `background: var(--panel-tone, #ffffff)` — three options via tweak: pure white `#ffffff`, off-white `#fafaf8`, paper `#f4f1ea`.
- Vignette: a `pointer-events: none` overlay. `radial-gradient(ellipse 90% 70% at 50% 50%, transparent 50%, rgba(0,0,0,var(--tw-vignette,0.2)) 100%)`. Intensity from the slider, clamped 0–0.6.

### Mobile fallback (≤720px)

Sticky disabled. Section becomes a normal-flow stack of three blocks at viewport-height each. Each reveals via Framer's `whileInView`: `opacity: 0; scale: 0.85` → `opacity: 1; scale: 1`. No horizontal motion. Single column. Tweak knobs that still apply (giant-size, settle-scale, vignette, bg tone, label weight) carry over; pin-scroll-length and phase-overlap are no-ops on mobile.

### Reduced motion

Both pin and reveals disabled. Renders three static blocks at settle scale.

### Tab 2 controls

| Control | Range | CSS var driven |
|---|---|---|
| Pin scroll length | 1.5× → 4× | `--tw-pin-scroll` (used by JS for outer height) |
| Giant number size | 18 → 40 vh | `--tw-giant-vh` |
| Giant→settle scale | 0.15 → 0.45× | `--tw-settle-scale` |
| Easing per phase | linear / eased / aggressive (3-way) | not CSS, picked in motion config |
| Phase overlap | 0 → 25% | not CSS, picked in motion config |
| Vignette intensity | 0 → 60% | `--tw-vignette` |
| Background tone | pure / off-white / paper (3-way) | `--tw-panel-tone` |
| Card label weight | 300 / 400 / 500 (3-way) | `--tw-label-weight` |

### Affected files

- New: `src/components/technology/proof-section/proof-section.tsx`
- New: `src/components/technology/proof-section/proof-card.tsx`
- New: `src/components/technology/proof-section/proof-section.module.css`
- New: `src/components/technology/tweak-tabs/proof-tab.tsx`
- Removed: `src/components/technology/proof-strip.tsx`, `src/components/technology/proof-strip.module.css`
- `src/app/technology/page.tsx` — swap `<ProofStrip />` for `<ProofSection />`.
- `src/lib/use-tweaks.tsx` — extend `TweakValues` with the proof knobs + defaults.

---

## Section 5 — Banner containment + edge taper

The technology hero (`array-mosaic.jpg`) and about Cambridge section (`cambridge.png`) currently bleed full viewport width. New behavior: the image stays visually wide, but its left/right edges fade smoothly to the page background outside the 1400px content width.

**Technique:** CSS `mask-image` on the `<img>`:

```css
:root {
  --content-w: 1400px;     // matches max-w-[1400px] on TopNav
}

.banner img {
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black calc(50% - var(--content-w) / 2),
    black calc(50% + var(--content-w) / 2),
    transparent 100%
  );
}
```

Within the central 1400px the image is fully opaque; outside, fades to transparent over the remaining half on each side, letting the page background show through. On viewports ≤ 1400px, the calc yields ≤ 0% / ≥ 100% and the whole image stays opaque — no media query needed.

Existing vertical fade overlays (top dark band, bottom blend) are independent absolutely-positioned divs and are preserved unchanged.

**Affected files:**
- `src/app/globals.css` — add `--content-w: 1400px` on `:root`.
- `src/components/technology/hero.module.css` — `.banner img` gets the mask.
- `src/components/about/cambridge-section.module.css` — `.media img` gets the mask.

---

## Section 6 — Cambridge section overhaul

Restructures the Cambridge section. Copy moves out of the image overlay and up above the image; the image gets a floating callout badge top-right; meta strip and pull-quote disappear.

### New DOM

```tsx
<section>
  <div className={styles.eyebrow}>Origins</div>
  <h2 className={styles.title}>
    From Origins at the <em>University of Cambridge</em>
  </h2>
  <p className={styles.intro}>
    Our founding team met while studying at Cambridge, and Polytecks
    maintains strong research links with the university.
  </p>

  <div className={styles.body}>
    <div className={styles.media}>
      <Image src="/assets/cambridge.png" />     // object-position: center 20%
      <div className={styles.mediaCaption}>King's College, Cambridge</div>
      <div className={styles.calloutBadge}>
        <p>The ECG was born in Cambridge over a century ago. The next chapter starts here too.</p>
      </div>
    </div>
  </div>
</section>
```

### Removals

- `.copy` block (the right-column / overlay text)
- `.pull` paragraph
- `.meta` strip ("Founded Cambridge UK / ECG Legacy 100+ years")
- The strong left-side darkening gradient (`.media::after`) — softened to a subtle 15% top-right corner darken so the badge has contrast even on bright photos.

### Image fix

`object-position: center center` → `object-position: center 20%`. Shows the spires + sky at the top instead of cropping them off.

### Intro paragraph styling

New `.intro` class — white (`color: var(--ink)`), display font, `font-size: clamp(18px, 1.6vw, 24px)`, weight 400, max-width 720px, line-height 1.5. Lede-weight: heavier than body copy, lighter than the title.

### Callout badge

Repurposes the existing `.callout` styles (already in the CSS module — backdrop-blur, indigo border-left). Position absolute within `.media`, `top: clamp(16px, 2vw, 32px); right: clamp(16px, 2vw, 32px);`. No internal eyebrow label — content stands on its own.

### Heading

`text-wrap: balance`, `max-width: 18ch`. *University of Cambridge* italic+indigo (the accent stretches across the line break, signposting the institution). Natural line break:

```
From Origins at the
University of Cambridge
```

### Affected files

- `src/components/about/cambridge-section.tsx` — restructured DOM.
- `src/components/about/cambridge-section.module.css` — new `.intro`, repurposed `.calloutBadge`, softened `.media::after`, removed `.copy`/`.pull`/`.meta` rules.

---

## Section 7 — Mission panel team-tease block

The white mission panel extends downward beyond the existing copy with a divider and a new team-tease section showing four university affiliations.

### Updated DOM

```tsx
<section className={styles.panel} data-topo-invert>
  <div className={styles.fill} />
  <div className={styles.inner}>
    <p className={styles.eyebrow}>Our Mission</p>
    <h2 className={styles.headline}>Make the body legible.</h2>
    <p className={styles.lede}>…</p>
    {/* meta strip removed */}
  </div>

  <hr className={styles.divider} />

  <div className={styles.teamTease}>
    <p className={styles.teamEyebrow}>Team</p>
    <h3 className={styles.teamTitle}>
      Brought to you by world-leading researchers, engineers,
      and scientists <em>united by our mission.</em>
    </h3>
    <div className={styles.logos}>
      <UniversityMark name="Cambridge" />
      <UniversityMark name="Imperial" />
      <UniversityMark name="Durham" />
      <UniversityMark name="UCL" />
    </div>
  </div>
</section>
```

### Removals

`Cambridge, UK · Founded 2024` meta line (the `.meta` block) is removed entirely.

### Styling — black on white

Inverse of the rest of the dark site:
- Eyebrow `Team` — mono / 11px / 0.3em tracking / `#0a0a0e` (near-black, not indigo — indigo doesn't read on white).
- `teamTitle` — display font, weight 300, `clamp(24px, 2.4vw, 38px)`, line-height 1.25, near-black, max-width 880px, `text-wrap: balance`. The `<em>` "united by our mission" is italic+weight 500 in pure black.
- `.divider` — `1px solid rgba(0, 0, 0, 0.12)`, inset to content width with margin auto, vertical spacing 80px above and below.

### `<UniversityMark>` component

Renders each university with bracket registration marks (corner brackets — Polytecks-fitting "engineered" motif):

```
┌                          ┐
   [logo image or text]
└                          ┘
```

Brackets: 4 absolutely-positioned `<span>` corners, each ~10px L-shape via `border-top + border-left` (or matching corners). Color `rgba(0,0,0,0.4)`, thickness 1px.

Logo content: when an image asset exists at `/assets/universities/<name-lowercase>.svg`, renders it in `filter: grayscale(1)` to handle multi-color crests. Otherwise falls back to a clean text mark in `var(--font-display)` weight 500, slight letter-spacing.

**TODO at end of spec:** drop SVG/PNG marks for Cambridge, Imperial, Durham, UCL into `/public/assets/universities/`. Until then, the text-mark fallback renders.

Layout: `display: flex; justify-content: space-around; gap: clamp(40px, 6vw, 80px);` — 4 across at desktop, 2×2 grid below 720px.

### Affected files

- `src/components/home/mission-panel.tsx` — restructured DOM, `data-topo-invert` attribute.
- `src/components/home/mission-panel.module.css` — `.divider`, `.teamTease`, `.teamEyebrow`, `.teamTitle`, `.logos`.
- New: `src/components/home/university-mark.tsx` + `.module.css`.

---

## Section 8 — Site-wide footer

New `<Footer>` rendered in `src/app/layout.tsx` after `<main>`. Same dark page background, top-bordered with `1px solid var(--line)`.

### Layout (≥960px)

```
─────────────────────────────────────────────────────────────────
[Polytecks logo]    EXPLORE        COMPANY       CONNECT
                    Technology     About Us      Contact
                    Devices        Team ↓        LinkedIn (#)
                                   Careers       Email (#)
                                                 X (#)
─────────────────────────────────────────────────────────────────
© 2026 Polytecks Ltd · Cambridge, UK            Privacy · Terms
```

### Component shape

```tsx
<footer>
  <div className={styles.top}>
    <Link href="/"><Image src="/assets/polytecks-logo-white.png" /></Link>
    <FooterColumn label="Explore" links={[…]} />
    <FooterColumn label="Company" links={[…]} />     // Team ↓ → /about#team
    <FooterColumn label="Connect" links={[…]} />     // # placeholders
  </div>
  <hr />
  <div className={styles.bottom}>
    <span>© 2026 Polytecks Ltd · Cambridge, UK</span>
    <div>
      <Link href="/privacy">Privacy</Link>
      <Link href="/terms">Terms</Link>
    </div>
  </div>
</footer>
```

Link sets:
- Explore: `Technology /technology`, `Devices /devices`
- Company: `About Us /about`, `Team ↓ /about#team`, `Careers /careers`
- Connect: `Contact /contact`, `LinkedIn #`, `Email #`, `X #`

### Styling

- Container: `max-width: var(--content-w); margin: auto; padding: 80px 24px 32px`.
- Top section: `grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 64px;` — logo column gets more room.
- Column label: mono / 11px / 0.3em tracking / uppercase / `var(--ink)` / `margin-bottom: 16px`.
- Column link: sans / 14px / weight 400 / `var(--ink-dim)`. Hover → `var(--ink)`. 8px vertical gap between links.
- Logo: `height: 32px; width: auto`.
- Bottom strip: flex space-between, mono / 11px / 0.25em tracking / `var(--ink-faint)`. Privacy/Terms route to `/privacy` and `/terms` — minimal stub pages (see "Affected files" below).

### Mobile (≤720px)

Single column: logo, then 3 link groups stacked, then bottom strip with copyright line above legal links.

### Anchor for Team ↓

`src/components/about/team-section.tsx` — add `id="team"` on the `.section` root `<div>`. Browser-native anchor scroll handles the rest.

### Affected files

- New: `src/components/footer/footer.tsx` + `.module.css`.
- New: `src/components/footer/footer-column.tsx`.
- `src/app/layout.tsx` — render `<Footer />` after `<main>`.
- `src/components/about/team-section.tsx` — add `id="team"` to root `<div>`.
- New: `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` — minimal placeholder pages with `Privacy Policy` / `Terms of Service` headings and a "Coming soon" line.

---

## Section 9 — Polish punch list

Small, self-contained items.

**Home page:**

1. **Remove R&D Cambridge UK blinking eyebrow.** Delete the `<p className={styles.eyebrow}>R&D · Cambridge UK</p>` from `hero.tsx`. Delete the `.eyebrow`, `.eyebrow::before`, and `pulse` keyframes from `hero.module.css`. Headline becomes the first piece of copy in the hero.

2. **CTA arrows: white at all times.** In `charge-link.module.css`, remove the `color: var(--cl-accent)` transition on `.link:hover .arrow`. Keep `color: var(--cl-color)` (white) at all states.

3. **CTA hover physics.** After the 520ms underline charge fills, the arrow springs to `transform: translateX(10px) scale(1.4)` (was `translateX(6px)` no-scale). Ease: `cubic-bezier(0.34, 1.56, 0.64, 1)` over 360ms (overshoot springiness in CSS). Return-to-baseline on hover-out: `cubic-bezier(0.4, 0, 0.2, 1)` over 280ms (softer, no spring). Update `.link:hover .arrow` and add `.arrow` baseline transitions.

4. **Mission panel meta line removed.** Covered in §7.

5. **Affiliations ribbon:**
   - Label `Our Investors and Partners` → `Affiliations and Partners` in `partners-ribbon.tsx`.
   - Background gradient → solid `var(--bg)` in `partners-ribbon.module.css` (`.ribbon`).
   - **Loop fix.** Replace `keyframes slide { 0% → -50% }` with a JS-measured exact-pixel translate. On mount, measure `track.firstChildSet.offsetWidth`, set `--loop-offset: ${measured}px` on the track, animate to `translateX(calc(-1 * var(--loop-offset)))`. Re-measure on resize. Single `useEffect`.

**About page:**

6. **Enlarge "The Team Behind" Polytecks logo.** In `team-section.module.css`, change `.titleLogo { height: 0.9em }` → `.titleLogo { height: 1.2em }` (33% larger, scales with the title's font-size which is `clamp(32px, 3.6vw, 52px)` — so the logo grows from ~29–47px tall to ~38–62px tall, "slightly larger" without dwarfing the heading text).

**Technology page:**

7. **Hero header text:**
   - eyebrow: `Technology` *(unchanged)*
   - title: `The Mosaic™ Platform` *(was "The electrode, reinvented.")*
   - lede: `A new frontier in bioelectrical mapping.` *(unchanged)*

8. **Pillar section header:**
   - Currently `<p className={styles.lede}>Rebuilt from first principles.</p>`.
   - Becomes `<h2 className={styles.title}>The electrode. <em>Reimagined from first principles.</em></h2>`.
   - Promote from a small lede to a real `<h2>` — display font, weight 300, large size (matching subpage title), italic+indigo on the second sentence.

**Site-wide white-panel vignette:**

9. The vignette overlay defined for the proof points panel (radial-gradient, intensity from the tweak slider) is reused for any other white-bg section. Today that's the mission panel + its team-tease extension. Abstract to a `.whiteVignette` utility class in `globals.css` and apply to the mission panel and the proof panel. Single tweak slider controls site-wide intensity.

---

## Open TODOs after merge

These can land later — the design is complete without them:

- Drop SVG/PNG marks for Cambridge, Imperial, Durham, UCL into `/public/assets/universities/` (today the section uses text-mark fallback).
- Provide LinkedIn / Email / X URLs to replace footer `#` placeholders.
- Stub real `/privacy` and `/terms` pages (today they're minimal placeholders).

## Out-of-scope flagged in brief

- Pillar text z-order behind image: requested, then withdrawn during brainstorming. Pillars stay as-is.
