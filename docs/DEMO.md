# Mode Demo — MyDayz (tanpa akun)

## Apa itu mode demo

MyDayz berjalan **local-first tanpa akun**: semua fitur bisa dipakai
tanpa daftar dan tanpa kunci AI.

| Aspek | Mode saat ini (live) |
|---|---|
| Akun | Tidak ada — email apa pun diterima, atau "Masuk sebagai demo" |
| Data disimpan di | `localStorage` browser ini (lihat `docs/SCHEMA.md`) |
| AI Assistant | Worker `/api/chat` — aktif bila `GEMINI_API_KEY` terpasang, 503 bila tidak |
| Riwayat | Hanya di browser ini (hilang bila cache dibersihkan) |
| Sinkronisasi cloud | Belum ada (Supabase disiapkan, belum aktif) |

Mode dipilih otomatis: Supabase tidak terpasang → mode lokal.
Tidak ada banner "mode demo" yang mengganggu — perilaku lokal adalah
perilaku produk, bukan fallback.

## Data contoh (seed)

Saat pertama kali login, bila **semua** store masih kosong, MyDayz
mengisi localStorage dengan data contoh (`src/lib/demo.ts`,
`seedDemoIfEmpty()`). Data ini tanggal-relatif terhadap hari ini,
bukan karangan lepas — diambil dari pola pemakaian nyata (kuliah,
uang saku, UAS):

- **5 task + 1 goal** — "Review materi kuliah Basis Data II" 08:00
  (selesai), "Kerjakan latihan soal Aljabar Linier" 10:30,
  "Beli bahan makanan mingguan" 16:00, "Olahraga ringan 30 menit"
  17:30 (selesai), "Siapkan presentasi kelompok UAS Prak SO" besok
  09:00; goal mingguan "Selesaikan laporan UAS Prak SO" (40%).
- **3 habit** — "Minum 2L air" (streak 5 hari), "Baca 20 menit"
  (3 hari terakhir), "Olahraga pagi" (hari ini).
- **5 transaksi IDR** — pemasukan "Uang saku" Rp1.500.000 (tgl 1);
  pengeluaran: makan Rp35.000, bensin Rp15.000, belanja Rp120.000,
  tagihan Rp250.000.
- **1 entri diary + 3 mood** (hari ini 4/5, kemarin 3/5, lusa 5/5).
- **2 event kalender** — rapat kelompok (hari ini), kumpul draft (besok).
- **Roadmap** — misi "Lulus Semester 4 — IPK ≥ 3.5" + 3 milestone
  (UTS Basis Data II = achieved, UAS Prak SO = in-progress,
  English Test = pending).

Seed **tidak pernah menimpa** data pengguna: bila satu saja store
sudah berisi, tidak ada yang di-seed. Penanda:
`localStorage mydayz_demo_seeded_v1`.

Hapus data contoh (dan semua data) dari Pengaturan → "Hapus semua
data" (`clearDemoData()`), atau muat ulang dari Pengaturan → "Muat
data contoh" (hanya bila semua kosong).

Key localStorage: lihat `docs/SCHEMA.md`.

## Alur demo (play-test)

```
Landing → Masuk → "Masuk sebagai demo"
  → seedDemoIfEmpty() (bila kosong)
  → /dashboard: sapaan + stats (2 pending, 3/3 habit, Rp420.000)
    + timeline berisi task contoh
  → /planner, /habits, /finance, /diary, /calendar, /roadmap, /ai,
    /settings — semua terisi data contoh
  → /ai: kirim pesan → 503 AI_KEY_REQUIRED (tanpa kunci, jujur)
```

## Keterbatasan yang diketahui

1. **AI butuh kunci.** Tanpa `GEMINI_API_KEY`, AI Assistant dan AI
   Command Bar menjawab error yang jelas. Semua fitur lain tetap jalan.
2. **Data lokal.** Data demo hilang bila localStorage dibersihkan
   atau ganti browser/perangkat. Itu by design — pasang Supabase
   untuk data permanen (lihat `docs/DEPLOYMENT.md`).
3. **Tanggal memakai `toISOString()` (UTC)**, bukan WIB — entri
   00:00–07:00 WIB tercatat sebagai "kemarin" (UTC). Konsisten di
   seluruh app.
4. **Auth dummy.** Email apa pun diterima; password tidak diperiksa.
   Jangan pakai untuk data sensitif multi-user sebelum Supabase Auth.

## File uji

- `scripts/screenshot.mjs` — play-test headless: landing → login →
  demo → semua halaman; gagal (exit 1) bila dashboard tidak berisi
  data contoh atau satu halaman tidak termuat.
- `docs/screenshots/` — 13 screenshot ASLI dari play-test headless.
- `docs/demo/demo.mp4` — video demo 15 detik (6 adegan dari
  screenshot yang sama, zoom halus).
- `public/preview-dashboard.png` — tangkapan dashboard asli yang
  dipakai preview di landing.
