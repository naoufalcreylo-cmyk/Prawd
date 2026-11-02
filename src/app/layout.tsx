import type { Metadata, Viewport } from "next";
import { Inter_Tight, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE } from "@/lib/site";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const serif = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.line}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  robots: SITE.indexable ? undefined : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_GB",
    title: `${SITE.name}: ${SITE.line}`,
    description: SITE.description,
    images: [{ url: "/brand/og-default.png", width: 1200, height: 630, alt: "PRAWD" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#ffffff", colorScheme: "light" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
