"use client";

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Zap,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronRight,
  Plus,
  Flame,
  Star,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapNodeData, NodeStatus } from "@/types/roadmap";

// ─── Status Config ────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  NodeStatus,
  {
    label: string;
    color: string;
    border: string;
    glow: string;
    bg: string;
    icon: React.FC<{ size?: number; className?: string }>;
    dot: string;
  }
> = {
  pending: {
    label: "Pending",
    color: "text-neutral-500",
    border: "border-neutral-200/80",
    glow: "shadow-neutral-200/60",
    bg: "from-neutral-50/90 to-white/95",
    icon: Clock,
    dot: "bg-neutral-300",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-blue-600",
    border: "border-blue-200/80",
    glow: "shadow-blue-200/70",
    bg: "from-blue-50/90 to-white/95",
    icon: Zap,
    dot: "bg-blue-400",
  },
  achieved: {
    label: "Achieved",
    color: "text-emerald-600",
    border: "border-emerald-200/80",
    glow: "shadow-emerald-200/70",
    bg: "from-emerald-50/90 to-white/95",
    icon: CheckCircle2,
    dot: "bg-emerald-400",
  },
};

const NODE_ICONS = [Target, Flame, Star, Flag, Zap, CheckCircle2];
const ICON_COLORS = [
  "text-blue-500",
  "text-orange-500",
  "text-amber-500",
  "text-rose-500",
  "text-violet-500",
  "text-emerald-500",
];
const ICON_BG = [
  "bg-blue-100",
  "bg-orange-100",
  "bg-amber-100",
  "bg-rose-100",
  "bg-violet-100",
  "bg-emerald-100",
];

// ─── Custom Node ──────────────────────────────────────────────────────────────

interface RoadmapNodeProps extends NodeProps {
  data: RoadmapNodeData;
}

