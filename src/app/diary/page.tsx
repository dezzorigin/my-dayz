"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDiaryStore } from "@/store/diaryStore";
import { useMoodStore, useTodayMood } from "@/store/moodStore";
import type { MoodValue } from "@/types";
import { Send, Sparkles, CalendarDays, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MOODS = [
  { v: 5, e: "🤩", l: "Luar Biasa", color: "text-amber-500" },
  { v: 4, e: "😊", l: "Baik", color: "text-emerald-500" },
  { v: 3, e: "😐", l: "Biasa", color: "text-sky-500" },
  { v: 2, e: "😔", l: "Buruk", color: "text-violet-500" },
  { v: 1, e: "😫", l: "Sangat Buruk", color: "text-rose-500" },
];

function getMoodMeta(v?: MoodValue) { return MOODS.find(m => m.v === v) || MOODS[2]; }

export default function DiaryPage() {
  const { entries, addEntry, deleteEntry } = useDiaryStore();
  const { setMood } = useMoodStore();
  const todayMood = useTodayMood();
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodValue | undefined>(todayMood?.v);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (todayMood && !selectedMood) setSelectedMood(todayMood.v);
  }, [todayMood, selectedMood]);

  if (!mounted) return null;

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    addEntry({ date: today, content, mood: selectedMood, tags: [] });
    if (selectedMood) setMood({ date: today, v: selectedMood });
    setContent("");
  };

  return (
    <div className="relative w-full pb-20 lg:pb-0">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-3xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="mt-2 mb-6 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Daily Diary</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">Ruang personal untuk pikiran, cerita, dan emosimu.</p>
        </div>

        {/* Composer */}
        <form onSubmit={handlePost} className="themed-card p-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0 pt-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center border border-[var(--border-subtle)]">
                <Sparkles size={18} className="text-pink-500" />
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Apa yang ada di pikiranmu hari ini?"
                className="w-full bg-transparent outline-none resize-none text-[16px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] min-h-[100px] leading-relaxed pt-2"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
            <div className="flex items-center gap-2">
              {MOODS.map(m => (
                <button key={m.v} type="button" onClick={() => setSelectedMood(m.v as MoodValue)} className={cn("w-8 h-8 rounded-full flex items-center justify-center text-lg transition-transform", selectedMood === m.v ? "scale-125 bg-[var(--bg-elevated)]" : "opacity-50 hover:opacity-100 hover:scale-110")} title={m.l}>{m.e}</button>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.95 }} disabled={!content.trim()} type="submit" className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 shadow-lg shadow-pink-500/20 flex items-center gap-2">
              Post <Send size={14} />
            </motion.button>
          </div>
        </form>

        {/* Timeline */}
        <div className="space-y-6 pt-4">
          {entries.length === 0 ? (
            <div className="text-center py-20 themed-card border-dashed flex flex-col items-center justify-center">
              <CalendarDays size={40} className="text-[var(--text-ghost)] mb-4" />
              <p className="text-[var(--text-secondary)] font-semibold">Timeline diary-mu masih kosong.</p>
              <p className="text-[var(--text-muted)] text-sm mt-1">Mulai tulis ceritamu hari ini.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-[var(--border-subtle)] ml-5 pl-8 space-y-10 pb-10">
              {entries.map((entry) => {
                const mMeta = getMoodMeta(entry.mood);
                const dateObj = new Date(entry.createdAt);
                const timeStr = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                const dateStr = dateObj.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <motion.div layout initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={entry.id} className="relative group">
                    <div className="absolute -left-[45px] top-1 w-8 h-8 rounded-full border-4 border-[var(--bg-base)] flex items-center justify-center text-[13px] bg-[var(--bg-surface)] z-10">{mMeta.e}</div>
                    <div className="themed-card p-5 hover:border-[var(--border-default)] transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[15px] text-[var(--text-primary)]">{dateStr}</span>
                          <span className="text-[var(--text-ghost)]">•</span>
                          <span className="text-[13px] text-[var(--text-muted)] font-medium">{timeStr} WIB</span>
                        </div>
                        <button onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                      </div>
                      <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">{entry.content}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
