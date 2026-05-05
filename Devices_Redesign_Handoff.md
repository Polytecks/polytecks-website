# Devices Page Redesign - Hand-off Package

## Context

This package describes a redesign of the **Devices** page on the Polytecks site. The redesign is provided as a complete HTML reference file (`Devices.html`). This document is the brief that pairs with that file: scope, integration directives, preservation notes, and an acceptance checklist.

The HTML in `Devices.html` is the **canonical template for the redesigned region**. It is intentionally self-contained (inline CSS, inline JS) so it can be read and adapted in a single pass. It is **not** intended to be dropped in verbatim - it must be integrated into the existing Polytecks site, inheriting the project's structure, asset pipeline, and load-in animation pattern used on About / Technology / Contact.

## Scope

**Change region:** everything from the section head `Our first device` downward, through the platform section, CTA, and footer hand-off.

**Do not modify:** everything above `Our first device`. Specifically:
- The `<nav>` block (already on the live site - keep current implementation)
- The hero block: `eyebrow`, `h1`, `lede`
- The icon strip with six items (Cardiac Signals, Neural Activity, Muscle Function, Gut Electrophysiology, Autonomic Control, Oncological Signatures)

The CSS and HTML for the above-the-cut parts are included in `Devices.html` only as context so the file renders as a complete page in isolation. Use the existing live-site versions of those sections; do not regress them to whatever is in this template.

## What's New, Section by Section

### 1. Section head: `Our first device`

- Kicker (`Our first device`, monospace, uppercase, dim) above an h2.
- The h2 reads: *Veterinary cardiac staging at the point of care.* with `point of care` italicised and tinted indigo via `<em>`.
- HTML: `Devices.html` lines 712-715.

### 2. First Device block (Veterinary cardiac staging)

Two-column grid (`.first-device`, `1fr / 1.1fr`):

**Left column - `.device-visual`:**
- Image placeholder for now. Production should swap in an in-clinic photo of the device on a canine patient.
- Background: subtle indigo gradient + diagonal hairline pattern, already styled in the template.
- Min-height 540px on desktop, 320px on mobile.

**Right column - `.device-copy`:**
- One `p.lead` (slightly heavier weight, lighter colour) followed by three regular `<p>` paragraphs.
- A `.device-summary` triple cell row: Format / Measurement time / Setting, with values *Non-invasive*, *~2 min*, *Point of care*.
- A `.status-block` with:
  - Animated indigo pulse dot (CSS `@keyframes status-pulse`, 2.4s loop)
  - "Trial ongoing" / "Active in-clinic study with first-opinion veterinary partners."
  - Primary button `Follow updates →` linking to `contact.html#newsletter`

HTML: lines 717-757. Preserve the copy verbatim.

### 3. Section head: `Future indications`

- Kicker + h2 + supporting paragraph (the only `section-head` that uses `<p>`).
- h2: *The same platform, applied across adjacent areas of health.* (italic + indigo on `adjacent`).
- HTML: lines 760-764.

### 4. Future Indications timeline (the centrepiece)

This is the page's signature interaction. **Treat it as load-bearing - port the JS verbatim and do not "improve" it.**

**Structure:**
- A vertical container `.timeline` containing `.timeline-track`, `.timeline-fill`, `.timeline-dot`, and eight `<article class="indication">` cards alternating `.left` / `.right`.
- Cards in order: Arrhythmia Mapping, Fetal Monitoring, Neuromuscular & Autonomic, EEG Research, GI Disease Diagnostics & Monitoring, Prosthetic Control, Cancer Screening, Epilepsy Monitoring.
- Each card: title, descriptor (small indigo text), a 64px-tall scrolling ECG-style waveform, and a body paragraph.

**Behaviour (must preserve):**
- The dot's *target* position is computed each scroll: it pins to viewport-centre while the timeline is on-screen, otherwise to whichever timeline edge is nearest.
- The dot's *displayed* position eases toward the target at 22% per frame (`tick()` function), with a 0.2px snap threshold to avoid sub-pixel jitter.
- The illuminated `.timeline-fill` height is updated every frame to match the dot's offset.
- Cards above the dot's current position get class `is-active` (opacity 1, indigo border, connector visible). Cards below stay at 0.35 opacity.

The full IIFE is at lines 989-1056. Port it as-is, including the comment block. The 22% lerp factor and the 0.2px snap are tuned values, not arbitrary.

**ECG waveforms (must preserve):**
- Each `.indi-wave` SVG uses inline SMIL `<animateTransform>` to translate a `<g class="wave-scroll">` from `0 0` to `-400 0` over 9s.
- The path inside is duplicated with a `translate(400 0)` second copy so the loop is seamless.
- Each card's `begin` attribute is a **negative** value (`-1.5s`, `-3s`, `-4.5s`, `-6s`, `-7.5s`, `-9s`, `-10.5s`, `-12s`). This staggers the start so the waves don't all sync. Keep these.
- The "ghost" trace is the same `<path d>` rendered at lower opacity inside the same scrolling group, so it mirrors the bright trace 1:1 by construction. Don't try to compute the ghost separately.

