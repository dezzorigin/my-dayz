"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, CheckCircle2, Circle, Plus, Flame,
  Wallet, NotebookPen, ChevronRight, Zap, X, Loader2,
  Coffee, Sun, Moon, Sunset, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/taskStore";
import { useHabitStore } from "@/store/habitStore";
import { useFinanceStore } from "@/store/financeStore";
import { useAuthStore } from "@/store/authStore";
import { SecondaryDrawer } from "@/components/layout/SecondaryDrawer";

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
type DrawerTab = "habit" | "finance" | "diary" | null;

function getTimeOfDay(h: number): TimeOfDay {
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 20) return "evening";
  return "night";
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, notation: Math.abs(n) >= 1_000_000 ? "compact" : "standard" }).format(n || 0);
}

const GREETING_MAP: Record<TimeOfDay, { text: string; icon: typeof Sun; sub: string }> = {
  morning:   { text: "Selamat Pagi",  icon: Sun,    sub: "Mulai hari dengan penuh semangat ✨" },
  afternoon: { text: "Selamat Siang", icon: Coffee, sub: "Jaga energimu, tetap fokus 💪" },
  evening:   { text: "Selamat Sore",  icon: Sunset, sub: "Hampir selesai, terus semangat 🌇" },
  night:     { text: "Selamat Malam", icon: Moon,   sub: "Istirahat yang baik adalah investasi 🌙" },
};

