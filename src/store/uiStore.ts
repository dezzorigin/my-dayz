import { create } from 'zustand';

/** UI shell: mobile drawer / nav panel memakai state yang sama dengan “sidebar” mobile */
interface UiState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));

/** Alias untuk drawer mobile (API lama: isOpen / open / close / toggle) */
export function useMobileDrawer() {
  const isOpen = useUiStore((s) => s.isSidebarOpen);
  const open = useUiStore((s) => s.openSidebar);
  const close = useUiStore((s) => s.closeSidebar);
  const toggle = useUiStore((s) => s.toggleSidebar);
  return { isOpen, open, close, toggle };
}

// ─── Command Palette (future) ────────────────────────────────────────────────

interface CommandPaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCommandPalette = create<CommandPaletteState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
