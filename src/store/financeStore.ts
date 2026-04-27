// src/store/financeStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Transaction } from "@/types";

interface FinanceStore {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  clearAll: () => void;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (t) =>
        set((s) => ({ transactions: [t, ...s.transactions] })),

      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        })),

      clearAll: () => set({ transactions: [] }),
    }),
    { name: "myday-finance" }
  )
);