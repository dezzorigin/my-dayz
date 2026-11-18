"use client";

import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/", "/login"];

/**
 * AuthGate — Prevents unauthenticated users from accessing protected routes.
 * Redirects to / (landing page) if not logged in.
 *
 * Anak SELALU di-render — termasuk saat SSR/prerender — supaya halaman
 * statis berisi konten aslinya (bukan shell kosong). Versi sebelumnya
 * mengembalikan `null` sampai timer 50ms jalan, sehingga SEMUA halaman
 * (termasuk landing) ter-prerender sebagai `<div hidden>` kosong: HTML
 * statis tidak berisi apa-apa, first paint menunggu JS, dan smoke test
 * curl tidak bisa memverifikasi apa pun. Redirect-nya sendiri tetap
 * menunggu mount + 50ms (memberi waktu rehidrasi persist zustand),
 * jadi pengguna yang belum login hanya melihat shell aplikasi
 * sekilas sebelum dilempar ke landing.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wait for hydration of zustand persist
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (!isLoggedIn && !isPublic) {
      router.replace("/");
    }
  }, [isLoggedIn, pathname, mounted, router]);

  return <>{children}</>;
}
