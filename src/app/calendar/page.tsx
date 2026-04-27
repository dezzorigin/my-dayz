"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, GraduationCap, Wallet, Moon, ChevronLeft, ChevronRight, X, Plus, Trash2, FileText } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useHabitStore } from "@/store/habitStore";
import { useFinanceStore } from "@/store/financeStore";
import { useCalendarStore } from "@/store/calendarStore";
import { cn } from "@/lib/utils";

type CalendarMode = "personal" | "akademik" | "financial" | "salat";

const MOCK_AKADEMIK = [
  { date: "2026-04-12", title: "Tugas Perancangan Sistem", type: "deadline", color: "bg-indigo-500" },
  { date: "2026-04-15", title: "Hackathon TechFest", type: "event", color: "bg-violet-500" },
  { date: "2026-04-18", title: "Kuis AI", type: "exam", color: "bg-rose-500" },
  { date: "2026-04-20", title: "Presentasi Final", type: "deadline", color: "bg-indigo-500" },
];

const MOCK_SALAT = {
  jadwal: [
    { name: "Subuh", time: "04:35", icon: "🌃" },
    { name: "Dzuhur", time: "11:53", icon: "☀️" },
    { name: "Ashar", time: "15:12", icon: "🌤️" },
    { name: "Maghrib", time: "17:53", icon: "🌇" },
    { name: "Isya", time: "19:03", icon: "🌙" },
  ]
};

function toDateStr(d: Date) { return d.toISOString().slice(0, 10); }

