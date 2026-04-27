// src/types/roadmap.ts

export type NodeStatus = "pending" | "in-progress" | "achieved";
export type RoadmapNodeType = "mission" | "milestone";

export interface RoadmapNodeData {
  id: string;
  title: string;
  description?: string;
  status: NodeStatus;
  nodeType: RoadmapNodeType;
  iconIndex?: number;
  // Callbacks injected by the page
  onUpdate?: (id: string, patch: Partial<RoadmapNodeData>) => void;
  onDelete?: (id: string) => void;
  onAddChild?: (parentId: string) => void;
  // React Flow needs this
  [key: string]: unknown;
}

export interface PersistedRoadmapNode {
  id: string;
  type: RoadmapNodeType;
  position: { x: number; y: number };
  data: Omit<RoadmapNodeData, "onUpdate" | "onDelete" | "onAddChild">;
}

export interface PersistedRoadmapEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}