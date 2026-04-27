import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SettingsState {
  features: {
    habits: boolean;
    finance: boolean;
    cycleTracker: boolean;
  };
  toggleFeature: (feature: keyof SettingsState['features']) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      features: {
        habits: true,
        finance: true,
        cycleTracker: false,
      },
      toggleFeature: (feature) =>
        set((state) => ({
          features: {
            ...state.features,
            [feature]: !state.features[feature],
          },
        })),
    }),
    {
      name: 'myday_settings_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
