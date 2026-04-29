# Polytecks website — mobile strategy

Companion to `WEBSITE_REFERENCE.md`. That doc describes the **desktop design that exists**. This doc describes **how to build the mobile experience** without diluting it. Read both before working on mobile-related changes.

The goal of this document is to give a single, stable reference that any session of mobile work can anchor to — so decisions stay consistent across sessions and the mobile experience converges instead of oscillating.

---

## 0. The framing shift

The mobile work to date has been treating the problem as **adapting the desktop site to a small screen**. That framing has produced increasingly fragile CSS — media queries piled on media queries, viewport-positioned elements re-anchored with vw/vh tweaks, hover-state interactions left orphaned on touch.

The reframe: **translate the design language into a mobile idiom.** The mobile site should feel like the same brand, executed differently — not the desktop site shrunk down. Identity (indigo-italic accents, mask-fade dissolves, photographic moments, hex portraits, mono eyebrows, dark/light surface inversion) is preserved. Interactions (hover-to-expand, scroll-pinning, viewport-anchored floats) are replaced with mobile-native equivalents.

This implies: some sections are CSS-only fixes, some need restructured CSS, and some need genuinely different React components for mobile. Forcing every section into the CSS-only bucket is what broke the previous approach.

---

## 1. Mobile-first user model

Optimise the mobile experience for the most likely mobile visitors:

- **Investors** scanning the site after receiving a deck link — need fast credibility and a clear "what is Polytecks" answer in the first viewport.
- **Candidates** browsing careers in transit — need to find roles and team quickly.
- **Partners / clinicians** doing due diligence between meetings — need affiliations and technology summary.
- **Press / general** — same as above with less depth.

Implication: every mobile design decision should be checked against these flows. If a piece of desktop content slows down or distracts from these flows on mobile, it can be trimmed, deprioritised, or moved further down the scroll.

---

## 2. Three tiers

Every section of every page is classified into one of three tiers. This determines the *kind* of work needed and prevents the "trying to fix Tier 3 with Tier 1 tools" failure mode.

### Tier 1 — Responsive only
Same HTML, same components. CSS clamps and media queries handle everything. No JS changes.
**Test:** would removing every media query above 720 px still produce a usable mobile layout? If yes, Tier 1.

### Tier 2 — Adapted layout
Same React components, but CSS restructures the layout meaningfully (grid → stack, multi-col → single-col, hidden side elements, repositioned floats).
**Test:** does the desktop and mobile version share component code but render visibly different layouts? If yes, Tier 2.

### Tier 3 — Genuinely rebuilt
Mobile renders a different component, or a markedly different branch of the same component. Used when the desktop interaction has no mobile equivalent (hover-to-expand, scroll-pinning, viewport-anchored floats, fixed-position overlays).
**Test:** is there an interaction or layout primitive on desktop that simply doesn't translate to a touch screen? If yes, Tier 3.

**Architecture for Tier 3:** prefer **component-level branching** with a single `useIsMobile()` hook (SSR-safe, defaults to `false` server-side, hydrates to actual viewport client-side). Render `<MobileVariant />` or `<DesktopVariant />` from the parent. Keep both variants in the same folder so they evolve together.

Avoid: separate `/m/` routes, user-agent sniffing, two parallel codebases.

---

## 3. Design language — what to preserve on mobile

These are non-negotiable. Mobile must keep:

- **Indigo-bright italic accents** on `<em>` inside headings. Same `--indigo-bright` token, same italic-500 treatment.
- **Mono eyebrows** in `--indigo-bright` with 0.18–0.3em letter-spacing.
- **Mask-fade dissolves** at panel boundaries (the dark→light transitions, the image edge fades). These survive at any viewport.
- **Hex portraits** with the gradient-stroke ring. Disable the rotating-ring hover animation on touch (it never fires) but keep the static frame.
- **Dark/light surface inversion** — mission panel stays light, careers open-roles stays light, everything else stays dark.
- **Photographic backgrounds** — Cambridge image, tech hero image, careers image. Keep them; just constrain crops.
- **Display font (Space Grotesk) at weight 300** for headings. Don't switch to a heavier weight on mobile — it changes the brand voice.

