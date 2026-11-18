# PRD — MyDayz

## 1. Informasi Proyek

| Field | Nilai |
|---|---|
| Nama Proyek | MyDayz — Personal AI OS |
| Deskripsi | Satu command center untuk tugas, keuangan, kebiasaan, diary, kalender, roadmap, dan AI — local-first di browser |
| Tech Stack | Next.js 16 (App Router, static export) + React 19 + Tailwind CSS 4 + Zustand + xyflow + Recharts + Gemini (via Pages Worker) + Supabase (opsional, belum aktif) |
| Status | Proper v3.0 — live di Cloudflare Pages |
| Penanggung Jawab | Nabil Aulia Dika (dezzorigin) |
| Versi Dokumen | 3.0 |
| Tanggal | 18 November 2026 |

## 2. Latar Belakang

Pengguna membutuhkan satu tempat — bukan tujuh aplikasi — untuk menjalankan
harinya: apa yang harus dikerjakan jam berapa, kebiasaan apa yang dijaga,
uang keluar ke mana, bagaimana perasaan hari ini, dan target besar apa yang
sedang dikejar. MyDayz menjawab itu sebagai **Personal AI OS**: dashboard
sebagai command center, delapan modul yang saling terhubung, dan asisten AI
untuk bertanya dan mencatat cepat.

Aplikasi ini **local-first**: semua data tinggal di `localStorage` browser.
Tidak ada akun, tidak ada server yang menyimpan data pengguna, tidak ada
pelacakan. Itu keputusan desain, bukan kekurangan sementara — lihat §9.

## 3. Masalah yang Diselesaikan

1. **Fragmentasi**: tugas di satu aplikasi, keuangan di aplikasi lain,
   habit di aplikasi ketiga. MyDayz menyatukan 8 modul dalam satu shell.
2. **Gesekan masuk**: aplikasi produktivitas umumnya memaksa daftar +
   verifikasi email sebelum terlihat isinya. MyDayz: masuk sebagai demo,
   data contoh langsung terisi, produk langsung bisa dinilai.
3. **AI yang berpura-pura**: banyak demo AI menjawab apa pun padahal
   kuncinya tidak terpasang. MyDayz menampilkan status AI apa adanya
   (pill sidebar + error 503 yang jelas) dan tetap jalan penuh tanpa AI.

## 4. Tujuan & Sasaran

- Pengguna baru memahami produk dalam < 1 menit (landing → demo → dashboard).
- Semua fitur inti bisa dipakai tanpa akun dan tanpa kunci AI.
- Data pengguna tidak pernah meninggalkan browser kecuali ia sendiri
  yang mengekspor (PDF) — sampai sinkronisasi cloud diaktifkan.
- Build + lint + typecheck hijau di CI; deploy statis di Cloudflare Pages.

## 5. Ruang Lingkup

### In Scope
- Landing ala SaaS (navbar + GitHub, hero, preview produk asli, 8 fitur, cara kerja, footer).
- 8 modul: Dashboard, Planner (tasks + goals), Kalender, Finance, Habits,
  Daily Diary, Neural Map (roadmap xyflow), AI Assistant (chat Gemini).
- Auth lokal (dummy — email apa pun) + mode demo dengan data contoh.
- Ekspor laporan bulanan ke PDF (dari Pengaturan).
- Mode gelap/terang, responsif (sidebar desktop, bottom nav + drawer mobile).
- Pages Worker untuk `/api/chat` (Gemini) + `/api/status`.

### Out of Scope
- **Sinkronisasi cloud Supabase** (Auth, Postgres, Storage): arsitektur
  disiapkan (`src/lib/supabase.ts` lazy + `.env.example`), belum diaktifkan.
  Data antar-perangkat belum tersinkron; ganti browser = mulai dari nol.
- **AI tanpa kunci**: tanpa `GEMINI_API_KEY`, AI Assistant menjawab 503
  dengan penjelasan — bukan jawaban palsu.
- **Multi-user / kolaborasi**: satu pengguna per browser.
- **Notifikasi/push**: belum ada.

## 6. Fitur & Persyaratan Fungsional

