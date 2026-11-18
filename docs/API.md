# API — MyDayz (Pages Worker)

Semua endpoint hidup di Pages Worker (`worker/_worker.js`), bukan di
Next.js. Di lokal, `scripts/serve-worker.mjs` menyajikan kontrak yang
sama di `http://127.0.0.1:8332`.

## GET /api/status

Kesehatan + mode AI.

```bash
curl -s https://my-dayz.pages.dev/api/status
```

```json
{
  "ok": true,
  "mode": "unconfigured",
  "engine": "gemini",
  "model": "gemini-1.5-flash"
}
```

| Field | Arti |
|---|---|
| `ok` | Selalu `true` bila Worker hidup |
| `mode` | `gemini` (kunci terpasang) atau `unconfigured` (tidak ada kunci) |
| `engine` | `gemini` |
| `model` | Model Gemini yang dipakai `/api/chat` |

Dipakai pill sidebar (`AI Active` vs `AI Belum Aktif`) dan smoke test CI.

## POST /api/chat

Chat dengan Gemini (teks dan/atau gambar).

```bash
curl -s -X POST https://my-dayz.pages.dev/api/chat \
  -H 'content-type: application/json' \
  -d '{"message": "Apa rencanaku hari ini?", "history": []}'
```

### Request

```jsonc
{
  "message": "string, opsional bila ada image",
  "image": "data:image/jpeg;base64,... (opsional)",
  "history": [
    { "role": "user" | "assistant", "content": "string" }
  ]
}
```

- `history` dinormalisasi Worker: selang-seling `user`/`model`,
  diawali `user`; dua pesan `user` beruntun digabung; pesan terakhir
  yang `user` dibuang supaya pesan baru valid.
- Bila `image` ada tanpa `message`, Worker menambah prompt
  "Tolong jelaskan apa yang ada di gambar ini."

### Response sukses (200)

```json
{ "reply": "Jawaban Gemini ..." }
```

### Error

| Status | Body | Arti |
|---|---|---|
| 400 | `{ "error": "Body harus JSON." }` | Body bukan JSON |
| 400 | `{ "error": "Kirim \`message\` atau \`image\`." }` | Pesan kosong |
| 503 | `{ "error": "GEMINI_API_KEY belum dikonfigurasi ...", "code": "AI_KEY_REQUIRED" }` | Kunci belum dipasang — frontend menampilkan pesan ini apa adanya |
| 502 | `{ "error": "<pesan dari Gemini>" }` | Gemini menjawab non-2xx atau tanpa teks |
| 405 | `{ "error": "Method tidak didukung." }` | Method selain POST ke `/api/chat` |

### Catatan

- Tanpa `GEMINI_API_KEY`, endpoint TIDAK PERNAH mengembalikan
  jawaban palsu. Itu kontrak yang diuji CI (`smoke` job).
- Tidak ada autentikasi/rate limit di endpoint ini (lihat
  `docs/SECURITY.md` — mitigasi berikutnya).
- Model dipertahankan dari route handler aslinya: `gemini-1.5-flash`.
  Ganti satu konstanta `GEMINI_MODEL` di `worker/_worker.js` bila
  model pensiun.
