"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinanceStore } from "@/store/financeStore";
import type { Transaction } from "@/types";
import { Wallet, TrendingDown, TrendingUp, Plus, X, CreditCard, PiggyBank, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);
}

const EXPENSE_CATEGORIES = ["Food", "Transport", "Education", "Shopping", "Bills", "Health", "Entertainment", "Other"];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Other"];

export default function FinancePage() {
  const { transactions, addTransaction } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { balance, income, expense, chartData } = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    let totalIncome = 0, totalExpense = 0;
    transactions.filter(t => t.date?.startsWith(thisMonth)).forEach(t => {
      if (t.type === "income") totalIncome += (t.amount || 0);
      else totalExpense += (t.amount || 0);
    });
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(now.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
    const cData = last7Days.map(dateStr => {
      const dayTxns = transactions.filter(t => t.date === dateStr);
      return {
        label: new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short' }),
        income: dayTxns.filter(t => t.type === "income").reduce((a, b) => a + (b.amount || 0), 0),
        expense: dayTxns.filter(t => t.type === "expense").reduce((a, b) => a + (b.amount || 0), 0),
      };
    });
    return { balance: totalIncome - totalExpense, income: totalIncome, expense: totalExpense, chartData: cData };
  }, [transactions]);

  const handleExportPdf = async () => {
    const element = document.getElementById("finance-pdf-content");
    if (!element) return;
    setIsExporting(true); element.style.display = "block";
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set({ margin: 0.5, filename: `Laporan_Keuangan.pdf`, image: { type: 'jpeg' as const, quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const } }).from(element).save();
    } catch (err) { console.error(err); }
    finally { element.style.display = "none"; setIsExporting(false); }
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full pb-20 lg:pb-0">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Finance Hub</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Lacak dan maksimalkan asetmu bulan ini.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportPdf} disabled={isExporting} className="flex items-center justify-center w-11 h-11 themed-card text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"><FileText size={18} /></button>
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm font-medium"><Plus size={16} /> Add Transaction</button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <div className="themed-card p-7 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex justify-center items-center"><Wallet size={16} className="text-emerald-500" /></div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total Balance</span>
            </div>
            <h2 className={cn("text-4xl font-bold tracking-tight truncate", balance < 0 ? "text-rose-500" : "text-emerald-500")}>{formatIDR(balance)}</h2>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="themed-card p-7 flex flex-col justify-center relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center"><TrendingUp size={14} className="text-emerald-500" /></div><span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Income</span></div>
              <p className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">{formatIDR(income)}</p>
            </div>
            <div className="themed-card p-7 flex flex-col justify-center relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center"><TrendingDown size={14} className="text-rose-500" /></div><span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Expense</span></div>
              <p className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">{formatIDR(expense)}</p>
            </div>
          </div>
        </div>

        {/* Chart + Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="themed-card p-7">
            <h3 className="font-semibold text-lg text-[var(--text-primary)] flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center"><CreditCard size={16} className="text-indigo-500" /></div>
              Cashflow 7 Hari
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                  </defs>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', backgroundColor: 'var(--bg-surface)', backdropFilter: 'blur(12px)' }}
                    itemStyle={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}
                    labelStyle={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}
                    formatter={(value: any) => formatIDR(Number(value || 0))}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="themed-card p-7 flex flex-col h-full">
            <h3 className="font-semibold text-lg text-[var(--text-primary)] flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center"><PiggyBank size={16} className="text-amber-500" /></div>
              Recent Transactions
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pb-2">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 themed-card border-dashed text-[var(--text-muted)]">
                  <PiggyBank size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">Belum ada transaksi.</p>
                </div>
              ) : (
                [...transactions].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()).slice(0, 8).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 themed-card hover:border-[var(--border-default)] transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg", t.type === "income" ? "bg-emerald-500/10" : "bg-rose-500/10")}>
                        {t.type === "income" ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-rose-500" />}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-primary)] text-sm">{t.title || "Tanpa Judul"}</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">{t.category || "Lainnya"} · {t.date}</p>
                      </div>
                    </div>
                    <span className={cn("font-bold tracking-tight text-sm", t.type === "income" ? "text-emerald-500" : "text-rose-500")}>{t.type === "income" ? "+" : "-"}{formatIDR(t.amount || 0)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* PDF Content */}
      <div id="finance-pdf-content" className="hidden p-8 bg-white text-neutral-900 absolute top-[-9999px] left-[-9999px] w-[800px]">
        <h1 className="text-3xl font-bold mb-2">MyDay OS - Laporan Keuangan</h1>
        <p className="text-sm text-neutral-500 mb-8">Balance: {formatIDR(balance)}</p>
      </div>

      <AnimatePresence>
        {modalOpen && <TransactionModal onClose={() => setModalOpen(false)} onAdd={(t) => { addTransaction(t); setModalOpen(false); }} />}
      </AnimatePresence>
    </div>
  );
}

function TransactionModal({ onClose, onAdd }: { onClose: () => void; onAdd: (t: Transaction) => void }) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const numAmt = parseInt(amountStr.replace(/[^0-9]/g, ""));
    if (isNaN(numAmt) || numAmt <= 0) return;
    onAdd({ id: Math.random().toString(36).slice(2, 9), title: title.trim(), type, amount: numAmt, category, date, createdAt: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 modal-overlay" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-[420px] modal-panel p-7">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><X size={16} /></button>
        <h2 className="text-2xl font-bold tracking-tight mb-6 text-[var(--text-primary)]">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex p-1.5 bg-[var(--bg-elevated)] rounded-xl">
            <button type="button" onClick={() => { setType("expense"); setCategory("Food"); }} className={cn("flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all", type === "expense" ? "bg-rose-500/10 text-rose-500" : "text-[var(--text-muted)]")}>Expense</button>
            <button type="button" onClick={() => { setType("income"); setCategory("Salary"); }} className={cn("flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all", type === "income" ? "bg-emerald-500/10 text-emerald-500" : "text-[var(--text-muted)]")}>Income</button>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Nama</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Cth: Nasi Goreng..." className="themed-input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Jumlah (Rp)</label>
            <input required value={amountStr} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ""); setAmountStr(v ? parseInt(v).toLocaleString("id-ID") : ""); }} placeholder="50.000" className="themed-input" />
          </div>
          <div className="flex gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="themed-select">{cats.map(c => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Tanggal</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="themed-input" />
            </div>
          </div>
          <button type="submit" className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl py-3.5 font-semibold shadow-lg shadow-pink-500/20 hover:shadow-xl transition-all">Simpan Transaksi</button>
        </form>
      </motion.div>
    </div>
  );
}