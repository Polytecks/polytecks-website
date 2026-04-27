"use client";

import {
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { useTweaks } from "@/lib/use-tweaks";
import styles from "./animated-title.module.css";

/**
 * Wraps title content and animates it on mount per the active tweak choice.
 *
 * - `wipe` and `stack` operate per line. The split point is the literal `\n` or
 *   `<br />`; for our subpage titles which use `<>One <em>two</em></>` and
 *   no explicit line breaks, both are treated as one line each.
 * - `cascade` operates per character, walking the React tree.
 *
 * Re-renders on style change because the React key includes the style id —
 * cheap because animations only fire on mount.
 */
export function AnimatedTitle({ children }: { children: ReactNode }) {
  const { values } = useTweaks();
  const style = values.titleAnim;
  const key = `${style}-${values.titleDurationMs}-${values.titleStaggerMs}`;

  if (style === "cascade") {
    let charIndex = 0;
    const wrap = (node: ReactNode): ReactNode => {
      if (typeof node === "string") {
        return node.split("").map((c) => {
          if (c === " ") return c;
          const idx = charIndex++;
          return (
            <span
              key={idx}
              className={styles.cascadeChar}
              style={{ ["--tw-title-ci" as string]: idx } as CSSProperties}
            >
              {c}
            </span>
          );
        });
      }
      if (Array.isArray(node)) return node.map(wrap);
      if (isValidElement(node)) {
        const el = node as ReactElement<{ children?: ReactNode }>;
        return cloneElement(el, undefined, wrap(el.props.children));
      }
      return node;
    };
    return <span key={key}>{wrap(children)}</span>;
  }

  if (style === "stack") {
    return (
      <span key={key} className={styles.stackLineWrap}>
        <span className={styles.stackLine} style={{ ["--tw-title-li" as string]: 0 } as CSSProperties}>
          {children}
        </span>
      </span>
    );
  }

  // wipe (default)
  return (
    <span
      key={key}
      className={styles.wipeLine}
      style={{ ["--tw-title-li" as string]: 0 } as CSSProperties}
    >
      {children}
    </span>
  );
}
