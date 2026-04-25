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
