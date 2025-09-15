import "./globals.css";
import { Jost } from "next/font/google";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "700"],  // include weights you need
  variable: "--font-jost",
});

export const metadata = {
  title: "Polytecks",
  description: "Smart textiles for advanced diagnostics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jost.className}>
      <body>{children}</body>
    </html>
  );
}
