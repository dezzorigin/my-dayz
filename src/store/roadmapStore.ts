// src/store/roadmapStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistedRoadmapNode, PersistedRoadmapEdge, RoadmapNodeData, NodeStatus } from "@/types/roadmap";

const genId = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_NODES: PersistedRoadmapNode[] = [];

const DEFAULT_EDGES: PersistedRoadmapEdge[] = [];

interface RoadmapStore {
  nodes: PersistedRoadmapNode[];
  edges: PersistedRoadmapEdge[];

  addNode: (node: PersistedRoadmapNode) => void;
  updateNode: (id: string, patch: Partial<RoadmapNodeData>) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;

  addEdge: (edge: PersistedRoadmapEdge) => void;
  deleteEdge: (id: string) => void;

  reset: () => void;
}

export const useRoadmapStore = create<RoadmapStore>()(
  persist(
    (set) => ({
      nodes: DEFAULT_NODES,
      edges: DEFAULT_EDGES,

      addNode: (node) =>
        set((s) => ({ nodes: [...s.nodes, node] })),

      updateNode: (id, patch) =>
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
          ),
        })),

      updateNodePosition: (id, position) =>
        set((s) => ({
          nodes: s.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
        })),

      deleteNode: (id) =>
        set((s) => ({
          nodes: s.nodes.filter((n) => n.id !== id),
          edges: s.edges.filter((e) => e.source !== id && e.target !== id),
        })),

      addEdge: (edge) =>
        set((s) => {
          const exists = s.edges.some(
            (e) => e.source === edge.source && e.target === edge.target
          );
          if (exists) return s;
          return { edges: [...s.edges, edge] };
        }),

      deleteEdge: (id) =>
        set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),

      reset: () => set({ nodes: DEFAULT_NODES, edges: DEFAULT_EDGES }),
    }),
    { name: "myday-roadmap" }
  )
);