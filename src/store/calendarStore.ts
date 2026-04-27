import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type EventType = 'event' | 'deadline' | 'exam' | 'custom';

export interface CustomEvent {
  id: string;
  date: string;
  title: string;
  type: EventType;
  color: string;
  mode: 'personal' | 'akademik' | 'financial' | 'salat';
}

export interface CalendarState {
  events: CustomEvent[];
  addEvent: (event: Omit<CustomEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: crypto.randomUUID() }],
        })),
      removeEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
    }),
    {
      name: 'myday_calendar_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
