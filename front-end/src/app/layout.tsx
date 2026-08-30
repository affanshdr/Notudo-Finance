import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
