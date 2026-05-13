"use client";

import { useEffect, useRef, useState } from "react";
import { TopoCanvas } from "@/lib/topo-canvas";

/**
 * Fixed-position canvas behind the page content that renders the
 * animated topo / contour lines.
 *
 *  - Fades the canvas in over ~600 ms once the first frame has
 *    actually painted, instead of letting the contour lines snap
 *    into existence when the topo loop's first rAF callback fires.
 *    On slower machines / dev mode the first paint can lag the
 *    page's initial render by several hundred ms, which previously
 *    looked jarring.
 *  - Stops the requestAnimationFrame loop when the browser tab is
 *    hidden so it stops competing for CPU in the background.
 */
export function TopoBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const topo = new TopoCanvas(canvas);
    topo.setMode("flow");
    topo.setIntensity(95);
    topo.setDensity(13);
    topo.start();

    // Flip to opacity 1 on the next rAF after starting — the topo
    // class begins drawing on its own rAF, so by the time this
    // microtask runs the first draw has likely happened. Using rAF
    // (rather than setting visible directly) ensures the fade in
    // begins right as paintable content exists, not before.
    const raf = requestAnimationFrame(() => setVisible(true));

    const onVisibility = () => {
      if (document.visibilityState === "hidden") topo.stop();
      else topo.start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      topo.stop();
    };
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
        opacity: visible ? 1 : 0,
        transition: "opacity 600ms ease-out",
      }}
    />
  );
}
