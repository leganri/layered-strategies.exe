import { Source_Serif_4 } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./discovery/discovery.css";
import "./discovery/shell.css";

/* Type from reganli.com: Geist for interface, Source Serif 4 for reading prose. */
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

/* as on reganli.com: let the page run under the iPhone bars, then pad by the safe-area insets */
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata = {
  title: "Layered Strategies",
  description: "Proprietary brand strategy instrument by Layered Studio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.variable + " " + GeistMono.variable + " " + serif.variable}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
