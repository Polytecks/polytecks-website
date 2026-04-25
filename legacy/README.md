# Handoff: Polytecks Website

## Overview
A marketing website for **Polytecks**, a Cambridge-based medical technology start-up developing bioelectrical mapping ("making the skin a window into the body"). Five top-level pages: **Home**, **About Us**, **Technology**, **Devices** (with Clinical / Veterinary tabs), **Careers**, **Contact**.

The design is dark, scientific, and editorial — driven by a live topographic-line canvas on the home hero, hexagonal team portraits, and a strong indigo accent.

## About the Design Files
The files in this bundle are **design references created in HTML** — a single self-contained prototype showing intended look, layout, animation, and interaction. They are **not production code to copy directly**.

The task is to **recreate these HTML designs in the target codebase's existing environment** (likely React/Next.js + Tailwind or a similar modern stack) using its established patterns and libraries. If no environment exists yet, choose the most appropriate framework for the project (Next.js + Tailwind is a sensible default given the static/marketing nature of the site) and implement the designs there.

The single `index.html` is a SPA-style document with all pages defined in one file and switched via a `data-nav` routing function. In production, each `.page[data-page="…"]` block should become its own route.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, hover/animation states, and copy are all production-ready. Recreate pixel-perfectly using the codebase's libraries and patterns.

A secondary file, `Landing v1 (jagged lines).html`, is an earlier exploration kept for reference — **do not implement this version**.

---

## Pages / Views

### 1. Home (`data-page="home"`)
**Purpose:** introduce Polytecks and route to The Science / Devices.

**Layout:** full-viewport hero, split grid (`1.2fr 1fr` by default).
- **Left column:** eyebrow chip ("R&D · Cambridge UK"), large headline, sub-line, two stacked CTAs.
- **Right column:** hero image of the hexagonal electrode array on a forearm (`assets/polytecks-arm-v2.png`).
- **Background:** animated topographic isolines (white lines on pure black) drawn on a fixed-position `<canvas>` — see "Topographic canvas" below.
- **Below hero:** mission panel (see below), then the "Our Investors and Partners" marquee ribbon.

