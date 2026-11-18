# Komponen — MyDayz

## Halaman (`src/app/`)

| Rute | File | Isi |
|---|---|---|
| `/` | `page.tsx` | Landing SaaS: navbar (GitHub), hero, preview produk asli, 8 fitur, cara kerja, footer |
| `/login` | `login/page.tsx` | Form email + password (dummy) + tombol "Masuk sebagai demo" |
| `/dashboard` | `dashboard/page.tsx` | `DashboardHeader` (sapaan + jam live), `AICommandBar`, `QuickStats`, `VerticalTimeline` (06:00–23:00), `SecondaryFAB` |
| `/planner` | `planner/page.tsx` | Task + goals; `AddPlannerModal` (task/goal) |
| `/calendar` | `calendar/page.tsx` | Grid bulanan; mode Personal/Akademik/Financial/Salat; tambah event |
| `/finance` | `finance/page.tsx` | Saldo/income/expense, grafik cashflow 7 hari (Recharts), transaksi terbaru, tambah transaksi |
| `/habits` | `habits/page.tsx` | Daftar habit + streak; `AddHabitModal` |
| `/diary` | `diary/page.tsx` | Entri per tanggal + mood + tag |
| `/roadmap` | `roadmap/page.tsx` | Canvas xyflow: node Mission/Milestone, edge, minimap, panel tambah node |
| `/ai` | `ai/page.tsx` | AI Vault: chat, upload gambar, voice input (Web Speech API), auto-task dari perintah |
| `/settings` | `settings/page.tsx` | Tema, toggle modul, ekspor PDF, data contoh, logout |

Semua halaman `"use client"`. Root layout (`layout.tsx`): font Inter,
metadata + manifest, `ThemeProvider` → `GrainOverlay` → `AuthGate` →
`AppShell`.

## Layout (`src/components/layout/`)

| Komponen | Peran |
|---|---|
| `AppShell.tsx` | Shell: sidebar desktop / drawer + bottom nav mobile; rute full-bleed (`/ai`, `/roadmap`) vs konten `max-w-[960px]`; `GrainOverlay` (noise SVG) |
| `AuthGate.tsx` | Gerbang auth: selalu render anak (termasuk SSR); redirect ke `/` bila belum login, setelah mount + 50ms |
| `Sidebar.tsx` | Nav grup Core/Life/Intelligence, toggle tema, **pill status AI** (fetch `/api/status`), user + logout |
| `MobileDrawer.tsx` | Drawer geser navigasi (mobile) |
| `MobileTopBar.tsx` | Top bar mobile (judul + subtitle per rute) |
| `MobileBottomNav.tsx` | Bottom tab navigation (mobile) |
| `SecondaryDrawer.tsx` | Drawer cepat dari dashboard (habit/finance/diary) |
| `ThemeProvider.tsx` | Sinkron `themeStore.mode` → class `dark`/`light` di `<html>` |

## Roadmap (`src/components/roadmap/`)

| Komponen | Peran |
|---|---|
| `RoadmapNode.tsx` | `RoadmapNode` (milestone) + `MissionNode` (misi) + `STATUS_CONFIG` (pending/in-progress/achieved); klik node = ganti status |

## UI (`src/components/ui/`)

| Komponen | Peran |
|---|---|
| `sheet.tsx` | Sheet/drawer primitif (dipakai drawer) |
| `ThemeSwitcher.tsx` | Toggle tema |

## Store (`src/store/`, Zustand + persist)

| Store | Key localStorage | Isi |
|---|---|---|
| `authStore` | `mydayz_auth_v1` | `isLoggedIn`, `userName`, `userEmail`, `login`, `logout` |
| `taskStore` | `myday_tasks_v3` | `tasks`, `goals`, CRUD + `toggleTask`, `setGoalProgress`, `importTasks`, `reset` |
| `habitStore` | `myday_habits_v3` | `habits`, `addHabit`, `toggleLog`/`markDone`/`bulkLog`, `getAllWithStats`, `reset` |
| `financeStore` | `myday-finance` | `transactions`, `add/update/deleteTransaction`, `clearAll` |
| `diaryStore` | `myday_diary_v2` | `entries`, `addEntry`, `updateEntry`, `deleteEntry`, `getByDate`, `reset` |
| `moodStore` | `myday_moods_v2` | `entries`, `setMood`, `updateEntry`, `deleteEntry`, `getByDate`, `reset` |
| `calendarStore` | `myday_calendar_v1` | `events`, `addEvent`, `removeEvent`, `reset` |
| `roadmapStore` | `myday-roadmap` | `nodes`, `edges`, `addNode`/`updateNode`/`deleteNode`, `addEdge`/`deleteEdge`, `reset` |
| `settingsStore` | `myday_settings_v1` | `features` (finance/habits/cycleTracker), `toggleFeature` |
| `themeStore` | `mydayz_theme_v2` | `mode`, `toggle` |
| `uiStore` | — | State UI kecil |

## Lib (`src/lib/`)

| Modul | Peran |
|---|---|
| `constants.ts` | `DAYS_*`, `MONTHS`, kategori finance, `MOODS`, `HABIT_ICONS`, `NAV_ITEMS` (termasuk perbaikan `/neural-roadmap` → `/roadmap`), `QUOTES`, `LS_KEYS`, `APP_VERSION` |
| `supabase.ts` | `getSupabase()` lazy/guarded (null bila env kosong) + `isSupabaseConfigured()` — belum aktif |
| `demo.ts` | `seedDemoIfEmpty()`, `clearDemoData()`, `isDemoSeeded()` |
| `utils.ts` | `cn()` (clsx + tailwind-merge) |

## Hook

| Hook | Peran |
|---|---|
| `useIsMounted.ts` | `true` setelah mount (via `requestAnimationFrame`) — anti hydration mismatch |
| `useStore.ts` | Helper store (bila dipakai halaman) |

## Worker + skrip

Lihat `docs/ARCHITECTURE.md` §5–6 untuk `worker/_worker.js` dan
`scripts/` (`copy-worker.mjs`, `serve-worker.mjs`, `screenshot.mjs`,
`make-video.mjs`, `advisory-sweep.py`).