export const RoadmapNode = memo(function RoadmapNode({ data, selected }: RoadmapNodeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(data.title);
  const [editDesc, setEditDesc] = useState(data.description ?? "");
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const status = data.status ?? "pending";
  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;
  const iconIdx = (data.iconIndex ?? 0) % NODE_ICONS.length;
  const NodeIcon = NODE_ICONS[iconIdx];

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleSaveEdit = useCallback(() => {
    if (editTitle.trim()) {
      data.onUpdate?.(data.id, { title: editTitle.trim(), description: editDesc.trim() });
    }
    setIsEditing(false);
  }, [data, editTitle, editDesc]);

  const cycleStatus = useCallback(() => {
    const order: NodeStatus[] = ["pending", "in-progress", "achieved"];
    const next = order[(order.indexOf(status) + 1) % order.length];
    data.onUpdate?.(data.id, { status: next });
  }, [data, status]);

  return (
    <>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          "!w-3 !h-3 !rounded-full !border-2 !border-white !-left-1.5 transition-all",
          status === "achieved" ? "!bg-emerald-400" : status === "in-progress" ? "!bg-blue-400" : "!bg-neutral-300"
        )}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "!w-3 !h-3 !rounded-full !border-2 !border-white !-right-1.5 transition-all",
          status === "achieved" ? "!bg-emerald-400" : status === "in-progress" ? "!bg-blue-400" : "!bg-neutral-300"
        )}
      />

      {/* Node card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className={cn(
          "relative w-[220px] rounded-2xl overflow-visible",
          "bg-gradient-to-br backdrop-blur-xl",
          "border shadow-lg",
          cfg.bg,
          cfg.border,
          cfg.glow,
          selected && "ring-2 ring-offset-1 ring-blue-400/60",
          "transition-shadow duration-200"
        )}
        style={{
          boxShadow: selected
            ? `0 0 0 2px rgba(96, 165, 250, 0.4), 0 8px 24px -4px var(--tw-shadow-color)`
            : `0 4px 20px -4px var(--tw-shadow-color)`,
        }}
      >
        {/* Status glow strip at top */}
        <div
          className={cn(
            "absolute top-0 left-4 right-4 h-0.5 rounded-full opacity-60",
            status === "achieved" ? "bg-gradient-to-r from-emerald-400 to-teal-300" :
            status === "in-progress" ? "bg-gradient-to-r from-blue-400 to-sky-300" :
            "bg-gradient-to-r from-neutral-200 to-neutral-100"
          )}
        />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-2.5 mb-3">
            {/* Icon */}
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
              ICON_BG[iconIdx]
            )}>
              <NodeIcon size={15} className={ICON_COLORS[iconIdx]} strokeWidth={2} />
            </div>

            {/* Title & desc */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-1.5" onMouseDown={(e) => e.stopPropagation()}>
                  <input
                    ref={inputRef}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") { setIsEditing(false); setEditTitle(data.title); }
                    }}
                    className="w-full text-[13px] font-semibold text-neutral-800 bg-white/80 border border-neutral-200 rounded-lg px-2 py-1 outline-none focus:border-blue-300 font-sans"
                    placeholder="Nama misi..."
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full text-[11px] text-neutral-500 bg-white/80 border border-neutral-200 rounded-lg px-2 py-1 outline-none focus:border-blue-300 resize-none font-sans"
                    rows={2}
                    placeholder="Deskripsi (opsional)..."
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 text-[10px] font-mono bg-neutral-900 text-white rounded-lg py-1 hover:bg-neutral-700 transition-colors"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setEditTitle(data.title); }}
                      className="flex-1 text-[10px] font-mono bg-neutral-100 text-neutral-500 rounded-lg py-1 hover:bg-neutral-200 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[13px] font-semibold text-neutral-800 leading-tight font-sans truncate">
                    {data.title}
                  </p>
                  {data.description && (
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug font-sans line-clamp-2">
                      {data.description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Menu button */}
            {!isEditing && (
              <div className="relative flex-shrink-0" ref={menuRef}>
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  <MoreHorizontal size={13} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      transition={{ duration: 0.12 }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute top-7 right-0 z-50 w-36 bg-white rounded-xl border border-neutral-200 shadow-lg shadow-neutral-200/60 py-1 overflow-hidden"
                    >
                      <button
                        onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-neutral-600 hover:bg-neutral-50 transition-colors font-sans"
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        onClick={() => { cycleStatus(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-neutral-600 hover:bg-neutral-50 transition-colors font-sans"
                      >
                        <ChevronRight size={11} /> Ganti Status
                      </button>
                      <button
                        onClick={() => { data.onAddChild?.(data.id); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-neutral-600 hover:bg-neutral-50 transition-colors font-sans"
                      >
                        <Plus size={11} /> Add Milestone
                      </button>
                      <div className="border-t border-neutral-100 my-1" />
                      <button
                        onClick={() => { data.onDelete?.(data.id); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-rose-500 hover:bg-rose-50 transition-colors font-sans"
                      >
                        <Trash2 size={11} /> Hapus
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Status badge — clickable to cycle */}
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={cycleStatus}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-medium transition-all w-full justify-center",
                cfg.color,
                cfg.border,
                "hover:opacity-80"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
              <StatusIcon size={10} />
              {cfg.label}
            </motion.button>
          )}
        </div>

        {/* Shimmer effect for achieved */}
        {status === "achieved" && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: ["−100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
          </div>
        )}
      </motion.div>
    </>
  );
});

// ─── Root / Mission Node (larger, more prominent) ─────────────────────────────

export const MissionNode = memo(function MissionNode({ data, selected }: RoadmapNodeProps) {
  const status = data.status ?? "pending";
  const cfg = STATUS_CONFIG[status];

  return (
    <>
      <Handle type="source" position={Position.Right} className="!w-3.5 !h-3.5 !rounded-full !border-2 !border-white !bg-amber-400 !-right-1.5" />
      <Handle type="target" position={Position.Left} className="!w-3.5 !h-3.5 !rounded-full !border-2 !border-white !bg-amber-400 !-left-1.5" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          "relative w-[240px] rounded-3xl overflow-hidden",
          "bg-gradient-to-br from-neutral-900 to-neutral-800",
          "border border-white/10",
          "shadow-2xl shadow-neutral-900/30",
          selected && "ring-2 ring-offset-2 ring-amber-400/60"
        )}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

        {/* Glow orb */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

        <div className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm shadow-amber-400/30">
              <Target size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-mono text-[9px] text-amber-400/80 tracking-[0.18em] uppercase">Mission</span>
          </div>
          <h3 className="font-serif text-[17px] text-white tracking-tight leading-tight mt-2">
            {data.title}
          </h3>
          {data.description && (
            <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed font-sans">
              {data.description}
            </p>
          )}

          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              const order: NodeStatus[] = ["pending", "in-progress", "achieved"];
              const next = order[(order.indexOf(status) + 1) % order.length];
              data.onUpdate?.(data.id, { status: next });
            }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono mt-3 transition-all",
              status === "achieved" ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" :
              status === "in-progress" ? "border-blue-500/40 text-blue-400 bg-blue-500/10" :
              "border-white/10 text-neutral-500 bg-white/5"
            )}
          >
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              status === "achieved" ? "bg-emerald-400" : status === "in-progress" ? "bg-blue-400 animate-pulse" : "bg-neutral-600"
            )} />
            {cfg.label}
          </button>
        </div>
      </motion.div>
    </>
  );
});