# Deployment — MyDayz

## Ringkasan

| Item | Nilai |
|---|---|
| Platform | Cloudflare Pages (static + Worker) |
| URL live | https://my-dayz.pages.dev |
| Project Pages | `my-dayz` |
| Build | `npm run build` → `next build` (static export) + `copy-worker.mjs` |
| Output | `out/` (13 halaman) + `out/_worker.js` |
| Deploy | `cf_pages.py` (direct-upload API, pola repo P1) |
| CI | `.github/workflows/ci.yml` (build, advisory-sweep, smoke, docs) |

## Cara deploy

### Prasyarat

- Node.js 20, `npm ci` (lockfile).
- Akses Cloudflare (API token via konektor `custom.cloudflare` —
  skrip deploy memakai surrogate yang sama dengan repo P1 lain).
- `python3` + `blake3` untuk `cf_pages.py`.

### Langkah

```bash
# 1. Build (typecheck + lint + build sudah hijau di CI)
npm run build

# 2. Buat project Pages sekali saja (nama global — "my-dayz" bersih)
python3 ~/workspace/github-actions/cf_pages.py create-project my-dayz

# 3. Deploy out/ (termasuk _worker.js sebagai _worker.bundle)
python3 ~/workspace/github-actions/cf_pages.py deploy my-dayz out

# 4. Verifikasi
curl -s -o /dev/null -w "landing %{http_code}\n" https://my-dayz.pages.dev/
curl -s https://my-dayz.pages.dev/api/status
```

### Nama Pages

Nama dicoba berurutan: `my-dayz` → `mydayz` → `hariku`. **`my-dayz`
bersih** (tidak 409, tidak bersufiks) — dipakai. Pelajaran P1: GET
project 404 TIDAK berarti nama tersedia (namespace global); baru
ketahuan saat create.

## Environment variables (Pages)

| Variabel | Wajib | Keterangan |
|---|---|---|
| `GEMINI_API_KEY` | Tidak | Bila kosong, AI menjawab 503 `AI_KEY_REQUIRED` dan semua fitur lain tetap jalan. Pasang di Pages → Settings → Environment variables (production). |
| `NEXT_PUBLIC_SUPABASE_URL` | Tidak | Belum aktif (lihat `src/lib/supabase.ts`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tidak | Belum aktif. |

Tanpa satu pun variabel, deployment tetap jalan penuh dalam mode demo
+ AI nonaktif. Itulah kondisi live saat ini.

## Kenapa bukan `wrangler pages deploy` / git integration

- VM ini tidak punya `wrangler` terinstal stabil; pola P1 memakai
  `cf_pages.py` (direct-upload API, terverifikasi di 20+ repo):
  upload-token JWT → check-missing → assets/upload → upsert-hashes →
  create deployment (dengan `_worker.bundle` bila `out/_worker.js` ada).
- Tidak ada git integration Cloudflare (build di Pages) — build jalan
  di CI GitHub Actions; Pages hanya menerima hasil `out/`.

## Verifikasi live (checklist)

```bash
BASE=https://my-dayz.pages.dev
curl -s -o /dev/null -w "landing %{http_code}\n" $BASE/
curl -s $BASE/ | grep -c "Masuk Sekarang"            # hero di HTML
curl -s $BASE/ | grep -c "github.com/dezzorigin/my-dayz"
for r in dashboard planner habits finance diary calendar roadmap ai settings login; do
  curl -s -o /dev/null -w "/$r %{http_code}\n" $BASE/$r
done
curl -s $BASE/api/status
# {"ok":true,"mode":"unconfigured","engine":"gemini","model":"gemini-1.5-flash"}
curl -s -X POST $BASE/api/chat -H 'content-type: application/json' -d '{}' -w " <- %{http_code}\n"
# {"error":"Kirim `message` atau `image`."} <- 400
curl -s -X POST $BASE/api/chat -H 'content-type: application/json' -d '{"message":"halo"}' -w " <- %{http_code}\n"
# {"error":"GEMINI_API_KEY belum dikonfigurasi ...","code":"AI_KEY_REQUIRED"} <- 503
```

Play-test penuh (klik) hanya bisa dari browser beneran — POST dari VM
ini menggantung untuk endpoint tertentu (artefak egress, terbukti di
repo #22); GET + smoke curl di atas adalah verifikasi yang bisa
dilakukan dari VM. Lihat `docs/DEMO.md` untuk play-test headless lokal
(Chrome + serve-worker), yang sudah memverifikasi alur login demo →
dashboard → semua halaman.

## Rollback

- Deploy ulang `out/` dari commit sebelumnya (tag/branch main sebelum
  PR). Pages menyimpan riwayat deployment; rollback juga bisa dari
  dashboard Pages → Deployments → Rollback.
- Tidak ada migrasi data: semua state di localStorage pengguna, tidak
  tersentuh deploy.

## Lokal

```bash
npm run dev     # Next dev server (port 3000)
npm run build && npm run serve   # out/ + Worker di http://127.0.0.1:8332
```
