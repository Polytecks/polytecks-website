# Polytecks website — full visual + technical reference

Brief for an AI/engineer planning the mobile rebuild. This describes the desktop design that exists today (which the team is happy with) and is intended to ground a separate effort to make the mobile experience first-class.

---

## 1. Tech stack

- **Framework**: Next.js 16.2.4 with the **App Router**, **Turbopack** dev server, served from `src/app/`.
- **Language**: TypeScript with React 19.
- **Styling**: **CSS Modules** (`*.module.css`) for component styles + **Tailwind 4** for global utilities + a small `globals.css` with the design-token custom properties. Class names are hashed at build time (e.g. `subpage-module___7AMIVW__lede`).
- **Animation**: **Framer Motion 12** (`motion.div`, `useScroll`, `useTransform`, `useMotionValueEvent`) for scroll-driven and entry animations; CSS `@keyframes` for simple repeating fades.
- **Fonts** (loaded via `next/font/google` in `src/app/layout.tsx`):
  - **Display / heading** — Space Grotesk, weights 300/400/500/600/700, exposed as `var(--font-display)`.
  - **Body / sans** — Inter, weights 300/400/500/600, exposed as `var(--font-sans)`.
  - **Mono / eyebrow** — JetBrains Mono, weights 400/500, exposed as `var(--font-mono)`.
- **Image handling**: `next/image` with explicit `width`+`height` props (or `fill` for absolute-positioned images). Site-wide `body { overflow-x: clip }` clips off-viewport free-floating images at the viewport edge without breaking sticky positioning.

The dev server prints both `localhost:3000` and the LAN IP `http://192.168.0.128:3000` (or whatever the current IPv4 is) so a real phone on the same Wi-Fi can hit the site directly.

---

## 2. Site map

```
/                  — Home (landing)
/about             — About Us (Cambridge story + team)
/technology        — Technology (Mosaic platform)
/devices           — Devices (clinical / veterinary applications)
/careers           — Careers (values + open roles)
/contact           — Contact (form + newsletter)
/privacy           — Privacy (placeholder "Coming soon")
/terms             — Terms (placeholder)
```

Every page is wrapped in this layout shell (`src/app/layout.tsx`):

```
<TopNav />                       ← fixed 72 px header, z-index 50
<main>{page content}</main>      ← pages render here, with main padding-top
<Footer />                       ← dark footer with link columns + copyright
<TweakPanel />                   ← floating dev panel (only visible with ?tweaks=1)
```

`<TopNav>` is `position: fixed; top: 0; height: 72px;` and its height is exposed as `--nav-h: 72px` so other components can offset themselves under it.

---

## 3. Design system

### 3.1 Colour tokens (`src/app/globals.css`)

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#0a0a0e` | Default page background (deep blue-black) |
| `--bg-2` | `#0f1016` | Slightly lifted surface (cards, etc.) |
| `--ink` | `#e8e9f0` | Primary text on dark |
| `--ink-dim` | `#8a8c9a` | Secondary text |
| `--ink-faint` | `#4a4c5a` | Tertiary / placeholder text |
| `--line` | `rgba(255,255,255,0.08)` | Hairlines, dividers |
| `--line-strong` | `rgba(255,255,255,0.16)` | Visible borders |
| `--indigo` | `#4a54c0` | Brand indigo (mid) |
| `--indigo-bright` | `#6a74dc` | Brand indigo accent (used for italic emphasis, eyebrows, links) |
| `--indigo-light` | `#8e98ee` | Hover/active highlights |
| `--indigo-lightest` | `#a8b0f3` | Eyebrow text inside translucent pills |

There is a "white-on-dark, dark-on-white" relationship: most pages use the dark `--bg` palette, but two areas invert to a warm off-white surface (`#f4f4f1` for the careers Open Roles panel; `#ffffff` with `mix-blend-mode: difference` for the home Mission panel which renders the topographic line canvas through a difference filter to appear black on white).

### 3.2 Typography sizes (clamp-based, fluid)

| Role | Size | Weight | Notes |
|---|---|---|---|
| Hero headline (home `<h1>`) | `clamp(40px, 5.4vw, 120px)` | 300 | "Making the Skin a Window into the Body" |
| Subpage hero `<h1>` | `clamp(40px, 5vw, 64px)` | 300 | All About/Devices/Careers titles |
| Tech hero `<h1>` | clamp(40px, 5vw, 64px), reduced to `clamp(34px, 9vw, 44px)` below 720 px | 300 | "The Mosaic™ Platform" |
| Mission `<h2>` | `clamp(28px, 4.4vw, 64px)` | 300 | "To redefine how we see disease" |
| Section `<h2>` (Cambridge, Values, Open Roles) | `clamp(40px, 5vw, 64px)` | 300 | |
| Pillar card `<h3>` | `clamp(24px, 2.4vw, 36px)` | 400 | |
| Subpage `.lede` | `clamp(18px, 1.6vw, 26px)` | 300, indigo-bright | Standardised across about/tech/devices |
| Mission `.lede` | `clamp(18px, 1.4vw, 24px)` | 300, near-black on white | |
| Body | 15–16 px | 300 | |
| Eyebrow (mono) | 11 px | 600, 0.3em letter-spacing, indigo-bright | |
| Tab labels (mono) | 14 px | 500 | |
| Footer link | 14 px | 400 | |

Italic + indigo-bright is the universal accent treatment: every `<em>` inside a heading renders italic 500-weight in `--indigo-bright`. Examples: *"Mosaic"*, *"sensing layer"*, *"spot"*, *"University of Cambridge"*. The `™` glyph in "The Mosaic™ Platform" is also indigo-bright.

### 3.3 Spacing system

The site uses CSS custom properties for inter-section spacing so the live tweak panel can adjust them. Names follow `--sp-<page>-<from-to>`. Defaults:

| Variable | Default |
|---|---|
| `--sp-home-mission` | 0 px (mission panel margin-top) |
| `--sp-home-ribbon` | 0 px |
| `--sp-about-header-to-cambridge` | 280 px |
| `--sp-about-cambridge-to-team` | 160 px |
| `--sp-about-team-gap` | 120 px |
| `--sp-tech-hero-to-pillars` | 0 px |
| `--sp-tech-pillars-to-proof` | 0 px |
| `--sp-tech-proof-to-philosophy` | 0 px |
| `--sp-devices-header-to-strip` | 32 px |
| `--sp-devices-strip-gap-below` | 32 px |
| `--sp-devices-icon-row-gap` | 12 px (icon → label) |
| `--sp-careers-values-bottom` | 200 px (extra black panel below values grid before the gradient fade into the white open-roles panel) |