Things that can change on mobile:
- Hover-driven reveal patterns (replace with always-revealed)
- Scroll-pinned animations (replace with static + entry fade)
- Viewport-anchored floating elements (replace with flow-positioned)
- Multi-step interaction sequences (collapse to single-step or remove)
- Animation cascades longer than ~600ms (compress)

---

## 4. Per-section specification

For each section: **tier**, **what mobile should render**, **specific concerns to address**.

### 4.1 Top nav (`top-nav.tsx`) — Tier 2 ✅ Done
Hamburger overlay below 720px is correct. No further work needed unless the link list grows.

### 4.2 Footer — Tier 2 (rework)
Current: 4-col → 1-col at ≤720 px. Too aggressive.
Mobile: 4-col → 2-col (≤960 px) → 1-col (≤480 px). At 2-col, pair Explore+Company in the left column and Connect+logo in the right. Keep eyebrows visible.

### 4.3 Home / Hero — Tier 1 (minor fixes)
Already collapses to single column at 960 px. Two specific fixes:

- **CTA button width.** `clamp(420px, 36vw, 620px)` overflows narrow viewports. Mobile override: `width: 100%; max-width: 360px`.
- **Headline word cascade.** Word-by-word unblur over 880ms feels slow on mobile. Below 720 px, compress total cascade to ~600ms (delay = wi × 75ms instead of 110ms). Or fire all words simultaneously with a single 600ms blur-up.

### 4.4 Mission panel — Tier 1 ✅ Mostly done
The 720 px headline-wrap fix is right. One outstanding concern:

- **Logo row balance.** Imperial's wordmark is dramatically wider than the three shield logos. At 2×2 grid below 720 px, Imperial will dominate its row. Either constrain Imperial to `max-width: 100px` on mobile (smaller than the shield-logos' implicit widths), or stack 1-col below 480 px so each logo gets equal vertical space.

### 4.5 Partners ribbon — Tier 1 (minor)
Marquee scroll speed should be viewport-relative. At 320 px viewport, a `pixels/second` scroll feels glacial. Switch to `vw/second` or scale speed by `viewport-width / 1400`.

### 4.6 Subpage shell + header — Tier 1 ✅
Eyebrow pill, italic-indigo title, indigo-bright lede all translate cleanly. No work needed.

### 4.7 Cambridge section — Tier 3 (rebuild)
The floating ECG callout is the fragile piece. It must not be position-anchored to the viewport on mobile.

Mobile rebuild:
- Section title and body paragraph render normally (already do).
- Image renders constrained to `aspect-ratio: 4/3` (more square than the 16:9 desktop crop) so it doesn't dominate the scroll.
- The ECG callout text renders as a separate `<p>` directly below the image, with the same indigo-bright treatment that headings use for emphasis. No absolute positioning, no viewport units.
- Keep the side+bottom mask fades on the image — they work at any width.

### 4.8 Team — executives — Tier 2 ✅
3-col → 1-col at ≤860 px is correct. One change: disable the SVG ring rotation animation below 720 px (touch never triggers it; the animation wastes CPU).

### 4.9 Team — advisors — Tier 2 (tighten)
Current breakpoints (5 → 3 at 960, 3 → 2 at 560) are reasonable but produce a 2-2-1 final row that looks unbalanced.
Better: 5 → 3-col at ≤960, then **2-col at ≤700 px** (gives 2-2-1, but with larger hexes that fill the row). Already documented in WEBSITE_REFERENCE.md §5.2.3 — keep the per-portrait `object-position` tunings since they're percentage-based.

### 4.10 Tech hero — Tier 1 ✅ Done
Already tuned. No further work.

### 4.11 Pillars — Tier 3 (critical rebuild)
Desktop hover-to-expand has no mobile equivalent. Don't try to replicate with tap-to-expand accordion — that hides information behind an interaction step that mobile users won't take.

