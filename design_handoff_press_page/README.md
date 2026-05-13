# Handoff: Press &amp; Publications page (`/press`)

## Overview

A new top-level route at **`/press`** for the Polytecks website. The page has two
audiences with equal billing — **journalists** (looking for press coverage,
contacts, podcast appearances) and **clinicians / partners / scientists**
(looking for peer-reviewed publications). The chosen layout — committed to
after exploring three structural variants — places press first, then a
visually inverted (light, "paper-tone") publications section, mirroring the
home page's dark↔light surface alternation.

The page consists of (top to bottom):
1. **Page header** — eyebrow, large display headline with italic-indigo emphasis on the second sentence.
2. **Featured carousel** ("Featured") — 5 stories, two-up cards, paginated with prev/next arrows and a tick-style progress bar.
3. **Press list section** ("Articles" / "In the conversation.") — paginated list, 10 rows per page.
4. **Publications section** ("Publications" / "And in the record.") — *light/inverted surface*, numbered bibliography blocks, paginated 10 per page.
5. **Press contact strip** ("Press Enquiries") — headline + email link.
6. Standard global footer.

## About the design files

The files in this bundle are **design references created in HTML** —
prototypes showing intended look and behaviour, **not production code** to
copy directly. The task is to recreate this design inside the existing
`website/` Next.js codebase, using its established patterns (App Router,
TypeScript, CSS Modules, the existing token system in `globals.css`) and
**reusing existing components wherever they exist** (top nav, footer, the
italic-indigo headline pattern, the `.eyebrow` / mission-panel section header
treatment).

Treat the prototype as the source of truth for **layout, typography sizing,
spacing, copy, and interactions**. Treat the existing codebase as the source
of truth for **tokens, fonts, components, and styling conventions**.

## Fidelity

**High-fidelity.** Every value (colour, spacing, font size, line height,
letter-spacing, border radius) in the prototype is intentional and should be
preserved when porting. Where the prototype invents a value that already
exists as a token in the codebase, **use the codebase token**.

## Files in this bundle

| File | What it is | Maps to |
|---|---|---|
| `p3.html` | Entry HTML (loads React + Babel + everything below). Reference only — not ported. | `src/app/press/page.tsx` |
| `p3.jsx` | The page-level React component + the press / publications sections + pager + row components. | `src/app/press/page.tsx` + new components in `src/components/press/` |
| `shell.jsx` | TopNav, Footer, PressContact, FeaturedCarousel — all four in one file because the prototype is a single-file React app. **The first two are duplicates of components you already have.** | TopNav and Footer: **delete the prototype's versions, use existing.** PressContact + FeaturedCarousel: new components in `src/components/press/`. |
| `data.js` | Sample press items (`PRESS_ITEMS`) and publications (`PUBLICATIONS`). Many entries are **fabricated placeholders** flagged with `fabricated: true` — replace with real content before shipping. | `src/data/press.ts` (or wherever your team puts content data; could be a CMS hook later). |
| `tokens.css` | Design tokens — many of these already exist in `website/src/app/globals.css`. **Diff carefully** before adding anything new. | `globals.css` (only the genuinely new tokens). |
| `shared.css` | Page header, featured carousel, section eyebrows. | Module-scoped CSS files alongside the new components. |
| `p3.css` | Press section, publications section, pager arrows. | Module-scoped CSS files alongside the new components. |

## Suggested file plan in your repo

```
src/
  app/
    press/
      page.tsx                       # exports PressPage; "use client" at top (uses pagination state)
  components/
    press/
      featured-carousel.tsx
      featured-carousel.module.css
      press-section.tsx              # the "In the conversation." paginated list
      press-section.module.css
      press-row.tsx
      publications-section.tsx       # the "And in the record." paginated list (light/inverted)
      publications-section.module.css
      publication-block.tsx
      pager-arrows.tsx               # shared between PressSection and PublicationsSection
      pager-arrows.module.css
      press-contact.tsx              # "Press Enquiries" strip
      press-contact.module.css
      section-eyebrow.tsx            # the indigo line-flanked label (Featured / Articles / Publications / Press Enquiries)
      section-eyebrow.module.css
  data/
    press.ts                         # PRESS_ITEMS and PUBLICATIONS, typed
```

