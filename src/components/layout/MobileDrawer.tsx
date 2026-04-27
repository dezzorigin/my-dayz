"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, CalendarDays, Wallet, Flame,
  NotebookPen, Bot, X, Sparkles, Settings, ChevronRight, LogOut, Sun, Moon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMobileDrawer } from "@/store/uiStore";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";

const NAV_SECTIONS = [
  {
    label: "Core",
    items: [
      { id: "dash", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "plan", href: "/planner", label: "Planner", icon: ClipboardList },
      { id: "cal", href: "/calendar", label: "Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Life",
    items: [
      { id: "fin", href: "/finance", label: "Finance", icon: Wallet },
      { id: "habit", href: "/habits", label: "Habits", icon: Flame },
      { id: "diary", href: "/diary", label: "Diary", icon: NotebookPen },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "ai", href: "/ai", label: "AI Assistant", icon: Bot },
    ],
  },
];

const containerVar: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const itemVar: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 400, damping: 30 } },
};

export function MobileDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useMobileDrawer();
  const { mode, toggle } = useThemeStore();
  const { logout, userName } = useAuthStore();

  const handleLogout = () => {
    close();
    logout();
    router.push("/");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && close()}>
      <SheetContent
        side="left"
        className="w-[272px] p-0 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col overflow-hidden"
      >
        {/* ── Header ─── */}
        <SheetHeader className="flex-row items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] space-y-0">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-900/40">
              <span className="font-bold text-white text-sm leading-none">M</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)] leading-none">MyDayz</p>
              <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-[0.14em] uppercase mt-0.5">Personal OS</p>
            </div>
          </div>
          <button
            onClick={close}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <X size={14} />
          </button>
        </SheetHeader>

        {/* ── User card ─── */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] font-bold text-sm uppercase">
            {userName?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[var(--text-primary)]">{userName || "User"}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">Personal Plan</p>
          </div>
        </div>

        {/* ── Navigation ─── */}
        <motion.nav
          className="flex-1 px-3 py-4 space-y-5 overflow-y-auto"
          variants={containerVar}
          initial="hidden"
          animate={isOpen ? "show" : "hidden"}
        >
          {NAV_SECTIONS.map((section) => (
            <motion.div key={section.label} variants={itemVar}>
              <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--text-muted)] px-2 mb-1.5">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/" || pathname === "/dashboard"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <motion.li key={item.id} variants={itemVar}>
                      <Link href={item.href} onClick={close}>
                        <div
                          className={cn(
                            "group flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg cursor-pointer select-none transition-colors duration-150",
                            isActive
                              ? "bg-pink-500/[0.08] text-[var(--text-primary)]"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                          )}
                        >
                          <Icon
                            size={15}
                            strokeWidth={isActive ? 2 : 1.75}
                            className={cn(
                              "flex-shrink-0 transition-colors",
                              isActive ? "text-pink-500" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                            )}
                          />
                          <span className="text-[13px] font-medium tracking-tight flex-1">
                            {item.label}
                          </span>
                          {isActive && <ChevronRight size={11} className="text-[var(--text-muted)] flex-shrink-0" />}
                        </div>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </motion.nav>

        {/* ── Footer ─── */}
        <div className="px-3 pb-6 border-t border-[var(--border-subtle)] pt-3 space-y-0.5">
          <Link href="/settings" onClick={close}>
            <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors text-[var(--text-secondary)]">
              <Settings size={14} strokeWidth={1.75} className="text-[var(--text-muted)]" />
              <span className="text-[13px] font-medium">Settings</span>
            </div>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors text-[var(--text-secondary)]"
          >
            {mode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            <span className="text-[13px] font-medium">{mode === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors text-[var(--text-secondary)] hover:text-rose-500"
          >
            <LogOut size={14} />
            <span className="text-[13px] font-medium">Logout</span>
          </button>

          {/* AI Status */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-pink-500/[0.06] border border-pink-500/[0.12] mt-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={11} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[var(--text-primary)]">Gemini AI Active</p>
              <p className="text-[9px] text-[var(--text-muted)] font-mono">MyDayz v3.0</p>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-dot-blink flex-shrink-0" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}