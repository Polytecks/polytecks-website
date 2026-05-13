import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer/footer";
import { Providers } from "./providers";

// Design-tweak panel is no longer mounted — site is locked in. If you
// ever need it back, re-add the line below + `<TweakPanel />` in the
// Providers tree. The TweaksProvider stays mounted so any values
// already in localStorage continue to apply as CSS vars.
//   import { TweakPanel } from "@/components/technology/tweak-panel";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Used by the publications section on /press — Source Serif 4 signals the
// "scholarly record" register and is intentionally distinct from the
// display sans used everywhere else.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  /* Title template: the homepage uses `default`; every subpage that
     exports its own metadata.title gets the template applied so the
     browser tab reads e.g. "About · Polytecks", "Careers · Polytecks". */
  title: {
    default: "Polytecks — Making the Skin a Window into the Body",
    template: "%s · Polytecks",
  },
  description:
    "Polytecks is a Cambridge-based medical technology company developing bioelectrical mapping for enhanced diagnostics.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

// Without initial-scale=1, iOS Safari falls back to a wider implied
// layout viewport (often 980 px), which makes mobile @media queries
// miss and pushes fixed/full-width content off the right edge of the
// visual viewport — exactly the "panel extends past the viewport,
// content reads off-centre" symptom we saw on real devices.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable}`}
    >
      <head>
        {/* Anti-FOUC theme bootstrap. Reads the persisted theme from
            localStorage and writes data-theme="light" onto <html> before
            paint so the page never flashes the wrong palette on reload.
            Default (no attribute) = the dark site. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('polytecks:theme');if(t==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <TopNav />
          <main className="pt-[var(--nav-h,72px)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