`section-eyebrow.tsx` is a generalisation of the `.eyebrow` rule already in
`mission-panel.module.css`. If you'd rather just import that existing module
class, that's also fine — but extracting it into a shared component makes the
four uses on this page consistent and lets the publications section's "light
on light" use case live in the same place.

## Design tokens

All of the following should already exist in `globals.css`. If any are
missing, add them; if any conflict, the codebase wins.

| Token (prototype name → repo name) | Value |
|---|---|
| `--bg` | `#0a0a0e` (page background, dark) |
| `--ink` | `#ffffff` |
| `--ink-dim` | `rgba(255, 255, 255, 0.7)` |
| `--ink-faint` | `rgba(255, 255, 255, 0.45)` |
| `--line` | `rgba(255, 255, 255, 0.08)` |
| `--line-strong` | `rgba(255, 255, 255, 0.18)` |
| `--indigo` | `#4a54c0` |
| `--indigo-bright` | `#6c78d8` |
| `--indigo-light` | `#a8b0f3` |
| `--indigo-lightest` | `#c8cef5` |
| Publications section bg | `#f4f4ee` (light "paper" tone — new; only used on this page) |
| `--font-display` | Space Grotesk, weight 300/500 |
| `--font-sans` | Inter, weight 300/400/500 |
| `--font-serif` | Source Serif 4, weight 400/500 + italic 400 |
| `--font-mono` | JetBrains Mono, weight 500/600 |

The display headline weight is **300** (light) with the italicised emphasis
span at weight **500** in `--indigo-bright`. This is the existing
italic-em-indigo pattern from the rest of the site.

## Page header

```
[eyebrow: PRESS & PUBLICATIONS]
[h1: "Capturing signals from the body. <em>Generating signals in the world.</em>"]
```

- Centered.
- Container `max-width: 1280px`, padding `96px 32px 48px`.
- `h1` uses `clamp(40px, 5vw, 68px)`, `letter-spacing: -0.03em`, `line-height: 1.1`, `font-weight: 300`. The `<em>` block is `font-style: italic; font-weight: 500; color: var(--indigo-bright)`.
- The italic-indigo highlight is the **entire second sentence**, not just one word.

## Section eyebrow (used 4 times)

A line-flanked indigo monospace label, modelled directly on
`mission-panel.module.css → .eyebrow`.

- `font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3em; color: var(--indigo);`
- Flex container with `gap: 14px`. Two `::before` / `::after` 60px-wide gradient lines fading from transparent to `rgba(74, 84, 192, 0.5)`.
- **Centered** under each section.
- Used as: `Featured`, `Articles`, `Publications`, `Press Enquiries`.

The `Publications` instance sits on the light/paper background — same indigo
colour, same gradient lines (the indigo reads fine on either surface).

## Featured carousel

- Two cards visible at a time.
- 5 items total → 4 "pages" of 1-card scroll (transform-driven, not virtualised).
- Track translates by `-${idx} * (50% + 12px)` — i.e. one card per arrow click.
- Each card: image placeholder (16:9), meta row (outlet · date · podcast/fabricated tag), large display title, "Read article →" link. **No description / excerpt** — removed by intent.
- Card hover: `padding: 24px; margin: -24px;` so the hover background extends 24px beyond each side. The viewport is `overflow: hidden` with matching `margin: -24px; padding: 24px;` so the hover halo isn't clipped. **Don't omit this** — the hover state looks cramped without it.
- Below the cards: a tick-style progress bar (`.fc-progress`), one tick per page, indigo fill on the active. `margin-top: 40px` to clear the expanded hover halo.
- Header is centered: `Featured` eyebrow on top, prev/next circular arrow buttons on the right of the next row.

## Press section ("In the conversation.")

