// ─────────────────────────────────────────────────────────────────────────────
// src/lib/demo.ts — Data contoh (mode demo, tanpa akun)
//
// MyDayz adalah aplikasi local-first: semua data tinggal di localStorage
// browser (lihat docs/SCHEMA.md). Supaya pengguna baru langsung melihat
// produknya bekerja — bukan halaman kosong — login pertama mengisi data
// contoh SEKALI, hanya bila semua store masih kosong.
//
//   - seedDemoIfEmpty() dipanggil setelah login (login biasa maupun demo)
//     dan dari Pengaturan → "Muat data contoh".
//   - Data contoh TIDAK PERNAH menimpa data pengguna: bila satu saja store
//     sudah berisi, tidak ada yang di-seed.
//   - clearDemoData() (Pengaturan → "Hapus semua data") mengembalikan semua
//     store ke kosong dan menghapus penanda seed.
// Penanda: localStorage `mydayz_demo_seeded_v1`.
// ─────────────────────────────────────────────────────────────────────────────

import { useTaskStore } from "@/store/taskStore";
import { useHabitStore } from "@/store/habitStore";
import { useFinanceStore } from "@/store/financeStore";
import { useDiaryStore } from "@/store/diaryStore";
import { useMoodStore } from "@/store/moodStore";
import { useCalendarStore } from "@/store/calendarStore";
import { useRoadmapStore } from "@/store/roadmapStore";

export const DEMO_SEED_FLAG = "mydayz_demo_seeded_v1";

const isoDay = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const uid = (): string => Math.random().toString(36).slice(2, 11);
const nowIso = (): string => new Date().toISOString();

function allStoresEmpty(): boolean {
  return (
    useTaskStore.getState().tasks.length === 0 &&
    useTaskStore.getState().goals.length === 0 &&
    useHabitStore.getState().habits.length === 0 &&
    useFinanceStore.getState().transactions.length === 0 &&
    useDiaryStore.getState().entries.length === 0 &&
    useMoodStore.getState().entries.length === 0 &&
    useCalendarStore.getState().events.length === 0 &&
    useRoadmapStore.getState().nodes.length === 0
  );
}

