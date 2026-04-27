import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { LS_KEYS } from '@/lib/constants';
import type { DiaryEntry, MoodValue } from '@/types';

const genId = (): string => Math.random().toString(36).slice(2, 11);
const now = (): string => new Date().toISOString();

interface DiaryState {
  entries: DiaryEntry[];

  addEntry: (payload: {
    date: string;
    content: string;
    mood?: MoodValue;
    tags?: string[];
  }) => DiaryEntry;

  updateEntry: (
    id: string,
    patch: Partial<Pick<DiaryEntry, 'content' | 'mood' | 'tags'>>
  ) => void;

  deleteEntry: (id: string) => void;
  getByDate: (date: string) => DiaryEntry | undefined;
  reset: () => void;
}

const initial = { entries: [] as DiaryEntry[] };

export const useDiaryStore = create<DiaryState>()(
  persist(
    immer((set, get) => ({
      ...initial,

      addEntry: (payload) => {
        const ts = now();
        const entry: DiaryEntry = {
          id: genId(),
          date: payload.date,
          content: payload.content.trim(),
          mood: payload.mood,
          tags: payload.tags ?? [],
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => {
          s.entries = s.entries.filter((e) => e.date !== payload.date);
          s.entries.unshift(entry);
        });
        return entry;
      },

      updateEntry: (id, patch) =>
        set((s) => {
          const e = s.entries.find((x) => x.id === id);
          if (e) {
            Object.assign(e, patch);
            e.updatedAt = now();
          }
        }),

      deleteEntry: (id) =>
        set((s) => {
          s.entries = s.entries.filter((e) => e.id !== id);
        }),

      getByDate: (date) => get().entries.find((e) => e.date === date),

      reset: () => set(() => ({ ...initial })),
    })),
    {
      name: LS_KEYS.DIARY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ entries: s.entries }),
    }
  )
);