**Headline (Space Grotesk, 300 weight, clamp(40px, 5.4vw, 120px), letter-spacing -0.035em):**
> Making the Skin **/a Window/** into the Body

The word *Window* is italic, weight 500, color **#6a74dc** (the indigo accent — same as `subpage-title em`), with a soft glow `text-shadow: 0 0 28px rgba(106,116,220,0.5)` and a faded gradient underline.

Headline animates in word-by-word; default animation is `unblur` (blur → focus, drift up, staggered 110ms).

**Sub-line (Inter 400, clamp(19px, 1.4vw, 28px)):** "Advanced bioelectrical mapping for enhanced diagnostics" — `margin-bottom: 64px` to give breathing room before CTAs.

**Mission panel (white, below the hero):** a full-width section that scrolls into view after the hero. Background fill is `#f4f4f1` with `mix-blend-mode: difference` so the topo lines from the fixed canvas behind it invert (white lines → dark lines on a near-white panel). Inside:
- Mono eyebrow "Our Mission" in dark indigo (#3a3a8a, JetBrains Mono, 11px, tracking 0.18em)
- Large headline "Make the body legible." (Space Grotesk 300, clamp(48px, 6vw, 110px), color #0a0a0e)
- Lede paragraph in #2a2a35
- Meta row: "Cambridge, UK · Founded 2024" (mono, dimmed)

The panel content sits in a `.mission-panel-inner` (`z-index: 1`, no blend mode) layered over a `.mission-panel-fill` absolute layer (the one with `mix-blend-mode: difference`). When porting: keep the inner content **outside** the blend-mode element so text reads as authored.

**CTAs — "charge-link" style (vertical stack):**
- Width: `clamp(420px, 36vw, 620px)`, gap 18px between the two.
- Each button is a vertically stacked structure: a flex row containing the label text + an inline arrow icon, then a thin track underneath with a 1px hairline.
- **Default state:** label visible, arrow visible inline at right, hairline visible (rgba(255,255,255,0.18)).
- **Hover state:** the 2px accent fill grows from `width: 0` to `width: 100%` over `--cl-charge-ms` (default 520ms, easing `cubic-bezier(.6,.05,.2,1)`); after the fill completes (transition-delay = same value), the inline arrow nudges right by 6px and the label color shifts to the accent.
- **Primary CTA** (`The Science`) → routes to Technology.
- **Secondary CTA** (`View Devices`, capital D) → routes to Devices.

CTAs have two tweakable axes (see "Design Tokens / Tweaks"): `data-cta-color` (5 palettes) and `data-cta-anim` (6 timing/effect variants). The shipped defaults are `ctaColor: "both-bright"`, `ctaAnim: "charge"`.

**Partners ribbon:** continuous marquee of styled text logos (no images), e.g. "University of *Cambridge*", "*NHS* Innovation", "*Wellcome* Trust", etc. Greyscale by default; the item nearest viewport center brightens (spotlight effect tracked in `requestAnimationFrame`). Mask-image fades the edges.

### 2. About Us (`data-page="about"`)
- **Eyebrow** "About Us" (badge style by default — see eyebrow-style options).
- **Title:** "We are building the *sensing layer* for next-generation healthcare."
- **Lede paragraph** about Polytecks' mission.
- **Cambridge section** (full-bleed image of Cambridge with overlay copy and a small floating callout panel; layout default is `bleed` but `split` and `overlap` variants exist).
- **Team grid** — 3 members in hexagonal frames with rotating SVG ring on hover (Callan, Ruben, Charlie). Hex shape: `polygon(50% 1.3%, 98.7% 25.9%, 98.7% 74.1%, 50% 98.7%, 1.3% 74.1%, 1.3% 25.9%)`. Per-image crop tuning is in CSS (search `.hex-clip img[src*=…]`).
- **Advisors** — 5 advisors in smaller hex frames, single row layout by default (Malliaras, Novo Matos, Fairén-Jiménez, Hampton, Richardson).

### 3. Technology (`data-page="technology"`)
- Full-bleed mosaic hero image at top (`assets/array-mosaic.jpg`) with darkening gradient under the nav and toward the text. The page has `padding-top: 0` so the mosaic bleeds up under the nav.
- **Title:** "The science behind the *signal*."
- **Lede** explaining the bioelectrical mapping approach.
- **Tech-feature blocks** (image left, copy right) — scientist photo (`assets/tech-scientist.jpg`) + explanation.

### 4. Devices (`data-page="devices"`)
- Pill-shaped tab switcher with animated indicator (Clinical / Veterinary). Indicator width is measured from the active tab in JS (`updateDevicesIndicator()`).
- **Clinical panel:** two `app-block` sections (alternating image left/right) for "Fetal monitoring" and "Arrhythmia mapping".
- **Veterinary panel:** product hero with image (`assets/clinic-kit.png`), product title with superscript trademark, lede, body copy, 3-column spec grid (cards with hex bullet markers), and a feature list.

### 5. Careers / Contact
Placeholder pages with eyebrow + title + dashed-border placeholder cards (intentionally unfinished — copy/sections to be supplied).

---

## Topographic canvas (home background)
A `<canvas id="topo-canvas">` runs a 100×60 scalar field generated from 7 moving Gaussian centers with phase-modulated cosines. Marching-squares extracts isolines at evenly-spaced thresholds; lines are drawn twice (a wide soft pass and a sharp pass) for a glow. Pointer movement adds a local field contribution with four selectable modes:
- `flow` (default) — soft Gaussian bump under the cursor.
- `ripple` — radiating ring wave.
- `attract` — gravitational well.
- `vortex` — angular swirl.

The canvas is started/stopped by the page router so it only runs on home (`body.page-home`). Tweaks expose `intensity` (line opacity multiplier) and `density` (number of contour levels). Important: in the React/Next implementation, mount the canvas only on the home route and tear it down on navigation away.

---

## Interactions & Behavior

### Routing
A simple JS function `navigate(page)` toggles `.active` on `.page[data-page]` blocks and on `.nav-link[data-nav]`, scrolls to top, sets `body.page-home` for the canvas-gated styles, and starts/stops the topo canvas. **The page always loads on `home` on refresh** — `localStorage` is explicitly cleared on init (do not restore previous page).

In a real router (Next.js App Router, React Router, etc.) you'd use real routes; the body class `page-home` and the canvas mount/unmount logic are the only home-specific concerns to preserve.

### Page transitions
A staggered fade-up is applied to subpage children when a page becomes active, controlled by `body[data-transition]` (default `curtain`). Several variants exist in CSS (stagger, curtain, etc.).

### Headline word-in
`.hero-headline .word` elements have `--wi` index variables; CSS animations stagger by `calc(var(--wi) * Xms)`. Five variants selectable via `body[data-headline-anim]`: `reveal`, `unblur` (default), `typewrite`, `rise`, `glitch`. All respect `prefers-reduced-motion`.

### CTA "charge" hover (home)
See the Home section for the full description. Implementation hinges on two CSS custom properties on `.charge-link`:
```
--cl-charge-ms: 520ms;   /* underline fill duration */
--cl-arrow-ms: 260ms;    /* arrow nudge / glow duration */
```
The arrow's `transition-delay` is set to `var(--cl-charge-ms)` on hover so it only reacts after the underline is full.

### Devices tabs
Clicking a tab swaps `.active` on `.devices-tab` and `.devices-panel`, and `updateDevicesIndicator()` re-measures the active tab's bounding rect to position the pill indicator. Re-measure on resize and after the tab becomes visible.

### Partners ribbon
Two copies of the list rendered into one `.partners-track`, animated with `transform: translateX(0 → -50%)` over `partners-slide` keyframes. Speed selected via `data-speed` on the ribbon (slow/medium/fast). Spotlight: a `requestAnimationFrame` loop measures distance from each item's center to the ribbon's center and toggles `is-center` / `is-near` classes for the brightness/saturation lift.

### Team / advisor hex hover
`.hex-ring` rotates 360° infinitely (`hex-rotate` keyframes) on hover; image scales by a per-person `--hover-zoom` value. The ring's `z-index` drops behind the image during hover so the zoomed image isn't clipped by the ring border.

---

## State Management
This is a content-driven marketing site — no real app state. The only "state" is:
- Current page (URL/route).
- Current devices tab (Clinical / Veterinary).
- Tweak values (development affordance — strip in production unless you want a `?preview=` mode).

---

## Design Tokens

### Colors
```
--bg:           #0a0a0e   /* page background */
--bg-2:         #0f1016   /* card/panel slightly lifted */
--ink:          #e8e9f0   /* primary text */
--ink-dim:      #8a8c9a   /* secondary text */
--ink-faint:    #4a4c5a   /* tertiary / labels */
--line:         rgba(255,255,255,0.08)   /* hairlines */
--line-strong:  rgba(255,255,255,0.16)
--indigo:        #4A54C0
--indigo-bright: #6a74dc   /* primary accent — italic-em color, links, badges */
                 #8e98ee   /* lighter accent (hover, "bright glow" CTA) */
                 #a8b0f3   /* lightest accent (rings, subtle glows) */
