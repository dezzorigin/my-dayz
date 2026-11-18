import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export untuk Cloudflare Pages. Route handler dinamis (/api/chat)
  // TIDAK bisa hidup di sini — `next build` menolaknya saat output: 'export'.
  // Logika chat Gemini pindah ke Pages Worker (worker/_worker.js), yang
  // di-copy ke out/_worker.js saat build dan di-deploy sebagai _worker.bundle
  // (lihat docs/DEPLOYMENT.md).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
