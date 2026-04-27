"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Wallet, NotebookPen, CheckCircle2, Circle, Plus, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHabitStore } from "@/store/habitStore";
import { useFinanceStore } from "@/store/financeStore";
import { useDiaryStore } from "@/store/diaryStore";

type DrawerTab = "habit" | "finance" | "diary" | null;

interface SecondaryDrawerProps {
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
  onClose: () => void;
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, notation: Math.abs(n) >= 1_000_000 ? "compact" : "standard" }).format(n || 0);
}

const TABS = [
  { id: "habit" as DrawerTab, label: "Habit", icon: Flame },
  { id: "finance" as DrawerTab, label: "Finance", icon: Wallet },
  { id: "diary" as DrawerTab, label: "Diary", icon: NotebookPen },
];

function HabitPanel() {
  const habits = useHabitStore(s => s.habits);
  const toggleLog = useHabitStore(s => s.toggleLog);
  const addHabit = useHabitStore(s => s.addHabit);
  const deleteHabit = useHabitStore(s => s.deleteHabit);
  const today = todayStr();
  const [newName, setNewName] = useState("");
  const donePct = habits.length > 0 ? Math.round((habits.filter(h => h.log?.[today]).length / habits.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Progress Hari Ini</p>
          <p className="font-mono text-[11px] text-pink-500 font-medium">{donePct}%</p>
        </div>
        <div className="h-1.5 rounded-full progress-bar-bg overflow-hidden">
          <motion.div className="h-full rounded-full progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${donePct}%` }} transition={{ duration: 0.6 }} />
        </div>
      </div>
      <div className="space-y-1">
        <AnimatePresence>
          {habits.map(habit => {
            const done = !!habit.log?.[today];
            return (
              <motion.div key={habit.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all group", done ? "bg-pink-500/[0.06] border-pink-500/[0.15]" : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-default)]")}>
                <button onClick={() => toggleLog(habit.id)} className="flex-shrink-0">
                  {done ? <CheckCircle2 size={16} className="text-pink-500" /> : <Circle size={16} className="text-[var(--text-muted)] hover:text-pink-500 transition-colors" />}
                </button>
                <span className={cn("flex-1 text-[13px]", done ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]")}>{habit.name}</span>
                <button onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-rose-500"><Trash2 size={11} /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {habits.length === 0 && <div className="py-8 text-center"><Flame size={24} className="mx-auto text-[var(--text-muted)] mb-2" /><p className="text-[12px] text-[var(--text-muted)]">Belum ada habit.</p></div>}
      </div>
      <div className="flex gap-2 pt-1">
        <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && (() => { if (newName.trim()) { addHabit({ name: newName.trim() }); setNewName(""); } })()} placeholder="Habit baru..." className="input-dark flex-1 text-[13px]" />
        <button onClick={() => { if (newName.trim()) { addHabit({ name: newName.trim() }); setNewName(""); } }} className="px-3 py-2 rounded-xl bg-pink-500 text-white text-[12px] font-mono hover:bg-pink-400 transition-colors flex items-center gap-1.5 flex-shrink-0"><Plus size={13} /> Add</button>
      </div>
    </div>
  );
}

function FinancePanel() {
  const transactions = useFinanceStore(s => s.transactions);
  const addTransaction = useFinanceStore(s => s.addTransaction);
  const deleteTransaction = useFinanceStore(s => s.deleteTransaction);
  const [form, setForm] = useState({ title: "", amount: "", type: "expense" as "income" | "expense" });
  const [showForm, setShowForm] = useState(false);
  const today = todayStr();
  const thisMonth = today.slice(0, 7);

  const { income, expense, balance } = useMemo(() => {
    const monthly = transactions.filter(t => t.date?.startsWith(thisMonth));
    const inc = monthly.filter(t => t.type === "income").reduce((a, t) => a + (t.amount || 0), 0);
    const exp = monthly.filter(t => t.type === "expense").reduce((a, t) => a + (t.amount || 0), 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [transactions, thisMonth]);

  const recent = [...transactions].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Masuk", value: formatIDR(income), color: "text-emerald-500" },
          { label: "Keluar", value: formatIDR(expense), color: "text-rose-500" },
          { label: "Saldo", value: formatIDR(balance), color: balance >= 0 ? "text-[var(--text-primary)]" : "text-rose-500" },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2.5 py-2 text-center">
            <p className={cn("font-mono text-[13px] font-semibold truncate", s.color)}>{s.value}</p>
            <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <button onClick={() => setShowForm(!showForm)} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[var(--bg-elevated)] border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-pink-500 hover:border-pink-500/20 transition-all text-[12px] font-mono"><Plus size={13} /> Tambah Transaksi</button>
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="space-y-2 pb-1">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Keterangan..." className="input-dark w-full text-[13px]" />
              <div className="flex gap-2">
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Jumlah" className="input-dark flex-1 text-[13px]" />
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="input-dark flex-shrink-0 text-[12px]">
                  <option value="expense">Keluar</option><option value="income">Masuk</option>
                </select>
              </div>
              <button onClick={() => { const amount = parseFloat(form.amount); if (!form.title.trim() || isNaN(amount) || amount <= 0) return; addTransaction({ id: Math.random().toString(36).slice(2, 11), title: form.title.trim(), amount, type: form.type, date: today }); setForm({ title: "", amount: "", type: "expense" }); setShowForm(false); }} className="w-full py-2 rounded-xl bg-pink-500 text-white text-[12px] font-mono hover:bg-pink-400 transition-colors">Simpan</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div>
        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Riwayat</p>
        <div className="space-y-1">
          {recent.length === 0 && <p className="text-center py-6 text-[12px] text-[var(--text-muted)]">Belum ada transaksi</p>}
          {recent.map(t => (
            <div key={t.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] group">
              <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", t.type === "income" ? "bg-emerald-500/10" : "bg-rose-500/10")}>
                {t.type === "income" ? <ArrowUpRight size={12} className="text-emerald-500" /> : <ArrowDownRight size={12} className="text-rose-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[var(--text-primary)] truncate">{t.title}</p>
                <p className="font-mono text-[9px] text-[var(--text-muted)]">{t.date}</p>
              </div>
              <p className={cn("font-mono text-[12px] font-medium flex-shrink-0", t.type === "income" ? "text-emerald-500" : "text-rose-500")}>{t.type === "income" ? "+" : "-"}{formatIDR(t.amount ?? 0)}</p>
              <button onClick={() => deleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center text-[var(--text-muted)] hover:text-rose-500"><X size={10} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiaryPanel() {
  const entries = useDiaryStore(s => s.entries);
  const addEntry = useDiaryStore(s => s.addEntry);
  const deleteEntry = useDiaryStore(s => s.deleteEntry);
  const today = todayStr();
  const todayEntry = entries.find(e => e.date === today);
  const [content, setContent] = useState(todayEntry?.content ?? "");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Catatan Hari Ini</p>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Tulis pikiranmu..." rows={5} className="input-dark w-full text-[13px] resize-none leading-relaxed" />
        <button onClick={() => { if (!content.trim()) return; addEntry({ date: today, content: content.trim(), mood: 3 }); setSaved(true); setTimeout(() => setSaved(false), 2000); }} className={cn("mt-2 w-full py-2 rounded-xl text-[12px] font-mono transition-all", saved ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-500" : "bg-pink-500 text-white hover:bg-pink-400")}>{saved ? "✓ Tersimpan" : "Simpan Catatan"}</button>
      </div>
      <div>
        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Entri Sebelumnya</p>
        <div className="space-y-2">
          {entries.filter(e => e.date !== today).slice(0, 5).map(entry => (
            <div key={entry.id} className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-2.5 group">
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-[10px] text-[var(--text-muted)]">{entry.date}</p>
                <button onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-rose-500"><X size={10} /></button>
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">{entry.content}</p>
            </div>
          ))}
          {entries.filter(e => e.date !== today).length === 0 && <p className="text-center py-4 text-[12px] text-[var(--text-muted)]">Belum ada entri sebelumnya</p>}
        </div>
      </div>
    </div>
  );
}

export function SecondaryDrawer({ activeTab, onTabChange, onClose }: SecondaryDrawerProps) {
  const isOpen = activeTab !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} className="fixed inset-0 z-50 modal-overlay" />
          <motion.div key="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 340, damping: 38 }} className="feature-drawer">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
              <div className="flex items-center gap-1.5">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => onTabChange(tab.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-mono transition-all", activeTab === tab.id ? "bg-pink-500/[0.15] text-pink-500 border border-pink-500/[0.25]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]")}>
                      <Icon size={12} />{tab.label}
                    </button>
                  );
                })}
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                  {activeTab === "habit" && <HabitPanel />}
                  {activeTab === "finance" && <FinancePanel />}
                  {activeTab === "diary" && <DiaryPanel />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
