import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { PwaRegistry } from "@/components/PwaRegistry";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SIM-PPDS | Sistem Informasi Manajemen Pondok Pesantren Darussalam",
  description:
    "Dashboard admin untuk mengelola data santri, ustadz, keuangan, asrama, dan jadwal kegiatan Pondok Pesantren Darussalam.",
  keywords: ["pesantren", "manajemen", "santri", "dashboard", "SIM-PPDS"],
  openGraph: {
    title: "SIM-PPDS Dashboard",
    description: "Sistem Informasi Manajemen Pondok Pesantren",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#064e3b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SIM-PPDS" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${plusJakartaSans.variable} h-full antialiased`}>
        <ToastProvider>
          <PwaRegistry />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

