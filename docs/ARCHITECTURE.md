# Arsitektur — MyDayz

## Ringkasan

MyDayz adalah aplikasi **local-first**: seluruh state produk tinggal di
browser (Zustand + `localStorage`). Satu-satunya yang dinamis di sisi
server adalah **Pages Worker** untuk chat Gemini — karena kunci API tidak
boleh tinggal di browser. Sisanya adalah 13 halaman statis yang di-deploy
di Cloudflare Pages.

```
Browser (React 19 + Zustand + localStorage)
  │  HTTPS
  ▼
Cloudflare Pages ── out/ (13 halaman statis, Next.js output: "export")
  │  /api/* diteruskan ke Worker
  ▼
Pages Worker ── worker/_worker.js (tanpa dependensi)
  │  GET  /api/status  → { ok, mode: gemini|unconfigured }
  │  POST /api/chat    → Gemini REST (bila GEMINI_API_KEY ada)
  ▼
Google Gemini API (gemini-1.5-flash) — opsional
Supabase (Auth/Postgres/Storage) — disiapkan, BELUM AKTIF
```

Diagram visual (SVG): `docs/DIAGRAMS.html`.

## Lapisan

### 1. Presentasi — `src/app/` (Next.js App Router)

13 rute, semua `"use client"` kecuali root layout:

| Rute | Halaman |
|---|---|
| `/` | Landing SaaS (navbar, hero, preview, fitur, footer) |
| `/login` | Login dummy + tombol demo |
| `/dashboard` | Command center: sapaan, AI bar, stats, timeline |
| `/planner` | Task + goals |
| `/calendar` | Grid bulanan + event |
| `/finance` | Saldo, cashflow 7 hari, transaksi |
| `/habits` | Habit + streak |
| `/diary` | Jurnal + mood |
| `/roadmap` | Neural Map (xyflow) |
| `/ai` | AI Vault (chat) |
| `/settings` | Tema, modul, data contoh, ekspor PDF |

Root layout (`src/app/layout.tsx`): `next/font` Inter, metadata + Open
Graph + manifest, `ThemeProvider` → `GrainOverlay` → `AuthGate` →
`AppShell` (sidebar desktop / drawer + bottom nav mobile).

### 2. State — `src/store/` (Zustand + persist)

Satu store per domain, semua `persist` ke `localStorage` (lihat
`docs/SCHEMA.md` untuk key + bentuk data):

- `authStore` — login dummy, sesi
- `taskStore` — task + goals (immer)
- `habitStore` — habit + log harian + statistik turunan (streak, rate)
- `financeStore` — transaksi
- `diaryStore` — entri jurnal
- `moodStore` — entri mood 1–5
- `calendarStore` — event kustom
- `roadmapStore` — node + edge xyflow
- `settingsStore` — toggle fitur
- `themeStore` — dark/light
- `uiStore` — state UI kecil

Tidak ada store yang memanggil jaringan. `useIsMounted()` (rAF) dipakai
halaman yang harus menghindari hydration mismatch (jam/tanggal live).

### 3. Data contoh — `src/lib/demo.ts`

`seedDemoIfEmpty()` mengisi semua store SEKALI, hanya bila semuanya
kosong (tidak pernah menimpa data pengguna). Dipanggil setelah login
(biasa maupun demo) dan dari Pengaturan. Penanda:
`localStorage mydayz_demo_seeded_v1`. `clearDemoData()` mereset semua
store + menghapus penanda. Isi seed: 5 task (2 selesai) + 1 goal, 3 habit
dengan riwayat log (streak terhitung), 5 transaksi IDR bulan berjalan,
1 entri diary + 3 mood, 2 event kalender, 1 misi + 3 milestone roadmap.

### 4. Supabase — `src/lib/supabase.ts` (belum aktif)

