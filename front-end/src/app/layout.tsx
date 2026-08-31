import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Notudo Finance — Analisis Data Saham BEI Indonesia",
  description:
    "Platform analisis data saham Indonesia. Scraping otomatis data OHLCV, broker summary, dan 826 emiten dari Bursa Efek Indonesia melalui pipeline Selenium + Python.",
  keywords: "saham indonesia, BEI, bursa efek indonesia, analisis saham, OHLCV, broker summary, stockbit scraper",
  openGraph: {
    title: "Notudo Finance",
    description: "Platform analisis data saham Indonesia — 826 emiten BEI, data OHLCV & broker summary.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}>{children}</body>
    </html>
  );
}
