// Video demo MyDayz dari screenshot ASLI (docs/screenshots/) — slideshow
// 16:9 dengan zoom halus (Ken Burns), 6 adegan × 2,5 detik = 15 detik.
//   Usage: node scripts/make-video.mjs [docs/screenshots] [docs/demo/demo.mp4]
// Butuh ffmpeg di PATH. Tanpa adegan yang diada-adakan: semua frame adalah
// tangkapan layar nyata dari play-test headless (scripts/screenshot.mjs).
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SHOTS = process.argv[2] || path.join(ROOT, "docs", "screenshots");
const OUT = process.argv[3] || path.join(ROOT, "docs", "demo", "demo.mp4");
const TMP = path.join(ROOT, "docs", "demo", ".tmp-clips");

const SCENES = [
  "01-landing-hero.png",
  "04-dashboard.png",
  "06-habits.png",
  "07-finance.png",
  "10-roadmap.png",
  "11-ai.png",
];

mkdirSync(TMP, { recursive: true });
mkdirSync(path.dirname(OUT), { recursive: true });

const clips = [];
SCENES.forEach((file, i) => {
  const src = path.join(SHOTS, file);
  const clip = path.join(TMP, `clip-${i}.mp4`);
  // Potong 16:9 dari 1440x900, zoom pelan 1.00 → 1.08 selama 75 frame (2,5 dtk).
  execFileSync("ffmpeg", [
    "-y", "-v", "error",
    "-loop", "1", "-i", src,
    "-vf",
    "crop=1440:810:0:45,scale=1280:720,zoompan=z='1+0.08*on/75':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=75:s=1280x720:fps=30",
    "-t", "2.5", "-c:v", "libx264", "-pix_fmt", "yuv420p",
    clip,
  ]);
  clips.push(clip);
  console.log("clip:", file);
});

const listFile = path.join(TMP, "list.txt");
writeFileSync(listFile, clips.map((c) => `file '${c}'`).join("\n"));
execFileSync("ffmpeg", [
  "-y", "-v", "error",
  "-f", "concat", "-safe", "0", "-i", listFile,
  "-c", "copy", OUT,
]);
rmSync(TMP, { recursive: true, force: true });
console.log("video:", OUT);
