# Prompt to paste into Claude Code

I'm adding a new `/press` page to the Polytecks website. The design is in
`design_handoff_press_page/` — start by reading `README.md` there, then
opening `p3.html` in a browser to see the live prototype. Treat the HTML
files as **design references**, not code to copy. Recreate the design inside
this Next.js codebase using its existing patterns (App Router, TypeScript,
CSS Modules, the token system in `src/app/globals.css`, and the existing
components in `src/components/`).

## What to do

1. **Read first.** Read `design_handoff_press_page/README.md` completely
   before you start. It lists every section, its tokens, its interactions,
   and — most importantly — the existing components and tokens in this
   codebase that you should reuse rather than duplicate. Then skim the
   prototype files (`p3.jsx`, `shell.jsx`, `p3.css`, `shared.css`) for the
   exact layout values.

2. **Create the route** at `src/app/press/page.tsx`. Compose it from the
   components you build in step 4. Use my existing `TopNav`
   (`src/components/top-nav.tsx`) and `Footer`
   (`src/components/footer/footer.tsx`) — do **not** port the prototype's
   `TopNav` / `Footer` from `shell.jsx`, those are duplicates of what I
   already have.

3. **Create the data file** at `src/data/press.ts`. Port `PRESS_ITEMS` and
   `PUBLICATIONS` from `design_handoff_press_page/data.js` to typed exports
   (the README has the exact `PressItem` and `Publication` types). Keep the
   `fabricated: true` flags as-is — they're a placeholder marker I want to
   keep visible during review.

4. **Create components** under `src/components/press/`:
   - `section-eyebrow.tsx` — generalise the line-flanked indigo label from
     `mission-panel.module.css → .eyebrow`. Used four times on this page
     (Featured / Articles / Publications / Press Enquiries). Support a
     `light` variant for the inverted publications section.
   - `featured-carousel.tsx` — 5-item, two-up carousel with prev/next arrows
     and a tick progress bar. **Pay attention to the hover halo** — the
     prototype has `padding: 24px; margin: -24px;` on the cards and matching
     padding on the viewport so the hover background isn't clipped. Don't
     skip that detail.
   - `press-section.tsx` + `press-row.tsx` — paginated list of press items,
     10 per page. Two-tone tag pills (`Article` cool / `Podcast` warm).
   - `publications-section.tsx` + `publication-block.tsx` — paginated
     numbered bibliography on the **light/paper-tone** surface
     (`#f4f4ee`). Source Serif 4 for the paper titles, italic for journal
     names — this is intentional, signals the "record" register.
   - `pager-arrows.tsx` — shared component, two variants (dark / light).

5. **Convert the styling** to CSS Modules alongside each component. Use the
   tokens in `src/app/globals.css` — almost everything in the prototype's
   `tokens.css` is already there. The only genuinely new value is
   `#f4f4ee` (publications paper tone), and that should stay scoped to the
   publications module, not promoted to a global.

6. **Mark client components.** `PressSection`, `PublicationsSection`, and
   `FeaturedCarousel` all use `useState` for local pagination/index state
   — they need `"use client"` at the top. The page itself can stay a
   server component.

7. **Add `/press` to the top-nav** active-link logic if it has one.

## Things to keep exactly as designed

- The display headline `Capturing signals from the body. <em>Generating signals in the world.</em>` — italic-indigo emphasis on the **entire** second sentence, not just one word.
- The four section eyebrows — all centered, line-flanked, in indigo.
- The light/paper-tone surface inversion on the publications section. This is the visual move that justifies the layout; don't soften it.
- Pager arrows are disabled (greyed) when there's nothing to page to. The single-page case is the current expected behaviour.
- "Press Enquiries" strip has only the headline and the email — the lede and "Cambridge, UK · GMT" meta were removed by intent.
- The press list's top hairline matches the row width (not section width). Same for publications.
- `Featured` carousel cards have **no description/excerpt** — image, meta, title, "Read article →" only.

## Things you should change from the prototype

- All globally-scoped class names (`.p3-press-row`, `.fc-card`, etc.) become
  module-scoped (`styles.pressRow`, `styles.fcCard`).
- `.img-ph` placeholder gradients → `next/image` (keep 16:9 aspect ratio).
- `<link>` Google Fonts → `next/font` declarations in `layout.tsx`
  (Space Grotesk, Inter, Source Serif 4 with italic, JetBrains Mono).
- Anything in `tokens.css` that already exists in `globals.css` should be
  dropped, not duplicated. `globals.css` wins.

## When you're done

Walk me through:
1. The final file list under `src/app/press/` and `src/components/press/`.
2. Any tokens you added to `globals.css` (should be at most one — the paper tone — and ideally zero).
3. Anything you couldn't port cleanly and want to discuss.

Then run a build and a visual smoke-test in dev (`npm run dev`, navigate to
`/press`) and confirm the page renders without console errors.
