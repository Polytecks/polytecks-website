# Home Page Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home `RouteStub` with a high-fidelity port of the home page from `legacy/index.html`: hero (split grid + headline word-stagger + charge-link CTAs + arm photo), animated topographic canvas background, mission panel (with `mix-blend-mode: difference`), and partners marquee ribbon.

**Architecture:** Each home-page section is its own component under `src/components/home/`. The topo canvas is a client component that mounts a framework-agnostic `TopoCanvas` class extracted to `src/lib/topo-canvas.ts`. Visual styling for animations / pseudo-elements / blend modes / CSS custom properties uses **co-located CSS Modules** (`*.module.css`) per component — this mirrors the legacy class structure 1:1 for pixel-perfect port. Tailwind 4 utilities are used for layout/spacing/typography only.

**Tech Stack:** Next.js 16.2.4 App Router, React 19.2.4, Tailwind 4, CSS Modules, `next/font` (already wired), `next/image`.

**Why no tests:** This codebase has no test infrastructure (`package.json` has no test runner). Verification is **dev server + visual check at the listed URL** at the end of each task. Type-check via `npm run build` for type-correctness.

**Tweak defaults baked in (from `legacy/README.md`):**
- `layout: "split"` (1.2fr 1fr)
- `arm: "natural"` (filter set on hero arm)
- `headlineAnim: "unblur"` (the default word-in animation)
- `eyebrowStyle: "badge"` (only used on subpages — N/A here)
- `ctaColor: "both-bright"` (--cl-accent: #8e98ee)
- `ctaAnim: "charge"` (520ms underline / 260ms arrow)
- `partnersEffect: "spotlight"`, `partnersSpeed: "medium"` (32s loop)
- `intensity: 95` (topo canvas), `density: 13` (topo canvas)

**Out of scope** (separate phase / plan): About / Technology / Devices / Careers / Contact pages. The Tweaks panel (designer affordance — strip in production per the README handoff). Headline animation variants other than `unblur`. CTA color modes other than `both-bright`. Partners effects other than `spotlight`. Topo canvas pointer modes other than `flow`.

---

## File Structure

**Create:**
- `src/lib/topo-canvas.ts` — framework-agnostic topo isolines class (extracted from `legacy/index.html` lines 2275–2477).
- `src/components/home/charge-link.tsx` + `charge-link.module.css` — the vertical CTA link (label + arrow + animated underline track).
- `src/components/home/hero.tsx` + `hero.module.css` — the split-grid hero (eyebrow, headline with word-stagger, sub-line, two CTAs, arm image).
- `src/components/home/topo-canvas.tsx` — client component that mounts the topo class on a fixed-position canvas with mode `flow`, `intensity: 95`, `density: 13`.
- `src/components/home/mission-panel.tsx` + `mission-panel.module.css` — white panel with `mix-blend-mode: difference` against the canvas behind.
- `src/components/home/partners-ribbon.tsx` + `partners-ribbon.module.css` — marquee with rAF spotlight tracking.

**Modify:**
- `src/app/page.tsx` — replace `RouteStub` with the assembled home page.

---

## Task 1: Charge-link component

Self-contained CTA. No dependencies. Pure CSS hover behavior — no JS needed for the charge animation.

**Files:**
- Create: `src/components/home/charge-link.tsx`
- Create: `src/components/home/charge-link.module.css`

- [ ] **Step 1: Create `charge-link.module.css`**

```css
/* Mirrors legacy/index.html lines 229-304, with shipped defaults baked in:
   - cta-color "both-bright" → --cl-color: #fff, --cl-accent: #8e98ee
   - cta-anim  "charge"      → 520ms underline / 260ms arrow */

.link {
  --cl-color: #fff;
  --cl-accent: #8e98ee;
  --cl-line: rgba(255, 255, 255, 0.18);
  --cl-charge-ms: 520ms;
  --cl-arrow-ms: 260ms;

  appearance: none;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  display: block;
  width: 100%;
  font-family: var(--font-display);
  color: var(--cl-color);
  text-align: left;
  text-decoration: none;
}

.label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: clamp(20px, 1.7vw, 26px);
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.1;
  padding: 6px 0 10px;
  transition: color 0.25s, transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
  transform-origin: left center;
}

.arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 1em;
  height: 1em;
  color: var(--cl-color);
  transform: translateX(0);
  transition: transform var(--cl-arrow-ms) cubic-bezier(0.2, 0.8, 0.2, 1),
              filter var(--cl-arrow-ms) ease,
              color var(--cl-arrow-ms) ease;
  transition-delay: 0s;
}

.arrow svg {
  width: 100%;
  height: 100%;
  display: block;
}

.track {
  position: relative;
  display: block;
  height: 8px;
  width: 100%;
}

.track::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 1px;
  height: 1px;
  background: var(--cl-line);
}

.fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 2px;
  width: 0;
  background: var(--cl-accent);
  box-shadow: 0 0 10px var(--cl-accent);
  transition: width var(--cl-charge-ms) cubic-bezier(0.6, 0.05, 0.2, 1);
}

.link:hover .fill {
  width: 100%;
}

.link:hover .arrow {
  transform: translateX(6px);
  color: var(--cl-accent);
  transition-delay: var(--cl-charge-ms);
}

.link:hover .label {
  color: var(--cl-accent);
}

@media (prefers-reduced-motion: reduce) {
  .fill,
  .arrow,
  .label {
    transition: none !important;
  }
}
```

- [ ] **Step 2: Create `charge-link.tsx`**

```tsx
import Link from "next/link";
import styles from "./charge-link.module.css";

export function ChargeLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={styles.link}>
      <span className={styles.label}>
        <span>{label}</span>
        <span className={styles.arrow} aria-hidden="true">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5" />
          </svg>
        </span>
      </span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.fill} />
      </span>
    </Link>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npm run build` (or in another terminal during dev: `npx tsc --noEmit`)
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/charge-link.tsx src/components/home/charge-link.module.css
git commit -m "feat(home): add ChargeLink CTA component"
```

---

## Task 2: Hero component (without topo canvas)

Static hero structure. No JS behavior — word-stagger animation is pure CSS via `--wi` custom property.

**Files:**
- Create: `src/components/home/hero.tsx`
- Create: `src/components/home/hero.module.css`

- [ ] **Step 1: Create `hero.module.css`**

```css
/* Mirrors legacy/index.html lines 70-152, 217-227, 791-816, with shipped defaults:
   - layout "split"       → grid-template-columns: 1.2fr 1fr
   - arm "natural"        → tuned drop-shadow filter
   - headlineAnim "unblur"→ blur→focus drift-in word stagger */

.hero {
  position: relative;
  min-height: calc(100vh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: hidden;
}

.gridOverlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
}

.vignette {
  position: fixed;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: radial-gradient(ellipse 90% 70% at 50% 50%, transparent 40%, rgba(10, 10, 14, 0.7) 100%);
}

.content {
  position: relative;
  z-index: 4;
  width: 100%;
  max-width: 1600px;
  display: grid;
  gap: clamp(40px, 5vw, 96px);
  align-items: center;
  grid-template-columns: 1.2fr 1fr;
}

@media (max-width: 960px) {
  .content {
    grid-template-columns: 1fr;
  }
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--indigo-bright);
  text-transform: uppercase;
  letter-spacing: 0.25em;
  margin-bottom: 28px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.eyebrow::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--indigo-bright);
  box-shadow: 0 0 12px var(--indigo-bright);
  animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}

