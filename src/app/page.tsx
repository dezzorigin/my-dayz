"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, Zap, Flame, Wallet, Brain, NotebookPen,
  Calendar, LayoutDashboard, LogIn, CheckCircle2, Play,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// Ikon GitHub inline (SVG mark resmi, CC0) — lucide-react 1.x tidak lagi
// mengekspor ikon brand, jadi jangan import `Github` dari lucide.
function GithubIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

const REPO_URL = "https://github.com/dezzorigin/my-dayz";

const FEATURES = [
  { icon: LayoutDashboard, title: "Dashboard", desc: "Sapaan harian, jam live, statistik, dan timeline vertikal harimu dalam satu layar." },
  { icon: Zap, title: "Smart Planner", desc: "Atur jadwal harian dengan timeline vertikal yang intuitif, lengkap dengan goals mingguan–semesteran." },
  { icon: Flame, title: "Habit Tracker", desc: "Bangun rutinitas positif dengan streak, riwayat 7 hari, dan statistik 30 hari." },
  { icon: Wallet, title: "Finance Hub", desc: "Lacak pengeluaran & pendapatan (IDR) dengan kategori dan grafik bulanan." },
  { icon: NotebookPen, title: "Daily Diary", desc: "Jurnal harian dengan mood dan tag — ditulis, disimpan, bisa diekspor ke PDF." },
  { icon: Calendar, title: "Kalender", desc: "Event, deadline, dan ujian dalam satu kalender bulanan, mode personal–akademik." },
  { icon: Brain, title: "Neural Map", desc: "Peta roadmap interaktif (drag, zoom, tambah node) untuk misi dan milestone besar." },
  { icon: Sparkles, title: "AI Assistant", desc: "Asisten Gemini: tanya apa saja, kirim gambar, bahkan tambah task lewat chat." },
];

const STEPS = [
  { n: "01", title: "Masuk tanpa daftar", desc: "Tidak ada akun, tidak ada password. Masuk sebagai demo dan data contoh langsung terisi — atau pakai email apa pun." },
  { n: "02", title: "Isi harimu", desc: "Tambah task di timeline, centang habit, catat pengeluaran. Semua tersimpan otomatis di browsermu." },
  { n: "03", title: "Pantau & ulangi", desc: "Streak habit, grafik keuangan, dan laporan PDF bulanan menunjukkan progresmu — lalu ulangi besok." },
];