**Responsive (already handled):**
- At `<960px`, the track moves to the left edge and all cards collapse into a single column to the right of the track. Spacers and connectors adjust automatically via the existing media query.

### 5. Coda

`.indi-coda` paragraph centred below the timeline:
*And many more, across cardiology, neurophysiology, autonomic systems, and musculoskeletal health.*
Italic + indigo on `many more`. Lines 942-944.

### 6. Platform

Two-column grid (`.platform`): kicker + h2 on the left, two body paragraphs on the right. Top border separates from the timeline. Lines 947-956.

### 7. CTA

Two-column (`.cta`): heading + supporting line on the left, two stacked buttons on the right.
- Primary: `Explore collaborations →`
- Secondary: `Follow updates`

The `Follow updates` secondary button links to `contact.html#newsletter`. The `Explore collaborations` primary button is a `#` placeholder - **wire it to the appropriate route** (likely a `mailto:` or a contact-form anchor; confirm with Callan before guessing). Lines 959-968.

## Integration Directives

### Load-in animations

The current site has scroll-triggered fade/slide-in animations on About, Technology, and Contact (implemented previously in this codebase). The redesigned Devices page should match that pattern. Apply to:

- Both `.section-head` blocks (kicker fades up, then h2)
- `.first-device` left and right columns (stagger by ~120ms)
- Each `.device-summary .cell` (small stagger)
- `.status-block`
- `.indi-coda`
- `.platform` left and right columns
- `.cta`

**Do not** apply load-in animations to individual `.indication` cards in the timeline. Those have their own scroll-driven activation system (the `is-active` class). Adding a separate fade-in on top will fight the activation logic and feel double-handled. The timeline's appearance *is* its load-in.

### Connections to wire

| Element | Wire to |
|---|---|
| Nav `Devices` link | This page (already marked `.active`) |
| Other nav links | Existing site routes - match the implementation already used on About / Technology / Contact |
| Logo | Home |
| Icon strip asset paths | `/assets/heartpoly.png`, `brainpoly.png`, `musclepoly.png`, `gutpoly.png`, `autonomicpoly.png`, `ribbonpoly.png` - confirm naming matches the live site |
| Polytecks logo asset | `/assets/polytecks-logo-white.png` or whatever the existing pages use |
| `Follow updates` (status block) | `contact.html#newsletter` |
| `Follow updates` (CTA secondary) | `contact.html#newsletter` |
| `Explore collaborations` (CTA primary) | **TBC - confirm with Callan** |
| Footer | Match existing site footer (the template has a minimal one only for standalone rendering) |

### Aesthetic guardrails

- Aesthetic direction is **patent-schematic / proprietary-research-lab**, not generic dashboard. The hairline diagonals in `.device-visual`, the 1px borders, the muted indigo glow, and the monospace kickers are all part of this language. Do not soften them with rounded cards, drop shadows, or saturated brand colours.
- Italic + indigo `<em>` highlights are how emphasis is carried in display text. Keep them sparing, one per heading.
- No em dashes in any new copy added (use " - " instead). Existing copy in the template is locked, don't rewrite it.

## Preservation Checklist (do not change)

- [ ] The scroll-timeline IIFE (lines 989-1056), verbatim
- [ ] The `0.22` lerp factor in `tick()`
- [ ] The `0.2` snap threshold
- [ ] The negative `begin` values on each ECG `<animateTransform>`
- [ ] The `@keyframes status-pulse` keyframe values (0% / 70% / 100%)
- [ ] The `prefers-reduced-motion` block (lines 672-675) - extend it if you add new animations, never remove it
- [ ] The two `.indi-spacer` `<div>`s in each timeline card (they hold the empty grid cell so the alternating-side layout works)
- [ ] The `data-screen-label` attributes on each section - they may be used for screen-reader or analytics tooling

## Acceptance Checklist

- [ ] Everything above `Our first device` matches the current live site exactly
- [ ] Section head, first-device block, and timeline render correctly on desktop (≥1100px)
- [ ] Timeline collapses to single-column at `<960px` with track on the left
- [ ] Dot tracks viewport centre smoothly while the timeline is on-screen
- [ ] Each ECG wave animates and loops seamlessly (no visible jump at the end of each 9s cycle)
- [ ] Cards activate progressively as the dot passes their vertical centre
- [ ] Status pulse animates on the trial-ongoing block
- [ ] Load-in animations on `.section-head`, `.first-device`, `.platform`, `.cta` match the rest of the site
- [ ] All nav, button, and footer links route correctly
- [ ] `prefers-reduced-motion: reduce` disables decorative animations (status pulse, ECG scroll) without breaking the dot tracking
- [ ] Page passes a Lighthouse a11y check at the level the rest of the site does

## File Reference

The companion HTML file `Devices.html` is the canonical template. Read it end-to-end before starting. The comments in the CSS and the IIFE explain the *why* behind several non-obvious decisions: the duplicate-path trick for seamless ECG looping, the lerp + snap pattern for the dot, and the grid-spacer pattern for alternating cards.
