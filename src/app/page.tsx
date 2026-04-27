"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Shield, Brain, Flame } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LandingPage() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [mounted, isLoggedIn, router]);

  if (!mounted) return null;

  const features = [
    { icon: Zap, title: "Smart Planner", desc: "Atur jadwal harian dengan timeline vertikal yang intuitif" },
    { icon: Flame, title: "Habit Tracker", desc: "Bangun rutinitas positif dengan streak & statistik harian" },
    { icon: Shield, title: "Finance Hub", desc: "Lacak pengeluaran & pendapatan dalam satu dashboard" },
    { icon: Brain, title: "AI Assistant", desc: "Asisten cerdas berbasis Gemini untuk produktivitasmu" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6 py-12">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-rose-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl mx-auto space-y-8"
      >
        {/* Logo Badge */}
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

        {/* Title */}
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

        {/* CTA Buttons */}
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
        </motion.div>
      </motion.div>

      {/* Feature Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative z-10 mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
      >
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
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
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 mt-12 text-xs text-[var(--text-muted)] flex items-center gap-1.5"
      >
        <Sparkles size={10} className="text-pink-500" />
        Powered by Gemini AI · Built with Next.js
      </motion.p>
    </div>
  );
}
