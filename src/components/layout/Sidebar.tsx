"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Wallet,
  Flame,
  NotebookPen,
  Bot,
  Sparkles,
  Settings,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";

// ─── Nav Definition ───────────────────────────────────────────────────────────

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
      { id: "settings", href: "/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "ai", href: "/ai", label: "AI Assistant", icon: Bot },
    ],
  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggle } = useThemeStore();
  const { logout, userName } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-[220px] min-w-[220px] h-screen sticky top-0",
        "border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto",
      )}
    >
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border-subtle)]">
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-900/40 flex-shrink-0">
          <span className="font-bold text-white text-sm leading-none">M</span>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-pink-400 rounded-full border border-[var(--bg-surface)] animate-dot-blink" />
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)] leading-none">MyDayz</p>
          <p className="text-[9px] text-[var(--text-muted)] tracking-[0.14em] uppercase mt-0.5 font-mono">Personal OS</p>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--text-muted)] px-2 mb-1.5">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/" || pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <li key={item.id}>
                    <Link href={item.href}>
                      <motion.div
                        whileHover={{ x: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className={cn(
                          "group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer select-none",
                          "transition-colors duration-150",
                          isActive
                            ? "bg-pink-500/[0.08] text-[var(--text-primary)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="sidebarActive"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-pink-500 rounded-r"
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          />
                        )}
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
                        {isActive && (
                          <ChevronRight size={11} className="text-[var(--text-muted)] flex-shrink-0" />
                        )}
                      </motion.div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-[var(--border-subtle)] space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)]"
        >
          {mode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          <span className="text-[12px] font-medium flex-1 text-left">
            {mode === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {/* AI pill */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-pink-500/[0.06] border border-pink-500/[0.12]">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
            <Sparkles size={11} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--text-primary)]">AI Active</p>
            <p className="text-[9px] text-[var(--text-muted)] font-mono truncate">Gemini · Connected</p>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 flex-shrink-0 animate-dot-blink" />
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0 text-[var(--text-primary)] text-xs font-bold uppercase">
            {userName?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[var(--text-primary)] truncate">{userName || "User"}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">Personal</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Logout"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}