```

### Type
- **Display / headline:** `Space Grotesk` (300/400/500/600/700) — Google Fonts.
- **Body:** `Inter` (300/400/500/600).
- **Mono / labels / eyebrows:** `JetBrains Mono` (400/500).
- **Headline:** weight 300, letter-spacing -0.035em, line-height 1.02, italic 500 for emphasis words.
- **Subpage title:** weight 300, clamp(40px, 5vw, 64px), letter-spacing -0.03em.
- **Eyebrows:** JetBrains Mono 11px, uppercase, letter-spacing 0.25em, indigo-bright.

### Spacing & radius
No formal scale — values are largely `clamp()` based. Common radii: `4px` (subtle), `6px` (nav buttons, cards), `8px–10px` (panels), `999px` (pill tabs).

### Shadows / glows
- `0 30px 80px rgba(0,0,0,0.6)` on heavy cards.
- `0 0 18px rgba(106,116,220,0.35)` for indigo glow accents.
- Drop-shadows on hex frames intensify on hover.

### Tweak values (current shipped defaults)
```js
{
  arm: "natural",
  layout: "split",
  intensity: 95,
  density: 13,
  advisorsLayout: "row",
  cambridgeLayout: "bleed",
  transition: "curtain",
  headlineAnim: "unblur",
  btnStyle: "pill",          // legacy — old hero buttons
  eyebrowStyle: "badge",
  partnersEffect: "spotlight",
  partnersSpeed: "medium",
  btnPulse: "none",
  ctaColor: "both-bright",   // home CTAs
  ctaAnim: "charge"          // home CTAs
}
```

In production, **bake the defaults into CSS** (or expose only via a `?preview=` query for design review). The Tweaks panel is a designer affordance, not a user feature.

---

## Assets
All in `assets/`:
- `polytecks-logo-white.png` / `polytecks-logo.png` — wordmark used in the nav.
- `polytecks-arm-v2.png` — hero photo (forearm with electrode array). The `-v2` is the canonical version; `polytecks-arm.png` is the older variant.
- `array-mosaic.jpg` — Technology page hero (full-bleed mosaic).
- `tech-scientist.jpg` — scientist photo for tech-feature block.
- `cambridge.png` — Cambridge architectural shot for About Us.
- `clinic-kit.png` — veterinary product hero on Devices page.
- `team-callan.png`, `team-ruben.png`, `team-charlie.png` — team portraits (square, cropped to hex via clip-path).
- `advisor-malliaras.png`, `advisor-novo-matos.png`, `advisor-fairen-jimenez.png`, `advisor-hampton.png`, `advisor-richardson.png` — advisor portraits.

Per-portrait `object-position` and `transform: scale()` tuning is in the CSS (search `.hex-clip img[src*="…"]`) — preserve these values when porting; they are non-trivial to re-derive.

---

## Files
- `index.html` — the canonical, current design. Single file containing all pages, styles, scripts.
- `Landing v1 (jagged lines).html` — earlier landing exploration. **Reference only — do not implement.**
- `assets/` — all images and the logo.

The `index.html` is large but cleanly sectioned with `/* ====== SECTION ====== */` comment dividers. Suggested porting order:
1. Set up the chosen framework (Next.js + Tailwind recommended) and replicate the color tokens, fonts, and global styles.
2. Build the nav and routing scaffold.
3. Port the home page, including the topographic canvas (it's already self-contained and framework-agnostic — drop it into a `useEffect` mount/unmount).
4. Port About Us (Cambridge section + team/advisor hex grid).
5. Port Technology, Devices (with tab logic), then placeholder Careers/Contact.
6. Strip the Tweaks panel and bake in the defaults listed above.
