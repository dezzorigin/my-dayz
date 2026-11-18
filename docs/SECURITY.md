# Keamanan — MyDayz

## Model ancaman

Aplikasi local-first + satu Worker. Permukaan serangan:

1. **Kunci Gemini** — satu-satunya rahasia produk.
2. **Data pengguna** — hanya di `localStorage` browser masing-masing.
3. **Dependensi** — rantai npm (Next.js, React, xyflow, Recharts, ...).
4. **Input pengguna** — judul task, isi diary, chat, upload gambar ke AI.

## Aturan

### Kunci Gemini tidak pernah ke browser

- `GEMINI_API_KEY` hanya dibaca Worker dari environment
  (`env.GEMINI_API_KEY`). Tidak ada `NEXT_PUBLIC_*` untuk kunci ini.
- Worker memanggil Gemini REST server-to-server; browser hanya melihat
  `/api/chat` dan balasan `{ reply }`.
- Tanpa kunci, Worker menjawab 503 `AI_KEY_REQUIRED` — frontend tidak
  pernah mendapat kunci palsu atau jawaban palsu.

### Tidak ada secret ke-commit

- `.env*` di-`.gitignore` (termasuk `.env.local`). Yang ada di repo
  hanya `.env.example` (nama variabel + penjelasan, tanpa nilai).
- Pengecekan manual sebelum PR ini: `grep -r` untuk pola
  `supabase.co`, token JWT (`eyJhbGci`), dan `api[_-]?key\s*=\s*['"]`
  di `src/` — **nol temuan**. Tidak ada file `.env` di repo.
- Bila kunci pernah ter-commit: cabut/rotasi di Google AI Studio,
  jangan hanya menghapus dari tree (riwayat git tetap menyimpan).

### Data lokal

- Data hanya di `localStorage` asal yang sama (same-origin). Tidak ada
  pengiriman ke server mana pun kecuali teks/gambar chat ke Gemini
  (oleh Worker, hanya saat pengguna mengirim pesan).
- Gambar yang dikirim ke AI Vault dikirim sebagai base64 ke Worker →
  Gemini, lalu dibuang (tidak disimpan di mana pun).
- Ekspor PDF dibuat di browser (html2pdf.js); tidak ada upload.

### Dependensi

- CI job `advisory-sweep` (bukan `npm audit --omit=dev` — bug npm
  melaporkan advisory dev-only): memeriksa **hanya pohon produksi**
  terhadap GitHub Advisory Database; FAIL bila ada temuan high/critical
  di produksi.
- Klasifikasi dep dijaga: tidak ada CLI/build tool di `dependencies`
  (pelajaran repo #22: `shadcn` CLI di `dependencies` menyeret 57
  temuan HIGH). Di repo ini: `@google/generative-ai` dihapus saat route
  handler Next.js diganti Worker; `puppeteer-core` hanya devDependency
  (play-test), tidak ikut bundle produksi.
- `npm ci` di CI memakai `package-lock.json` (bukan `npm install`).

### Input

- Semua input pengguna di-render sebagai teks React (escaped otomatis)
  — tidak ada `dangerouslySetInnerHTML` di `src/`.
- Chat: riwayat dinormalisasi di Worker sebelum ke Gemini (peran
  selang-seling, diawali `user`); body bukan JSON → 400; pesan kosong
  → 400.
- Upload gambar: hanya `data:image/*;base64` yang diteruskan
  (mime diambil dari prefix, bukan dari nama file).

## Yang BELUM aman / bukan klaim

- **Auth dummy**: login menerima email apa pun; password tidak
  diperiksa. Ini mode demo yang disengaja — JANGAN dipakai untuk data
  sensitif multi-user. Supabase Auth adalah prasyarat sebelum ada data
  yang dibagikan antar-perangkat.
- **Tanpa RLS / tanpa backend data**: tidak ada data server yang perlu
  dilindungi hari ini; saat Supabase aktif, RLS wajib diverifikasi
  sebelum satu baris data nyata masuk (pelajaran ArticleTemplate:
  `schema.sql` tanpa RLS = order bisa diubah jadi lunas sendiri).
- **Tanpa CSP/headers keamanan kustom** di Pages (default Cloudflare).
- **Tanpa rate limit** di `/api/chat` — kunci Gemini bisa terkuras
  bila endpoint dipanggil massal. Mitigasi berikutnya: rate limit di
  Worker + kuota per hari.

## Checklist sebelum deploy

- [ ] `grep` secret di `src/` + `worker/` nol temuan.
- [ ] `GEMINI_API_KEY` hanya di Pages env (bukan di repo, bukan di chat).
- [ ] `advisory-sweep` hijau di CI.
- [ ] `/api/status` live menunjukkan `unconfigured` (bila kunci
      memang belum dipasang) — bukan `gemini` palsu.
