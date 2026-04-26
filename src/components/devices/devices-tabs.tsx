"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./devices-tabs.module.css";

export type DevicesTab = {
  id: string;
  label: string;
  panel: ReactNode;
};

export function DevicesTabs({ tabs }: { tabs: ReadonlyArray<DevicesTab> }) {
  const [active, setActive] = useState(tabs[0].id);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    transform: string;
    width: number;
  }>({ transform: "translateX(0)", width: 100 });

  useEffect(() => {
    const measure = () => {
      const tab = tabRefs.current[active];
      const container = containerRef.current;
      if (!tab || !container) return;
      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      const offset = tabRect.left - containerRect.left - 5;
      setIndicatorStyle({
        transform: `translateX(${offset}px)`,
        width: tabRect.width,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [active]);

  return (
    <>
      <div className={styles.tabs} ref={containerRef} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`${styles.tab} ${active === tab.id ? styles.active : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <div
          className={styles.indicator}
          style={{
            transform: indicatorStyle.transform,
            width: `${indicatorStyle.width}px`,
          }}
        />
      </div>

      <div className={styles.panels}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            className={`${styles.panel} ${active === tab.id ? styles.active : ""}`}
          >
            {tab.panel}
          </div>
        ))}
      </div>
    </>
  );
}
