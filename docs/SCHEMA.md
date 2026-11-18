# Skema Data — MyDayz (localStorage)

Semua data produk tinggal di `localStorage` browser — satu key per store
(Zustand `persist`). Tidak ada tabel server; Supabase belum aktif
(lihat `docs/ARCHITECTURE.md` §4). Dokumen ini adalah kontrak bentuk
data; ganti bentuk = ganti versi key (pola `_v1`/`_v2`/`_v3` yang sudah
dipakai store).

## Key localStorage

| Key | Store | Isi |
|---|---|---|
| `mydayz_auth_v1` | `authStore` | `{ isLoggedIn, userName, userEmail }` |
| `myday_tasks_v3` | `taskStore` | `{ tasks, goals }` |
| `myday_habits_v3` | `habitStore` | `{ habits }` |
| `myday-finance` | `financeStore` | `{ transactions }` |
| `myday_diary_v2` | `diaryStore` | `{ entries }` |
| `myday_moods_v2` | `moodStore` | `{ entries }` |
| `myday_calendar_v1` | `calendarStore` | `{ events }` |
| `myday-roadmap` | `roadmapStore` | `{ nodes, edges }` |
| `myday_settings_v1` | `settingsStore` | `{ features }` |
| `mydayz_theme_v2` | `themeStore` | `{ mode }` |
| `mydayz_demo_seeded_v1` | — (flag) | `"1"` bila data contoh pernah di-seed |

Nilai disimpan sebagai JSON Zustand persist: `{ state: {...}, version: 0 }`.

## Bentuk data

### Task (`myday_tasks_v3`)

```ts
interface Task {
  id: string;        // Math.random base36
  title: string;
  date: string;      // "YYYY-MM-DD"
  priority: "high" | "med" | "low";
  tag: string;       // "Kuliah" | "Pribadi" | ...
  time: string;      // "HH:mm" | "" (tanpa jam)
  notes: string;
  done: boolean;
  createdAt: string; // ISO
}
interface Goal {
  id: string;
  title: string;
  type: "mingguan" | "bulanan" | "semestral";
  deadline: string;  // "YYYY-MM-DD" | ""
  progress: number;  // 0–100
  createdAt: string;
}
```

### Habit (`myday_habits_v3`)

```ts
interface Habit {
  id: string;
  name: string;
  icon: string;      // emoji
  freq: "daily" | "weekly"; // default daily
  target: number;    // default 1
  color: string;     // hex
  log: Record<string, boolean>; // "YYYY-MM-DD" → selesai
  createdAt: string;
}
// Turunan (dihitung, tidak disimpan): doneToday, streak (beruntun
// sampai hari ini), last7, totalDone, completionRate (30 hari).
```

### Transaction (`myday-finance`)

```ts
interface Transaction {
  id: string;
  type: "income" | "expense";
  amount?: number;   // IDR
  title?: string;
  category?: string; // "Makan" | "Transport" | ... | "Gaji" | ...
  date?: string;     // "YYYY-MM-DD"
  createdAt?: string;
  note?: string;
}
```

### Diary + Mood (`myday_diary_v2`, `myday_moods_v2`)

```ts
interface DiaryEntry {
  id: string;
  date: string;      // "YYYY-MM-DD" (satu entri per hari)
  content: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
interface MoodEntry {
  id: string;
  date: string;
  v: 1 | 2 | 3 | 4 | 5; // 1 Sangat Buruk … 5 Luar Biasa
  note: string;
  createdAt: string;
}
```

### Calendar (`myday_calendar_v1`)

```ts
interface CustomEvent {
  id: string;        // crypto.randomUUID()
  date: string;
  title: string;
  type: "event" | "deadline" | "exam" | "custom";
  color: string;
  mode: "personal" | "akademik" | "financial" | "salat";
}
```

### Roadmap (`myday-roadmap`)

```ts
interface PersistedRoadmapNode {
  id: string;
  type: "mission" | "milestone";
  position: { x: number; y: number };
  data: {
    id: string;
    title: string;
    description?: string;
    status: "pending" | "in-progress" | "achieved";
    nodeType: "mission" | "milestone";
    iconIndex?: number;
  };
}
interface PersistedRoadmapEdge {
  id: string;
  source: string; // id node
  target: string;
  animated?: boolean;
}
```

### Settings + Theme + Auth

```ts
// myday_settings_v1: { features: { finance: boolean; habits: boolean; cycleTracker: boolean } }
// mydayz_theme_v2:   { mode: "dark" | "light" }
// mydayz_auth_v1:    { isLoggedIn: boolean; userName: string; userEmail: string }
```

## Data contoh (seed)

`src/lib/demo.ts` — lihat `docs/DEMO.md`. Seed hanya jalan bila
**semua** store kosong; isinya tanggal-relatif terhadap hari ini
(`YYYY-MM-DD` lokal via `toISOString`, konsisten dengan seluruh app).

## Migrasi

Bila bentuk berubah, naikkan versi key (mis. `myday_tasks_v4`) dan
biarkan key lama tidak terbaca — data lama tidak dimigrasi otomatis.
Sejauh ini belum pernah ada migrasi; key `_v3`/`_v2` adalah peninggalan
versi app sebelumnya.

## Batasan yang diketahui

- **Tidak ada sinkronisasi**: ganti browser/perangkat = data baru.
- **Tidak ada backup otomatis**: hapus localStorage = data hilang.
  Mitigasi: ekspor PDF laporan bulanan (Pengaturan) + Supabase
  berikutnya.
- **Tanggal memakai `toISOString()` (UTC)**, bukan waktu lokal WIB —
  konsisten di seluruh app, tapi entri yang dibuat pukul 00:00–07:00
  WIB tercatat sebagai "kemarin" (UTC). Perilaku bawaan, bukan bug
  yang diperkenalkan PR ini.
