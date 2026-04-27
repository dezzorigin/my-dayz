import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { LS_KEYS } from '@/lib/constants';
import type { MoodEntry, MoodValue } from '@/types';

const genId = (): string => Math.random().toString(36).slice(2, 11);
const now = (): string => new Date().toISOString();
const today = (): string => new Date().toISOString().slice(0, 10);

interface MoodState {
  entries: MoodEntry[];

  setMood: (payload: { date?: string; v: MoodValue; note?: string }) => MoodEntry;
  updateEntry: (id: string, patch: Partial<Pick<MoodEntry, 'v' | 'note'>>) => void;
  deleteEntry: (id: string) => void;
  getByDate: (date: string) => MoodEntry | undefined;
  reset: () => void;
}

const initial = { entries: [] as MoodEntry[] };

export const useMoodStore = create<MoodState>()(
  persist(
    immer((set, get) => ({
      ...initial,

      setMood: ({ date = today(), v, note = '' }) => {
        const existing = get().entries.find((e) => e.date === date);
        if (existing) {
          set((s) => {
            const e = s.entries.find((x) => x.id === existing.id);
            if (e) {
              e.v = v;
              e.note = note;
            }
          });
          return get().entries.find((e) => e.date === date) as MoodEntry;
        }
        const entry: MoodEntry = {
          id: genId(),
          date,
          v,
          note,
          createdAt: now(),
        };
        set((s) => {
          s.entries.unshift(entry);
        });
        return entry;
      },

      updateEntry: (id, patch) =>
        set((s) => {
          const e = s.entries.find((x) => x.id === id);
          if (e) Object.assign(e, patch);
        }),

      deleteEntry: (id) =>
        set((s) => {
          s.entries = s.entries.filter((e) => e.id !== id);
        }),

      getByDate: (date) => get().entries.find((e) => e.date === date),

      reset: () => set(() => ({ ...initial })),
    })),
    {
      name: LS_KEYS.MOODS,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ entries: s.entries }),
    }
  )
);

export function useTodayMood(): MoodEntry | undefined {
  const td = today();
  return useMoodStore((s) => s.entries.find((e) => e.date === td));
}