Layout container widths used as visual rails:

- `--content-w` = **1400 px** (top nav max-width, footer, hero outer rail).
- `--banner-w` = **1200 px** (older banner-style images; mostly superseded).
- Subpage content rail = **1100 px** (`<Subpage>` component max-width).
- Mission panel inner = **920 px**.
- Subpage-wide grid breakouts (devices icon strip) = **min(94vw, 1700 px)** with a `transform: translateX(-50%)` breakout — they break out of the 1100 px rail visually.

### 3.4 Existing breakpoints

The site already defines media queries at: **560 px**, **600 px**, **720 px**, **860 px**, **900 px**, **960 px**. The "primary" mobile breakpoint is **720 px** — below that several layouts switch to single-column or hamburger nav.

---

## 4. Global components

### 4.1 Top nav (`src/components/top-nav.tsx`)

- Fixed header, full width, 72 px tall, z-index 50.
- Inside: `max-width: 1400px` flex row with logo left + nav links right, padding `0 24px`.
- Logo: `polytecks-logo-white.png` (intrinsic 2500×720), rendered at `height: 40px; width: auto`.
- Links: 5 items (`About Us`, `Technology`, `Devices`, `Careers`, `Contact`) rendered in mono uppercase 11 px tracking 0.18em. Active route uses `--ink` (white), inactive uses `--ink-dim`.
- **Mobile (≤ 720 px)**: link list is hidden; a hamburger button toggles a fullscreen overlay that slides down from below the nav. Overlay uses `bg-bg/95 backdrop-blur-md`, links rendered at 28 px display-font, divided by hairlines. Body scroll is locked while open. Menu auto-closes when the route changes.

### 4.2 Footer (`src/components/footer/footer.module.css`)

- Background `--bg`, 80 px top padding, 40 px horizontal.
- Inner max-width 1400 px, 4-column grid: logo / Explore / Company / Connect.
- Each column has an indigo eyebrow (mono 11 px) + link list (sans 14 px, ink-dim with hover ink).
- Hairline divider, then bottom row: copyright + Privacy / Terms links.
- **Mobile**: 4-col grid collapses to single column at `≤ 720 px`.

### 4.3 StackEntry (`src/components/stack-entry.tsx`)

A wrapper that fades + translates its children up on mount.

```
<StackEntry index={N} delayMs={...}>{children}</StackEntry>
```

