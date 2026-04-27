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
  title: {
    default: "MyDayz — Personal AI OS",
    template: "%s · MyDayz",
  },
  description:
    "Your personal AI-powered operating system. Manage tasks, finances, habits, and your day — all in one beautiful command center.",
  keywords: ["productivity", "personal os", "habit tracker", "finance tracker", "ai planner"],
  authors: [{ name: "MyDayz" }],
  creator: "MyDayz",
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "MyDayz — Personal AI OS",
    description: "Your personal AI-powered operating system.",
    siteName: "MyDayz",
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