### 6.1 Landing (`/`)
- Navbar: logo, tautan Fitur/Produk/Cara kerja, ikon GitHub → repo,
  tombol Masuk. Hero + 2 CTA (Masuk Sekarang, Lihat produknya).
- Preview produk: tangkapan layar **asli** dashboard (bukan mockup) di
  dalam frame browser. 8 kartu fitur. 3 langkah cara kerja. Kartu
  "Datamu tetap milikmu". Footer (GitHub, MIT, © 2026).
- Pengguna login otomatis dilempar ke `/dashboard`.

### 6.2 Auth (`/login`, `src/store/authStore.ts`)
- Login dummy: email apa pun diterima (password tidak diperiksa).
- Tombol **"Masuk sebagai demo"** → login sebagai `demo@mydayz.local` +
  isi data contoh bila semua store kosong.
- Sesi tersimpan di localStorage (`mydayz_auth_v1`); logout dari
  Pengaturan atau sidebar.

### 6.3 Dashboard (`/dashboard`)
- Sapaan berdasarkan waktu (Pagi/Siang/Sore/Malam) + jam live (WIB) +
  tanggal Indonesia.
- AI Command Bar: tanya cepat → `POST /api/chat`; error worker
  ditampilkan apa adanya.
- Quick Stats: task pending hari ini, habit selesai hari ini (x/y),
  pengeluaran bulan ini (IDR, format compact ≥ Rp1jt).
- Vertical Timeline 06:00–23:00: task per jam, garis "sekarang" live,
  tambah task inline per jam, toggle selesai, prioritas high ditandai.
- FAB membuka Secondary Drawer (habit/finance/diary cepat).

### 6.4 Planner (`/planner`)
- Daftar task + goals (mingguan/bulanan/semestral) dengan progres.
- Tambah task/goal lewat modal; toggle, hapus, ubah progres.

### 6.5 Kalender (`/calendar`)
- Grid bulanan 35/42 hari; mode Personal/Akademik/Financial/Salat.
- Event kustom (event/deadline/exam/custom) + badge per hari; tambah/hapus.

### 6.6 Finance (`/finance`)
- Saldo, pemasukan, pengeluaran bulan berjalan; grafik cashflow 7 hari
  (Recharts Area); daftar transaksi terbaru; tambah transaksi (kategori
  Indonesia: Makan, Transport, Hiburan, Belanja, Tagihan, Kos/Rumah,
  Kesehatan, Edukasi, Lainnya; pemasukan: Gaji, Freelance, Uang Saku,
  Bonus, Lainnya). Mata uang IDR.

### 6.7 Habits (`/habits`)
- Tambah habit (nama, ikon emoji, warna); toggle log harian; streak
  (beruntun sampai hari ini), riwayat 7 hari, total, completion rate
  30 hari; habit terpanjang.

### 6.8 Daily Diary (`/diary`)
- Entri per tanggal (satu per hari) + mood 1–5 + tag; baca/tulis/ubah/hapus.
- Mood juga tersimpan di `moodStore` (dipakai halaman lain).

### 6.9 Neural Map (`/roadmap`, xyflow)
- Canvas tak berhingga: node Mission + Milestone, edge antar-node,
  drag, zoom, minimap, tambah node (double-click / tombol), ubah status
  (Pending → In Progress → Achieved, klik node), hapus, reset.
- Persisten di localStorage; data contoh: 1 misi + 3 milestone.

### 6.10 AI Assistant (`/ai`)
- Chat dengan Gemini 1.5 Flash (teks + gambar + voice input via Web
  Speech API). Riwayat dinormalisasi (selang-seling user/model).
- Perintah "ingatkan/tambahkan task/jadwalkan ..." otomatis menambah task.
- Tanpa kunci: pesan error 503 dari worker ditampilkan di chat
  (bukan jawaban palsu). Footer halaman menulis model aktif.

### 6.11 Pengaturan (`/settings`)
- Mode gelap/terang; toggle modul (Finance/Habits/Cycle Tracker).
- Laporan bulanan → ekspor PDF (html2pdf.js).
- **Data contoh**: muat data contoh (hanya bila semua kosong) +
  hapus semua data. Logout.

## 7. Persyaratan Non-Fungsional