- Either `index` × `--stack-stagger-ms` OR an absolute `delayMs` controls when the entry fires.
- Default duration `--stack-duration-ms: 600 ms`, default stagger `--stack-stagger-ms: 420 ms` (computed from duration × `(1 − overlap%)`).
- Entry: `transform: translateY(28px)` → 0, `opacity: 0` → 1, ease `cubic-bezier(0.16, 1, 0.3, 1)`.
- Listens for a `polytecks:replay-page` window event to remount and replay (used by the tweak panel's "Replay page anim" button).
- `prefers-reduced-motion` disables the animation.

This is the primary entry choreography mechanism. Hero typography, section titles, cards, etc. are all sequenced via this one component.

---

## 5. Per-page anatomy

### 5.1 Home (`/`)

**Page structure**: Hero → Mission panel (white-feel, topographic lines) → Partners ribbon → Footer.

**5.1.1 Hero** (`src/components/home/hero.tsx`, `hero.module.css`)

- Section: `min-height: calc(100vh − 72px)`; flex centring.
- Two layered fixed full-viewport overlays:
  - `.gridOverlay` — 60 px grid of 1 px hairlines at 4% white opacity, masked via `radial-gradient(ellipse at center, black 20%, transparent 75%)` so it concentrates near the centre and fades at edges. Sits behind content.
  - `.vignette` — `radial-gradient(ellipse 90% 70% at 50% 50%, transparent 40%, rgba(10,10,14,0.7) 100%)` — soft viewport-corner darkening.
- Content grid: `1.2fr 1fr` two columns, `max-width: 1600px`, gap `clamp(40px, 5vw, 96px)`. Left column: headline + sub + CTAs. Right column: forearm image.
- **Headline** (`<h1>`): "Making the Skin a Window into the Body" rendered word-by-word in `<span>`s with sequential `--wi` indices 0–7. Each word animates `hl-unblur` (opacity 0 + blur 18 px + translateY 10 px → 1 + 0 + 0) with `delay = wi × 110 ms` so the headline drifts into focus left-to-right. The word "Window" is italic indigo-bright with a 2 px gradient underline pseudo-element and a soft indigo glow text-shadow. `text-wrap: balance` for nice line breaks. Two `.nowrap` spans group "Making the Skin" and "a Window" so they never break mid-phrase on desktop.
- **Sub** (`<p>`): "Advanced bioelectrical mapping for enhanced diagnostics". `clamp(19px, 1.4vw, 28px)`, max-width `clamp(520px, 60vw, 900px)`, animates in at delay `--landing-sub-delay: 1600 ms`.
- **CTAs**: Two `<ChargeLink>` buttons stacked vertically — "The Technology" → /technology, "View Devices" → /devices. Width `clamp(420px, 36vw, 620px)`, animate in at 1800 ms / 1950 ms respectively.
- **Arm image** (right column): `polytecks-arm-v2.png` (intrinsic 1920×1661). Rendered with `width: 100%; max-width: clamp(520px, 48vw, 860px); height: auto`. Has a CSS filter `contrast(1.1) saturate(1.15) drop-shadow(0 0 26px rgba(255,255,255,0.18)) drop-shadow(0 24px 70px rgba(0,0,0,0.9))` and two pseudo-element auras behind it (indigo radial blur + dark vignette ellipse). Animates in at `--landing-arm-delay: 1400 ms` (entry blurs from `blur(14px)` to 0).
- **Below 960 px**: grid collapses to single column (text on top, image below).

**5.1.2 Mission panel** (`src/components/home/mission-panel.tsx`, `.module.css`)

- Visually **white** even though it sits on a dark page. Achieved by an absolutely-positioned `.fill` div with `background: #f4f4f1; mix-blend-mode: difference;` over a topographic `<canvas>` that draws contour lines. The `mix-blend-mode: difference` inverts the dark canvas lines into dark lines on a light surface.
- Padding: `clamp(80px, 12vh, 160px) 40px clamp(80px, 12vh, 140px)`.
- Inner `max-width: 920 px`, text-align center, ink colour `#0a0a0e`.
- **Eyebrow**: "OUR MISSION" with two flex 60 px gradient hairlines flanking it (transparent → indigo-translucent → transparent). Mono 11 px 600 weight, indigo `#4a54c0`.
- **Headline** `<h2>`: "To redefine how we see disease". `clamp(28px, 4.4vw, 64px)`, weight 300, line-height 1.05, letter-spacing -0.035em. Rendered with `white-space: nowrap` on desktop so it fits on a single line at the 920 px container — **switches to `white-space: normal; text-wrap: balance` below 720 px** so it wraps gracefully on phones.
- **Lede** `<p>`: 4-line paragraph `clamp(18px, 1.4vw, 24px)` in `#2a2c36`, max-width 720 px.
- Hairline divider (1 px black at 12%, max-width 920 px, 80 px vertical margin).
- **Team tease block**:
  - eyebrow "BROUGHT TO YOU BY" not used; instead a single big sub-headline `<h3>` `clamp(24px, 2.4vw, 38px)` "Brought to you by world-leading researchers, engineers, and scientists *united by our mission.*" The italic phrase is plain ink (not indigo because the panel is on white).
  - Below: a row of 4 university `<UniversityMark>` brackets. Each `<UniversityMark>` is a relatively-positioned 140×60 box with 4 corner L-bracket pseudo-elements (1 px lines at black-40%, 12 px arms) that frame the logo. Inside: the actual logo image, `max-height: 52px; max-width: 160px; object-fit: contain; filter: grayscale(1)` so all four logos read as the same visual unit despite very different aspect ratios. The four logos are:
    - Cambridge — `Grey_University_of_Cambridge-Logo.wine.png` (shield + word mark)
    - Imperial — `grey_Imperial_College_London_new_logo.png` (huge type-only wordmark "IMPERIAL")
    - Durham — `grey_durham.png` (shield + words)
    - UCL — `ucllogo.svg.png` (shield with banner text)
  - Row layout: `display: flex; justify-content: space-around; align-items: center; gap: clamp(40px, 6vw, 80px); flex-wrap: wrap`.
  - **Below 720 px**: row becomes `grid-template-columns: repeat(2, 1fr)` with 32 px gap so it forms a 2×2 logo block.

**5.1.3 Partners ribbon** (`src/components/home/partners-ribbon.tsx`)

- Horizontal infinite-scroll marquee strip below the mission panel. Background `--bg`, dark surface.
- Renders the AFFILIATIONS row and uses a JS-measured loop offset so the row scrolls seamlessly.

### 5.2 About (`/about`)

**Page structure**: Subpage shell wraps `<SubpageHeader>` → `<CambridgeSection>` → `<TeamSection>`.

**5.2.1 Subpage shell** (`src/components/subpage.tsx`, `subpage.module.css`)

- `<Subpage>` is just `max-width: 1100px; margin: 0 auto; padding: 100px 40px 80px; z-index: 5`.
- `<SubpageHeader>` renders an indigo pill `eyebrow` + `<h1>` title (the title can include `<em>`/`<sup>`/etc.) + optional `lede` paragraph.
  - Eyebrow: a "badge" pill — translucent indigo background with bordered radius 999 px and a soft glow. Mono 11 px 600 letter-spaced 0.2em.
  - Title: `clamp(40px, 5vw, 64px)` weight 300, italic + indigo for `<em>`.
  - Lede: `var(--font-sans)` weight 300 `clamp(18px, 1.6vw, 26px)` color **`--indigo-bright`** — this is the intentional indigo subhead style across all subpages. Max-width 680 px, 72 px bottom margin.

About copy: title "We are building the *sensing layer* for next-generation healthcare." Lede: "Polytecks is a medical technology start-up developing bioelectrical mapping for a novel non-invasive information source into disease."

**5.2.2 Cambridge section** (`src/components/about/cambridge-section.tsx`, `.module.css`)

- Section is **full-bleed** — escapes the 1100 px Subpage rail via negative margins (`margin-left: calc(50% − 50vw); width: 100vw`). Top + bottom margins read from the `--sp-about-header-to-cambridge` and `--sp-about-cambridge-to-team` tweak vars (defaults 280 / 160 px).
- Inside the full-bleed section: a section title (`<h2>` `clamp(28px, 3vw, 44px)`) — "From Origins at the *University of Cambridge*" — left-aligned with margins matching the Subpage rail (`max(40px, calc(50vw − 530px))`).
- A body paragraph below the title — "Polytecks grew out of the Cambridge ecosystem, and maintains strong research links with the university." — sans 300 `clamp(18px, 1.6vw, 26px)` (matches the SubpageHeader lede size and font), white ink, max-width `min(960px, calc(100vw − 80px))`, `text-wrap: pretty`.
- The image (`cambridge.png`, intrinsic 2400×1350, aspect 16:9) is the visual anchor of the section. Its display box is **shape-locked** to keep the visible crop identical at every viewport:

```css
.media img {
  width: calc(min(1400px, 92vw) * scale * (1 − cropSides));
  aspect-ratio: 1100 / calc(619 * (1 − cropBottom));
  height: auto;
  object-fit: cover;
  object-position: center top;
  /* mask: see below */
}
```

`scale`, `cropBottom`, `cropSides` are CSS custom properties (`--tw-cb-scale`, `--tw-cb-crop-bottom`, `--tw-cb-crop-sides`) wired to the tweak panel; defaults 1, 0, 0. The aspect-ratio approach guarantees object-fit: cover always shows the same slice regardless of width.

- **Mask**: two linear gradients composited via `mask-composite: intersect` (Safari needs `-webkit-mask-composite: source-in`). The result is a hard top edge with three soft fades on the other three sides:
  - Layer A — left/right: `linear-gradient(to right, transparent 0%, black <side-fade>%, black calc(100% − <side-fade>%), transparent 100%)` (default `<side-fade>` = 8%).
  - Layer B — bottom: `linear-gradient(to top, transparent 0%, black <bottom-fade>%, black 100%)` (default `<bottom-fade>` = 15%).
- Floating ECG callout — a single `<p>` of plain white text (no chrome — no panel, no border, no padding, just a soft text-shadow) absolutely-positioned over the image. Defaults `top: 4vh; left: 60vw; max-width: 480px; font-size: calc(13px × scale)`. Positions are CSS vars (`--tw-cb-callout-top`, `--tw-cb-callout-left`) tied to tweak sliders.
- **Mobile (≤ 720 px)** rules:
  - Section margins shrink to `clamp(120px, 20vh, 200px)` top / `clamp(80px, 12vh, 140px)` bottom.
  - Title + body text get 20 px gutters instead of `max(40px, …)`.
  - Body text font drops to `clamp(15px, 4.4vw, 18px)`.
  - Callout text moves to `right: 16px; top: 12px; max-width: 60vw`, font scales down.

**5.2.3 Team section** (`src/components/about/team-section.tsx`, `.module.css`)

- Sits inside the 1100 px Subpage rail.
- Title `<h2>`: "The Team Behind [Polytecks logo image]" — flex row mixing display text + a logo image inline (`titleLogo` is `polytecks-logo-white.png` at `height: 1.4em; width: auto`).
- "EXECUTIVE" subheading (mono 12 px indigo-bright, with hairline border-bottom).
- **Executive grid**: 3 columns of `<HexPortrait>` (Ruben, Callan, Charlie). Each HexPortrait is a 220×254 hex frame.
- "ADVISORS" subheading.
- **Advisor row**: 5 columns of smaller `<HexPortrait variant="advisor">` (Malliaras, Novo Matos, Fairen-Jimenez, Hampton, Richardson). Variant overrides `--hex-w: 140px; --hex-h: 161.65px`.
- **HexPortrait** (`src/components/hex-portrait.tsx`):
  - Hex shape via `clip-path: polygon(50% 1.3%, 98.7% 25.9%, 98.7% 74.1%, 50% 98.7%, 1.3% 74.1%, 1.3% 25.9%);` on the inner `.clip` div.
  - Hex outline ring is an SVG polygon stroked with `stroke: url(#hex-gradient); stroke-width: 4` — gradient is defined site-wide in `<HexGradientDefs>` rendered on the about page. Drop-shadow filter for the indigo glow.
  - On hover: ring rotates `6s linear infinite`, glow intensifies, image zooms via `--hover-zoom`.
  - Per-portrait `object-position` and `transform: scale(...)` are defined in CSS — every portrait has its own crop tuning so the head sits well inside the hex frame. First three advisor portraits (Malliaras, Novo Matos, Fairen-Jimenez) intentionally have their image content shifted DOWNWARD inside the frame (object-position 8% / 8% / 14%, scale 1.18 / 1.18 / 1.20) so there's white space above the head.
- Portrait name (display 18 px 500) and role (mono 12 px ink-dim 0.18em letter-spacing) sit beneath each frame.
- **Mobile** rules already present:
  - `≤ 960 px`: advisor row collapses to 3 columns.
  - `≤ 860 px`: executive grid collapses to 1 column.
  - `≤ 560 px`: advisor row collapses to 2 columns.

### 5.3 Technology (`/technology`)

**Page structure**: full-viewport hero → Pillar section → Proof section → Philosophy → "See it in action" charge link.

The page sequences entry animations on a strict top-down clock: hero internals 0/420/840 ms, pillar title at 1500 ms, pillar cards at 1750 + 150·i ms, proof section at 2700 ms, philosophy 3000 ms, charge link 3300 ms.

**5.3.1 Tech hero** (`src/components/technology/hero.tsx`, `hero.module.css`)

- A `<section>` with `position: relative; width: 100%; height: 100vh; background-color: #0a0a0e`.
- `background-image: url("/assets/mosiac technology page background real.png")` — covers the whole hero. `background-size: cover; background-position: center; background-repeat: no-repeat`.
- Two absolutely-positioned overlay layers under the heading (z-index: 1, pointer-events: none):
  - `.overlay`: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.55), rgba(0,0,0,0.6))` — anchors text legibility against a busy photographic background.
  - `.bottomFade`: `linear-gradient(to bottom, transparent 0%, transparent 55%, rgba(10,10,14,0.4) 72%, rgba(10,10,14,0.85) 90%, #0a0a0e 100%)` — dissolves the bottom 25–45% of the hero into the dark page panel below so the boundary is invisible.
- The heading block is z-index 2, max-width 1100 px, vertically centered via flex. Contains:
  - "TECHNOLOGY" pill (the SubpageHeader eyebrow).
  - `<h1>` "The *Mosaic*<sup>™</sup> Platform" — italic + indigo on "Mosaic" and ™.
  - Lede `<p>` "A new frontier in bioelectrical mapping." rendered at the standard subpage lede size (`clamp(18px, 1.6vw, 26px)`) but with **font-weight 500** (heavier than the standard 300) to fight the photographic background.
- Heading + lede have a **heavy black halo** via 6-layer text-shadow: blur radii 8/18/36/64/96/2 px, opacities 0.95/0.9/0.85/0.7/0.5/0.85 — the text reads as if backlit against the bumpy mosaic pattern.
- The hero is `position: relative` (NOT fixed/sticky) — it scrolls away naturally when the user scrolls; nothing parallax.
- **Mobile (≤ 720 px)** rules:
  - Title shrinks to `clamp(34px, 9vw, 44px)`, lede to `clamp(15px, 4.4vw, 19px)`.
  - Glow shadow dialed back (4 layers, smaller radii) so it doesn't overwhelm the smaller text.
  - Header padding `0 20px`.
  - Hero stays 100 vh always — the user always lands on a full-screen image.

**5.3.2 Pillar section** (`src/components/technology/pillars/`)

- Section title `<h2>` "The electrode. *Reimagined from first principles.*" — `clamp(28px, 3vw, 44px)`, italic indigo on the second sentence.
- Three pillar cards in a flex row (`align-items: flex-start; min-height: 630px; gap: clamp(16px, 1.6vw, 28px)`). The cards are `<motion.button>` elements with their own complex hover/active interactions:
  - **Pillar 1 — "New Materials"** (`materials`). Background image: `Materials.jpg`. In rest state, image fills the card top with a `[banner]` style (top 110 px, edge-to-edge, height clamp(140-200 px)). Card title sits at top-left.
  - **Pillar 2 — "New Form"** (`form`). Visual: a webm video (`information.webm`) auto-playing muted. Image rest style is `[framed]` — inset 24 px, height clamp(180-240 px).
  - **Pillar 3 — "New Intelligence"** (`intelligence`). Background image with a colourful gradient. Rest style is `[background]` — fills entire card under a top-overlay gradient. Title rendered over the gradient.
- Each card has a flex-grow that morphs on hover. When one card is hovered (by zone-detection in `pillar-section.tsx`), the active card's `flex-grow = pillarPop` (default 1.45) and siblings dim to `1 − siblingDim` (default 0.25). The active state also raises `min-height` to ~620 px so the card grows downwards. A description paragraph fades in inside the active card.
- **Mobile (≤ 720 px)**: row becomes `flex-direction: column; min-height: 0` — cards stack vertically. Pillar `min-height` drops from 480 to 420 px. Image-zone heights reduced.
- The pillar cards' entry uses Framer's own `motion.button` with computed `delay` from `entryIndex × pillarCardStaggerMs`, NOT the StackEntry mechanism — done because the cards also need to morph between hover/active states.

**5.3.3 Proof section** (`src/components/technology/proof-section/`)

- A scroll-pinned 3-card section. On desktop:
  - Outer height = `--tw-proof-height` (default 300 vh = `pinScrollMult: 3 × 100vh`).
  - Inside, a `position: sticky; top: 0; height: 100vh` panel is pinned to the viewport while the user scrolls through the outer's height.
  - The panel has `background: var(--tw-panel-tone, #ffffff)` — appears as a full-screen white "slide" with a soft `whiteVignette` overlay.
  - Three proof cards are absolutely-positioned in the centre and animate via `useScroll`:
    - Card 0 — number "10x", label "increase in spatial resolution relative to standard electrodes".
    - Card 1 — number "0", label "skin preparation needed — *no electrode gel required*" (line break after the em-dash).
    - Card 2 — number "Weeks", label "of *continuous wear* on the body".
  - Phase order is `[0, 2, 1]` — card 0 emerges first centred, then card 2, then card 1 (which is the middle slot, so its slide is a no-op). Each card emerges at scale 0.4 → 1.0 with a blur 12 → 0 px transform, then translates left/right to its slot (`16.67%` / `50%` / `83.33%` of the cards-root container).
  - Once `scrollYProgress >= 0.88` (third card emerged), `data-locked="true"` flips. CSS then collapses outer height from 300vh → 100vh and sticky becomes `relative`. Cards stay locked at their final positions via inline styles. A `requestAnimationFrame(window.scrollTo(sectionTopDocY))` keeps the panel pinned at viewport top through the height change so the user sees no jump.
  - The animation keys off Framer Motion `useTransform` → `useMotionValueEvent` listeners that write inline styles directly (working around a Framer issue where `<motion.div style={{ ...mvs }}>` was binding to WAAPI and running on a time-clock instead of scroll-linked).
- **Mobile (≤ 720 px) / `prefers-reduced-motion`**: the JSX detects this and renders a totally different markup with `data-static="true"`. The outer becomes `height: auto`, the sticky becomes `position: static` with column-flex layout, and the three cards stack vertically with `whileInView` fade-in animations. Card numbers shrink to `clamp(64px, 18vh, 140px)`.

**5.3.4 Philosophy** (`src/components/technology/philosophy.module.css`)

- A simple centred paragraph: sans 300 `clamp(18px, 1.5vw, 22px)` ink-dim, max-width 720 px, text-align center, `text-wrap: pretty`.

**5.3.5 Charge link**

- Centered `<ChargeLink href="/devices" label="See it in action" variant="inline">` — an underlined link with a horizontal "charge" sweep animation that fills under the text on hover (via a pseudo-element gradient).

### 5.4 Devices (`/devices`)

**Page structure**: SubpageHeader → ApplicationsStrip → DevicesTabs.

- **Hero**: standard SubpageHeader with eyebrow "DEVICES", title "Making disease easier to *spot*, diagnose, and manage." (italic indigo on "spot"), and lede "The Mosaic Sensor platform can bring imaging-level insights into primary care, and even earlier. Across all domains of health."
- **ApplicationsStrip** (`src/components/devices/applications-strip.tsx`, `.module.css`):
  - Renders 6 icon items as a 6-column CSS grid.
  - Strip width is **`min(94vw, 1700px)`** — wider than the parent Subpage's 1100 px rail. Achieved with `margin-left: 50%; transform: translateX(-50%)` so it breaks out of the parent and centres on the viewport.
  - Each item is a column: `<div class="iconWrap">` containing a `<next/image>` of the actual icon PNG, plus a `<p class="label">` below.
  - Icon container: `clamp(128px, 11vw, 180px)` square, image `width: 100%; height: 100%; object-fit: contain`.
  - Icons (indigo line-art PNGs) and their labels:
    - Cardiac Signals — `heartpoly (1).png`
    - Neural Activity — `brainpoly (1).png`
    - Muscle Function — `musclepoly (1).png`
    - Gut Electrophysiology — `gutpoly (1).png`
    - Autonomic Control — `autonomicpoly (1).png`
    - Oncological Signatures — `ribbonpoly (1).png`
  - Each label is split on whitespace and rendered with `<br />` between words — so all 6 labels stack on **two lines** (e.g. "CARDIAC / SIGNALS"), keeping the row visually consistent.
  - Label colour: `--ink` (white). Mono font, 11 px 500, 0.18em tracking, uppercase.
  - Each icon's entry uses a `<StackEntry delayMs={...}>`. Delays are computed at runtime from `headerEnd + i × stagger`, where `headerEnd = 2 × stack-stagger + 0.3 × stack-duration` — meaning the icons start cascading in *while* the lede is still settling, eliminating the dead pause between subtitle and icons.
  - **Mobile breakpoints**:
    - `≤ 960 px`: drops the desktop breakout (no transform), reverts to `width: auto`, 3-col grid, `padding: 0 20px`. Icons clamp to `(80px, 22vw, 110px)`.
    - `≤ 560 px`: 2-col grid, padding 16 px, icons `(72px, 28vw, 110px)`.
- **DevicesTabs** (`src/components/devices/devices-tabs.tsx`):
  - Pill-shape tab strip with `Clinical` / `Veterinary` segments.
  - Active state has a moving indigo gradient indicator (transform: translateX) under the active tab.
  - Inside the panel: a sequence of `<AppBlock>` elements — image left + copy right (or reversed via `reverse` prop). Each AppBlock shows `eyebrow / title / paragraph`. Currently 2 clinical blocks (Fetal Monitoring, Arrhythmia Mapping) and a Veterinary placeholder.
  - The tabs are wrapped in `<TabsEntry>` which dynamically computes a `delayMs` from `getApplicationsStripEndMs() + 0` (the icons' last-icon-start + 30% of duration), so the tabs start fading in **while the last icon is still settling** — no perceptible gap between the icons and the tabs.

### 5.5 Careers (`/careers`)

**Page structure**: CareersHero (with image bg) → ValuesSection (dark) → OpenRolesSection (white).

**5.5.1 CareersHero** (`src/components/careers/careers-hero.tsx`, `.module.css`)

- `<section>` `min-height: 100vh; overflow: hidden; display: flex; align-items: center;`.
- Background uses `<next/image fill src="/assets/Careers.png">` with `object-position: center 65%; filter: contrast(1.05) brightness(0.7)` and a 1.2 s opacity fade-in keyframe on mount.
- Overlay div: `linear-gradient(180deg, rgba(10,10,14,0.6) 0%, rgba(10,10,14,0.45) 40%, rgba(10,10,14,0.85) 90%, #0a0a0e 100%)` — gradually solidifies into the page bg at the bottom.
- Content: max-width 1400 px, padding 100/40/80, z-index 1.
  - "CAREERS" pill eyebrow.
  - `<h1>` "Help us build the future of bioelectrical sensing." weight 300 `clamp(40px, 5vw, 64px)`, max-width 920 px, `text-shadow: 0 4px 24px rgba(0,0,0,0.5)`.
  - Lede paragraph: "We're a highly technical team working across material science, electrical engineering, machine learning, and medicine. Based in Cambridge, UK." Sans 300 `clamp(18px, 1.4vw, 22px)`, ink #e8e9f0, max-width 720 px, text-shadow.

**5.5.2 ValuesSection** (`src/components/careers/values-section.tsx`, `.module.css`)

- `<section>` `position: relative; z-index: 1; background: var(--bg)`. Padding-top `clamp(80px, 10vh, 140px)`. Padding-bottom is **`var(--sp-careers-values-bottom, 200px)`** — a tweakable value (slider 80–480 px) so the user can dial how much black panel sits below the values grid before the gradient fade.
- Title `<h2>` "Values" (`clamp(40px, 5vw, 64px)`).
- 3-column grid of 6 value cards, each containing:
  - PNG icon — `value1.png` through `value6.png`. Indigo line-art on a transparent background. Container `clamp(64px, 6vw, 96px)`, `object-fit: contain`.
  - `<h3>` value title — display 500 `clamp(18px, 1.4vw, 22px)`.
  - `<p>` value body — sans 300 15 px, ink-dim.
- Six values:
  1. Build and own the category
  2. Patients come first
  3. We protect creativity
  4. Strength in range
  5. Low-ego, high-standards
  6. We look after the room
- **Bottom fade into white panel**: a fixed-height (120 px) `mask-image: linear-gradient(to bottom, black 0, black calc(100% − 120px), transparent 100%)` on the section. The section has `z-index: 1` so it sits above the white open-roles section beneath. The OpenRolesSection has `margin-top: -120px` so it slides up *behind* the values panel — its white surface shows through the masked-fade strip. This gives a clean, symmetric ~120 px dissolve from black into white with no visible seam.
- **Mobile**: grid drops to 2-col at ≤ 960 px and 1-col at ≤ 600 px.

**5.5.3 OpenRolesSection** (`src/components/careers/open-roles-section.tsx`, `.module.css`)

- `<section>` `min-height: 100vh; background: #f4f4f1; z-index: 0; margin-top: -120px; padding-top: 160px`.
- Inner max-width 1400 px, padding `40 40 80`.
- Title `<h2>` "Open Roles" `clamp(40px, 5vw, 64px)` weight 300, dark `#0a0a0e`.
- A list with 1 px black-18% borders top + bottom, 32 px vertical padding. Currently empty + a paragraph "Currently no open roles — check back later." (display 300 `clamp(20px, 1.6vw, 26px)`, dark).
- Mobile: padding shrinks to `60 20`.

### 5.6 Contact (`/contact`)

**Page structure**: A two-column grid (left: form column, right: empty grid placeholder for the floating image) plus a free-floating image overlay.

- `<section>` `min-height: calc(100vh − 72px); background: var(--bg);` — solid black.
- `.grid` is `display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr); gap: clamp(40px, 5vw, 80px); padding: 64px 40px 96px; max-width: 1400px; margin: 0 auto`.
- **Left column**: contact form block + newsletter block stacked vertically with 56 px gap.
  - Reach-out block: eyebrow "REACH OUT" + `<h1>` "Contact us." (`clamp(34px, 4vw, 52px)`, weight 300, italic-indigo for `<em>`) + lede + form.
  - Newsletter block: eyebrow "NEWSLETTER" + `<h2>` "Stay close to Mosaic." (same `.title` class — identical font/size/weight to "Contact us.") + lede + email + Subscribe row.
- The form has First name + Last name (2-col), Email, Job title + Company (2-col), Message textarea, Submit. All inputs are `border-bottom: 1px solid var(--line-strong)`, transparent bg, focus turns the bottom border indigo.
- Submit button — pill-shaped, `border: 1px solid var(--line-strong); border-radius: 999px; padding: 13px 36px;` mono uppercase 12 px. Hover fills with indigo.
- **Free-floating image overlay** (right side):
  - Sits as an `<div class="imageOverlay">` ABSOLUTELY positioned within the section (`position: absolute; top: 0; bottom: 0; right: 0; width: 50vw`). It scrolls with the page (was `position: fixed` previously, deliberately switched to `absolute` so it scrolls naturally with the form).
  - The image element inside is `position: absolute; top: 0; left: 0; height: 100%; width: calc(50vw × scale); max-width: none; object-fit: cover; transform: translateX(offsetX%)`.
  - The image source is `mosaicvertical.png` — a dark sensor-array tiled photograph. Intrinsic 1200×1200, but rendered at 50 vw × scale = roughly `720 × <section-height>` at desktop.
  - The overlay carries the **spotlight mask**: `mask-image: radial-gradient(ellipse <size>% <size>% at <X>% <Y>%, rgb(0,0,0) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0) 100%)`. The mask lives on the *wrapper*, not the image — so spotlight position is anchored to the viewport area (the wrapper), independent of the image inside translating around.
  - Four CSS vars / tweak sliders control this independently:
    - `--tw-contact-img-scale` (image scale, 0.5–2×)
    - `--tw-contact-img-offset-x` (translateX %, 0–40%)
    - `--tw-contact-spot-x` / `-y` (spotlight centre, 30–100% / 20–80%)
    - `--tw-contact-spot-size` (radial radius, 30–120%)
- **Empty `.imageColPlaceholder` div** in the grid takes up the right-column horizontal space so the form column doesn't expand into the overlay area. It's effectively invisible (`width: 100%; height: 1px`).
- The whole site has `body { overflow-x: clip }` so when the image is offset off the right edge of the viewport, the off-viewport portion is clipped silently (no horizontal scrollbar).
- **Mobile (≤ 900 px)**: grid drops to 1 column, both `.imageColPlaceholder` and `.imageOverlay` are `display: none`. The form takes the full width. There's no image on mobile by design.

### 5.7 Privacy / Terms

Stub pages with the SubpageHeader pattern and a one-line "Coming soon." paragraph. Not relevant for mobile work.

---

## 6. Image inventory (sizes + roles)

All assets live in `public/assets/`. Sizes shown are intrinsic.

| File | Use | Intrinsic | Render |
|---|---|---|---|
| `polytecks-logo-white.png` | Top nav logo, footer logo, team title inline logo | 2500×720 | height: 40 px (nav), 1.4 em (team inline) |
| `polytecks-arm-v2.png` | Home hero — forearm + electrode array | 1920×1661 | max-width clamp(520px, 48vw, 860px) |
| `cambridge.png` | About — King's College photograph | 2400×1350 (16:9) | width: min(1400px, 92vw); aspect-ratio locked at 1100/619 |
| `mosiac technology page background real.png` | Tech hero full-viewport bg | unknown (large) | background-size: cover at 100vw × 100vh |
| `mosaicvertical.png` | Contact spotlight image | 1200×1200 (square) | width: 50vw × scale; object-fit: cover |
| `Careers.png` | Careers hero bg | unknown | object-fit: cover, fill |
| `array-mosaic.jpg` | (Legacy banner image, no longer rendered after the tech-hero switch) | 2400×1600 | unused |
| `team-callan.png`, `team-ruben.png`, `team-charlie.png` | Executive hex portraits | ~3:4 | 100% × 100% inside hex 220×254 |
| `advisor-malliaras.png`, `advisor-novo-matos.png`, `advisor-fairen-jimenez.png`, `advisor-hampton.png`, `advisor-richardson.png` | Advisor hex portraits | ~3:4 | inside hex 140×162 |
| `heartpoly (1).png`, `brainpoly (1).png`, `musclepoly (1).png`, `gutpoly (1).png`, `autonomicpoly (1).png`, `ribbonpoly (1).png` | Devices application icons | indigo line-art | clamp(128, 11vw, 180) px container, contain |
| `value1.png` … `value6.png` | Careers value icons | indigo line-art ~500×530 | clamp(64, 6vw, 96) px, contain |
| `Grey_University_of_Cambridge-Logo.wine.png` | Mission panel (Cambridge) | varies | max-height 52, max-width 160, contain, grayscale(1) |
| `grey_Imperial_College_London_new_logo.png` | Mission panel (Imperial) | very wide wordmark | same constraint group as above |
| `grey_durham.png` | Mission panel (Durham) | shield+text | same |
| `ucllogo.svg.png` | Mission panel (UCL) | shield+banner | same |
| `Materials.jpg` | Tech pillar 1 | photographic | banner-mode inside pillar |
| `tech-scientist.jpg` | reserved | — | unused currently |
| `clinic-kit.png` | reserved | — | unused currently |
| `information.webm` | Tech pillar 2 | video | autoplay loop muted |
| `transparentform.png` | reserved | — | unused (was the prior Contact image) |

### Critical visual constraints to preserve

- **University logos must look like a single visual unit.** They are wildly different shapes (square shield vs. wide wordmark) — current desktop solution is `max-height: 52px; max-width: 160px; object-fit: contain; filter: grayscale(1)`. On mobile the row collapses to a 2×2 grid (32 px gap). The bracket marks around each logo are 12×12 px corner L-shapes positioned at the four corners of a 140×60 minimum-size box.
- **Hex portraits**: every face needs to feel framed in the hex. There is per-portrait `object-position` and `transform: scale()` in CSS — when changing sizes, those tunings need to scale with the hex. Currently `--hex-w / --hex-h` are 220/254 px (executive) and 140/162 px (advisor). On a 375 px phone the executive grid stacks single-column, advisors go to a 2-col grid (5 hexes → 3 rows: 2-2-1).
- **Cambridge image bottom crop**: must be viewport-independent. The current trick is `aspect-ratio: 1100 / calc(619 × (1 − cropBottom))`. If you change layout, keep this principle: lock the box's aspect ratio so `object-fit: cover` always shows the same slice.
- **Mosaic spotlight (contact)**: spotlight position is anchored to the *overlay wrapper*, not the image. Don't put the mask on the image directly or it will move with translateX.

---

## 7. Animation system

Three animation systems coexist:

1. **StackEntry** (CSS keyframes via `<StackEntry>` wrapper). Every section title, hero element, card fades up + opacity-up on mount. Driven by either `index` (multiplied by global stagger) or absolute `delayMs`.
2. **Framer Motion entry/hover** (used inside Pillars). `motion.button` with `initial / animate / transition` — needed because the same element also responds to hover/active state changes.
3. **Framer Motion scroll-driven** (Proof section only). `useScroll` + `useTransform` + `useMotionValueEvent` writing inline styles directly. Falls back to a static stacked layout below 720 px (or for `prefers-reduced-motion`).

Page-level entry timeline (technology, defaults):

```
0    420  840   1500     1750  1900  2050   2700      3000        3300
|     |    |     |        |     |     |      |          |           |
eyebrow title lede pillar-title card0 card1 card2 proof-section philosophy charge-link
```

Devices is similar but with the icon strip cascading in starting at "lede mid-fade" and tabs starting "while last icon is still settling". The exact computation lives in `applications-strip.tsx` and `tabs-entry.tsx`.

---

## 8. Tweak panel

`src/components/technology/tweak-panel.tsx` is a floating dev panel that becomes visible when the URL has `?tweaks=1`. It writes CSS custom properties on `document.body` from a `localStorage`-persisted state object (`TweakValues` in `src/lib/use-tweaks.tsx`). Tabs:

- **Pillars** — pillar pop / sibling dim / animMs / accent / rhythm / activeTheme / imageStyle / per-card image positioning
- **Proof** — pinScrollMult / cardNumberSize / cardLabelSize / easing / phaseOverlap / vignette / panelTone / labelWeight
- **Page Fx** — title anim / title duration / stack stagger / pillar card stagger / devices icons stagger / landing entry timing / Cambridge image controls (scale, crops, fades, callout position) / Contact image controls (scale, offset, spotlight)
- **Spacing** — every `--sp-*` variable

The tweak values are persisted per origin (localStorage) so they don't carry between localhost and a LAN IP / tunnel. This is OK for production — there's a sensible `TWEAK_DEFAULTS` object that ships baked-in.

---

## 9. Currently-known mobile issues

What is fixed (desktop-first redesign was carried over):
- Top nav has a hamburger menu with full-screen overlay below 720 px.
- Devices icon strip drops from 6-col to 3/2-col with smaller icons.
- Mission heading no longer has `white-space: nowrap` below 720 px.
- Cambridge section margins, body text font, and ECG callout positioning are tuned for narrow viewports.
- Tech hero typography clamps down on mobile and the dark-glow is reduced so it doesn't overpower 12 px text.

What may still need work:
- **Tech proof section** — the static fallback stacks 3 cards vertically inside a tall white panel. Visually the panel looks empty for a long stretch on mobile because the card numbers are huge and the gaps are generous (96 px between cards). May want a more compact mobile variant (smaller cards, tighter gap).
- **Pillar cards** — even when stacked, the cards still rely on hover/active state for full readability. Body text inside `.descriptionZone` is `position: absolute; opacity: 0` until hovered; a touch-only mobile user has no way to see it. Consider showing all body copy by default on touch devices.
- **Cambridge ECG callout** — currently positioned via vw/vh sliders. On a 390 px viewport the default `top: 4vh; left: 60vw` may put the text awkwardly on top of the building tower. Positioning probably needs to be re-anchored relative to the image's top-right corner instead of the viewport.
- **Contact form** — works in single column below 900 px but the inputs are border-bottom only. On a touch keyboard the focus state could use a stronger visual (filled background or thicker border) so users always see which field is active.
- **Footer link columns** — already collapse to single column at narrow widths but the spacing between columns may need tightening.
- **Charge link** — the underline-sweep hover effect doesn't really work on touch. Consider replacing with a tap-target pill on mobile.
- **Tweak panel** — fixed bottom-right at 280 px wide. On mobile it occupies a huge fraction of the viewport. Probably should hide entirely below 720 px (`?tweaks=1` users can rely on desktop).

---

## 10. File structure (relevant parts)

```
src/
  app/
    layout.tsx                 ← root layout (TopNav + main + Footer + TweakPanel)
    page.tsx                   ← / (Home)
    globals.css                ← design tokens, body overflow-x: clip
    providers.tsx              ← TweaksProvider client wrapper
    about/page.tsx
    technology/page.tsx
    devices/page.tsx
    careers/page.tsx
    contact/page.tsx
    privacy/page.tsx           ← stub
    terms/page.tsx             ← stub
  components/
    top-nav.tsx                ← global header + hamburger overlay
    footer/
      footer.tsx + .module.css
    subpage.tsx + .module.css  ← <Subpage> + <SubpageHeader>
    stack-entry.tsx + .module.css
    animated-title.tsx
    hex-portrait.tsx + .module.css
    home/
      hero.tsx + .module.css
      mission-panel.tsx + .module.css
      partners-ribbon.tsx + .module.css
      university-mark.tsx + .module.css
      topo-canvas.tsx
      charge-link.tsx + .module.css
    about/
      cambridge-section.tsx + .module.css
      team-section.tsx + .module.css
    technology/
      hero.tsx + hero.module.css
      philosophy.tsx + .module.css
      pillars/
        pillar-section.tsx + .module.css
        pillar.tsx + .module.css
        pillar-data.ts
      proof-section/
        proof-section.tsx + .module.css
        proof-card.tsx
      tweak-panel.tsx + .module.css
      tweak-tabs/{pillars,proof,page-fx,spacing}-tab.tsx
    devices/
      applications-strip.tsx + .module.css
      tabs-entry.tsx
      devices-tabs.tsx + .module.css
      app-block.tsx + .module.css
      veterinary-panel.tsx + .module.css
    careers/
      careers-hero.tsx + .module.css
      values-section.tsx + .module.css
      open-roles-section.tsx + .module.css
    contact/
      contact-hero.tsx + .module.css
  lib/
    use-tweaks.tsx              ← TweakValues type + TWEAK_DEFAULTS + applyToBody
public/
  assets/
    (everything listed in Section 6)
    universities/  ← old SVG logos (no longer used; replaced by PNGs in /assets root)
```

---

## 11. Suggested mobile-rebuild approach

The desktop design has a strong identity built around three things: (a) heavy use of indigo-bright accents on italic words, (b) photographic backgrounds with mask-fade dissolves at every panel boundary, (c) full-bleed visual moments alternating with rail-constrained typography. A mobile rebuild should preserve these — not replace them with a generic stack.

Areas where the mobile layout fundamentally differs from desktop and probably need first-principles design rather than CSS tweaks:

1. **Top nav overlay** — already done.
2. **Pillars** — desktop hover-to-expand pattern doesn't translate. Pick: (a) accordion (tap to expand body), (b) always-expanded vertical cards, (c) a horizontal swipeable carousel. (a) keeps the same data model with minimal changes.
3. **Proof section** — the scroll-pinned 100vh experience is desktop-only. The static 3-card stack is the mobile variant. Probably needs to be visually anchored differently — maybe with a single "proof card" that pages horizontally, or with a viewport-tight typography size.
4. **Cambridge image** — works on mobile but the floating ECG callout position is fragile. Either move the callout to a separate paragraph below the image, or tightly anchor it to the image's top-right with intrinsic-pixel offsets.
5. **Tech hero** — full 100vh hero with bg-image is great on mobile. Just needs typography clamps + glow already tuned.
6. **Contact** — image is hidden below 900 px by design. Form is single-column.

When introducing new mobile layouts, follow the existing patterns:
- **Spacing**: prefer `clamp(min, vw, max)` — already used everywhere.
- **Typography**: use the existing fluid `clamp` ranges; lower the ceiling at narrow breakpoints rather than introducing a new font family.
- **Colour**: stick to the token palette. The site's identity is mostly carried by `--bg` + `--ink` + `--indigo-bright`, with ink-dim for secondary text.
- **Animations**: re-use `<StackEntry delayMs={...}>` for page entry. Disable scroll-driven motion below 720 px and provide a static visual variant (the proof section already does this — copy the pattern).
- **Image treatments**: prefer CSS masks over wrapper overlays. Keep all four-edge soft fades wherever possible.

The site already has a consistent design language — the goal of the mobile rebuild should be to translate that language into a smaller viewport without diluting it.
