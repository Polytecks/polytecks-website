"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/about", label: "About Us" },
  { href: "/technology", label: "Technology" },
  { href: "/devices", label: "Devices" },
  { href: "/press", label: "Press" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
] as const;

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu whenever the route changes (link click).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the menu is open so the user can't scroll
  // the page underneath the overlay.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
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
            className="themeDarkOnly h-10"
            style={{ width: "auto" }}
          />
          <Image
            src="/assets/Polytecksblack.png"
            alt="Polytecks"
            width={2500}
            height={720}
            priority
            className="themeLightOnly h-10"
            style={{ width: "auto" }}
          />
        </Link>

        {/* Desktop link list — hidden below 720px. ThemeToggle sits at
            the right end of the row as the last item so it doesn't
            disrupt the existing nav rhythm. */}
        <div className="hidden items-center gap-2 [@media(min-width:720px)]:flex">
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
          <ThemeToggle />
        </div>

        {/* Mobile hamburger button — visible below 720px. */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav-overlay"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-md text-ink hover:text-ink [@media(min-width:720px)]:hidden"
        >
          <span
            className="block h-[1.5px] w-[22px] origin-center bg-current transition-transform duration-200"
            style={{ transform: open ? "translateY(6.5px) rotate(45deg)" : "" }}
          />
          <span
            className="block h-[1.5px] w-[22px] bg-current transition-opacity duration-200"
            style={{ opacity: open ? 0 : 1 }}
          />
          <span
            className="block h-[1.5px] w-[22px] origin-center bg-current transition-transform duration-200"
            style={{ transform: open ? "translateY(-6.5px) rotate(-45deg)" : "" }}
          />
        </button>
      </nav>
    </header>

    {/* Full-viewport mobile menu overlay — rendered as a SIBLING of <header>,
        not a child. The header has backdrop-filter (bg-bg/70 backdrop-blur-md)
        which makes it a containing block for any position:fixed descendant,
        forcing the overlay's top:72px / bottom:0 to resolve against the 72px
        header → height collapses to 0. Hoisting the overlay out of <header>
        restores the viewport as its containing block. */}
      <div
        id="mobile-nav-overlay"
        aria-hidden={!open}
        className="fixed inset-x-0 top-[72px] bottom-0 z-40 transition-[opacity,transform] duration-250 [@media(min-width:720px)]:hidden"
        style={{
          background: "var(--bg)",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <ul className="flex flex-col px-6 pt-10">
          {NAV_ITEMS.map(({ href, label }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`block border-b border-line py-5 font-display text-[28px] font-light tracking-[-0.01em] transition-colors hover:text-ink ${
                    active ? "text-ink" : "text-ink-dim"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex items-center gap-3 px-6">
          <ThemeToggle />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim">
            Theme
          </span>
        </div>
      </div>
    </>
  );
}
