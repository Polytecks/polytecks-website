import type { NextConfig } from "next";
import { DECK_SLUGS } from "./deck-slugs.mjs";

// Hidden investor-deck copy (see deck-slugs.mjs and scripts/sync-deck.mjs).
// The page itself lives at public/d/_deck/index.html; each slug rewrites to it.
const DECK_PAGE = "/d/_deck/index.html";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Allow LAN phones to hit the dev server's HMR endpoints. Next 16
  // blocks cross-origin dev requests by default; without this the phone
  // loads pages but never receives hot-module updates, so source edits
  // don't reach it without a hard reload.
  allowedDevOrigins: ["192.168.0.128"],
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/d", headers: noindex },
      { source: "/d/:path*", headers: noindex },
    ];
  },
  async rewrites() {
    return {
      // The deck page is only reachable through a listed slug, so retiring a
      // slug really retires access.
      beforeFiles: [{ source: DECK_PAGE, destination: "/d/_deck/not-found" }],
      afterFiles: DECK_SLUGS.map((slug) => ({
        source: `/d/${slug}`,
        destination: DECK_PAGE,
      })),
      fallback: [],
    };
  },
};

export default nextConfig;