.headline {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(40px, 5.4vw, 120px);
  line-height: 1.02;
  letter-spacing: -0.035em;
  margin-bottom: 28px;
  text-wrap: balance;
}

.nowrap {
  white-space: nowrap;
}

.window {
  display: inline-block;
  font-weight: 500;
  font-style: italic;
  position: relative;
  color: #6a74dc;
  text-shadow: 0 0 28px rgba(106, 116, 220, 0.5);
}

.window::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.06em;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(106, 116, 220, 0.75), transparent);
}

.word {
  display: inline-block;
  white-space: pre;
  will-change: transform, opacity, filter;
  animation: hl-unblur 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(var(--wi, 0) * 110ms);
}

@keyframes hl-unblur {
  from {
    opacity: 0;
    filter: blur(18px);
    letter-spacing: 0.08em;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    filter: blur(0);
    letter-spacing: -0.035em;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .word { animation: none !important; }
}

.sub {
  font-family: var(--font-sans);
  font-weight: 400;
  font-size: clamp(19px, 1.4vw, 28px);
  line-height: 1.5;
  color: #e8e9f0;
  max-width: clamp(520px, 42vw, 720px);
  margin-bottom: 64px;
  text-shadow: 0 1px 20px rgba(0, 0, 0, 0.6);
}

.ctas {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  width: clamp(420px, 36vw, 620px);
  max-width: 100%;
}

.arm {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arm img {
  width: 100%;
  max-width: clamp(520px, 48vw, 860px);
  height: auto;
  /* arm "natural" treatment from legacy lines 801-803 */
  filter: contrast(1.1) saturate(1.15)
    drop-shadow(0 0 26px rgba(255, 255, 255, 0.18))
    drop-shadow(0 24px 70px rgba(0, 0, 0, 0.9));
}

.arm::before {
  content: "";
  position: absolute;
  inset: 10%;
  z-index: -1;
  background: radial-gradient(circle, rgba(74, 84, 192, 0.25) 0%, transparent 65%);
  filter: blur(30px);
}

.arm::after {
  content: "";
  position: absolute;
  inset: 5% 8%;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(ellipse at 45% 55%, rgba(10, 10, 20, 0.85) 0%, rgba(10, 10, 14, 0.55) 45%, transparent 75%);
  filter: blur(20px);
}
```

- [ ] **Step 2: Create `hero.tsx`**

```tsx
import Image from "next/image";
import { ChargeLink } from "./charge-link";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.gridOverlay} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={styles.content}>
        <div>
          <p className={styles.eyebrow}>R&D · Cambridge UK</p>

          <h1 className={styles.headline}>
            <span className={styles.nowrap}>
              <span className={styles.word} style={{ ["--wi" as string]: 0 }}>Making</span>{" "}
              <span className={styles.word} style={{ ["--wi" as string]: 1 }}>the</span>{" "}
              <span className={styles.word} style={{ ["--wi" as string]: 2 }}>Skin</span>
            </span>
            <br />
            <span className={styles.nowrap}>
              <span className={styles.word} style={{ ["--wi" as string]: 3 }}>a</span>{" "}
              <span className={`${styles.word} ${styles.window}`} style={{ ["--wi" as string]: 4 }}>Window</span>
            </span>{" "}
            <span className={styles.word} style={{ ["--wi" as string]: 5 }}>into</span>
            <br />
            <span className={styles.word} style={{ ["--wi" as string]: 6 }}>the</span>{" "}
            <span className={styles.word} style={{ ["--wi" as string]: 7 }}>Body</span>
          </h1>

          <p className={styles.sub}>
            Advanced bioelectrical mapping for enhanced diagnostics
          </p>

          <div className={styles.ctas}>
            <ChargeLink href="/technology" label="The Science" />
            <ChargeLink href="/devices" label="View Devices" />
          </div>
        </div>

        <div className={styles.arm}>
          <Image
            src="/assets/polytecks-arm-v2.png"
            alt="Polytecks hexagonal electrode array on forearm"
            width={1200}
            height={1200}
            priority
            sizes="(max-width: 960px) 100vw, 48vw"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire into the home page (temporary — no canvas yet)**

Replace `src/app/page.tsx` contents with:

```tsx
import { Hero } from "@/components/home/hero";

export default function HomePage() {
  return <Hero />;
}
```

- [ ] **Step 4: Visual check**

Run: `npm run dev`
Open: `http://localhost:3000`
Expected:
- Headline reads "Making the Skin / a *Window* into / the Body" with "Window" italic + indigo (#6a74dc) + glow + faded underline.
- Words animate in (blur → focus, drift up) with ~110ms stagger.
- Eyebrow "R&D · Cambridge UK" with pulsing indigo dot at left.
- Sub-line below headline.
- Two stacked CTAs ("The Science", "View Devices") at left; hovering each grows a 2px indigo-light underline left→right over 520ms; once full, the arrow nudges right by 6px and the label shifts to indigo-light.
- Forearm photo with electrode array on the right (with subtle drop-shadow + radial halo behind it).
- Below ~960px width, content stacks to single column.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/hero.tsx src/components/home/hero.module.css src/app/page.tsx
git commit -m "feat(home): port hero (split grid, headline word-stagger, CTAs, arm photo)"
```

---

## Task 3: Topo canvas — extract framework-agnostic class

The legacy script uses module-level `document.getElementById('topo-canvas')`. We'll refactor to a class that takes a canvas element in its constructor so React can own the lifecycle.

**Files:**
- Create: `src/lib/topo-canvas.ts`

- [ ] **Step 1: Create `src/lib/topo-canvas.ts`**

```ts
/**
 * Topographic isolines — white lines on black.
 * Ported from legacy/index.html lines 2275-2477.
 *
 * Scalar field F(x,y,t) sampled on a 100x60 grid, traced with marching squares
 * at evenly-spaced thresholds that slowly phase-shift so contours rise/fall
 * like a breathing surface. Pointer movement adds a local field contribution.
 */

type Mode = "flow" | "ripple" | "attract" | "vortex";

interface Center {
  x: number;
  y: number;
  vx: number;
  vy: number;
  amp: number;
  sigma: number;
  omega: number;
  phi: number;
  wx: number;
  wy: number;
  wphi: number;
}

const GW = 100;
const GH = 60;
const N = 7;

export class TopoCanvas {
  private ctx: CanvasRenderingContext2D;
  private field = new Float32Array(GW * GH);
  private W = 0;
  private H = 0;
  private DPR = 1;
  private mode: Mode = "flow";
  private intensity = 0.7;
  private density = 14;
  private running = false;
  private raf = 0;
  private mouse = { x: 0.5, y: 0.5, amp: 0, active: false, sx: 0.5, sy: 0.5 };
  private centers: Center[];

  private readonly onResize = () => this.resize();
  private readonly onPointerMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = (e.clientX - r.left) / r.width;
    this.mouse.y = (e.clientY - r.top) / r.height;
    this.mouse.active = true;
  };
  private readonly onPointerLeave = () => {
    this.mouse.active = false;
  };

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("TopoCanvas: 2D context unavailable");
    this.ctx = ctx;
    this.centers = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00006,
      vy: (Math.random() - 0.5) * 0.00006,
      amp: 0.6 + Math.random() * 0.7,
      sigma: 0.22 + Math.random() * 0.18,
      omega: 0.25 + Math.random() * 0.35,
      phi: Math.random() * Math.PI * 2,
      wx: 0.15 + Math.random() * 0.25,
      wy: 0.15 + Math.random() * 0.25,
      wphi: Math.random() * Math.PI * 2,
    }));
  }

  setMode(m: Mode) { this.mode = m; }
  setIntensity(v: number) { this.intensity = v / 100; }
  setDensity(v: number) { this.density = v; }

  start() {
    if (this.running) return;
    this.running = true;
    this.resize();
    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerleave", this.onPointerLeave);
    this.raf = requestAnimationFrame((t) => this.draw(t));
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerleave", this.onPointerLeave);
  }

  private resize() {
    this.DPR = Math.min(window.devicePixelRatio || 1, 2);
    const r = this.canvas.getBoundingClientRect();
    this.W = Math.max(1, r.width);
    this.H = Math.max(1, r.height);
    this.canvas.width = this.W * this.DPR;
    this.canvas.height = this.H * this.DPR;
    this.ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
  }

  private mouseContribution(fx: number, fy: number, t: number) {
    const dx = fx - this.mouse.sx;
    const dy = fy - this.mouse.sy;
    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(r2);
    const sigma = 0.2;
    const s2 = sigma * sigma;
    const k = this.mouse.amp * 0.75;
    if (k < 0.001) return 0;
    switch (this.mode) {
      case "ripple":
        return k * Math.cos(12 * r - 4 * t) * Math.exp(-r2 / s2);
      case "attract":
        return -k * 0.12 / (r2 + 0.02);
      case "vortex": {
        const theta = Math.atan2(dy, dx);
        return k * theta * 0.35 * Math.exp(-r2 / (s2 * 1.4));
      }
      default:
        return k * 0.7 * Math.exp(-r2 / s2);
    }
  }

  private updateField(time: number) {
    for (const c of this.centers) {
      c.x += c.vx;
      c.y += c.vy;
      if (c.x < -0.2) c.x = 1.2;
      if (c.x > 1.2) c.x = -0.2;
      if (c.y < -0.2) c.y = 1.2;
      if (c.y > 1.2) c.y = -0.2;
    }
    for (let j = 0; j < GH; j++) {
      const fy = j / (GH - 1);
      for (let i = 0; i < GW; i++) {
        const fx = i / (GW - 1);
        let s = 0;
        for (const c of this.centers) {
          const dx = fx - c.x;
          const dy = fy - c.y;
          const r2 = dx * dx + dy * dy;
          const s2 = c.sigma * c.sigma;
          const bump = Math.exp(-r2 / s2);
          s += c.amp * bump * Math.cos(c.omega * time + c.phi);
          s += 0.12 * Math.sin(fx * 6 + c.wx * time + c.wphi) *
                      Math.cos(fy * 5 + c.wy * time);
        }
        s += this.mouseContribution(fx, fy, time);
        this.field[j * GW + i] = s;
      }
    }
  }

  private renderIsolines(thresholds: number[], lineAlpha: number, lineWidth: number) {
    const cw = this.W / (GW - 1);
    const ch = this.H / (GH - 1);
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`;
    this.ctx.beginPath();
    for (const th of thresholds) {
      for (let j = 0; j < GH - 1; j++) {
        for (let i = 0; i < GW - 1; i++) {
          const v00 = this.field[j * GW + i];
          const v10 = this.field[j * GW + i + 1];
          const v01 = this.field[(j + 1) * GW + i];
          const v11 = this.field[(j + 1) * GW + i + 1];
          const c =
            (v00 > th ? 1 : 0) |
            (v10 > th ? 2 : 0) |
            (v11 > th ? 4 : 0) |
            (v01 > th ? 8 : 0);
          if (c === 0 || c === 15) continue;
          const x0 = i * cw;
          const y0 = j * ch;
          const ipX = (a: number, b: number) => (th - a) / (b - a || 1e-6);
          const top: [number, number]    = [x0 + cw * ipX(v00, v10), y0];
          const right: [number, number]  = [x0 + cw, y0 + ch * ipX(v10, v11)];
          const bottom: [number, number] = [x0 + cw * ipX(v01, v11), y0 + ch];
          const left: [number, number]   = [x0, y0 + ch * ipX(v00, v01)];
          const seg = (p: [number, number], q: [number, number]) => {
            this.ctx.moveTo(p[0], p[1]);
            this.ctx.lineTo(q[0], q[1]);
          };
          switch (c) {
            case 1: case 14: seg(left, top); break;
            case 2: case 13: seg(top, right); break;
            case 3: case 12: seg(left, right); break;
            case 4: case 11: seg(right, bottom); break;
            case 6: case 9:  seg(top, bottom); break;
            case 7: case 8:  seg(left, bottom); break;
            case 5:  seg(left, top); seg(right, bottom); break;
            case 10: seg(top, right); seg(left, bottom); break;
          }
        }
      }
    }
    this.ctx.stroke();
  }

  private draw(t: number) {
    if (!this.running) return;
    this.raf = requestAnimationFrame((tt) => this.draw(tt));
    const time = t * 0.0004;

    const target = this.mouse.active ? 1 : 0;
    this.mouse.amp += (target - this.mouse.amp) * 0.05;
    this.mouse.sx += (this.mouse.x - this.mouse.sx) * 0.18;
    this.mouse.sy += (this.mouse.y - this.mouse.sy) * 0.18;

    this.updateField(time);

    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.W, this.H);

    const phase = time * 0.25;
    const base: number[] = [];
    const count = Math.max(4, Math.round(this.density));
    const span = 2.6;
    const low = -1.1;
    const step = span / count;
    for (let i = 0; i < count; i++) {
      base.push(low + step * (i + 0.5 + 0.25 * Math.sin(phase + i * 0.6)));
    }

    this.renderIsolines(base, 0.09 * this.intensity, 2.4);
    this.renderIsolines(base, 0.55 * this.intensity, 1.0);
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npm run build` (will fail at the not-yet-created TopoCanvas component, but `tsc --noEmit` should pass for `topo-canvas.ts` itself; alternatively just lint-check). Use:

Run: `npx tsc --noEmit`
Expected: no errors specific to `src/lib/topo-canvas.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/topo-canvas.ts
git commit -m "feat(home): extract framework-agnostic TopoCanvas class"
```

---

## Task 4: Topo canvas React component

Client component that owns the canvas lifecycle. Mounts on home only (because it's only rendered from `app/page.tsx`).

**Files:**
- Create: `src/components/home/topo-canvas.tsx`

- [ ] **Step 1: Create `topo-canvas.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { TopoCanvas } from "@/lib/topo-canvas";

export function TopoBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const topo = new TopoCanvas(canvas);
    topo.setMode("flow");
    topo.setIntensity(95);
    topo.setDensity(13);
    topo.start();
    return () => topo.stop();
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
```

- [ ] **Step 2: Wire into home page**

Replace `src/app/page.tsx`:

```tsx
import { Hero } from "@/components/home/hero";
import { TopoBackground } from "@/components/home/topo-canvas";

export default function HomePage() {
  return (
    <>
      <TopoBackground />
      <Hero />
    </>
  );
}
```

- [ ] **Step 3: Visual check**

Run: `npm run dev`
Open: `http://localhost:3000`
Expected:
- Background: white topographic isolines on black, slowly breathing.
- Move pointer: a soft Gaussian "bump" follows under the cursor (lines deflect toward it).
- Move pointer out of viewport: bump fades over ~1s.
- Navigate to `/about` (click About in nav): canvas unmounts (no rAF running).

To verify unmount: in DevTools console on `/about`, run `performance.now()` repeatedly; CPU should be quiet. Or set a `console.log("rAF tick")` inside `draw()` temporarily to confirm it stops on navigation away (remove before commit).

- [ ] **Step 4: Commit**

```bash
git add src/components/home/topo-canvas.tsx src/app/page.tsx
git commit -m "feat(home): mount topographic canvas background on home route"
```

---

## Task 5: Mission panel

Sits below the hero. White panel with `mix-blend-mode: difference` against the topo canvas, so the white lines invert to black on the panel.

**Files:**
- Create: `src/components/home/mission-panel.tsx`
- Create: `src/components/home/mission-panel.module.css`

- [ ] **Step 1: Create `mission-panel.module.css`**

```css
/* Mirrors legacy/index.html lines 627-693.
   The .fill div sits absolutely behind the inner content with
   mix-blend-mode: difference. Inner content is z-index 1 (no blend mode)
   so text reads as authored — black text on the inverted white panel. */

.panel {
  position: relative;
  z-index: 4;
  padding: clamp(80px, 12vh, 160px) 40px clamp(80px, 12vh, 140px);
  overflow: hidden;
  background: #000;
}

.fill {
  position: absolute;
  inset: 0;
  background: #f4f4f1;
  mix-blend-mode: difference;
  pointer-events: none;
}

.inner {
  position: relative;
  z-index: 1;
  max-width: 920px;
  margin: 0 auto;
  color: #0a0a0e;
  text-align: center;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: #4a54c0;
  margin-bottom: 28px;
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

.eyebrow::before,
.eyebrow::after {
  content: "";
  width: 28px;
  height: 1px;
  background: #4a54c0;
  opacity: 0.6;
}

.headline {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(40px, 5vw, 88px);
  line-height: 1.02;
  letter-spacing: -0.035em;
  color: #0a0a0e;
  margin-bottom: 36px;
  text-wrap: balance;
}

.lede {
  font-family: var(--font-sans);
  font-weight: 300;
  font-size: clamp(18px, 1.4vw, 24px);
  line-height: 1.55;
  color: #2a2c36;
  max-width: 720px;
  margin: 0 auto 56px;
  text-wrap: pretty;
}

.meta {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #4a4c5a;
}

.metaDot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #4a54c0;
  opacity: 0.6;
}
```

- [ ] **Step 2: Create `mission-panel.tsx`**

```tsx
import styles from "./mission-panel.module.css";

export function MissionPanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.fill} aria-hidden="true" />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Our Mission</p>
        <h2 className={styles.headline}>Make the body legible.</h2>
        <p className={styles.lede}>
          We are turning the skin into a high-resolution interface to the body&apos;s
          electrical activity — so clinicians can see, earlier and more clearly,
          what the heart, the muscles, and the nervous system are saying.
        </p>
        <div className={styles.meta}>
          <span>Cambridge, UK</span>
          <span className={styles.metaDot} aria-hidden="true" />
          <span>Founded 2024</span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire into home page**

Update `src/app/page.tsx`:

```tsx
import { Hero } from "@/components/home/hero";
import { MissionPanel } from "@/components/home/mission-panel";
import { TopoBackground } from "@/components/home/topo-canvas";

export default function HomePage() {
  return (
    <>
      <TopoBackground />
      <Hero />
      <MissionPanel />
    </>
  );
}
```

- [ ] **Step 4: Visual check**

Run: `npm run dev`
Open: `http://localhost:3000` and scroll past the hero.
Expected:
- White panel appears below hero with eyebrow "Our Mission" (indigo, with two flanking lines), big headline "Make the body legible." (Space Grotesk 300), lede paragraph in mid-grey, meta row "Cambridge, UK · Founded 2024".
- The topographic lines from the canvas behind appear as **dark/black lines on the white panel** (because of `mix-blend-mode: difference`). They animate in sync with the rest of the canvas.
- Text in the panel reads cleanly (black on white) — not inverted.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/mission-panel.tsx src/components/home/mission-panel.module.css src/app/page.tsx
git commit -m "feat(home): add mission panel with mix-blend-mode difference"
```

---

## Task 6: Partners ribbon

Marquee with seamless loop (list rendered twice, animated `translateX(0 → -50%)`) and rAF-driven spotlight on the item nearest viewport center.

**Files:**
- Create: `src/components/home/partners-ribbon.tsx`
- Create: `src/components/home/partners-ribbon.module.css`

- [ ] **Step 1: Create `partners-ribbon.module.css`**

```css
/* Mirrors legacy/index.html lines 695-789. Defaults: speed=medium (32s), effect=spotlight. */

.ribbon {
  position: relative;
  z-index: 4;
  padding: 56px 0 40px;
  margin-top: 24px;
  border-top: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(10, 10, 14, 0.6), rgba(10, 10, 14, 0.95));
}

.label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--indigo-bright);
  text-transform: uppercase;
  letter-spacing: 0.3em;
  text-align: center;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.label::before,
