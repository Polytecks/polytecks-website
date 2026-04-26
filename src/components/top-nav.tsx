"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/about", label: "About Us" },
  { href: "/technology", label: "Technology" },
  { href: "/devices", label: "Devices" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
] as const;

export function TopNav() {
  const pathname = usePathname();

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-line bg-bg/70 backdrop-blur-md"
      style={{ ["--nav-h" as string]: "72px" }}
    >
      <nav className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="flex items-center" aria-label="Polytecks home">
          <Image
            src="/assets/polytecks-logo-white.png"
            alt="Polytecks"
            width={2500}
            height={720}
            priority
            className="h-8"
            style={{ width: "auto" }}
          />
        </Link>
        <ul className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`rounded-md px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:text-ink ${
                    active ? "text-ink" : "text-ink-dim"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
