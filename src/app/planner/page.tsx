"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskStore, useTasksByDate } from "@/store/taskStore";
import type { Priority, GoalType, Task, Goal } from "@/types";
import { Plus, X, CheckCircle2, Circle, Focus, Mountain, Zap, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function todayStr() { return new Date().toISOString().slice(0, 10); }

export default function PlannerPage() {
  const { toggleTask, deleteTask, goals, incrementProgress, addGoal, addTask } = useTaskStore();
  const todayTasks = useTasksByDate(todayStr());
  const pendingTasks = todayTasks.filter(t => !t.done);
  const completedTasks = todayTasks.filter(t => t.done);

  const [activeTab, setActiveTab] = useState<"tasks" | "goals">("tasks");
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative w-full pb-20 lg:pb-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mx-auto space-y-6 relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Planner</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Fokus harianmu & target jangka panjang.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm font-medium"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1.5 rounded-xl flex max-w-sm">
          <button
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all",
              activeTab === "tasks" ? "bg-pink-500/10 text-pink-500" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
          >
            <Focus size={16} /> Today&apos;s Focus
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all",
              activeTab === "goals" ? "bg-pink-500/10 text-pink-500" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
          >
            <Mountain size={16} /> Big Picture
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "tasks" && (
            <motion.div key="tasks" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {pendingTasks.length === 0 && completedTasks.length === 0 ? (
                <div className="text-center py-16 themed-card flex flex-col items-center justify-center border-dashed">
                  <Focus size={36} className="text-[var(--text-muted)] mb-3" />
                  <p className="text-[var(--text-secondary)] font-medium">Belum ada task hari ini</p>
                  <p className="text-[var(--text-muted)] text-sm mt-1">Klik Add Item untuk memulai.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingTasks.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] pl-2">In Progress ({pendingTasks.length})</h3>
                      <div className="space-y-2">{pendingTasks.map(t => <TaskItem key={t.id} task={t} onToggle={() => toggleTask(t.id)} onDelete={() => deleteTask(t.id)} />)}</div>
                    </div>
                  )}
                  {completedTasks.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] pl-2">Completed ({completedTasks.length})</h3>
                      <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">{completedTasks.map(t => <TaskItem key={t.id} task={t} onToggle={() => toggleTask(t.id)} onDelete={() => deleteTask(t.id)} />)}</div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "goals" && (
            <motion.div key="goals" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {goals.length === 0 ? (
                <div className="text-center py-16 themed-card flex flex-col items-center justify-center border-dashed">
                  <Mountain size={36} className="text-[var(--text-muted)] mb-3" />
                  <p className="text-[var(--text-secondary)] font-medium">Belum ada target besar</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map(g => <GoalItem key={g.id} goal={g} onIncrement={() => incrementProgress(g.id, 5)} />)}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <AddPlannerModal
            onClose={() => setModalOpen(false)}
            onAdd={({ isGoal, data }) => {
              if (isGoal) addGoal(data as any);
              else addTask(data as any);
              setModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Task Item ──────────────────────────────────────────────────────────────
function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const PRIO: Record<Priority, { label: string; color: string }> = {
    high: { label: "High", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
    med:  { label: "Med", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    low:  { label: "Low", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  };
  const prio = PRIO[task.priority];

  return (
    <motion.div
      layout
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all group",
        task.done
          ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)] opacity-60"
          : "themed-card hover:border-[var(--border-default)]"
      )}
    >
      <button onClick={onToggle} className="flex-shrink-0">
        {task.done ? (
          <CheckCircle2 size={20} className="text-pink-500" />
        ) : (
          <Circle size={20} className="text-[var(--text-muted)] hover:text-pink-500 transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-[15px] truncate", task.done ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]")}>{task.title}</p>
      </div>
      {!task.done && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {task.tag && <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md border bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]">{task.tag}</span>}
          <span className={cn("text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md border flex items-center gap-1", prio.color)}>
            {task.priority === "high" && <Zap size={10} />} {prio.label}
          </span>
        </div>
      )}
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-rose-500">
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

// ─── Goal Item ──────────────────────────────────────────────────────────────
function GoalItem({ goal, onIncrement }: { goal: Goal; onIncrement: () => void }) {
  const isDone = goal.progress >= 100;
  return (
    <div className={cn("themed-card p-5 flex flex-col justify-between min-h-[140px]", isDone && "border-emerald-500/20")}>
      <div>
        <span className="text-[10px] bg-pink-500/10 text-pink-500 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border border-pink-500/20">{goal.type}</span>
        {isDone && <span className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border border-emerald-500/20">Done</span>}
        <h3 className="font-bold text-[17px] mt-2 text-[var(--text-primary)]">{goal.title}</h3>
      </div>
      <div>
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-xs font-bold text-[var(--text-muted)]">Progress</span>
          <span className={cn("font-bold font-mono text-[16px]", isDone ? "text-emerald-500" : "text-pink-500")}>{Math.round(goal.progress)}%</span>
        </div>
        <div className="h-2.5 w-full progress-bar-bg">
          <motion.div initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} transition={{ duration: 1 }} className={cn("h-full rounded-full", isDone ? "bg-emerald-500" : "progress-bar-fill")} />
        </div>
        {!isDone && (
          <button onClick={onIncrement} className="w-full mt-4 themed-card border-dashed py-2 text-xs font-bold text-[var(--text-muted)] hover:text-pink-500 hover:border-pink-500/30 transition-all">
            + Update Progress
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Add Modal ──────────────────────────────────────────────────────────────
function AddPlannerModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: { isGoal: boolean; data: any }) => void }) {
  const [type, setType] = useState<"task" | "goal">("task");
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("IT");
  const [priority, setPriority] = useState<Priority>("med");
  const [goalType, setGoalType] = useState<GoalType>("mingguan");
  const TAGS = ["IT", "Kuliah", "Personal", "Work", "Other"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (type === "task") onAdd({ isGoal: false, data: { title: title.trim(), tag, priority } });
    else onAdd({ isGoal: true, data: { title: title.trim(), type: goalType } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 modal-overlay" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="relative w-full max-w-[420px] modal-panel p-7">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><X size={16} /></button>
        <h2 className="text-2xl font-bold tracking-tight mb-6 text-[var(--text-primary)]">Add Item</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex p-1.5 bg-[var(--bg-elevated)] rounded-xl">
            <button type="button" onClick={() => setType("task")} className={cn("flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all", type === "task" ? "bg-pink-500/10 text-pink-500" : "text-[var(--text-muted)]")}>Task</button>
            <button type="button" onClick={() => setType("goal")} className={cn("flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all", type === "goal" ? "bg-pink-500/10 text-pink-500" : "text-[var(--text-muted)]")}>Goal</button>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Judul</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder={type === "task" ? "Cth: Fix CSS Bug..." : "Cth: Selesaiin MVP..."} className="themed-input" />
          </div>
          {type === "task" && (
            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Kategori</label>
                <select value={tag} onChange={e => setTag(e.target.value)} className="themed-select">{TAGS.map(t => <option key={t} value={t}>{t}</option>)}</select>
              </div>
              <div className="space-y-1.5 flex-[0.8]">
                <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Prioritas</label>
                <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="themed-select">
                  <option value="high">High</option><option value="med">Medium</option><option value="low">Low</option>
                </select>
              </div>
            </div>
          )}
          {type === "goal" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Tipe Target</label>
              <select value={goalType} onChange={e => setGoalType(e.target.value as GoalType)} className="themed-select">
                <option value="mingguan">Mingguan</option><option value="bulanan">Bulanan</option><option value="semestral">Semestral</option>
              </select>
            </div>
          )}
          <button type="submit" className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl py-3.5 font-semibold shadow-lg shadow-pink-500/20 hover:shadow-xl transition-all">
            Create {type === "task" ? "Task" : "Goal"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
