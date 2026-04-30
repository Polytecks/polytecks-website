import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Allow LAN phones to hit the dev server's HMR endpoints. Next 16
  // blocks cross-origin dev requests by default; without this the phone
  // loads pages but never receives hot-module updates, so source edits
  // don't reach it without a hard reload.
  allowedDevOrigins: ["192.168.0.128"],
};

export default nextConfig;