// ─── AI Command Bar ──────────────────────────────────────────────────────────
function AICommandBar() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    setQuery(""); setLoading(true); setResponse("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history: [] }),
      });
      const data = await res.json();
      setResponse(data?.reply ?? data?.message ?? "Maaf, tidak ada respons.");
    } catch {
      setResponse("Koneksi ke AI gagal.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSend} className="relative">
        <div className="ai-command-bar rounded-2xl flex items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-[11px] font-mono text-pink-500 hidden sm:block">MyDayz AI</span>
          </div>
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tanya apa saja..." className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none" />
          <motion.button type="submit" disabled={!query.trim() || loading} whileTap={{ scale: 0.93 }} className={cn("flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all", query.trim() && !loading ? "bg-pink-500 text-white shadow-lg shadow-pink-900/40" : "bg-[var(--bg-elevated)] text-[var(--text-muted)]")}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </motion.button>
        </div>
      </form>
      <AnimatePresence>
        {(loading || response) && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-3">
            {loading ? (
              <div className="flex items-center gap-2">
                {[0, 1, 2].map(i => <motion.div key={i} animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} className="w-1.5 h-1.5 rounded-full bg-pink-400" />)}
                <span className="text-[12px] font-mono text-[var(--text-muted)] ml-1">Memproses...</span>
              </div>
            ) : (
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{response}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function DashboardHeader() {
  const [mounted, setMounted] = useState(false);
  const [tod, setTod] = useState<TimeOfDay>("morning");
  const [timeStr, setTimeStr] = useState("--:--");
  const [dateStr, setDateStr] = useState("");
  const { userName } = useAuthStore();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTod(getTimeOfDay(now.getHours()));
      setTimeStr(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
      setDateStr(now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };
    update(); setMounted(true);
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  const g = GREETING_MAP[tod];
  const Icon = g.icon;

  return (
    <div className="flex items-start justify-between">
      <div>
        {mounted ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} className="text-[var(--text-muted)]" />
              <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-[0.15em] uppercase">{dateStr}</p>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{g.text}, {userName || "User"}</h1>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{g.sub}</p>
          </>
        ) : (
          <div className="space-y-2">
            <div className="h-3 w-40 rounded shimmer" />
            <div className="h-7 w-48 rounded shimmer" />
          </div>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-mono text-3xl font-medium tracking-tight text-[var(--text-primary)]">{mounted ? timeStr : "--:--"}</p>
        <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-widest uppercase mt-0.5">WIB</p>
      </div>
    </div>
  );
}

// ─── Quick Stats ─────────────────────────────────────────────────────────────
function QuickStats() {
  const tasks = useTaskStore(s => s.tasks);
  const habits = useHabitStore(s => s.habits);
  const transactions = useFinanceStore(s => s.transactions);
  const today = todayStr();
  const pendingTasks = tasks.filter(t => !t.done && t.date === today).length;
  const habitsDone = habits.filter(h => h.log?.[today]).length;
  const thisMonthExpense = useMemo(() => {
    const ym = today.slice(0, 7);
    return transactions.filter(t => t.type === "expense" && t.date?.startsWith(ym)).reduce((a, t) => a + (t.amount || 0), 0);
  }, [transactions, today]);

  const stats = [
    { label: "Pending", value: String(pendingTasks), sub: "tasks", color: "text-pink-500" },
    { label: "Habit", value: `${habitsDone}/${habits.length}`, sub: "hari ini", color: "text-rose-500" },
    { label: "Keluar", value: formatIDR(thisMonthExpense), sub: "bulan ini", color: "text-pink-400" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map(s => (
        <div key={s.label} className="themed-card px-3 py-2.5">
          <p className={cn("font-mono text-[15px] font-semibold tracking-tight", s.color)}>{s.value}</p>
          <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{s.label}</p>
          <p className="font-mono text-[9px] text-[var(--text-ghost)]">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Vertical Timeline ──────────────────────────────────────────────────────
function VerticalTimeline({ onAddTask }: { onAddTask: () => void }) {
  const allTasks = useTaskStore(s => s.tasks);
  const toggleTask = useTaskStore(s => s.toggleTask);
  const addTask = useTaskStore(s => s.addTask);
  const [mounted, setMounted] = useState(false);
  const [currentHour, setCurrentHour] = useState(0);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [newTaskHour, setNewTaskHour] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    const update = () => { const now = new Date(); setCurrentHour(now.getHours()); setCurrentMinute(now.getMinutes()); };
    update(); setMounted(true);
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, []);

  const today = todayStr();
  const todayTasks = allTasks.filter(t => t.date === today || !t.date);
  const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);

  const tasksByHour = useMemo(() => {
    const map: Record<number, typeof todayTasks> = {};
    todayTasks.forEach(task => {
      const h = task.time ? parseInt(task.time.split(":")[0], 10) : -1;
      const key = (isNaN(h) || h < 0) ? -1 : h;
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [todayTasks]);

  const handleAddTask = (hour: number) => {
    const title = newTaskTitle.trim();
    if (!title) return;
    addTask({ title, date: today, time: `${String(hour).padStart(2, "0")}:00`, priority: "med" });
    setNewTaskHour(null); setNewTaskTitle("");
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-[0.14em]">Timeline Hari Ini</p>
        <button onClick={onAddTask} className="flex items-center gap-1.5 text-[11px] font-mono text-pink-500 hover:text-pink-400 transition-colors"><Plus size={12} /> Tambah Task</button>
      </div>
      <div className="relative">
        {HOURS.map(hour => {
          const isCurrentHour = mounted && hour === currentHour;
          const isPast = mounted && hour < currentHour;
          const tasks = tasksByHour[hour] ?? [];

          return (
            <div key={hour} className="flex gap-3 group">
              <div className="flex flex-col items-center w-10 flex-shrink-0">
                <span className={cn("font-mono text-[10px] h-5 flex items-center", isCurrentHour ? "text-pink-500 font-semibold" : isPast ? "text-[var(--text-ghost)]" : "text-[var(--text-muted)]")}>{String(hour).padStart(2, "0")}</span>
                <div className={cn("flex-1 w-px min-h-[20px]", isCurrentHour ? "bg-pink-500/60" : isPast ? "bg-[var(--border-subtle)]" : "bg-[var(--border-subtle)]")} />
              </div>
              <div className="flex-1 pb-1 min-h-[40px]">
                {isCurrentHour && mounted && (
                  <div className="flex items-center gap-2 mb-1 -mt-0.5">
                    <div className="relative flex items-center"><span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" /><span className="absolute w-2 h-2 rounded-full bg-pink-400 animate-ping" /></div>
                    <div className="flex-1 h-px bg-gradient-to-r from-pink-500/50 to-transparent" />
                    <span className="font-mono text-[9px] text-pink-500 flex-shrink-0">{String(currentHour).padStart(2, "0")}:{String(currentMinute).padStart(2, "0")}</span>
                  </div>
                )}
                <div className="space-y-1">
                  {tasks.map(task => (
                    <motion.button key={task.id} onClick={() => toggleTask(task.id)} whileTap={{ scale: 0.98 }} className={cn("w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all border", task.done ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)] opacity-50" : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)]")}>
                      <div className="mt-[2px]">
                        {task.done ? <CheckCircle2 size={14} className="text-pink-500 flex-shrink-0" /> : <Circle size={14} className="text-[var(--text-muted)] flex-shrink-0" />}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <span className={cn("text-[13px] leading-tight truncate block", task.done ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]")}>{task.title}</span>
                        {(task.time || task.notes) && (
                          <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)] truncate">
                            {task.time && <span>{task.time}</span>}
                            {task.time && task.notes && <span>•</span>}
                            {task.notes && <span className="truncate">{task.notes}</span>}
                          </div>
                        )}
                      </div>
                      {task.priority === "high" && !task.done && <Zap size={12} className="text-pink-500 flex-shrink-0 mt-[2px]" />}
                    </motion.button>
                  ))}
                </div>
                {newTaskHour === hour ? (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-1">
                    <input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddTask(hour); if (e.key === "Escape") { setNewTaskHour(null); setNewTaskTitle(""); } }} placeholder="Nama task..." className="input-dark flex-1 text-[12px]" />
                    <button onClick={() => handleAddTask(hour)} className="px-3 py-1.5 rounded-lg bg-pink-500 text-white text-[11px] font-mono hover:bg-pink-400 transition-colors">Add</button>
                    <button onClick={() => { setNewTaskHour(null); setNewTaskTitle(""); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"><X size={12} /></button>
                  </motion.div>
                ) : (
                  <button onClick={() => setNewTaskHour(hour)} className="mt-1 w-full py-1 rounded-lg text-[11px] font-mono text-[var(--text-ghost)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition-colors opacity-0 group-hover:opacity-100 text-left pl-2">+ tambah di jam ini</button>
                )}
              </div>
            </div>
          );
        })}

        {tasksByHour[-1]?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Tanpa Jadwal</p>
            <div className="space-y-1">
              {tasksByHour[-1].map(task => (
                <motion.button key={task.id} onClick={() => toggleTask(task.id)} whileTap={{ scale: 0.98 }} className={cn("w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all border", task.done ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)] opacity-50" : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)]")}>
                  <div className="mt-[2px]">
                    {task.done ? <CheckCircle2 size={14} className="text-pink-500 flex-shrink-0" /> : <Circle size={14} className="text-[var(--text-muted)] flex-shrink-0" />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <span className={cn("text-[13px] leading-tight truncate block", task.done ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]")}>{task.title}</span>
                    {task.notes && (
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)] truncate">
                        <span className="truncate">{task.notes}</span>
                      </div>
                    )}
                  </div>
                  {task.priority === "high" && !task.done && <Zap size={12} className="text-pink-500 flex-shrink-0 mt-[2px]" />}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────────────────
function SecondaryFAB({ onClick }: { onClick: () => void }) {
  const habits = useHabitStore(s => s.habits);
  const today = todayStr();
  const habitsDone = habits.filter(h => h.log?.[today]).length;
  const hasAlert = habits.length > 0 && habitsDone < habits.length;

  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl transition-all" title="Features">
      <LayoutGrid size={18} className="text-[var(--text-muted)]" />
      {hasAlert && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 border border-[var(--bg-base)]" />}
    </motion.button>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [drawerTab, setDrawerTab] = useState<DrawerTab>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative min-h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <div className="space-y-6 pb-28 lg:pb-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}><DashboardHeader /></motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}><AICommandBar /></motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.14 }}><QuickStats /></motion.div>
        <div className="sidebar-divider" />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}><VerticalTimeline onAddTask={() => setDrawerTab("habit")} /></motion.div>
      </div>
      <SecondaryFAB onClick={() => setDrawerTab(drawerTab ? null : "habit")} />
      <SecondaryDrawer activeTab={drawerTab} onTabChange={setDrawerTab} onClose={() => setDrawerTab(null)} />
    </div>
  );
}