export default function LandingPage() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Redirect langsung dari isLoggedIn — zustand persist terhidrasi sinkron
  // saat store dibuat, jadi tidak perlu state `mounted` perantara.
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, router]);

  // Konten landing di-render saat SSR (bukan `return null` sebelum mount):
  // halaman statis harus berisi hero + navbar + preview di HTML-nya, bukan
  // cuma shell kosong. Redirect ke /dashboard hanya jalan di client,
  // setelah mount, jadi pengguna login tetap langsung dilempar.
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-rose-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* ─── Navbar ─── */}
      <header className="relative z-20 w-full">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              My<span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Dayz</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border border-pink-500/30 text-pink-400">v3.0</span>
          </button>
          <div className="hidden md:flex items-center gap-7 text-sm text-[var(--text-secondary)]">
            <a href="#fitur" className="hover:text-[var(--text-primary)] transition-colors">Fitur</a>
            <a href="#produk" className="hover:text-[var(--text-primary)] transition-colors">Produk</a>
            <a href="#cara-kerja" className="hover:text-[var(--text-primary)] transition-colors">Cara kerja</a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MyDayz di GitHub"
              title="Lihat source code di GitHub"
              className="w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-pink-500/40 transition-all"
            >
              <GithubIcon size={17} />
            </a>
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all"
            >
              <LogIn size={15} />
              Masuk
            </button>
          </div>
        </nav>
      </header>

      {/* ─── Hero ─── */}
      <main className="relative z-10 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-8 px-6 pt-10 pb-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/20 bg-pink-500/5"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Personal AI OS v3.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
          >
            <span className="text-[var(--text-primary)]">My</span>
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Dayz
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed"
          >
            Satu command center untuk mengelola tugas, keuangan, kebiasaan, dan hari-harimu — didukung AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold text-[15px] shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 hover:-translate-y-0.5 transition-all"
            >
              Masuk Sekarang
              <ArrowRight size={16} />
            </button>
            <a
              href="#produk"
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold text-[15px] hover:border-pink-500/40 transition-all"
            >
              <Play size={15} className="text-pink-500" />
              Lihat produknya
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={12} className="text-pink-500" />
            Tanpa daftar · Data tersimpan lokal di browsermu · Gratis &amp; open source (MIT)
          </motion.p>
        </motion.div>

        {/* ─── Preview produk ─── */}
        <motion.section
          id="produk"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="max-w-5xl mx-auto px-6 mt-10 scroll-mt-24"
        >
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl shadow-pink-500/5">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <span className="w-3 h-3 rounded-full bg-rose-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-400/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
              <span className="ml-3 text-xs font-mono text-[var(--text-muted)]">my-dayz.pages.dev/dashboard</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/preview-dashboard.png"
              alt="Tampilan asli dashboard MyDayz — sapaan harian, AI command bar, statistik, dan timeline tugas"
              className="w-full h-auto block"
              loading="lazy"
            />
          </div>
          <p className="text-center text-xs text-[var(--text-muted)] mt-3">
            Tampilan asli dashboard MyDayz (mode demo, data contoh) — bukan mockup.
          </p>
        </motion.section>

        {/* ─── Fitur ─── */}
        <motion.section
          id="fitur"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto px-6 mt-20 scroll-mt-24"
        >
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-center text-[var(--text-primary)]">
            Semua harimu, <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">satu tempat</span>
          </h2>
          <p className="text-center text-sm text-[var(--text-secondary)] mt-2 max-w-lg mx-auto">
            Delapan modul yang saling terhubung — dari rencana pagi sampai refleksi malam.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.05 }}
                  className="themed-card p-5 group hover:border-pink-500/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center mb-3 group-hover:bg-pink-500/15 transition-colors">
                    <Icon size={18} className="text-pink-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{feat.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Cara kerja ─── */}
        <motion.section
          id="cara-kerja"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto px-6 mt-20 scroll-mt-24"
        >
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-center text-[var(--text-primary)]">
            Mulai dalam <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">semenit</span>
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="themed-card p-6">
                <p className="font-mono text-xs text-pink-500 tracking-widest">{s.n}</p>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mt-2 mb-1">{s.title}</h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="themed-card mt-6 p-6 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-pink-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Datamu tetap milikmu</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-1">
                Semua data tersimpan lokal di browser (localStorage) — tidak ada server yang
                menyimpannya, tidak ada pelacakan. AI Assistant memakai Gemini dan baru aktif
                bila kunci API dipasang di deployment (lihat docs/DEPLOYMENT.md); tanpa kunci,
                semua fitur lain tetap jalan penuh. Sinkronisasi cloud via Supabase adalah
                langkah berikut — arsitekturnya sudah disiapkan, belum diaktifkan.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── CTA akhir ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto px-6 mt-20 mb-4 text-center"
        >
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Harimu berikutnya dimulai di sini.
          </h2>
          <div className="mt-6">
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold text-[15px] shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 hover:-translate-y-0.5 transition-all"
            >
              Masuk Sekarang
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-[var(--border-subtle)] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Sparkles size={11} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">MyDayz</span>
            <span className="text-xs text-[var(--text-muted)]">— Personal AI OS · MIT License</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-[var(--text-muted)]">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
              <GithubIcon size={13} /> GitHub
            </a>
            <span>Powered by Gemini AI · Built with Next.js</span>
            <span>© 2026 Nabil Aulia Dika</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
