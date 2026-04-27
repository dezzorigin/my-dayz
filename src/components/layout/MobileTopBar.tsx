"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useMobileDrawer } from "@/store/uiStore";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/":               { title: "Dashboard",     subtitle: "Command Center" },
  "/dashboard":      { title: "Dashboard",     subtitle: "Command Center" },
  "/planner":        { title: "Planner",        subtitle: "Task & Focus" },
  "/calendar":       { title: "Calendar",       subtitle: "Schedule" },
  "/finance":        { title: "Finance",        subtitle: "Wealth Tracker" },
  "/habits":         { title: "Habits",         subtitle: "Build streaks" },
  "/diary":          { title: "Diary",          subtitle: "Daily entries" },
  "/ai":             { title: "AI Assistant",   subtitle: "Powered by Gemini" },
  "/settings":       { title: "Settings",       subtitle: "Preferences" },
};

export function MobileTopBar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { open: openDrawer } = useMobileDrawer();
  const { mode, toggle } = useThemeStore();
  const { userName } = useAuthStore();
  const pageInfo = PAGE_TITLES[pathname] ?? { title: "MyDayz" };

  return (
    <header
      className={cn(
        "lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3",
        "bg-[var(--bg-base)]/90 backdrop-blur-xl border-b border-[var(--border-subtle)]",
        className
      )}
    >
      {/* Avatar button → opens drawer */}
      <motion.button
        whileTap={{ scale: 0.90 }}
        onClick={openDrawer}
        aria-label="Open navigation"
        className={cn(
          "relative flex-shrink-0 w-8 h-8 rounded-full",
          "bg-gradient-to-br from-pink-500 to-rose-600",
          "flex items-center justify-center text-white text-xs font-bold",
          "ring-1 ring-pink-500/30 shadow-md shadow-pink-900/30"
        )}
      >
        {userName?.charAt(0)?.toUpperCase() || "U"}
        <span className="absolute -bottom-0 -right-0 w-2 h-2 bg-pink-400 rounded-full border border-[var(--bg-base)] animate-dot-blink" />
      </motion.button>

      {/* Centered page title */}
      <div className="flex-1 flex flex-col items-center">
        <motion.h1
          key={pathname}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)] leading-tight"
        >
          {pageInfo.title}
        </motion.h1>
        {pageInfo.subtitle && (
          <motion.p
            key={pathname + "-sub"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22, delay: 0.06 }}
            className="font-mono text-[9px] text-[var(--text-muted)] tracking-widest uppercase"
          >
            {pageInfo.subtitle}
          </motion.p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)] transition-colors"
          aria-label="Toggle Theme"
        >
          {mode === "dark" ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
        </motion.button>
      </div>
    </header>
  );
}