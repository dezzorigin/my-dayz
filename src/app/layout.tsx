import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppShell, GrainOverlay } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthGate } from "@/components/layout/AuthGate";
import "./globals.css";

// ─── Font — Inter (clean geometric, Linear-style) ─────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL("https://my-dayz.pages.dev"),
  title: {
    default: "MyDayz — Personal AI OS",
    template: "%s · MyDayz",
  },
  description:
    "Satu command center untuk mengelola tugas, keuangan, kebiasaan, dan hari-harimu — didukung AI.",
  keywords: ["productivity", "personal os", "habit tracker", "finance tracker", "ai planner"],
  authors: [{ name: "MyDayz" }],
  creator: "MyDayz",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://my-dayz.pages.dev",
    title: "MyDayz — Personal AI OS",
    description:
      "Satu command center untuk mengelola tugas, keuangan, kebiasaan, dan hari-harimu — didukung AI.",
    siteName: "MyDayz",
    images: [
      {
        url: "https://my-dayz.pages.dev/og-image.png",
        width: 1200,
        height: 630,
        alt: "MyDayz — Personal AI OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyDayz — Personal AI OS",
    description:
      "Satu command center untuk mengelola tugas, keuangan, kebiasaan, dan hari-harimu — didukung AI.",
    images: ["https://my-dayz.pages.dev/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <GrainOverlay />
          <AuthGate>
            <AppShell>{children}</AppShell>
          </AuthGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
