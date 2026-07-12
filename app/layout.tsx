import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-serif",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Frahnoir · Velvet Ember",
  description:
    "Velvet Ember — Extrait de Parfum, 50ml. A scroll-controlled 3D reveal by Frahnoir.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${sans.variable}`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
