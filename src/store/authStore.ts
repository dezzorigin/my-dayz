// ─────────────────────────────────────────────────────────────────────────────
// src/store/authStore.ts
// Zustand Store — Authentication state (localStorage-backed dummy auth)
// Ready for future Supabase Auth integration
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;

  login: (email: string, name?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userName: '',
      userEmail: '',

      login: (email, name) =>
        set({
          isLoggedIn: true,
          userEmail: email,
          userName: name || email.split('@')[0],
        }),

      logout: () =>
        set({
          isLoggedIn: false,
          userName: '',
          userEmail: '',
        }),
    }),
    {
      name: 'mydayz_auth_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