- **Performa**: static export; first paint landing dari HTML prerender
  (bukan shell kosong — lihat `docs/ARCHITECTURE.md` § AuthGate).
  Semua halaman prerender 13/13 saat build.
- **Keamanan**: rahasia (`.env`) tidak boleh ter-commit; gunakan
  `.env.example`. Kunci Gemini hanya hidup sebagai environment variable
  Worker — tidak pernah ke browser. Lihat `docs/SECURITY.md`.
- **Aksesibilitas**: kontras tema gelap/terang via variabel CSS;
  navigasi keyboard standar; `aria-label` pada ikon tautan.
- **Maintainability**: kode terstruktur per modul (store per domain),
  terdokumentasi; lint 0 error; typecheck hijau.
- **Portabilitas**: jalan di Linux/macOS/Windows; deploy di Cloudflare
  Pages (static + Worker); dev lokal via `npm run dev` / `npm run serve`.

## 8. Arsitektur & Tech Stack

Lihat `docs/ARCHITECTURE.md` + `docs/DIAGRAMS.html`. Ringkas: browser
(Zustand + localStorage) → Cloudflare Pages (`out/`, 13 halaman statis)
→ Pages Worker (`worker/_worker.js`: `/api/status`, `/api/chat` →
Gemini REST) → Supabase (opsional, belum aktif).

## 9. Keputusan Desain yang Dikunci

1. **Local-first, bukan "belum sempat backend"**. Supabase adalah
   lapisan sinkronisasi *berikutnya*, bukan prasyarat. `lib/supabase.ts`
   dibuat lazy/guarded supaya import-nya tidak pernah meledak tanpa env.
2. **Demo jujur**. Data contoh hanya terisi bila semua store kosong,
   tidak pernah menimpa data pengguna; penanda `mydayz_demo_seeded_v1`.
3. **AI jujur**. Status AI dibaca dari `/api/status` (pill sidebar);
   tanpa kunci, chat menjawab 503 `AI_KEY_REQUIRED` + penjelasan.
4. **SSR berisi konten**. Landing/login di-render saat prerender;
   AuthGate tidak lagi mengembalikan `null` sebelum mount (dulu semua
   halaman ter-prerender sebagai `<div hidden>` kosong).

## 10. Milestone / Roadmap

| Fase | Status |
|---|---|
| Inisialisasi & scaffolding | ✅ |
| Fitur inti (8 modul + AI) | ✅ |
| Mode demo + data contoh | ✅ |
| Static export + Worker + CI | ✅ (PR ini) |
| Deploy live Cloudflare Pages | ✅ (PR ini) |
| Screenshot asli + video demo | ✅ (PR ini) |
| Sinkronisasi cloud Supabase | ⏳ (berikutnya) |
| Notifikasi / pengingat | ⏳ (wacana) |

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Data hilang bila localStorage dibersihkan | Dieksplisitkan di UI + docs; ekspor PDF; Supabase berikutnya |
| Kunci Gemini bocor | Hanya env Worker; tidak ada kunci di repo (cek: `grep` di CI manual) |
| Model Gemini pensiun (`gemini-1.5-flash`) | Worker mengembalikan error API apa adanya (502); ganti satu konstanta |
| Nav `/neural-roadmap` mati (pernah) | Diperbaiki ke `/roadmap`; smoke test curl semua rute |

## 12. Kriteria Keberhasilan

- `npm run typecheck` + `npm run lint` (0 error) + `npm run build` hijau.
- CI 4 job hijau (build, advisory-sweep, smoke, docs).
- Play-test headless: 13 screenshot asli semua halaman + login demo
  mengisi data contoh; video demo 15 detik dari screenshot yang sama.
- Live: HTTP 200 semua rute; `/api/status` mode `unconfigured`;
  `POST /api/chat` tanpa kunci → 503 `AI_KEY_REQUIRED`.

## 13. Lampiran

- Struktur: lihat README.md
- Arsitektur: docs/ARCHITECTURE.md, docs/DIAGRAMS.html
- Skema data: docs/SCHEMA.md
- Keamanan: docs/SECURITY.md
- Deployment: docs/DEPLOYMENT.md
- Lisensi: MIT (LICENSE)
