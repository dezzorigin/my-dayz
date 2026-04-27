"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, FileText, Sun, Moon, LogOut } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { useTaskStore } from "@/store/taskStore";
import { useHabitStore } from "@/store/habitStore";
import { useFinanceStore } from "@/store/financeStore";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.features);
  const toggleFeature = useSettingsStore((s) => s.toggleFeature);
  const { mode, toggle } = useThemeStore();
  const { logout } = useAuthStore();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [reportTimestamp, setReportTimestamp] = useState<string>("");

  useEffect(() => { setReportTimestamp(new Date().toLocaleString("id-ID")); }, []);

  const tasks = useTaskStore((s) => s.tasks);
  const habits = useHabitStore((s) => s.habits);
  const txns = useFinanceStore((s) => s.transactions);

  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById("pdf-report-content");
    if (!element) { setIsExporting(false); return; }
    element.style.display = "block";
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set({ margin: 0.5, filename: `MyDayz_Report_${new Date().toISOString().slice(0, 10)}.pdf`, image: { type: "jpeg" as const, quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: "in" as const, format: "letter" as const, orientation: "portrait" as const } }).from(element).save();
    } catch (err) { console.error(err); }
    finally { element.style.display = "none"; setIsExporting(false); }
  };

  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
          <Settings size={17} className="text-[var(--text-muted)]" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Pengaturan</h1>
          <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-[0.14em] uppercase mt-0.5">Konfigurasi Personal OS</p>
        </div>
      </motion.div>

      {/* Theme Toggle */}
      <section className="space-y-3">
        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.14em]">Tampilan</p>
        <div className="themed-card divide-y divide-[var(--border-subtle)]">
          <div onClick={toggle} className="flex items-center justify-between px-4 py-3.5 hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              {mode === "dark" ? <Moon size={16} className="text-[var(--text-muted)]" /> : <Sun size={16} className="text-amber-500" />}
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Mode Gelap</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Beralih antara mode terang dan gelap</p>
              </div>
            </div>
            <div className={cn("w-10 flex items-center rounded-full px-0.5 transition-colors duration-300 flex-shrink-0 ml-4", mode === "dark" ? "bg-pink-500" : "bg-[var(--border-default)]")} style={{ height: "22px" }}>
              <motion.div animate={{ x: mode === "dark" ? 18 : 1 }} transition={{ type: "spring", stiffness: 600, damping: 35 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Modul Tambahan */}
      <section className="space-y-3">
        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.14em]">Modul Tambahan</p>
        <div className="themed-card divide-y divide-[var(--border-subtle)]">
          <ToggleRow label="Finance Tracker" desc="Lacak pengeluaran & pendapatan harian." active={settings.finance} onToggle={() => toggleFeature("finance")} />
          <ToggleRow label="Habits Tracker" desc="Membangun rutinitas yang lebih baik." active={settings.habits} onToggle={() => toggleFeature("habits")} />
          <ToggleRow label="Cycle Tracker" desc="Prediksi & catat siklus harian." active={settings.cycleTracker} onToggle={() => toggleFeature("cycleTracker")} />
        </div>
      </section>

      {/* Data & Export */}
      <section className="space-y-3">
        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.14em]">Data & Ekspor</p>
        <div className="themed-card p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-medium text-[var(--text-primary)]">Laporan Bulanan</p>
            <p className="text-[12px] text-[var(--text-muted)] mt-1 max-w-xs">Cetak performa produktivitas, kebiasaan, dan keuangan.</p>
          </div>
          <button onClick={handleExportPDF} disabled={isExporting} className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50 text-[13px] font-mono">
            <FileText size={14} /> {isExporting ? "Membuat..." : "Export PDF"}
          </button>
        </div>
      </section>

      {/* Logout */}
      <section className="space-y-3">
        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.14em]">Akun</p>
        <button onClick={handleLogout} className="w-full themed-card p-4 flex items-center gap-3 hover:border-rose-500/20 transition-colors text-left">
          <LogOut size={16} className="text-rose-500" />
          <div>
            <p className="text-[14px] font-medium text-rose-500">Logout</p>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Keluar dari MyDayz Personal OS</p>
          </div>
        </button>
      </section>

      {/* Hidden PDF Content */}
      <div id="pdf-report-content" className="hidden p-8 bg-white text-neutral-900">
        <h1 className="text-3xl font-bold mb-2">MyDayz OS — Laporan Bulanan</h1>
        <p className="text-sm text-neutral-500 mb-8">Generated at: {reportTimestamp}</p>
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Tasks</h2>
        <ul className="mb-6 space-y-1 text-sm list-disc pl-5">{tasks.map(t => <li key={t.id}>{t.title} — {t.done ? "Selesai" : "Pending"}</li>)}</ul>
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Habits</h2>
        <ul className="mb-6 space-y-1 text-sm list-disc pl-5">{habits.map(h => <li key={h.id}>{h.name}</li>)}</ul>
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Keuangan</h2>
        <ul className="mb-6 space-y-1 text-sm list-disc pl-5">{txns.map(t => <li key={t.id}>{t.type === "income" ? "+" : "-"}{t.amount} — {t.title}</li>)}</ul>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, active, onToggle }: { label: string; desc: string; active: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} className="flex items-center justify-between px-4 py-3.5 hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors">
      <div>
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{desc}</p>
      </div>
      <div className={cn("w-10 flex items-center rounded-full px-0.5 transition-colors duration-300 flex-shrink-0 ml-4", active ? "bg-pink-500" : "bg-[var(--border-default)]")} style={{ height: "22px" }}>
        <motion.div animate={{ x: active ? 18 : 1 }} transition={{ type: "spring", stiffness: 600, damping: 35 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  );
}
