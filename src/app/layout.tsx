import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AksesPangan — Dari Surplus ke Solusi",
  description: "Platform penghubung surplus makanan dari pelaku usaha dengan masyarakat secara real-time. Menyelamatkan makanan, mengurangi kelaparan, menekan emisi.",
  keywords: "food waste, surplus makanan, food rescue, akses pangan, keberlanjutan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Inter:ital,opsz,wght@0,14..32,300..800;1,14..32,300..700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-[#1d1d1f] bg-white selection:bg-black selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
