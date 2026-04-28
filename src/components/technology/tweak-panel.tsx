"use client";

import { useEffect, useState } from "react";
import { useTweaks } from "@/lib/use-tweaks";
import { PillarsTab } from "./tweak-tabs/pillars-tab";
import { ProofTab } from "./tweak-tabs/proof-tab";
import { PageFxTab } from "./tweak-tabs/page-fx-tab";
import { SpacingTab } from "./tweak-tabs/spacing-tab";
import styles from "./tweak-panel.module.css";

type TabId = "pillars" | "proof" | "page-fx" | "spacing";

const TABS: { id: TabId; label: string }[] = [
  { id: "pillars",  label: "Pillars" },
  { id: "proof",    label: "Proof" },
  { id: "page-fx",  label: "Page Fx" },
  { id: "spacing",  label: "Spacing" },
];

const TAB_STORAGE_KEY = "polytecks:tweaks:tab";

export function TweakPanel() {
  const [enabled, setEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("pillars");
  const [snapshotMsg, setSnapshotMsg] = useState<string | null>(null);
  const { values, reset } = useTweaks();

  useEffect(() => {
    const check = () => {
      const params = new URLSearchParams(window.location.search);
      setEnabled(params.get("tweaks") === "1");
    };
    check();
    window.addEventListener("popstate", check);
    return () => window.removeEventListener("popstate", check);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TAB_STORAGE_KEY) as TabId | null;
      if (stored && TABS.some((t) => t.id === stored)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveTab(stored);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(TAB_STORAGE_KEY, activeTab); } catch { /* ignore */ }
  }, [activeTab]);

  if (!enabled) return null;

  const saveSnapshot = async () => {
    setSnapshotMsg("Saving…");
    try {
      const res = await fetch("/api/tweaks/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (res.ok) setSnapshotMsg(`Saved → ${json.path ?? "tweaks-snapshot.json"}`);
      else        setSnapshotMsg(`Error: ${json.error ?? res.status}`);
    } catch (e) {
      setSnapshotMsg(`Error: ${e instanceof Error ? e.message : "unknown"}`);
    }
    setTimeout(() => setSnapshotMsg(null), 4000);
  };

  return (
    <div className={styles.panel} role="dialog" aria-label="Design tweaks">
      <div className={styles.bar}>
        <span className={styles.title}>Tweaks</span>
        <div>
          <button type="button" className={styles.reset} onClick={reset}>Reset</button>
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
          >
            {collapsed ? "Show" : "Hide"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={styles.tab}
              data-active={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.body} data-collapsed={collapsed}>
        {activeTab === "pillars" && <PillarsTab />}
        {activeTab === "proof"   && <ProofTab />}
        {activeTab === "page-fx" && <PageFxTab />}
        {activeTab === "spacing" && <SpacingTab />}

        <div className={styles.divider} />
        <div className={styles.snapshotRow}>
          <button type="button" className={styles.snapshot} onClick={saveSnapshot}>
            💾 Save snapshot
          </button>
          {snapshotMsg ? <div className={styles.snapshotMsg}>{snapshotMsg}</div> : null}
        </div>
      </div>
    </div>
  );
}