Mobile rebuild — render a separate `<MobilePillarSection />` below 720 px:
- Three vertical cards in a single column.
- Each card: image full-bleed at top (height clamp(180px, 28vh, 240px)) → title (display 400 weight, 28-32px) → body copy (always visible, sans 300, 15-16px) → no hover, no Framer Motion expand logic, no `motion.button`.
- Keep indigo-bright italic accents in titles where they exist on desktop.
- Card background: `--bg-2` with subtle border, 24px padding, 16px radius.
- Use `<StackEntry index={i}>` for entry animation. No further interactivity.

### 4.12 Proof section — Tier 3 (critical rebuild)
The scroll-pinned 100vh experience is desktop-only. Current static fallback (3 cards stacked with 96 px gaps inside a tall white panel) feels empty.

Mobile rebuild — render a separate `<MobileProofSection />` below 720 px:
- Single white panel, padding `clamp(60px, 10vh, 100px) 0`.
- A horizontally-scrollable row of three cards using CSS scroll-snap. Each card 80vw wide, 70vh tall, snap-align center, gap 16 px. Padding `0 10vw` on the scroll container so first/last cards center-align.
- Each card: huge number (clamp(80px, 22vw, 140px), display weight 300), label below (15-16px, dark ink-dim).
- Subtle scroll-position indicator below the row (3 dots).
- No scroll-pinning, no useScroll, no useTransform. Just a static scroll-snap container.

If horizontal-snap proves problematic, fallback is vertical stack with gap reduced from 96 px to 32 px and number sizes reduced — but try horizontal first; it preserves more of the desktop "showcase" feel.

### 4.13 Philosophy paragraph — Tier 1 ✅
Already responsive. No work.

### 4.14 Charge link — Tier 3 (replace)
The horizontal underline-sweep is a pure desktop-hover effect. On touch it never fires.

Mobile: render a pill-shaped button with indigo border, indigo-bright text, 14px tracked-uppercase mono label. Match the visual weight of the contact-form Submit button. Width auto, padding 14px 32px. Centered.

### 4.15 Devices applications strip — Tier 2 ✅ Mostly done
Existing 6 → 3 → 2 column collapse is correct. One concern:

- **Stagger timing.** Six icons cascading at 150 ms each is 900 ms of waiting before all icons are visible. Below 720 px, compress stagger to 80 ms per icon (total ~480 ms). Same for tabs entry timing — recompute `getApplicationsStripEndMs()` based on the mobile stagger.

### 4.16 Devices tabs — Tier 1 (minor)
Tab pattern works on touch natively. Confirm tab targets are ≥44 px tall (Apple HIG minimum). Currently the pill-strip is sized for desktop hover; bump padding to ensure 44 px tap height.

### 4.17 App blocks — Tier 2 ✅
Image-left/copy-right alternating layout already collapses to image-then-copy stacked. Confirm the `reverse` prop is no-op'd on mobile so order is consistent (image always above copy).

### 4.18 Careers hero — Tier 1 ✅
Already responsive. No work.

### 4.19 Values grid — Tier 1 ✅
3 → 2 → 1 column collapse already defined. No work.

### 4.20 Open Roles — Tier 1 ✅
Just text; current "no roles" placeholder is fine.

### 4.21 Contact form — Tier 3 (input rebuild)
The form structure is fine; the inputs are not.

Mobile rebuild for inputs only:
- Background: `rgba(255, 255, 255, 0.04)` (subtle filled state).
- Border: 1 px `--line` on all sides; on focus, border becomes 1 px `--indigo-bright` and background lifts to `rgba(255, 255, 255, 0.06)`.
- Padding: 14 px horizontal, 12 px vertical.
- Border radius: 8 px.
- **Critical:** font-size **must** be 16 px or larger on mobile, otherwise iOS Safari will zoom the viewport on focus. Override the desktop input font-size for touch.
- The 2-col rows (First+Last name, Job+Company) collapse to single-col.
- Submit button: keep the desktop pill style, full-width on mobile, min-height 48 px.

The free-floating image stays `display: none` below 900 px (already correct).