/** Isi data contoh bila semua store kosong. Mengembalikan true bila seeding terjadi. */
export function seedDemoIfEmpty(): boolean {
  if (typeof window === "undefined") return false;
  if (!allStoresEmpty()) return false;

  const today = isoDay(0);
  const ym = today.slice(0, 7);

  // ── Tasks hari ini (timeline dashboard) ──
  const t = useTaskStore.getState();
  const t1 = t.addTask({ title: "Review materi kuliah Basis Data II", date: today, time: "08:00", priority: "high", tag: "Kuliah" });
  t.addTask({ title: "Kerjakan latihan soal Aljabar Linier", date: today, time: "10:30", priority: "med", tag: "Kuliah" });
  t.addTask({ title: "Beli bahan makanan mingguan", date: today, time: "16:00", priority: "low", tag: "Pribadi" });
  const t4 = t.addTask({ title: "Olahraga ringan 30 menit", date: today, time: "17:30", priority: "med", tag: "Sehat" });
  t.addTask({ title: "Siapkan presentasi kelompok UAS Prak SO", date: isoDay(1), time: "09:00", priority: "high", tag: "Kuliah", notes: "Deadline 22 Nov" });
  t.toggleTask(t1.id);
  t.toggleTask(t4.id);
  t.addGoal({ title: "Selesaikan laporan UAS Prak SO", type: "mingguan", deadline: isoDay(4) });
  const goal = useTaskStore.getState().goals[0];
  if (goal) useTaskStore.getState().setGoalProgress(goal.id, 40);

  // ── Habits (dengan riwayat log supaya streak terhitung) ──
  const h = useHabitStore.getState();
  const water = h.addHabit({ name: "Minum 2L air", icon: "💧", color: "#0891b2" });
  const read = h.addHabit({ name: "Baca 20 menit", icon: "📚", color: "#7c3aed" });
  const run = h.addHabit({ name: "Olahraga pagi", icon: "🏃", color: "#059669" });
  h.bulkLog(water.id, [0, -1, -2, -3, -4].map(isoDay));
  h.bulkLog(read.id, [0, -1, -3].map(isoDay));
  h.bulkLog(run.id, [0].map(isoDay));

  // ── Finance (IDR, bulan berjalan) ──
  const f = useFinanceStore.getState();
  f.addTransaction({ id: uid(), type: "income", amount: 1500000, title: "Uang saku", category: "Uang Saku", date: `${ym}-01`, createdAt: nowIso() });
  f.addTransaction({ id: uid(), type: "expense", amount: 35000, title: "Makan siang warteg", category: "Makan", date: today, createdAt: nowIso() });
  f.addTransaction({ id: uid(), type: "expense", amount: 15000, title: "Bensin motor", category: "Transport", date: today, createdAt: nowIso() });
  f.addTransaction({ id: uid(), type: "expense", amount: 120000, title: "Belanja bulanan", category: "Belanja", date: isoDay(-1), createdAt: nowIso() });
  f.addTransaction({ id: uid(), type: "expense", amount: 250000, title: "Paket data + listrik kos", category: "Tagihan", date: isoDay(-2), createdAt: nowIso() });

  // ── Diary + Mood ──
  useDiaryStore.getState().addEntry({
    date: today,
    content:
      "Hari ini lumayan produktif. Pagi review Basis Data, siang sempat baca 20 menit. Besok fokus ke presentasi UAS — jangan ditunda lagi.",
    mood: 4,
    tags: ["kuliah", "produktif"],
  });
  const m = useMoodStore.getState();
  m.setMood({ date: today, v: 4, note: "Semangat, tugas beres dua." });
  m.setMood({ date: isoDay(-1), v: 3, note: "Biasa saja, agak mengantuk." });
  m.setMood({ date: isoDay(-2), v: 5, note: "Presentasi kelompok lancar!" });

  // ── Kalender ──
  const c = useCalendarStore.getState();
  c.addEvent({ date: today, title: "Rapat kelompok UAS Prak SO", type: "event", color: "#db2777", mode: "akademik" });
  c.addEvent({ date: isoDay(1), title: "Kumpul draft presentasi", type: "deadline", color: "#dc2626", mode: "akademik" });

  // ── Neural Map (roadmap xyflow) ──
  const r = useRoadmapStore.getState();
  r.addNode({
    id: "demo-mission",
    type: "mission",
    position: { x: 420, y: 60 },
    data: { id: "demo-mission", title: "Lulus Semester 4 — IPK ≥ 3.5", description: "Misi besar semester ini.", status: "in-progress", nodeType: "mission" },
  });
  r.addNode({
    id: "demo-ms-1",
    type: "milestone",
    position: { x: 80, y: 300 },
    data: { id: "demo-ms-1", title: "UTS Basis Data II", description: "Nilai keluar, lulus.", status: "achieved", nodeType: "milestone" },
  });
  r.addNode({
    id: "demo-ms-2",
    type: "milestone",
    position: { x: 420, y: 300 },
    data: { id: "demo-ms-2", title: "UAS Prak SO", description: "Laporan + presentasi kelompok.", status: "in-progress", nodeType: "milestone" },
  });
  r.addNode({
    id: "demo-ms-3",
    type: "milestone",
    position: { x: 760, y: 300 },
    data: { id: "demo-ms-3", title: "English Test", description: "Target skor 500.", status: "pending", nodeType: "milestone" },
  });
  r.addEdge({ id: "demo-e-1", source: "demo-mission", target: "demo-ms-1", animated: true });
  r.addEdge({ id: "demo-e-2", source: "demo-mission", target: "demo-ms-2", animated: true });
  r.addEdge({ id: "demo-e-3", source: "demo-mission", target: "demo-ms-3", animated: true });

  try {
    window.localStorage.setItem(DEMO_SEED_FLAG, "1");
  } catch {
    /* abaikan */
  }
  return true;
}

export function isDemoSeeded(): boolean {
  try {
    return window.localStorage.getItem(DEMO_SEED_FLAG) === "1";
  } catch {
    return false;
  }
}

/** Kembalikan semua store ke kosong (dipakai Pengaturan → "Hapus semua data"). */
export function clearDemoData(): void {
  useTaskStore.getState().reset();
  useHabitStore.getState().reset();
  useFinanceStore.getState().clearAll();
  useDiaryStore.getState().reset();
  useMoodStore.getState().reset();
  useCalendarStore.getState().reset();
  useRoadmapStore.getState().reset();
  try {
    window.localStorage.removeItem(DEMO_SEED_FLAG);
  } catch {
    /* abaikan */
  }
}
