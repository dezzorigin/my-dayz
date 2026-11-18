# Dokumentasi — MyDayz

Indeks dokumen repo ini. Mulai dari README.md (root) untuk gambaran
cepat, lalu ke sini bila perlu detail.

| Dokumen | Isi |
|---|---|
| [README.md](../README.md) | Gambaran produk, cara jalan, screenshot, video demo |
| [PRD.md](../PRD.md) | PRD v3.0 (ruang lingkup, fitur, kriteria keberhasilan) — sumber kanonik di root repo |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Lapisan, state, Worker, keputusan arsitektur |
| [COMPONENTS.md](COMPONENTS.md) | Komponen + halaman + store |
| [SCHEMA.md](SCHEMA.md) | Skema data localStorage per store |
| [SECURITY.md](SECURITY.md) | Model ancaman, aturan kunci, checklist deploy |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deploy Cloudflare Pages + verifikasi live |
| [DEMO.md](DEMO.md) | Mode demo + data contoh + play-test |
| [DESIGN.md](DESIGN.md) | Identitas visual + prinsip layout |
| [API.md](API.md) | Kontrak `GET /api/status`, `POST /api/chat` |
| [DIAGRAMS.html](DIAGRAMS.html) | Diagram arsitektur/alur/data (SVG, bukan Mermaid) |

## Skrip

| Skrip | Peran |
|---|---|
| `scripts/copy-worker.mjs` | Worker → `out/_worker.js` saat build |
| `scripts/serve-worker.mjs` | Serve lokal `out/` + Worker (`:8332`) |
| `scripts/screenshot.mjs` | Play-test headless + 13 screenshot asli |
| `scripts/make-video.mjs` | Video demo 15 dtk dari screenshot |
| `scripts/advisory-sweep.py` | Gate advisory produksi (GitHub Advisory DB) |

## Alur kerja cepat

```bash
npm ci
npm run dev          # dev server :3000
npm run build        # static export + worker
npm run serve        # sajikan out/ + Worker di :8332
node scripts/screenshot.mjs   # play-test + screenshot
node scripts/make-video.mjs   # video demo
```