export default function CalendarPage() {
  const [mode, setMode] = useState<CalendarMode>("personal");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const tasks = useTaskStore(s => s.tasks);
  const habits = useHabitStore(s => s.habits);
  const transactions = useFinanceStore(s => s.transactions);
  const { events, addEvent, removeEvent } = useCalendarStore();

  const grid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const dates: Date[] = [];
    let current = new Date(startDate);
    while (dates.length < 35 || current <= lastDay) {
      if (dates.length >= 42) break;
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [currentDate]);

  const MODES: { id: CalendarMode; label: string; icon: any; color: string }[] = [
    { id: "personal", label: "Personal", icon: Target, color: "bg-pink-500 text-white" },
    { id: "akademik", label: "Akademik", icon: GraduationCap, color: "bg-indigo-500 text-white" },
    { id: "financial", label: "Financial", icon: Wallet, color: "bg-emerald-500 text-white" },
    { id: "salat", label: "Salat", icon: Moon, color: "bg-sky-500 text-white" },
  ];

  const getDayInfo = (date: Date) => {
    const dStr = toDateStr(date);
    const isToday = dStr === toDateStr(new Date());
    let badges: { id: string; label: string; bg: string }[] = [];
    let summaryList: React.ReactNode[] = [];
    const customEvents = events.filter(e => e.date === dStr && e.mode === mode);

    if (customEvents.length > 0) {
      badges.push({ id: "cust", label: `${customEvents.length} Event`, bg: "bg-pink-500" });
      summaryList.push(
        <div key="cust" className="space-y-2 mt-2">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Custom</p>
          {customEvents.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-sm themed-card p-3">
              <div className="flex items-center gap-3">
                <Target size={16} className="text-pink-500" />
                <span className="font-semibold text-[var(--text-primary)]">{c.title}</span>
              </div>
              <button onClick={() => removeEvent(c.id)} className="text-[var(--text-muted)] hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      );
    }

    if (mode === "personal") {
      const dayTasks = tasks.filter(t => t.date === dStr);
      const habitsDone = habits.filter(h => h.log?.[dStr]).length;
      if (dayTasks.length > 0) {
        badges.push({ id: "t", label: `${dayTasks.length} task`, bg: "bg-violet-500" });
        summaryList.push(
          <div key="t" className="space-y-2 mt-2">
            <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Tasks</p>
            {dayTasks.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-sm themed-card p-2">
                <div className={cn("w-2 h-2 rounded-full", t.done ? "bg-emerald-400" : "bg-[var(--text-muted)]")} />
                <span className={cn(t.done && "line-through text-[var(--text-muted)]", "text-[var(--text-primary)]")}>{t.title}</span>
              </div>
            ))}
          </div>
        );
      }
      if (habitsDone > 0) {
        badges.push({ id: "h", label: `${habitsDone} habit`, bg: "bg-orange-400" });
        summaryList.push(
          <div key="h" className="space-y-2 mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            🔥 Tercatat <strong className="text-orange-500">{habitsDone} habit</strong> selesai.
          </div>
        );
      }
    } else if (mode === "akademik") {
      const ak = MOCK_AKADEMIK.filter(a => a.date === dStr);
      if (ak.length > 0) {
        badges.push({ id: "ak", label: `${ak.length} Jadwal`, bg: "bg-indigo-500" });
        summaryList.push(
          <div key="ak" className="space-y-2 mt-2">
            <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Akademik</p>
            {ak.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm themed-card p-3">
                <GraduationCap size={16} className="text-indigo-500" />
                <span className="font-semibold text-[var(--text-primary)]">{a.title}</span>
              </div>
            ))}
          </div>
        );
      }
    } else if (mode === "financial") {
      const dayTrx = transactions.filter(t => t.date === dStr);
      if (dayTrx.length > 0) {
        badges.push({ id: "fn", label: `${dayTrx.length} Trx`, bg: dayTrx.some(t => t.type === 'expense') ? "bg-rose-400" : "bg-emerald-400" });
        summaryList.push(
          <div key="fn" className="space-y-2 mt-2">
            <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Transaksi</p>
            {dayTrx.map(t => (
              <div key={t.id} className="flex items-center justify-between text-sm themed-card p-2">
                <div className="flex items-center gap-2">
                  <Wallet size={14} className={t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'} />
                  <span className="text-[var(--text-primary)]">{t.title}</span>
                </div>
                <span className={cn("font-mono font-medium", t.type === 'income' ? 'text-emerald-500' : 'text-rose-500')}>
                  {t.type === 'income' ? '+' : '-'} Rp{(t.amount ?? 0).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        );
      }
    } else if (mode === "salat") {
      badges.push({ id: "sl", label: "5 Waktu", bg: "bg-sky-400" });
      summaryList.push(
        <div key="sl" className="space-y-2 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MOCK_SALAT.jadwal.map((j, i) => (
            <div key={i} className="flex items-center justify-between themed-card p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <span>{j.icon}</span> {j.name}
              </div>
              <span className="font-mono text-pink-500 font-bold">{j.time}</span>
            </div>
          ))}
        </div>
      );
    }

    return { isToday, badges, summaryList };
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !newEventTitle.trim()) return;
    addEvent({ date: toDateStr(selectedDay), title: newEventTitle, type: 'custom', color: 'bg-pink-500', mode });
    setNewEventTitle("");
    setShowForm(false);
  };

  const handleExportPdf = async () => {
    if (!selectedDay) return;
    const element = document.getElementById("calendar-day-pdf-content");
    if (!element) return;
    setIsExporting(true);
    element.style.display = "block";
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set({ margin: 0.5, filename: `Jadwal_${mode}_${toDateStr(selectedDay)}.pdf`, image: { type: 'jpeg' as const, quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const } }).from(element).save();
    } catch (err) { console.error(err); }
    finally { element.style.display = "none"; setIsExporting(false); }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-full flex flex-col space-y-6 pb-20 lg:pb-8">
      {/* Mode Toggles */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">Calendar</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Satu kanvas. Empat dimensi.</p>

        <div className="flex bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-1.5 overflow-x-auto">
          {MODES.map((m) => {
            const isActive = mode === m.id;
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => setMode(m.id)} className={cn("relative flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300", isActive ? "text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")}>
                {isActive && <motion.div layoutId="cal-mode-bg" className={cn("absolute inset-0 rounded-lg", m.color)} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10 capitalize hidden sm:block">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="themed-card p-4 lg:p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><ChevronLeft size={16} /></button>
          <h2 className="font-bold text-lg tracking-tight text-[var(--text-primary)]">{currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><ChevronRight size={16} /></button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
            <div key={day} className="text-center font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 lg:gap-2 flex-1 auto-rows-[60px] md:auto-rows-fr">
          {grid.map((date, idx) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const { isToday, badges } = getDayInfo(date);
            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(date)}
                className={cn(
                  "border rounded-xl p-2 flex flex-col gap-1 transition-colors overflow-hidden text-left",
                  isCurrentMonth ? "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)]" : "bg-[var(--bg-base)] border-transparent text-[var(--text-ghost)] opacity-50",
                  isToday && "ring-2 ring-pink-500 border-pink-500"
                )}
              >
                <span className={cn("text-sm font-bold flex items-center justify-center w-7 h-7 rounded-sm", isToday ? "bg-pink-500 text-white" : "text-[var(--text-primary)]")}>{date.getDate()}</span>
                <div className="mt-auto flex flex-col gap-1 w-full justify-end flex-wrap h-full">
                  {badges.map((b) => (
                    <div key={b.id} className={cn("text-[9px] font-mono px-1 py-0.5 rounded-sm text-white truncate text-left shadow-sm", b.bg)}>{b.label}</div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDay(null)} className="absolute inset-0 modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md modal-panel p-6 flex flex-col" style={{ maxHeight: "85vh" }}>
              <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{selectedDay.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest uppercase mt-1">Mode: {mode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportPdf} disabled={isExporting} className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"><FileText size={18} /></button>
                  <button onClick={() => setSelectedDay(null)} className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><X size={18} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pb-4 flex flex-col gap-4">
                {getDayInfo(selectedDay).summaryList.length > 0 ? getDayInfo(selectedDay).summaryList : (
                  <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)]">
                    <Target size={32} className="mb-3 opacity-20" />
                    <p className="text-sm font-medium">Tidak ada event terdeteksi.</p>
                  </div>
                )}
                {showForm ? (
                  <form onSubmit={handleAddEvent} className="mt-4 p-4 themed-card">
                    <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest uppercase mb-2">Tambah Jadwal Baru</p>
                    <input type="text" placeholder="Nama event..." className="themed-input mb-2" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} autoFocus />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">Batal</button>
                      <button type="submit" disabled={!newEventTitle.trim()} className="px-3 py-1.5 text-xs bg-pink-500 text-white rounded-lg transition-colors shadow-md disabled:opacity-50">Simpan</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowForm(true)} className="mt-4 w-full py-3 border-2 border-dashed border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-muted)] flex items-center justify-center gap-2 hover:border-pink-500/30 hover:text-pink-500 transition-all">
                    <Plus size={16} /> Tambah Jadwal Custom
                  </button>
                )}
              </div>
              {/* Hidden PDF content */}
              <div id="calendar-day-pdf-content" className="hidden p-8 bg-white text-neutral-900 absolute top-[-9999px] left-[-9999px] w-[800px]">
                <h1 className="text-3xl font-bold mb-2">MyDay OS - Jadwal Harian</h1>
                <p className="text-sm text-neutral-500 mb-8">Tanggal: {selectedDay.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | Mode: {mode}</p>
                <div className="space-y-4">{getDayInfo(selectedDay).summaryList}</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