### 4.22 Tweak panel — Tier 3 (hide)
Hide entirely below 720 px via CSS or by gating the component on `useIsMobile()`. Tweak panel users are dev-only and have desktop access.

### 4.23 Hex portrait — Tier 2
Disable the rotating ring SVG animation on touch (touch never triggers `:hover`, so the animation is dead code on mobile, but the SVG `<animate>` element if present still runs and burns battery). Confirm via DevTools that no animation is running on mobile.

### 4.24 StackEntry — Tier 1
Already respects `prefers-reduced-motion`. One enhancement: reduce default `--stack-stagger-ms` from 420 ms to 280 ms below 720 px. The longer stagger looks deliberate on a wide desktop; on mobile it just feels slow.

---

## 5. Workflow rules for mobile sessions

### 5.1 One section per session
Each Claude Code session works on **exactly one section** from §4. Define "done" before starting (the bullets in §4 for that section are the spec). Don't scope-creep into adjacent sections — they'll get their own session.

### 5.2 Mobile preview is mandatory
No mobile change is complete until viewed on a real phone via the LAN IP (`http://<ipv4>:3000`). Chrome DevTools mobile emulation is unreliable for: font rendering, scroll performance, touch behaviour, iOS Safari quirks (especially viewport zoom, sticky positioning, mask compositing). Do not approve a change based on DevTools alone.

### 5.3 Tier discipline
Before writing CSS for a section, identify its tier from §4. If it's Tier 3, the first action is to create a new component file (or a mobile branch in the existing file) — not to add a media query.

### 5.4 Don't accumulate media queries
The site already has breakpoints at 560/600/720/860/900/960 px. Don't add new ones. If a layout needs a different breakpoint, justify it in a code comment and update this doc.

### 5.5 Touch targets
Every interactive element on mobile (links, buttons, tab segments, form inputs, hamburger toggle) must be ≥44 px in its smallest dimension. Audit at the end of each session.

### 5.6 Identity check
Before merging a mobile change, scan the screenshot for: indigo-italic accents preserved? Eyebrow style preserved? Mask-fade dissolves preserved at panel boundaries? If any of these are missing on mobile when they're present on desktop, the change isn't ready.

### 5.7 Visual regression
Recommended (not required): add Playwright screenshot tests at 375 / 768 / 1280 px for each page. Three baseline screenshots per page, committed. Any change that alters them flags in PR. This stops the "fixed mobile / broke desktop" oscillation that's been happening.

---

## 6. Execution order (suggested)

If working through the mobile rebuild systematically, this order minimises rework (foundational components first, then sections that depend on them):

1. Create `useIsMobile()` hook (foundation for all Tier 3 work).
2. Footer rework (Tier 2, isolated, low risk).
3. Hex portrait — disable hover ring on touch (Tier 2, foundational for team sections).
4. Pillars mobile rebuild (Tier 3, high impact).
5. Proof section mobile rebuild (Tier 3, high impact).
6. Cambridge section mobile rebuild (Tier 3, fixes a known fragility).
7. Contact form input rebuild (Tier 3, fixes a UX problem).
8. Charge link mobile replacement (Tier 3, small).
9. Tweak panel hide (Tier 3, trivial).
10. Devices stagger compression (Tier 2, polish).
11. Stack stagger compression on mobile (Tier 1, polish).
12. Mission panel logo balance (Tier 1, polish).
13. Hero CTA width fix + headline cascade compression (Tier 1, polish).
14. Devices tabs touch-target audit (Tier 1, audit).
15. Final screenshot pass on real device.

Steps 1–9 are the substantive work. Steps 10–15 are polish.

---

## 7. What this doc does not cover

- Performance optimisation (image sizes, lazy loading, bundle size). Worth a separate pass after the mobile design is stable.
- SEO / metadata / Open Graph. Unrelated to mobile layout.
- Accessibility audit (focus visibility, ARIA, screen reader testing). Should be a separate session, not folded into mobile work.
- New mobile-only features (e.g. share-to-WhatsApp buttons). Out of scope; this doc is about translating the existing site.
