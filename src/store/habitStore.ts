// ─────────────────────────────────────────────────────────────────────────────
// src/store/habitStore.ts
// Zustand Store — Habits & Daily Logs with localStorage persistence
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ── Types ─────────────────────────────────────────────────────────────────────

export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  icon: string;             // emoji, e.g. "💧"
  freq: HabitFrequency;
  target: number;           // completions per period (reserved for future use)
  log: Record<string, boolean>; // { "YYYY-MM-DD": true }
  color: string;            // accent hex, e.g. "#2563eb"
  createdAt: string;
}

// Derived per-habit computed shape
export interface HabitWithStats extends Habit {
  doneToday:    boolean;
  streak:       number;     // consecutive days ending today
  last7:        { date: string; done: boolean }[];
  totalDone:    number;     // all-time completions
  completionRate: number;   // last-30-days %, 0–100
}

// ── Default accent colors (cycling) ──────────────────────────────────────────

const ACCENT_COLORS = [
  '#2563eb', // blue
  '#059669', // emerald
  '#d97706', // amber
  '#7c3aed', // violet
  '#db2777', // pink
  '#0891b2', // cyan
  '#65a30d', // lime
  '#dc2626', // red
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

const genId  = (): string => Math.random().toString(36).slice(2, 11);
const now    = (): string => new Date().toISOString();
const today  = (): string => new Date().toISOString().slice(0, 10);

function calcStreak(log: Record<string, boolean>): number {
  if (!log) return 0;
  let streak = 0;
  const d = new Date();
  // If today not done yet, still count yesterday forward
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if (!log[key]) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function calcLast7(log: Record<string, boolean>): { date: string; done: boolean }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const date = d.toISOString().slice(0, 10);
    return { date, done: !!log?.[date] };
  });
}

function calcCompletionRate(log: Record<string, boolean>): number {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 29 + i);
    return d.toISOString().slice(0, 10);
  });
  const done = days.filter((d) => log?.[d]).length;
  return Math.round((done / 30) * 100);
}

function enrichHabit(habit: Habit): HabitWithStats {
  const td = today();
  return {
    ...habit,
    doneToday:      !!habit.log?.[td],
    streak:         calcStreak(habit.log),
    last7:          calcLast7(habit.log),
    totalDone:      Object.values(habit.log ?? {}).filter(Boolean).length,
    completionRate: calcCompletionRate(habit.log),
  };
}

// ── State Interface ───────────────────────────────────────────────────────────

interface HabitState {
  habits: Habit[];

  // ── Mutation Actions ──
  addHabit: (payload: {
    name: string;
    icon?: string;
    freq?: HabitFrequency;
    target?: number;
    color?: string;
  }) => Habit;

  updateHabit: (id: string, patch: Partial<Omit<Habit, 'id' | 'log' | 'createdAt'>>) => void;
  deleteHabit: (id: string) => void;

  // ── Log Actions ──
  toggleLog:  (id: string, date?: string) => void;  // date defaults to today
  markDone:   (id: string, date?: string) => void;
  markUndone: (id: string, date?: string) => void;
  bulkLog:    (id: string, dates: string[]) => void;  // mark multiple dates done

  // ── Computed Getters ──
  getHabitWithStats:  (id: string) => HabitWithStats | undefined;
  getAllWithStats:     () => HabitWithStats[];
  getDoneToday:       () => Habit[];
  getOverallPct:      () => number;  // % of habits done today
  getStreak:          (id: string) => number;

  // ── Utility ──
  reorderHabits: (ids: string[]) => void;  // pass new order of IDs
  reset: () => void;
}

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = { habits: [] as Habit[] };

// ── Store ─────────────────────────────────────────────────────────────────────