.label::after {
  content: "";
  flex: 0 0 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(168, 176, 243, 0.5));
}

.label::after {
  background: linear-gradient(90deg, rgba(168, 176, 243, 0.5), transparent);
}

.trackWrap {
  position: relative;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
}

.track {
  display: flex;
  gap: clamp(56px, 8vw, 120px);
  width: max-content;
  animation: slide 32s linear infinite;
  align-items: center;
}

@keyframes slide {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.item {
  flex: 0 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: grayscale(1) brightness(1.6) contrast(0.9);
  opacity: 0.55;
  transition: opacity 0.4s, filter 0.4s, transform 0.4s;
}

.item:hover {
  opacity: 1;
  filter: grayscale(0) brightness(1) contrast(1);
  transform: scale(1.08);
}

.text {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(18px, 1.6vw, 24px);
  letter-spacing: -0.01em;
  color: #d8dae5;
  white-space: nowrap;
}

.text em {
  font-style: italic;
  font-weight: 300;
  color: #a0a4b5;
}

.isCenter {
  opacity: 1;
  filter: grayscale(0) brightness(1) contrast(1);
}

.isNear {
  opacity: 0.8;
  filter: grayscale(0.3) brightness(1.2) contrast(0.95);
}
```

- [ ] **Step 2: Create `partners-ribbon.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import styles from "./partners-ribbon.module.css";

const PARTNERS: { name: string; styled: React.ReactNode }[] = [
  { name: "University of Cambridge", styled: <>University of <em>Cambridge</em></> },
  { name: "NHS",                     styled: <><em>NHS</em> Innovation</> },
  { name: "Innovate UK",             styled: <>Innovate <em>UK</em></> },
  { name: "Royal Veterinary College",styled: <>Royal <em>Veterinary</em> College</> },
  { name: "EPSRC",                   styled: <>EPSRC</> },
  { name: "Wellcome Trust",          styled: <><em>Wellcome</em> Trust</> },
  { name: "Cambridge Enterprise",    styled: <>Cambridge <em>Enterprise</em></> },
  { name: "BHF",                     styled: <>British Heart <em>Foundation</em></> },
];

export function PartnersRibbon() {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const ribbon = ribbonRef.current;
      const track = trackRef.current;
      if (!ribbon || !track) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const wrapRect = ribbon.getBoundingClientRect();
      const center = wrapRect.left + wrapRect.width / 2;
      const items = Array.from(track.querySelectorAll<HTMLElement>(`.${styles.item}`));
      let nearest: HTMLElement | null = null;
      let nearestDist = Infinity;
      const measured: { el: HTMLElement; d: number }[] = [];
      for (const el of items) {
        const r = el.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - center);
        measured.push({ el, d });
        if (d < nearestDist) {
          nearestDist = d;
          nearest = el;
        }
      }
      for (const { el, d } of measured) {
        el.classList.toggle(styles.isCenter, el === nearest);
        el.classList.toggle(styles.isNear, el !== nearest && d < 220);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  // Render the list twice for the seamless 0 → -50% loop.
  const items = [...PARTNERS, ...PARTNERS];

  return (
    <div ref={ribbonRef} className={styles.ribbon}>
      <div className={styles.label}>Our Investors and Partners</div>
      <div className={styles.trackWrap}>
        <div ref={trackRef} className={styles.track}>
          {items.map((p, i) => (
            <div key={`${p.name}-${i}`} className={styles.item}>
              <span className={styles.text}>{p.styled}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire into home page**

Update `src/app/page.tsx`:

```tsx
import { Hero } from "@/components/home/hero";
import { MissionPanel } from "@/components/home/mission-panel";
import { PartnersRibbon } from "@/components/home/partners-ribbon";
import { TopoBackground } from "@/components/home/topo-canvas";

export default function HomePage() {
  return (
    <>
      <TopoBackground />
      <Hero />
      <MissionPanel />
      <PartnersRibbon />
    </>
  );
}
```

- [ ] **Step 4: Visual check**

Run: `npm run dev`
Open: `http://localhost:3000` and scroll to the bottom.
Expected:
- Below the mission panel: a "Our Investors and Partners" label centered with hairline brackets either side.
- Marquee of 8 partner names (Cambridge, NHS, Innovate UK, RVC, EPSRC, Wellcome, Cambridge Enterprise, BHF) scrolling continuously left, looping seamlessly.
- The item nearest to viewport horizontal center is brighter/full-color; neighbors within ~220px are slightly brighter than the rest.
- Edges of the ribbon fade out via mask-image.
- Hovering an item brightens it and scales 1.08.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/partners-ribbon.tsx src/components/home/partners-ribbon.module.css src/app/page.tsx
git commit -m "feat(home): add partners marquee ribbon with spotlight tracking"
```

---

## Task 7: Final verification

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: successful build with no type errors. Note any warnings about `next/image` sizing or `next/font` — fix if present.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors. Fix any warnings.

- [ ] **Step 3: Cross-route navigation check**

Run: `npm run dev`
- Land on `/`. Confirm topo canvas visible, animating.
- Click "About Us" in nav. Confirm canvas no longer rendered (inspect DOM — no `<canvas>`), no rAF loop running.
- Click logo / "Polytecks" to return home. Confirm canvas remounts and runs again.
- Click "The Science" CTA on hero — confirm route change to `/technology`.
- Click "View Devices" CTA — confirm route change to `/devices`.

- [ ] **Step 4: Reduced-motion check**

In OS settings or DevTools "Emulate CSS prefers-reduced-motion: reduce", reload `/`.
Expected:
- Headline words appear immediately (no blur/drift animation).
- Charge-link CTA hover transitions are instant.
- Eyebrow pulse and partners marquee continue (these are decorative and not gated by prefers-reduced-motion in legacy — preserved for fidelity; if user feedback says otherwise, gate them later).
- Topo canvas keeps animating (pointer-driven only — not gated; legacy parity).

- [ ] **Step 5: Mobile check**

Resize viewport below 960px.
Expected:
- Hero content stacks (copy on top, arm photo below).
- Headline/sub-line/CTAs remain readable; no horizontal scroll.

---

## Self-review notes

**Spec coverage check** (against `legacy/README.md` Home section):
- ✅ Eyebrow chip "R&D · Cambridge UK" (Task 2)
- ✅ Headline with italic indigo "Window" + glow + underline (Task 2)
- ✅ Word-by-word `unblur` headline animation (Task 2)
- ✅ Sub-line "Advanced bioelectrical mapping for enhanced diagnostics" (Task 2)
- ✅ Two stacked charge-link CTAs with default `both-bright` color and `charge` anim (Tasks 1+2)
- ✅ Forearm hero image with `natural` arm treatment filter (Task 2)
- ✅ Animated topographic canvas, 7 drifting Gaussian centers, marching squares, default `flow` mouse mode (Tasks 3+4)
- ✅ Mount/unmount on home only (Task 4 — gated by component presence on `/` route)
- ✅ Mission panel with `mix-blend-mode: difference` and proper z-layering (Task 5)
- ✅ Partners ribbon with seamless marquee + rAF spotlight (Task 6)

**Out of scope (intentionally deferred):**
- Dev-only Tweaks panel — bake-defaults strategy used; panel not ported.
- Tweak axis variants beyond shipped defaults (other layouts, headline anims, CTA colors, partners effects, btn styles, eyebrow styles).
- The `data-headline-anim`, `data-cta-color`, `data-cta-anim`, `data-partners-effect` body attributes — defaults baked into CSS so no body-attribute switching.