- Section eyebrow: `Articles`. Centered.
- Section title: `In the <em>conversation.</em>` (italic-indigo on "conversation").
- Pager arrows on the right of the title row (same circular hairline style as carousel).
- 10 items per page; arrows disable when `page === 1` (prev) or `page === totalPages` (next).
- Row layout (grid `200px 1fr 32px`):
  - Left column: date (mono, faint) + outlet (mono, indigo-lightest), stacked.
  - Middle: title (display, 300, ~22-26px) + tag pill ("Article" or "Podcast").
  - Right: a → arrow (mono).
- Row hover: `padding-left: 16px` slide, title shifts to indigo-light, arrow shifts +4px and turns indigo. Same hover vocabulary as the rest of the site.
- **Top hairline** above the first row matches the row width (1100px max with 32px padding) — implemented as a `::before` on the list container, not as a `border-top`, so it doesn't extend to the edge of the section.

### Tag colours

Two variants on `.p3-press-tag`:
- **Article** (default, cool): text `var(--indigo-lightest)`, border `rgba(168,176,243,0.3)`, bg `rgba(168,176,243,0.06)`.
- **Podcast** (warm): text `#f0d59a`, border `rgba(240,213,154,0.3)`, bg `rgba(240,213,154,0.06)`.

Both: 9px monospace, 0.22em letter-spacing, uppercase, full-pill border-radius, 3×8 padding.

## Publications section ("And in the record.")

- **Surface inversion** — section background is `#f4f4ee` (warm paper tone) with two subtle radial gradient overlays for texture (see `p3.css → .p3-pub-section`).
- Section eyebrow: `Publications`, centered, indigo.
- Section title: `And in the <em>record.</em>` — italic-indigo on "record".
- Pager arrows on the right (use a `.fc-btn-light` variant with darker borders so it reads on the light surface).
- Numbered bibliography blocks (grid `80px 1fr`):
  - **01, 02, 03 …** in mono, tabular-nums, faint.
  - Authors line (sans, 14px, dim).
  - Title in **Source Serif 4 regular**, ~22-28px, near-black. Serif here intentionally signals "scholarly record" — different register from the press section above.
  - Footer row: italic serif journal name (indigo) · mono "Vol. N · pp · YEAR" · DOI link with hairline underline.
  - Affiliation in tiny mono caps.

10 papers per page, same pager pattern as press section.

## Press contact strip

- Section eyebrow: `Press Enquiries`, centered.
- Two-column grid below:
  - Left: `Working on a story? <em>Get in touch.</em>` (display 300, italic-indigo on second sentence).
  - Right: email link, **same display-serif size as the headline** (`clamp(28px, 2.4vw, 38px)`), no underline, hover → indigo.
- Email: `contact@polytecks.com` (the existing site address).
- The lede paragraph and the "Cambridge, UK · GMT" meta were intentionally removed by the design owner.

## Pager arrows

A small reusable component: prev/next pair of 40×40 circular hairline-bordered
buttons with chevron SVGs. Three states:
- **Idle**: border `var(--line-strong)`, color `var(--ink)`.
- **Hover (enabled)**: border `var(--indigo-bright)`, color `var(--indigo-light)`, bg `rgba(74,84,192,0.08)`.
- **Disabled**: opacity 0.3, cursor `not-allowed`.

Light variant (`.fc-btn-light`) for the publications section: border
`rgba(0,0,0,0.15)`, hover border `var(--indigo)`, hover bg `rgba(74,84,192,0.06)`.

## State management

Everything is local component state — no server data, no global store
required for this page yet.

- `PressSection` owns `const [page, setPage] = useState(1)`.
- `PublicationsSection` owns its own `[page, setPage]`.
- `FeaturedCarousel` owns `const [idx, setIdx] = useState(0)`.

All three components need `"use client"` because they use `useState`. The
page itself can stay a server component if it composes these client
components — that's probably cleanest in the App Router.

## Data shape

See `data.js` — the field set should port to TypeScript verbatim:

