"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, ClipboardList, Wallet, Flame, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/planner",   icon: ClipboardList,   label: "Plan" },
  { href: "/ai",        icon: Bot,             label: "AI",   accent: true },
  { href: "/finance",   icon: Wallet,          label: "Cash" },
  { href: "/habits",    icon: Flame,           label: "Habit" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-50",
        "bg-[var(--bg-surface)]/90 backdrop-blur-xl",
        "border-t border-[var(--border-subtle)]",
        "pb-safe"
      )}
    >
      <div className="flex items-center px-2 py-2">
        {TABS.map((tab) => {
          const isActive = tab.href === "/dashboard"
            ? pathname === "/" || pathname === "/dashboard"
            : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex-1 flex flex-col items-center gap-1 py-1"
            >
              {tab.accent ? (
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    "w-12 h-10 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br from-pink-500 to-rose-600",
                    "shadow-lg shadow-pink-900/50",
                    isActive && "animate-pulse-glow"
                  )}
                >
                  <Icon size={20} strokeWidth={2} className="text-white" />
                </motion.div>
              ) : (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "w-12 h-10 rounded-xl flex items-center justify-center transition-colors duration-150",
                    isActive
                      ? "bg-pink-500/[0.1] text-pink-500"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.75} />
                </motion.div>
              )}

              <AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="bottomTabDot"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 35 }}
                    className="w-1 h-1 rounded-full bg-pink-500"
                  />
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
