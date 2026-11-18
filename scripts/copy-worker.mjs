// Menyalin Pages Worker ke out/ supaya `next build` (static export) ikut
// men-deploy-nya sebagai _worker.bundle (lihat cf_pages.py).
// Dijalankan otomatis sebagai bagian dari `npm run build`.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "..", "worker", "_worker.js");
const destDir = path.join(__dirname, "..", "out");
const dest = path.join(destDir, "_worker.js");

if (!existsSync(src)) {
  console.error(`copy-worker: worker tidak ditemukan di ${src}`);
  process.exit(1);
}
mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`copy-worker: ${dest}`);
