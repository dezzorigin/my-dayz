"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/types";
import { Send, Bot, Sparkles, User, RefreshCw, Paperclip, Mic, X } from "lucide-react";
import { cn } from "@/lib/utils";

type LocalChatMessage = ChatMessage & { imageUrl?: string };

export default function AIVaultPage() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalChatMessage[]>([
    { id: "init", role: "assistant", content: "Halo! Saya adalah MyDay AI Vault. Apa yang ingin kita bahas hari ini?", timestamp: new Date().toISOString() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  if (!mounted) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setImage(reader.result as string); if (fileInputRef.current) fileInputRef.current.value = ""; };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !image) return;

    const userMsg: LocalChatMessage = { id: Math.random().toString(36).slice(2), role: "user", content: input.trim(), timestamp: new Date().toISOString(), imageUrl: image || undefined };
    const historyForApi = [...messages];
    setMessages(prev => [...prev, userMsg]);
    const msg = input.trim(); const img = image;
    setInput(""); setImage(null); setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, image: img, history: historyForApi.map(m => ({ role: m.role, content: m.content || "🖼️ [Gambar]" })) })
      });
      if (!res.ok) throw new Error("Gagal merespons.");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { id: Math.random().toString(36).slice(2), role: "assistant", content: data.reply, timestamp: new Date().toISOString() }]);

      // Auto-task intent
      const lower = msg.toLowerCase();
      const match = lower.match(/(?:ingatkan|tambahkan task|jadwalkan)\\s+(.*?)$/i);
      if (match) {
        const taskName = match[1].trim();
        if (taskName) {
          const { useTaskStore } = await import("@/store/taskStore");
          useTaskStore.getState().addTask({ title: taskName, priority: lower.includes("penting") ? "high" : "med", date: new Date().toISOString().slice(0, 10) });
          setTimeout(() => setMessages(prev => [...prev, { id: Math.random().toString(36).slice(2), role: "assistant", content: `✅ Task Auto-Added: "${taskName}"`, timestamp: new Date().toISOString() }]), 500);
        }
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { id: Math.random().toString(36).slice(2), role: "assistant", content: "⚠️ " + error.message, timestamp: new Date().toISOString() }]);
    } finally { setIsTyping(false); }
  };

  const clearChat = () => {
    setMessages([{ id: "init", role: "assistant", content: "Halo! Ruang obrolan dibersihkan.", timestamp: new Date().toISOString() }]);
    setImage(null); setInput("");
  };

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Browser tidak mendukung Web Speech API."); return; }
    const r = new SR(); r.lang = "id-ID"; r.interimResults = false;
    r.onstart = () => setIsListening(true);
    r.onend = () => setIsListening(false);
    r.onresult = (ev: any) => setInput(p => p + (p.length > 0 ? " " : "") + ev.results[0][0].transcript);
    r.onerror = () => setIsListening(false);
    r.start();
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="relative z-20 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] pt-4 pb-3 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20"><Sparkles size={20} className="text-white" /></div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">AI Vault</h1>
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">Personal Intelligence</p>
          </div>
        </div>
        <button onClick={clearChat} className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><RefreshCw size={15} /></button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="max-w-3xl mx-auto py-8 flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isAI = msg.role === "assistant";
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", isAI ? "justify-start" : "justify-end")}>
                  {isAI && <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0 mt-1"><Bot size={16} className="text-pink-500" /></div>}
                  <div className={cn("max-w-[85%] lg:max-w-[75%] px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed", isAI ? "themed-card text-[var(--text-primary)] rounded-tl-sm whitespace-pre-wrap" : "bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-tr-sm space-y-3")}>
                    {msg.imageUrl && <div className="overflow-hidden rounded-xl border border-white/20 shadow-sm mt-1"><img src={msg.imageUrl} alt="Upload" className="w-full h-auto max-h-[300px] object-cover" /></div>}
                    {(msg.content || !msg.imageUrl) && <div className={cn(!isAI && msg.content && "font-medium")}>{msg.content || ""}</div>}
                  </div>
                  {!isAI && <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1"><User size={16} className="text-pink-500" /></div>}
                </motion.div>
              );
            })}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0 mt-1"><Bot size={16} className="text-pink-500" /></div>
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm themed-card flex items-center gap-1.5 h-[52px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input */}
      <footer className="relative z-20 pb-4 pt-2 px-4 md:px-0">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {image && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-3 px-2 flex justify-start">
                <div className="relative inline-block themed-card p-1.5">
                  <button type="button" onClick={() => setImage(null)} className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-pink-500 text-white rounded-full shadow-lg z-10"><X size={12} /></button>
                  <img src={image} className="h-16 w-auto max-w-[120px] rounded-xl object-cover" alt="Preview" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSend} className="flex items-center gap-2 themed-card p-2 pl-3 rounded-full">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
            <div className="flex items-center gap-1 flex-shrink-0">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-pink-500 transition-colors"><Paperclip size={18} /></button>
              <button type="button" onClick={handleVoice} className={cn("w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center transition-colors", isListening ? "text-rose-500 animate-pulse" : "text-[var(--text-muted)] hover:text-pink-500")}><Mic size={18} /></button>
            </div>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder={image ? "Pesan untuk gambar..." : "Tanya AI Vault..."} className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] py-2.5 px-2" />
            <motion.button whileTap={{ scale: 0.9 }} disabled={(!input.trim() && !image) || isTyping} type="submit" className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center disabled:opacity-50 shadow-lg shadow-pink-500/20 flex-shrink-0"><Send size={18} className="translate-x-[1px]" /></motion.button>
          </form>
          <p className="text-center text-[10px] text-[var(--text-muted)] mt-3 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
            <Sparkles size={10} className="text-pink-500" /> Active Core: Gemini 1.5 Flash
          </p>
        </div>
      </footer>
    </div>
  );
}