export const useHabitStore = create<HabitState>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // ── Mutation Actions ──────────────────────────────────────────────────────

      addHabit: (payload) => {
        // Auto-assign cycling color if none provided
        const usedColors = get().habits.map((h) => h.color);
        const color =
          payload.color ??
          ACCENT_COLORS.find((c) => !usedColors.includes(c)) ??
          ACCENT_COLORS[get().habits.length % ACCENT_COLORS.length];

        const habit: Habit = {
          id:        genId(),
          name:      payload.name.trim(),
          icon:      payload.icon   ?? '⭐',
          freq:      payload.freq   ?? 'daily',
          target:    payload.target ?? 1,
          color,
          log:       {},
          createdAt: now(),
        };
        set((state) => { state.habits.push(habit); });
        return habit;
      },

      updateHabit: (id, patch) =>
        set((state) => {
          const h = state.habits.find((h) => h.id === id);
          if (h) Object.assign(h, patch);
        }),

      deleteHabit: (id) =>
        set((state) => {
          state.habits = state.habits.filter((h) => h.id !== id);
        }),

      // ── Log Actions ──────────────────────────────────────────────────────────

      toggleLog: (id, date) => {
        const d = date ?? today();
        set((state) => {
          const h = state.habits.find((h) => h.id === id);
          if (!h) return;
          if (!h.log) h.log = {};
          if (h.log[d]) {
            delete h.log[d];
          } else {
            h.log[d] = true;
          }
        });
      },

      markDone: (id, date) => {
        const d = date ?? today();
        set((state) => {
          const h = state.habits.find((h) => h.id === id);
          if (h) {
            if (!h.log) h.log = {};
            h.log[d] = true;
          }
        });
      },

      markUndone: (id, date) => {
        const d = date ?? today();
        set((state) => {
          const h = state.habits.find((h) => h.id === id);
          if (h?.log) delete h.log[d];
        });
      },

      bulkLog: (id, dates) =>
        set((state) => {
          const h = state.habits.find((h) => h.id === id);
          if (!h) return;
          if (!h.log) h.log = {};
          dates.forEach((d) => { h.log[d] = true; });
        }),

      // ── Computed Getters ──────────────────────────────────────────────────────

      getHabitWithStats: (id) => {
        const h = get().habits.find((h) => h.id === id);
        return h ? enrichHabit(h) : undefined;
      },

      getAllWithStats: () =>
        get().habits.map(enrichHabit),

      getDoneToday: () => {
        const td = today();
        return get().habits.filter((h) => h.log?.[td]);
      },

      getOverallPct: () => {
        const { habits } = get();
        if (!habits.length) return 0;
        const td   = today();
        const done = habits.filter((h) => h.log?.[td]).length;
        return Math.round((done / habits.length) * 100);
      },

      getStreak: (id) => {
        const h = get().habits.find((h) => h.id === id);
        return h ? calcStreak(h.log) : 0;
      },

      // ── Utility ──────────────────────────────────────────────────────────────

      reorderHabits: (ids) =>
        set((state) => {
          const map = new Map(state.habits.map((h) => [h.id, h]));
          const reordered = ids.map((id) => map.get(id)).filter(Boolean) as Habit[];
          // Append any habits not in the ids list (safety net)
          const remaining = state.habits.filter((h) => !ids.includes(h.id));
          state.habits = [...reordered, ...remaining];
        }),

      reset: () => set(() => ({ ...initialState })),
    })),
    {
      name:    'myday_habits_v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ habits: s.habits }),
    }
  )
);

// ── Derived hooks ─────────────────────────────────────────────────────────────

import { useMemo } from 'react';

/** All habits enriched with streak, last7, etc. */
export function useAllHabitsWithStats(): HabitWithStats[] {
  const habits = useHabitStore((s) => s.habits);
  return useMemo(() => habits.map(h => useHabitStore.getState().getHabitWithStats(h.id)!), [habits]);
}

/** Single habit with stats */
export function useHabitWithStats(id: string): HabitWithStats | undefined {
  const habits = useHabitStore((s) => s.habits);
  return useMemo(() => useHabitStore.getState().getHabitWithStats(id), [habits, id]);
}

/** Overall today's completion % (for dashboard ring) */
export function useOverallHabitPct(): number {
  return useHabitStore((s) => s.getOverallPct());
}

/** Count done / total today (for dashboard subtitle) */
export function useHabitTodayCount(): { done: number; total: number } {
  const habits = useHabitStore((s) => s.habits);
  return useMemo(() => {
    const td    = new Date().toISOString().slice(0, 10);
    const total = habits.length;
    const done  = habits.filter((h) => h.log?.[td]).length;
    return { done, total };
  }, [habits]);
}

/** Longest current streak across all habits (flex stat for dashboard) */
export function useLongestStreak(): { name: string; streak: number; icon: string } | null {
  const habits = useHabitStore((s) => s.habits);
  return useMemo(() => {
    if (!habits.length) return null;
    const withStreaks = habits.map((h) => ({
      name:   h.name,
      icon:   h.icon,
      streak: useHabitStore.getState().getStreak(h.id),
    }));
    return withStreaks.reduce((best, h) => (h.streak > best.streak ? h : best));
  }, [habits]);
}

/** Last 7 days grid for ALL habits (heat map on dashboard) */
export function useWeekHeatmap(): {
  date: string;
  label: string;
  pct: number;
}[] {
  const habits = useHabitStore((s) => s.habits);
  return useMemo(() => {
    const DAYS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'] as const;
    const total = habits.length || 1;

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      const date  = d.toISOString().slice(0, 10);
      const label = DAYS[d.getDay()];
      const done  = habits.filter((h) => h.log?.[date]).length;
      return { date, label, pct: Math.round((done / total) * 100) };
    });
  }, [habits]);
}