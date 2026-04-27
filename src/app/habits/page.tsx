"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHabitStore, useAllHabitsWithStats, useOverallHabitPct, useHabitTodayCount, useLongestStreak } from "@/store/habitStore";
import { Plus, X, Flame, Target, Trophy, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HabitsPage() {
  const { addHabit, toggleLog, deleteHabit } = useHabitStore();
  const habits = useAllHabitsWithStats();
  const pct = useOverallHabitPct();
  const count = useHabitTodayCount();
  const longest = useLongestStreak();

  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative w-full pb-20 lg:pb-0">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Habit Tracker</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Bangun rutinitas andalanmu. Satu per satu.</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm font-medium">
            <Plus size={16} /> Add Habit
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="themed-card p-6 flex flex-col justify-center relative overflow-hidden group">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center"><Target size={16} className="text-orange-500" /></div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Today&apos;s Progress</span>
            </div>
            <div className="flex items-end gap-2">
              <h2 className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">{count.done}</h2>
              <span className="text-xl text-[var(--text-muted)] font-medium mb-1.5">/ {count.total}</span>
            </div>
          </div>

          <div className="themed-card p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 size={16} className="text-emerald-500" /></div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Completion Rate</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-emerald-500">{pct}%</h2>
          </div>

          <div className="themed-card p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center"><Trophy size={16} className="text-amber-500" /></div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Longest Streak</span>
            </div>
            {longest ? (
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-amber-500 flex items-center gap-2.5">{longest.streak} <Flame size={24} className="text-orange-500" /></h2>
                <p className="text-[11px] text-[var(--text-muted)] mt-2 font-semibold bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-full w-max flex items-center gap-1.5">{longest.icon} {longest.name}</p>
              </div>
            ) : (
              <h2 className="text-4xl font-bold tracking-tight text-[var(--text-ghost)]">0</h2>
            )}
          </div>
        </div>

        {/* Habit List */}
        <div className="space-y-4 pt-2">
          <h3 className="font-semibold text-lg text-[var(--text-primary)] flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center"><Flame size={16} className="text-pink-500" /></div>
            Your Habits
          </h3>
          <div className="space-y-3">
            {habits.length === 0 ? (
              <div className="text-center py-12 themed-card border-dashed flex flex-col items-center justify-center">
                <Flame size={36} className="text-[var(--text-ghost)] mb-3" />
                <p className="text-sm text-[var(--text-muted)]">Belum ada habit yang dilacak.</p>
              </div>
            ) : (
              habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} onToggle={() => toggleLog(habit.id)} onDelete={() => deleteHabit(habit.id)} />
              ))
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {modalOpen && <AddHabitModal onClose={() => setModalOpen(false)} onAdd={(data) => { addHabit(data); setModalOpen(false); }} />}
      </AnimatePresence>
    </div>
  );
}

function HabitCard({ habit, onToggle, onDelete }: { habit: ReturnType<typeof useAllHabitsWithStats>[0]; onToggle: () => void; onDelete: () => void }) {
  const isDone = habit.doneToday;
  return (
    <motion.div layout className={cn("flex items-center justify-between p-5 rounded-xl border transition-all group", isDone ? "bg-emerald-500/5 border-emerald-500/20" : "themed-card hover:border-[var(--border-default)]")}>
      <div className="flex items-center gap-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onToggle} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0", isDone ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-emerald-500 hover:border-emerald-500/30")}>
          {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </motion.button>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xl">{habit.icon}</span>
            <p className={cn("font-bold text-[16px] tracking-tight", isDone ? "text-emerald-500 line-through" : "text-[var(--text-primary)]")}>{habit.name}</p>
          </div>
          <div className="flex gap-2 mt-2.5">
            {habit.last7.map((day, i) => (
              <div key={i} className={cn("w-3 h-3 rounded-full", day.done ? "bg-emerald-400 shadow-sm shadow-emerald-400/40" : "bg-[var(--border-subtle)]")} title={day.date} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex flex-col items-end gap-1.5">
          <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border", isDone ? "bg-emerald-500/5 border-emerald-500/20" : "bg-[var(--bg-elevated)] border-[var(--border-subtle)]")}>
            <Flame size={14} className={habit.streak > 0 ? "text-orange-500" : "text-[var(--text-ghost)]"} />
            <span className={cn("text-[13px] font-bold", isDone ? "text-emerald-500" : "text-[var(--text-primary)]")}>{habit.streak}</span>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Streak</p>
        </div>
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10"><Trash2 size={14} /></button>
      </div>
    </motion.div>
  );
}

function AddHabitModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: any) => void }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💧");
  const ICONS = ["💧", "🏃‍♂️", "📖", "🧘‍♀️", "🥗", "💻", "🛌", "📝", "🚀", "🎸"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 modal-overlay" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-[420px] modal-panel p-7">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><X size={16} /></button>
        <h2 className="text-2xl font-bold tracking-tight mb-6 text-[var(--text-primary)]">Add New Habit</h2>
        <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; onAdd({ name: name.trim(), icon }); }} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Nama Habit</label>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Cth: Minum Air Putih..." className="themed-input" />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Pilih Ikon</label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map(i => (
                <button key={i} type="button" onClick={() => setIcon(i)} className={cn("text-2xl h-12 rounded-xl flex items-center justify-center transition-all", icon === i ? "bg-pink-500/15 border border-pink-500/30 scale-110" : "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] opacity-70 hover:opacity-100 hover:scale-105")}>{i}</button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl py-3.5 font-semibold shadow-lg shadow-pink-500/20 hover:shadow-xl transition-all">Create Habit</button>
        </form>
      </motion.div>
    </div>
  );
}
