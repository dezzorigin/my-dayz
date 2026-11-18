# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangerot.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial Next.js project setup for My Dayz
- Dashboard components for task management
- Date integration with calendar
- Local storage persistence
- Responsive design for mobile/desktop

## [3.0.0] - 2026-11-18 — Proper (P1 #23)

Rebuild total menjadi repo proper: landing SaaS, mode demo, static
export + Pages Worker, CI 4 job, docs lengkap, deploy live.

### Added
- Landing ala SaaS: navbar (logo + ikon GitHub → repo), hero, preview
  produk asli (`public/preview-dashboard.png`), 8 kartu fitur, cara
  kerja, kartu "Datamu tetap milikmu", footer
- Mode demo: tombol "Masuk sebagai demo" di `/login`; `src/lib/demo.ts`
  (`seedDemoIfEmpty` / `clearDemoData`) — data contoh hanya bila semua
  store kosong, tidak pernah menimpa data pengguna; seksi Data Contoh
  di Pengaturan (muat + hapus semua data)
- Data contoh roadmap: 1 misi + 3 milestone di Neural Map
- Pages Worker (`worker/_worker.js`): `GET /api/status`
  (`gemini`/`unconfigured`) + `POST /api/chat` (Gemini REST 1.5-flash,
  riwayat dinormalisasi); 503 `AI_KEY_REQUIRED` yang jujur bila kunci
  tidak ada
- `public/`: `icon.svg`, `favicon.ico`, `apple-touch-icon.png`,
  `icon-192/512.png`, `manifest.json` (sebelumnya tidak ada — layout
  mereferensikannya tapi 404)
- `.env.example` (GEMINI_API_KEY + Supabase, tanpa nilai)
- CI (`.github/workflows/ci.yml`, 4 job): build (typecheck+lint+build),
  advisory-sweep (produksi, GitHub Advisory DB), smoke (kontrak chat +
  mode demo + semua rute), docs
- `scripts/advisory-sweep.py`, `scripts/copy-worker.mjs`,
  `scripts/serve-worker.mjs` (serve lokal `:8332`),
  `scripts/screenshot.mjs` (play-test headless),
  `scripts/make-video.mjs` (video demo dari screenshot)
- Docs lengkap: `docs/` (ARCHITECTURE, COMPONENTS, SCHEMA, SECURITY,
  DEPLOYMENT, DEMO, DESIGN, API, README, DIAGRAMS.html SVG),
  README standar repo top, PRD v3.0
- 13 screenshot asli (`docs/screenshots/`) + video demo 15 detik
  (`docs/demo/demo.mp4`)
- Deploy live: https://my-dayz.pages.dev

### Changed
- `next.config.ts`: `output: "export"` + `images.unoptimized` untuk
  Cloudflare Pages
- Dependensi: Next.js 16.2.3 → **16.4.6** (+ `eslint-config-next`
  16.4.6) karena advisory-sweep menemukan 28 temuan HIGH/CRITICAL di
  pohon produksi (mayoritas Next 16.2.3); `overrides` untuk
  `postcss@^8.5.33`, `dompurify@^3.4.18`, `nanoid@^3.3.20`,
  `sharp@^0.35.5`, `source-map-js@^1.2.2` (transitif via Tailwind /
  html2pdf.js / Next) — sweep hijau setelahnya
- `package.json`: script `typecheck`, `serve`; build menyalin Worker ke
  `out/_worker.js`; `@google/generative-ai` dihapus (diganti Worker);
  `puppeteer-core` sebagai devDependency (play-test)
- `AuthGate` tidak lagi mengembalikan `null` sebelum mount — semua
  halaman ter-prerender berisi konten (sebelumnya `<div hidden>` kosong)
- Landing + login di-render saat SSR (hero + form ada di HTML statis)
- Sidebar: pill AI membaca `/api/status` ("AI Belum Aktif / Gemini ·
  Tanpa kunci" bila kunci tidak ada — sebelumnya hardcode "Connected")
- `AICommandBar` menampilkan error Worker apa adanya (sebelumnya
  "Maaf, tidak ada respons." untuk semua error)
- `lib/supabase.ts` menjadi lazy/guarded (`getSupabase()` → `null`
  bila env kosong; sebelumnya `createClient(url!, key!)` melempar
  saat di-import tanpa env)
- Lint: 26 error bawaan diperbaiki (pola `setState` sinkron di effect
  → rAF-defer/lazy init; `any` → tipe sejati) + 7 error tambahan yang
  muncul saat `eslint-config-next` naik ke 16.4.6 (situs `setMounted`
  yang sama di ai/calendar/finance/settings/sheet + hook `useStore`
  yang tidak dipakai siapa pun → dihapus) — `npm run lint` 0 error,
  `npm run typecheck` hijau

### Fixed
- Nav `/neural-roadmap` mati (tidak ada rute itu) → `/roadmap`
  (`src/lib/constants.ts` + `AppShell.tsx`)
- `manifest.json` / `favicon.ico` / `icon.svg` 404 (tidak ada `public/`)
- `lucide-react` 1.x tidak mengekspor ikon brand `Github` → SVG inline

### Security
- Verifikasi: nol secret ter-commit (`grep` pola Supabase/JWT/API key
  di `src/`); kunci Gemini hanya env Worker
- `advisory-sweep` menggantikan `npm audit --omit=dev` (bug npm:
  advisory dev-only ikut dilaporkan)

### Changed
- Updated Next.js and dependencies to latest stable versions
- Improved dashboard UI/UX
- Enhanced responsive design for mobile devices
- Optimized asset loading for faster page loads

### Fixed
- Fixed date picker selection bugs
- Fixed calendar integration issues
- Fixed responsive design problems on mobile

### Security
- Updated dependency versions to patch vulnerabilities
- Fixed potential XSS vulnerabilities in input fields
- Fixed local storage data corruption issues

## [1.0.0] - 2024-08-03

### Added
- Initial My Dayz setup
- Dashboard components
- Calendar integration
- Local storage persistence
- Responsive design
