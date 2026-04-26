"use client";

import type { ReactNode } from "react";
import { TweaksProvider } from "@/lib/use-tweaks";

export function Providers({ children }: { children: ReactNode }) {
  return <TweaksProvider>{children}</TweaksProvider>;
}
