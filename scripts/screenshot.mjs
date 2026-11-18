// Screenshot play-test headless MyDayz (dipakai CI lokal + pembuatan
// docs/screenshots/ dan public/preview-dashboard.png).
//   Usage: npm run build && npm run serve &  →  node scripts/screenshot.mjs [baseUrl]
// Memakai puppeteer-core + Chrome cache Playwright (tanpa unduhan baru).
// Alur: landing → login → "Masuk sebagai demo" (seed data contoh) → semua
// halaman inti. Bila satu halaman gagal dimuat, skrip exit 1.
import puppeteer from "puppeteer-core";
import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "screenshots");
const BASE = process.argv[2] || process.env.BASE_URL || "http://127.0.0.1:8332";
const CHROME =
  process.env.CHROME_PATH ||
  path.join(
    process.env.HOME || "",
    ".cache/ms-playwright/chromium-1234/chrome-linux/chrome"
  );

mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name, { fullPage = false } = {}) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage });
  console.log("shot:", name);
  return file;
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-device-scale-factor=1"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on("pageerror", (e) => console.error("pageerror:", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.error("console.error:", m.text().slice(0, 300));
  });

  // ── Landing ──
  await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 30000 });
  await sleep(1500);
  await shot(page, "01-landing-hero.png");
  await shot(page, "02-landing-full.png", { fullPage: true });

  // ── Login → demo ──
  await page.goto(BASE + "/login", { waitUntil: "networkidle0", timeout: 30000 });
  await sleep(1200);
  await shot(page, "03-login.png");
  // Klik tombol "Masuk sebagai demo" (teks eksak dari src/app/login/page.tsx)
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const b = btns.find((x) => x.textContent.includes("Masuk sebagai demo"));
    if (!b) return false;
    b.click();
    return true;
  });
  if (!clicked) throw new Error("tombol demo tidak ditemukan di /login");
  await page.waitForFunction(() => location.pathname === "/dashboard", { timeout: 15000 });
  // Tunggu konten dashboard benar-benar ter-render (bukan sleep tetap —
  // animasi + rehidrasi zustand butuh waktu yang bervariasi).
  try {
    await page.waitForFunction(
      () => document.body.innerText.includes("TIMELINE HARI INI"),
      { timeout: 15000 }
    );
  } catch {
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 500));
    await page.screenshot({ path: path.join(OUT, "debug-dashboard.png") });
    throw new Error(`dashboard tidak me-render timeline. innerText awal: ${JSON.stringify(txt)}`);
  }

  // Verifikasi data contoh ter-seed (stat "Pending" + timeline terisi).
  // CATATAN: innerText menerapkan text-transform CSS — "Timeline Hari Ini"
  // ter-render sebagai "TIMELINE HARI INI" (class `uppercase`).
  const dashText = await page.evaluate(() => document.body.innerText);
  for (const needle of ["TIMELINE HARI INI", "Review materi kuliah", "MyDayz AI"]) {
    if (!dashText.includes(needle)) {
      throw new Error(`dashboard tidak berisi "${needle}" setelah login demo`);
    }
  }
  console.log("dashboard: data contoh OK");
  const dashShot = await shot(page, "04-dashboard.png");
  copyFileSync(dashShot, path.join(ROOT, "public", "preview-dashboard.png"));
  console.log("preview: public/preview-dashboard.png");

  // ── Halaman inti (sudah login; AuthGate membiarkan karena persist) ──
  const pages = [
    ["planner", "05-planner.png", "Planner"],
    ["habits", "06-habits.png", "Habit"],
    ["finance", "07-finance.png", "Finance Hub"],
    ["diary", "08-diary.png", "Daily Diary"],
    ["calendar", "09-calendar.png", "Calendar"],
    ["roadmap", "10-roadmap.png", "Neural"],
    ["ai", "11-ai.png", "AI Vault"],
    ["settings", "12-settings.png", "Pengaturan"],
  ];
  for (const [route, file, needle] of pages) {
    await page.goto(`${BASE}/${route}`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(1600);
    const text = await page.evaluate(() => document.body.innerText);
    if (!text.includes(needle)) {
      console.error(`PERINGATAN: /${route} tidak berisi "${needle}" — cek manual`);
    }
    await shot(page, file);
  }

  // ── Mobile: landing ──
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 30000 });
  await sleep(1500);
  await shot(page, "13-landing-mobile.png");

  console.log("SEMUA SCREENSHOT OK");
} finally {
  await browser.close();
}
