/**
 * Topographic isolines - white lines on black.
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

  setMode(m: Mode) {
    this.mode = m;
  }
  setIntensity(v: number) {
    this.intensity = v / 100;
  }
  setDensity(v: number) {
    this.density = v;
  }

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
        return (-k * 0.12) / (r2 + 0.02);
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
          s +=
            0.12 *
            Math.sin(fx * 6 + c.wx * time + c.wphi) *
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
          const top: [number, number] = [x0 + cw * ipX(v00, v10), y0];
          const right: [number, number] = [x0 + cw, y0 + ch * ipX(v10, v11)];
          const bottom: [number, number] = [x0 + cw * ipX(v01, v11), y0 + ch];
          const left: [number, number] = [x0, y0 + ch * ipX(v00, v01)];
          const seg = (p: [number, number], q: [number, number]) => {
            this.ctx.moveTo(p[0], p[1]);
            this.ctx.lineTo(q[0], q[1]);
          };
          switch (c) {
            case 1:
            case 14:
              seg(left, top);
              break;
            case 2:
            case 13:
              seg(top, right);
              break;
            case 3:
            case 12:
              seg(left, right);
              break;
            case 4:
            case 11:
              seg(right, bottom);
              break;
            case 6:
            case 9:
              seg(top, bottom);
              break;
            case 7:
            case 8:
              seg(left, bottom);
              break;
            case 5:
              seg(left, top);
              seg(right, bottom);
              break;
            case 10:
              seg(top, right);
              seg(left, bottom);
              break;
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
