"use client";

import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/", "/login"];

/**
 * AuthGate — Prevents unauthenticated users from accessing protected routes.
 * Redirects to / (landing page) if not logged in.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for hydration of zustand persist
    const timer = setTimeout(() => setChecked(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!checked) return;
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (!isLoggedIn && !isPublic) {
      router.replace("/");
    }
  }, [isLoggedIn, pathname, checked, router]);

  if (!checked) return null;

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  if (!isLoggedIn && !isPublic) return null;

  return <>{children}</>;
}