Modul ini **lazy + guarded**: `getSupabase()` mengembalikan `null` bila
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` kosong, jadi
import-nya tidak pernah meledak saat build/deploy tanpa env. Versi
sebelumnya memanggil `createClient(url!, key!)` di tingkat modul — tanpa
env, modul itu melempar saat di-import (dan tidak ada kode yang
meng-import-nya). Saat integrasi Auth/sync dibangun, pakai
`getSupabase()` dan tangani `null` sebagai "mode lokal".

### 5. Worker — `worker/_worker.js`

Satu file, tanpa dependensi, dua rute + fallback aset:

- `GET /api/status` → `{ ok: true, mode, engine: "gemini", model }`.
  `mode` = `gemini` bila `GEMINI_API_KEY` ada, `unconfigured` bila tidak.
  Dipakai pill sidebar + smoke test.
- `POST /api/chat` → validasi body (400 bila tanpa `message`/`image`),
  503 `AI_KEY_REQUIRED` bila kunci tidak ada, selain itu teruskan ke
  Gemini REST `v1beta/models/gemini-1.5-flash:generateContent` dengan
  riwayat yang dinormalisasi (selang-seling user/model, diawali user —
  logika yang sama dengan route handler Next.js aslinya).
- Selain `/api/*` → `env.ASSETS.fetch(req)` (aset statis Pages).

Di-deploy sebagai `_worker.bundle` (bukan file statis) — lihat
`docs/DEPLOYMENT.md`. Di lokal, `scripts/serve-worker.mjs` meniru
binding `ASSETS` yang sama dari filesystem `out/`.

### 6. Build — static export

`next.config.ts`: `output: "export"`, `images: { unoptimized: true }`,
`reactStrictMode: true`. `npm run build` = `next build &&
node scripts/copy-worker.mjs` (menyalin `worker/_worker.js` ke
`out/_worker.js`). Route handler `/api/chat` (Next.js) sudah dihapus —
tidak bisa hidup di static export; logikanya pindah ke Worker.
`@google/generative-ai` ikut dihapus dari dependencies (hanya dipakai
route handler itu).

## Keputusan arsitektur penting

### AuthGate tidak lagi mengembalikan `null` saat SSR

Versi sebelumnya: `AuthGate` mengembalikan `null` sampai timer 50ms
jalan — akibatnya **semua** halaman ter-prerender sebagai
`<div hidden><!--$--><!--/$--></div>` kosong: HTML statis tidak berisi
apa-apa, first paint menunggu JS, dan smoke test curl tidak bisa
memverifikasi apa pun. Sekarang anak selalu di-render (termasuk saat
SSR); redirect ke `/` tetap menunggu mount + 50ms (memberi waktu
rehidrasi persist zustand). Pengguna belum login hanya melihat shell
aplikasi sekilas sebelum dilempar ke landing.

### Landing + login di-render saat SSR

`if (!mounted) return null` dihapus dari kedua halaman (redirect tetap
efek client-side). Hasil: `out/index.html` berisi hero + navbar +
tautan GitHub + preview; `out/login.html` berisi form + tombol demo.

### Jam/tanggal: lazy init + rAF, bukan `update()` sinkron di effect

`DashboardHeader`/`VerticalTimeline` dulu memanggil `update()` sinkron
di badan effect (setState sinkron → cascading render, ditolak
`react-hooks/set-state-in-effect` di eslint-config-next 16). Sekarang
state diinisialisasi malas dari `new Date()` dan effect hanya memasang
interval + menandai mounted lewat `requestAnimationFrame`. Render tetap
digate oleh `mounted` (shimmer), jadi tidak ada hydration mismatch
yang terlihat.

### Lint 0 error

26 error bawaan (pola `setMounted` sinkron di 8 file + `any` di 6 file)
diperbaiki dengan perubahan perilaku-nol: rAF-defer, lazy init,
dan tipe sejati (`Variants`, `LucideIcon`, union type modal planner,
tipe minimal Web Speech API). 22 warning tersisa (unused vars, deps
useMemo) tidak menggagalkan CI.

## Alur data

```
Login demo ──► seedDemoIfEmpty() ──► store (localStorage)
                                        │
Dashboard ◄── useTaskStore/useHabitStore/useFinanceStore (subscribe)
AI bar ──► POST /api/chat ──► Worker ──► Gemini (bila kunci ada)
Pengaturan ──► clearDemoData() ──► reset semua store
```

Tidak ada fetch ke server lain. Satu-satunya request jaringan produk
adalah `/api/status` (pill sidebar) dan `/api/chat` (AI).

## File kunci

| File | Peran |
|---|---|
| `next.config.ts` | Static export |
| `src/app/layout.tsx` | Shell + metadata + manifest |
| `src/components/layout/AuthGate.tsx` | Gerbang auth (render selalu, redirect tertunda) |
| `src/components/layout/AppShell.tsx` | Sidebar/drawer/bottom nav |
| `src/components/layout/Sidebar.tsx` | Pill status AI dari `/api/status` |
| `src/lib/demo.ts` | Seed + clear data contoh |
| `src/lib/supabase.ts` | Klien Supabase lazy (belum aktif) |
| `worker/_worker.js` | `/api/status`, `/api/chat`, fallback aset |
| `scripts/copy-worker.mjs` | Worker → `out/_worker.js` saat build |
| `scripts/serve-worker.mjs` | Serve lokal `out/` + Worker (port 8332) |
| `scripts/screenshot.mjs` | Play-test headless + screenshot asli |
| `scripts/make-video.mjs` | Video demo dari screenshot |
| `scripts/advisory-sweep.py` | Gate advisory produksi |
