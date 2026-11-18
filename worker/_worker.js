// MyDayz — Cloudflare Pages Worker (tanpa dependensi).
//
// Menggantikan route handler Next.js `src/app/api/chat/route.ts` yang tidak
// bisa hidup di static export. Worker ini melayani:
//   GET  /api/status — kesehatan + mode AI (gemini | unconfigured)
//   POST /api/chat   — chat Gemini (teks + gambar opsional), riwayat
//                      dinormalisasi seperti route handler aslinya
//   lainnya          — diteruskan ke aset statis Pages (env.ASSETS).
//
// GEMINI_API_KEY dibaca dari environment Worker (Pages dashboard →
// Settings → Environment variables, atau `wrangler pages secret put`).
// Tanpa kunci, /api/chat menjawab 503 dengan pesan yang jelas — frontend
// menampilkannya apa adanya, bukan berpura-pura menjawab.
//
// Model dipertahankan dari route handler aslinya: gemini-1.5-flash.

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";

/** Normalisasi riwayat ke format Gemini: selang-seling user/model, diawali user. */
function normalizeHistory(rawHistory) {
  const formatted = [];
  let expectedRole = "user";
  for (const msg of rawHistory || []) {
    const role = msg.role === "assistant" ? "model" : "user";
    const text = typeof msg.content === "string" ? msg.content : "";
    if (role === expectedRole) {
      formatted.push({ role, parts: [{ text }] });
      expectedRole = expectedRole === "user" ? "model" : "user";
    } else if (role === "user" && expectedRole === "model") {
      // Dua pesan user beruntun: gabung ke pesan user terakhir.
      const last = formatted[formatted.length - 1];
      if (last && last.role === "user") last.parts[0].text += "\n" + text;
    }
  }
  // Pesan baru dari user harus didahului 'model'.
  if (formatted.length > 0 && formatted[formatted.length - 1].role === "user") {
    formatted.pop();
  }
  return formatted;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function handleChat(req, env) {
  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body harus JSON." }, 400);
  }
  const { message, history, image } = body || {};
  if (!message && !image) {
    return json({ error: "Kirim `message` atau `image`." }, 400);
  }
  if (!env.GEMINI_API_KEY) {
    return json(
      {
        error:
          "GEMINI_API_KEY belum dikonfigurasi di deployment ini — AI Assistant tidak aktif. " +
          "Pasang kuncinya di Pages → Settings → Environment variables, atau pakai semua fitur lain yang tetap jalan tanpa AI.",
        code: "AI_KEY_REQUIRED",
      },
      503
    );
  }

  const parts = [];
  if (message) parts.push({ text: message });
  if (image) {
    const m = String(image).match(/data:(.*?);base64,/);
    if (m && m[1]) {
      parts.push({
        inlineData: { data: String(image).split(",")[1], mimeType: m[1] },
      });
    }
    if (!message) parts.push({ text: "Tolong jelaskan apa yang ada di gambar ini." });
  }

  const payload = {
    contents: [...normalizeHistory(history), { role: "user", parts }],
  };

  const res = await fetch(
    `${GEMINI_API}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data && data.error && data.error.message) ||
      `Gemini menjawab HTTP ${res.status}.`;
    return json({ error: msg }, 502);
  }
  const reply =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("") || "";
  if (!reply) return json({ error: "Gemini tidak mengembalikan teks." }, 502);
  return json({ reply });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === "/api/status" && req.method === "GET") {
      return json({
        ok: true,
        mode: env.GEMINI_API_KEY ? "gemini" : "unconfigured",
        engine: "gemini",
        model: GEMINI_MODEL,
      });
    }

    if (url.pathname === "/api/chat" && req.method === "POST") {
      return handleChat(req, env);
    }

    if (url.pathname === "/api/chat" || url.pathname === "/api/status") {
      return json({ error: "Method tidak didukung." }, 405);
    }

    return env.ASSETS.fetch(req);
  },
};
