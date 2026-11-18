# Desain — MyDayz

## Identitas visual

- **Aksen**: pink `#EC4899` → rose `#F43F5E` (gradasi tombol, logo,
  sorotan). Satu-satunya warna aksen; semua modul memakai gradasi yang
  sama supaya terasa satu produk.
- **Tipografi**: Inter (next/font, latin) — geometris bersih ala Linear.
  Mono (`font-mono`) untuk label kecil, jam, dan angka statistik.
- **Tema**: gelap default (`#0A0A0A` base, `#1A1A1A` surface), terang
  (`#F4F4F5` base, `#FFFFFF` surface). Semua warna lewat variabel CSS
  (`--bg-base`, `--bg-surface`, `--text-primary`, `--border-subtle`,
  ... — lihat `src/app/globals.css`); komponen tidak memakai warna
  hardcode kecuali aksen.
- **Grain overlay**: tekstur noise SVG 1,8% opacity di atas segalanya
  (`GrainOverlay`) — memberi kesan "kertas", bukan plastik.
- **Ikon**: Lucide (bukan emoji) untuk UI; emoji hanya untuk ikon habit
  (pilihan pengguna) dan ikon kategori keuangan. Ikon brand GitHub
  digambar sebagai SVG inline — lucide-react 1.x tidak lagi mengekspor
  ikon brand.

## Prinsip layout

- **Shell**: sidebar 240px desktop (grup Core / Life / Intelligence),
  drawer geser + bottom nav di mobile, top bar mobile. Konten
  `max-w-[960px]` kecuali rute full-bleed (`/ai`, `/roadmap`).
- **Kartu**: `themed-card` — surface + border subtle + radius 16–24px.
  Jarak konsisten 24px (`space-y-6`).
- **Animasi**: framer-motion — masuk halaman (opacity + y 6–10px,
  0,25–0,3 dtk), tap (scale 0,93–0,98), AnimatePresence `mode="wait"`
  antar-rute. Tidak ada animasi yang menghalangi klik.
- **Timeline dashboard**: garis vertikal per jam 06:00–23:00, jam
  berjalan ditandai titik pink + garis hidup; task tanpa jam di bagian
  "Tanpa Jadwal".

## Landing

- Gelap, satu kolom tengah, glow pink radial di belakang hero.
- Urutan: navbar (logo + v3.0 + Fitur/Produk/Cara kerja + GitHub +
  Masuk) → badge "Personal AI OS v3.0" → judul raksasa MyDayz →
  tagline → 2 CTA → catatan "tanpa daftar" → preview produk (frame
  browser + screenshot asli) → 8 kartu fitur → 3 langkah → kartu
  "Datamu tetap milikmu" → CTA akhir → footer.
- Preview memakai `public/preview-dashboard.png` — tangkapan layar
  asli dashboard mode demo, diregenerasi tiap play-test
  (`scripts/screenshot.mjs`).

## Halaman aplikasi

- **Dashboard**: sapaan + jam besar (mono 30px) → AI command bar
  (pill gelap, ikon sparkle) → 3 kartu stat → divider → timeline.
- **Finance**: 3 kartu angka (saldo hijau, income, expense) → grafik
  area cashflow 7 hari (Recharts, hijau/merah) → daftar transaksi.
- **Habits**: kartu habit + streak flame; modal tambah habit.
- **Roadmap**: canvas gelap berbintik (xyflow), node misi gelap +
  node milestone terang, edge putus-putus animasi; minimap kanan bawah.
- **AI Vault**: header + pesan (bubble gelap untuk AI, gradasi pink
  untuk user) + input pill bawah + "Active Core: Gemini 1.5 Flash".
- **Pengaturan**: seksi Tampilan / Modul Tambahan / Data & Ekspor /
  Data Contoh / Akun; toggle custom (spring framer-motion).

## Yang sengaja TIDAK dilakukan

- **Tidak ada grafik di landing/dashboard selain yang ada**: grafik
  hanya di Finance (cashflow) dan statistik habit — sesuai preferensi
  Nabil (grafik cukup di Statistik).
- **Tidak ada ilustrasi stok**: preview adalah screenshot asli;
  tidak ada mockup Figma yang berpura-pura jadi produk.
- **Tidak ada mode "premium"**: semua modul aktif untuk semua orang;
  toggle di Pengaturan hanya menyembunyikan modul dari nav.