```ts
export type PressItem = {
  id: string;
  type: "press" | "podcast";
  outlet: string;
  title: string;
  date: string;          // human "March 2026"
  iso: string;           // sortable "2026-03-04"
  href: string;
  excerpt?: string;      // not currently rendered, kept for future
  featured?: boolean;
  fabricated?: boolean;  // remove the field on real content
};

export type Publication = {
  id: string;
  authors: string[];
  title: string;
  journal: string;
  volume: string;
  pages: string;
  year: number;
  doi: string;
  affiliation: string;
  fabricated?: boolean;
};
```

## Things to flag for the developer doing the port

1. **Reuse, don't duplicate.** `TopNav` (`src/components/top-nav.tsx`) and `Footer` (`src/components/footer/footer.tsx`) already exist — *do not* port `shell.jsx`'s versions of them. Drop the existing ones into `press/page.tsx`.
2. **Section-eyebrow generalisation.** The `Featured / Articles / Publications / Press Enquiries` labels use the same indigo line-flanked treatment as `.eyebrow` in `mission-panel.module.css`. Either extract a shared `<SectionEyebrow>` component, or copy the existing `.eyebrow` selector into a new module — but don't reinvent the rule.
3. **CSS Modules.** Convert all globally-scoped class names to module-scoped (e.g. `.p3-press-row` → `styles.pressRow`). camelCase suggested by your existing pattern.
4. **Fonts.** The prototype loads Google Fonts via a `<link>` tag for speed. Your repo uses `next/font` — register Space Grotesk, Inter, Source Serif 4 (with italic), and JetBrains Mono there if any aren't already loaded.
5. **Image placeholders.** `.img-ph` is a striped CSS gradient with the outlet name as a `data-label`. Replace with `next/image` once real assets exist. Keep the 16:9 aspect ratio.
6. **`fabricated: true` content.** Search both `PRESS_ITEMS` and `PUBLICATIONS` for `fabricated: true` — every such entry is a placeholder I invented for the prototype. Replace before shipping. The `FAB` tag rendering (visible in the prototype) is wired off the same flag, so deleting the flag also removes the badge.
7. **Pagination empty-state.** With current sample data, both sections fit on a single page. The disabled state on the next button is the intended visual; once content exceeds 10 items, pagination activates with no further changes needed.
8. **No new global tokens.** Almost everything in `tokens.css` is already in your `globals.css`. The only genuinely new value is the publications-section paper tone `#f4f4ee` — keep that scoped to the publications module rather than promoting it to a global.
9. **Top-nav active state.** Add `/press` to whatever array drives the top-nav's active link highlighting, if it has one.

## Interactions &amp; behaviour

| Trigger | Result | Easing |
|---|---|---|
| Carousel arrow click | Track translates by one card width | `cubic-bezier(0.16, 1, 0.3, 1)` 0.55s |
| Hover featured card | Background fades to `rgba(168,176,243,0.04)`, image border activates, title shifts indigo, arrow shifts +4px | 0.25s ease |
| Hover press row | `padding-left: 16px`, title → indigo-light, arrow → indigo + 4px | `cubic-bezier(0.16, 1, 0.3, 1)` 0.35s for padding, 0.25s for colour |
| Pager click on disabled state | No-op (button has `disabled` attribute) | — |
| Hover pager arrow (enabled) | Border + colour shift to indigo, light bg fill | 0.2s ease |

## Responsive

- Both lists collapse to a single-column stack at `max-width: 720px`.
- Featured cards become full-width (one card visible).
- Page header padding tightens to `80px 20px 32px`.

The prototype was designed at 1440px wide and tested down to mobile. Tablet
breakpoints (between 720 and 1100) inherit the desktop layout — the eyebrow
left-arrow trick is centred in this design so no special handling is needed.

## Reference files

Open `p3.html` in a browser to see the live page. The componentry is all
under `p3.jsx` and `shell.jsx`; styling is split across `tokens.css` (global
tokens), `shared.css` (page header, carousel, section eyebrow), and `p3.css`
(press + publications sections, pager).
