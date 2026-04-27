"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/themeStore";

/**
 * ThemeProvider — Syncs Zustand theme state → <html> class for Tailwind dark: variants.
 * Also handles transition-colors on the body for smooth theme switching.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [mode, mounted]);

  return <>{children}</>;
}
