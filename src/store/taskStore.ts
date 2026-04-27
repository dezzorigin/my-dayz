// ─────────────────────────────────────────────────────────────────────────────
// src/store/taskStore.ts
// Zustand Store — Tasks & Goals with localStorage persistence
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Priority = 'high' | 'med' | 'low';
export type GoalType = 'mingguan' | 'bulanan' | 'semestral';

export interface Task {
  id: string;
  title: string;
  date: string;       // "YYYY-MM-DD"
  priority: Priority;
  tag: string;
  time: string;       // "HH:mm" | ""
  notes: string;
  done: boolean;
  createdAt: string;  // ISO string
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  deadline: string;   // "YYYY-MM-DD" | ""
  progress: number;   // 0–100
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const genId = (): string => Math.random().toString(36).slice(2, 11);
const now    = (): string => new Date().toISOString();
const today  = (): string => new Date().toISOString().slice(0, 10);

// ── Pure Selector Helpers (use inside useTaskStore selectors) ─────────────────

export const selectTasksByDate = (tasks: Task[], date: string): Task[] =>
  tasks.filter((t) => t.date === date);

export const selectTodayTasks = (tasks: Task[]): Task[] =>
  selectTasksByDate(tasks, today());

export const selectDonePct = (tasks: Task[]): number => {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
};

// ── State Interface ───────────────────────────────────────────────────────────

interface TaskState {
  tasks: Task[];
  goals: Goal[];

  // ── Task Actions ──
  addTask: (payload: {
    title: string;
    date?: string;
    priority?: Priority;
    tag?: string;
    time?: string;
    notes?: string;
  }) => Task;

  toggleTask:  (id: string) => void;
  deleteTask:  (id: string) => void;
  updateTask:  (id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  clearDone:   (date: string) => void;
  reorderTask: (id: string, newDate: string) => void;

  // ── Goal Actions ──
  addGoal: (payload: {
    title: string;
    type?: GoalType;
    deadline?: string;
  }) => Goal;

  updateGoal:        (id: string, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
  setGoalProgress:   (id: string, progress: number) => void;
  incrementProgress: (id: string, by?: number) => void;
  deleteGoal:        (id: string) => void;

  // ── Bulk / Utility ──
  importTasks: (tasks: Task[]) => void;
  reset: () => void;
}

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = { tasks: [] as Task[], goals: [] as Goal[] };

// ── Store ─────────────────────────────────────────────────────────────────────

export const useTaskStore = create<TaskState>()(
  persist(
    immer((set) => ({
      ...initialState,

      // ── Task Actions ─────────────────────────────────────────────────────────

      addTask: (payload) => {
        const task: Task = {
          id:        genId(),
          title:     payload.title.trim(),
          date:      payload.date     ?? today(),
          priority:  payload.priority ?? 'med',
          tag:       payload.tag      ?? '',
          time:      payload.time     ?? '',
          notes:     payload.notes    ?? '',
          done:      false,
          createdAt: now(),
        };
        set((state) => { state.tasks.unshift(task); });
        return task;
      },

      toggleTask: (id) =>
        set((state) => {
          const t = state.tasks.find((t) => t.id === id);
          if (t) t.done = !t.done;
        }),

      deleteTask: (id) =>
        set((state) => {
          state.tasks = state.tasks.filter((t) => t.id !== id);
        }),

      updateTask: (id, patch) =>
        set((state) => {
          const t = state.tasks.find((t) => t.id === id);
          if (t) Object.assign(t, patch);
        }),

      clearDone: (date) =>
        set((state) => {
          state.tasks = state.tasks.filter((t) => !(t.date === date && t.done));
        }),

      reorderTask: (id, newDate) =>
        set((state) => {
          const t = state.tasks.find((t) => t.id === id);
          if (t) t.date = newDate;
        }),

      // ── Goal Actions ─────────────────────────────────────────────────────────

      addGoal: (payload) => {
        const goal: Goal = {
          id:        genId(),
          title:     payload.title.trim(),
          type:      payload.type     ?? 'mingguan',
          deadline:  payload.deadline ?? '',
          progress:  0,
          createdAt: now(),
        };
        set((state) => { state.goals.unshift(goal); });
        return goal;
      },

      updateGoal: (id, patch) =>
        set((state) => {
          const g = state.goals.find((g) => g.id === id);
          if (g) Object.assign(g, patch);
        }),

      setGoalProgress: (id, progress) =>
        set((state) => {
          const g = state.goals.find((g) => g.id === id);
          if (g) g.progress = Math.min(100, Math.max(0, progress));
        }),

      incrementProgress: (id, by = 5) =>
        set((state) => {
          const g = state.goals.find((g) => g.id === id);
          if (g) g.progress = Math.min(100, g.progress + by);
        }),

      deleteGoal: (id) =>
        set((state) => {
          state.goals = state.goals.filter((g) => g.id !== id);
        }),

      // ── Bulk / Utility ────────────────────────────────────────────────────────

      importTasks: (incoming) =>
        set((state) => {
          const existing = new Set(state.tasks.map((t) => t.id));
          state.tasks.push(...incoming.filter((t) => !existing.has(t.id)));
        }),

      reset: () => set(() => ({ ...initialState })),
    })),
    {
      name:       'myday_tasks_v3',
      storage:    createJSONStorage(() => localStorage),
      partialize: (s) => ({ tasks: s.tasks, goals: s.goals }),
    }
  )
);

// ── Derived hooks (thin, memoised slices for components) ──────────────────────

const PRIO_ORDER: Record<Priority, number> = { high: 0, med: 1, low: 2 };

/** Tasks for a date, sorted: pending (high→low priority) then done */
export function useTasksByDate(date: string): Task[] {
  return useTaskStore(useShallow((s) =>
    [...s.tasks.filter((t) => t.date === date)].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority];
    })
  ));
}

/** Completion % for a given date */
export function useDonePct(date: string): number {
  return useTaskStore((s) => {
    const day = s.tasks.filter((t) => t.date === date);
    if (!day.length) return 0;
    return Math.round((day.filter((t) => t.done).length / day.length) * 100);
  });
}

/** Count of today's pending tasks (dashboard badge) */
export function useTodayPendingCount(): number {
  return useTaskStore((s) => {
    const td = today();
    return s.tasks.filter((t) => t.date === td && !t.done).length;
  });
}

/** Count of today's completed tasks */
export function useTodayDoneCount(): number {
  return useTaskStore((s) => {
    const td = today();
    return s.tasks.filter((t) => t.date === td && t.done).length;
  });
}

/** Last 7 days: date → task count (for mini heatmap on dashboard) */
export function useWeekTaskCounts(): { date: string; total: number; done: number }[] {
  return useTaskStore(useShallow((s) =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      const date = d.toISOString().slice(0, 10);
      const dayTasks = s.tasks.filter((t) => t.date === date);
      return { date, total: dayTasks.length, done: dayTasks.filter((t) => t.done).length };
    })
  ));
}