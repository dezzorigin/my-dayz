// Local dev server: serves out/ statically and routes /api/* through
// worker/_worker.js with the ASSETS binding backed by the filesystem.
// Usage: npm run build && npm run serve
// (default port 8332 — 8330 dipakai apk-builder, 8331 dipakai docsumm).
import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../worker/_worker.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "out");
const PORT = Number(process.env.PORT || 8332);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

const ASSETS = {
  async fetch(req) {
    const url = new URL(req.url);
    let p = decodeURIComponent(url.pathname);
    if (p === "/") p = "/index.html";
    // Static export: /dashboard → out/dashboard/index.html
    const file = path.join(OUT, p);
    if (!file.startsWith(OUT) || !existsSync(file) || statSync(file).isDirectory()) {
      const indexFile = path.join(OUT, p, "index.html");
      if (existsSync(indexFile)) {
        return new Response(await readFile(indexFile), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      // Next static export menyimpan halaman sebagai <rute>.html.
      const htmlFile = `${file}.html`;
      if (existsSync(htmlFile)) {
        return new Response(await readFile(htmlFile), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      const notFound = path.join(OUT, "404.html");
      if (existsSync(notFound)) {
        return new Response(await readFile(notFound), {
          status: 404,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      return new Response("Not found", { status: 404 });
    }
    const ext = path.extname(file);
    return new Response(await readFile(file), {
      headers: { "content-type": MIME[ext] || "application/octet-stream" },
    });
  },
};

const server = http.createServer(async (req, res) => {
  try {
    const url = `http://${req.headers.host}${req.url}`;
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : await new Response(req).arrayBuffer(),
      duplex: "half",
    });
    // env Worker lokal: tanpa GEMINI_API_KEY, jadi /api/chat menjawab 503
    // yang sama seperti deployment tanpa kunci (lihat worker/_worker.js).
    const response = await worker.fetch(request, { ASSETS, GEMINI_API_KEY: process.env.GEMINI_API_KEY || "" });
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    if (response.body) {
      for await (const chunk of response.body) res.write(chunk);
    }
    res.end();
  } catch (e) {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(`serve-worker error: ${e.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`my-dayz serve: http://127.0.0.1:${PORT}/`);
});
