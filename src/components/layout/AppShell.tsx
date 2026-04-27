"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface AppShellProps {
  children: React.ReactNode;
}

const FULLBLEED_ROUTES = ["/ai", "/roadmap", "/neural-roadmap"];
const NO_SHELL_ROUTES = ["/", "/login"];

const pageVariants: Variants = {
  initial: { opacity: 0, y: 6, filter: "blur(3px)" },
  enter: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0, y: -4, filter: "blur(3px)",
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const },
  },
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isFullBleed = FULLBLEED_ROUTES.some((r) => pathname.startsWith(r));
  const noShell = NO_SHELL_ROUTES.includes(pathname);

  // For landing/login pages, render without sidebar/nav
  if (noShell || !isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-base)]">
      {/* ─── Desktop Sidebar ─────────────────────────────── */}
      <Sidebar />

      {/* ─── Mobile Slide Drawer ─────────────────────────── */}
      <MobileDrawer />

      {/* ─── Main Column ─────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* Mobile sticky top bar */}
        <MobileTopBar />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className={cn(
                "min-h-full",
                isFullBleed
                  ? "h-full flex flex-col"
                  : "max-w-[960px] mx-auto px-4 py-6 lg:px-8 lg:py-8"
              )}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Tab Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

// ─── Grain overlay ─────────────────────────────────────────────────────────────
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.018] dark:opacity-[0.018] light:opacity-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
      }}
    />
  );
}