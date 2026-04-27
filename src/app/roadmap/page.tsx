"use client";

import {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type NodeMouseHandler,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Target,
  Milestone,
  Trash2,
  RotateCcw,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  X,
  MousePointer2,
  MoveHorizontal,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoadmapStore } from "@/store/roadmapStore";
import { RoadmapNode, MissionNode, STATUS_CONFIG } from "@/components/roadmap/RoadmapNode";
import type {
  RoadmapNodeData,
  NodeStatus,
  PersistedRoadmapNode,
} from "@/types/roadmap";

// ─── Node type registry ───────────────────────────────────────────────────────

const nodeTypes: NodeTypes = {
  milestone: RoadmapNode as unknown as NodeTypes["milestone"],
  mission: MissionNode as unknown as NodeTypes["mission"],
};

// ─── Edge style ───────────────────────────────────────────────────────────────

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed, color: "#d1d5db", width: 14, height: 14 },
  style: { stroke: "#d1d5db", strokeWidth: 1.5 },
};

const genId = () => Math.random().toString(36).slice(2, 9);

// ─── Helper: build RF node from persisted ────────────────────────────────────

function buildRFNode(
  persisted: PersistedRoadmapNode,
  callbacks: {
    onUpdate: (id: string, patch: Partial<RoadmapNodeData>) => void;
    onDelete: (id: string) => void;
    onAddChild: (parentId: string) => void;
  }
): Node<RoadmapNodeData> {
  return {
    id: persisted.id,
    type: persisted.type,
    position: persisted.position,
    data: {
      ...persisted.data,
      onUpdate: callbacks.onUpdate,
      onDelete: callbacks.onDelete,
      onAddChild: callbacks.onAddChild,
    } as RoadmapNodeData,
  };
}

// ─── Status legend pill ───────────────────────────────────────────────────────

function StatusLegend() {
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl border border-neutral-200/60 px-3 py-2 shadow-sm">
      {(Object.entries(STATUS_CONFIG) as [NodeStatus, typeof STATUS_CONFIG[NodeStatus]][]).map(
        ([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className={cn("flex items-center gap-1.5 font-mono text-[10px]", cfg.color)}>
              <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
              <Icon size={10} />
              {cfg.label}
            </div>
          );
        }
      )}
    </div>
  );
}

// ─── Hint tooltip ─────────────────────────────────────────────────────────────

function HintPanel({ show, onClose }: { show: boolean; onClose: () => void }) {
  const hints = [
    { icon: <MousePointer2 size={12} />, text: "Double-click canvas → node baru" },
    { icon: <MoveHorizontal size={12} />, text: "Drag node untuk memindah" },
    { icon: <GitBranch size={12} />, text: "Drag dari titik handle → edge" },
    { icon: <Target size={12} />, text: "Klik status badge → cycle status" },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl border border-neutral-200/80 shadow-xl shadow-neutral-200/50 p-4 w-64"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">
              Cara Pakai
            </p>
            <button
              onClick={onClose}
              className="w-5 h-5 rounded-md flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors"
            >
              <X size={11} />
            </button>
          </div>
          <ul className="space-y-2">
            {hints.map((h, i) => (
              <li key={i} className="flex items-center gap-2.5 text-neutral-600">
                <div className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-400">
                  {h.icon}
                </div>
                <span className="text-[11.5px] font-sans">{h.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Node count badge ─────────────────────────────────────────────────────────

function NodeCountBadge({ nodes }: { nodes: Node[] }) {
  const achieved = nodes.filter((n) => (n.data as RoadmapNodeData).status === "achieved").length;
  const total = nodes.length;
  const pct = total > 0 ? Math.round((achieved / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl border border-neutral-200/60 px-3 py-2 shadow-sm">
      <div className="text-center">
        <p className="font-serif text-lg text-neutral-900 leading-none">{total}</p>
        <p className="font-mono text-[8px] text-neutral-400 uppercase tracking-wider mt-0.5">Nodes</p>
      </div>
      <div className="w-px h-6 bg-neutral-100" />
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="font-mono text-[9px] text-neutral-400">Progress</p>
          <p className="font-mono text-[9px] text-emerald-500 font-medium">{pct}%</p>
        </div>
        <div className="w-24 h-1 rounded-full bg-neutral-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NeuralRoadmapPage() {
  const store = useRoadmapStore();

  const [showHint, setShowHint] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReturnType<typeof useNodesState>[0] | null>(null);

  // ── Callbacks (stable refs) ──────────────────────────────────────────────

  const handleUpdate = useCallback(
    (id: string, patch: Partial<RoadmapNodeData>) => {
      store.updateNode(id, patch);
    },
    [store]
  );

  const handleDelete = useCallback(
    (id: string) => {
      store.deleteNode(id);
      showToast("Node dihapus.");
    },
    [store]
  );

  const handleAddChild = useCallback(
    (parentId: string) => {
      const parent = store.nodes.find((n) => n.id === parentId);
      if (!parent) return;
      const newId = `node-${genId()}`;
      const newNode: PersistedRoadmapNode = {
        id: newId,
        type: "milestone",
        position: {
          x: parent.position.x + 280,
          y: parent.position.y + (Math.random() * 140 - 70),
        },
        data: {
          id: newId,
          title: "Milestone Baru",
          description: "",
          status: "pending",
          nodeType: "milestone",
          iconIndex: Math.floor(Math.random() * 6),
        },
      };
      store.addNode(newNode);
      store.addEdge({
        id: `e-${parentId}-${newId}`,
        source: parentId,
        target: newId,
      });
      showToast("Milestone ditambahkan!");
    },
    [store]
  );

  const callbacks = useMemo(
    () => ({ onUpdate: handleUpdate, onDelete: handleDelete, onAddChild: handleAddChild }),
    [handleUpdate, handleDelete, handleAddChild]
  );

  // ── Build RF nodes / edges from store ───────────────────────────────────

  const initialNodes = useMemo(
    () => store.nodes.map((n) => buildRFNode(n, callbacks)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // intentionally only on mount
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      store.edges.map((e) => ({
        ...e,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#d1d5db", width: 14, height: 14 },
        style: { stroke: "#d1d5db", strokeWidth: 1.5 },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ── Sync store → RF when store changes externally ───────────────────────

  useEffect(() => {
    setNodes((prev) =>
      store.nodes.map((sn) => {
        const existing = prev.find((n) => n.id === sn.id);
        return buildRFNode(
          { ...sn, position: existing?.position ?? sn.position },
          callbacks
        );
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.nodes]);

  // ── Persist positions on drag end ───────────────────────────────────────

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      store.updateNodePosition(node.id, node.position);
    },
    [store]
  );

  // ── Connect edges ────────────────────────────────────────────────────────

  const onConnect: OnConnect = useCallback(
    (params) => {
      const newEdge: Edge = {
        ...params,
        id: `e-${params.source}-${params.target}`,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#d1d5db" },
        style: { stroke: "#d1d5db", strokeWidth: 1.5 },
      } as unknown as Edge;  // Cast safely around 'type' conflicts if any
      setEdges((eds) => addEdge(newEdge, eds));
      store.addEdge({
        id: newEdge.id,
        source: params.source!,
        target: params.target!,
      });
    },
    [setEdges, store]
  );

  // ── Double-click on canvas → new node ───────────────────────────────────

  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!reactFlowWrapper.current) return;
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      // Use rfInstance to convert screen → flow coords
      const rfEl = document.querySelector(".react-flow__pane") as HTMLElement | null;
      if (!rfEl) return;

      const newId = `node-${genId()}`;
      // Approximate position (React Flow handles exact via useReactFlow in v12)
      const x = event.clientX - bounds.left - 110;
      const y = event.clientY - bounds.top - 60;

      const newPersistedNode: PersistedRoadmapNode = {
        id: newId,
        type: "milestone",
        position: { x, y },
        data: {
          id: newId,
          title: "Node Baru",
          description: "",
          status: "pending",
          nodeType: "milestone",
          iconIndex: Math.floor(Math.random() * 6),
        },
      };
      store.addNode(newPersistedNode);
      showToast("Node baru ditambahkan! Double-click handle untuk connect.");
    },
    [store]
  );

  // ── Add mission node ─────────────────────────────────────────────────────

  const addMissionNode = useCallback(() => {
    const newId = `mission-${genId()}`;
    const center = { x: 200 + Math.random() * 300, y: 150 + Math.random() * 200 };
    const newNode: PersistedRoadmapNode = {
      id: newId,
      type: "mission",
      position: center,
      data: {
        id: newId,
        title: "Misi Baru",
        description: "Deskripsikan misimu di sini.",
        status: "pending",
        nodeType: "mission",
        iconIndex: 0,
      },
    };
    store.addNode(newNode);
    showToast("Misi baru ditambahkan!");
  }, [store]);

  const addMilestoneNode = useCallback(() => {
    const newId = `node-${genId()}`;
    const center = { x: 300 + Math.random() * 300, y: 200 + Math.random() * 200 };
    const newNode: PersistedRoadmapNode = {
      id: newId,
      type: "milestone",
      position: center,
      data: {
        id: newId,
        title: "Milestone Baru",
        description: "",
        status: "pending",
        nodeType: "milestone",
        iconIndex: Math.floor(Math.random() * 6),
      },
    };
    store.addNode(newNode);
    showToast("Milestone ditambahkan!");
  }, [store]);

  // ── Edge delete on click ─────────────────────────────────────────────────

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (window.confirm("Hapus koneksi ini?")) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        store.deleteEdge(edge.id);
      }
    },
    [setEdges, store]
  );

  // ── Toast helper ─────────────────────────────────────────────────────────

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-[calc(100vh-80px)] lg:h-screen flex-1 flex flex-col" ref={reactFlowWrapper}>
      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-[12px] font-mono tracking-wide px-4 py-2 rounded-xl shadow-lg shadow-neutral-900/20 pointer-events-none"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── React Flow Canvas ── */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneDoubleClick as (e: React.MouseEvent) => void}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2.5}
        deleteKeyCode="Delete"
        className="bg-neutral-50"
        proOptions={{ hideAttribution: true }}
      >
        {/* Dot grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#e5e7eb"
        />

        {/* Controls */}
        <Controls
          showInteractive={false}
          className="!bg-white/90 !backdrop-blur-sm !border-neutral-200/60 !rounded-xl !shadow-sm !overflow-hidden"
        />

        {/* Minimap */}
        <MiniMap
          className="!rounded-xl !border-neutral-200/60 !shadow-sm"
          nodeColor={(n) => {
            const status = (n.data as RoadmapNodeData).status;
            if (status === "achieved") return "#34d399";
            if (status === "in-progress") return "#60a5fa";
            return "#e5e7eb";
          }}
          maskColor="rgba(250,250,249,0.85)"
          pannable
          zoomable
        />

        {/* ── TOP LEFT: Logo + title ── */}
        <Panel position="top-left">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-neutral-200/60 shadow-sm px-4 py-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm shadow-amber-200">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <p className="font-serif text-[15px] tracking-tight text-neutral-900 leading-none">
                Neural Roadmap
              </p>
              <p className="font-mono text-[9px] text-neutral-400 tracking-widest uppercase mt-0.5">
                Infinite Canvas · MyDay
              </p>
            </div>
          </motion.div>
        </Panel>

        {/* ── TOP CENTER: Node count + progress ── */}
        <Panel position="top-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <NodeCountBadge nodes={nodes} />
          </motion.div>
        </Panel>

        {/* ── TOP RIGHT: Actions toolbar ── */}
        <Panel position="top-right">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-end gap-2"
          >
            {/* Add buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={addMissionNode}
                className="flex items-center gap-2 bg-neutral-900 text-white text-[12px] font-mono px-3.5 py-2 rounded-xl shadow-sm hover:bg-neutral-800 transition-colors"
              >
                <Target size={13} />
                + Misi
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={addMilestoneNode}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-neutral-700 text-[12px] font-mono border border-neutral-200 px-3.5 py-2 rounded-xl shadow-sm hover:bg-white transition-colors"
              >
                <Plus size={13} />
                Milestone
              </motion.button>
            </div>

            {/* Utility buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowHint((v) => !v)}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/90 backdrop-blur-sm border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:bg-white shadow-sm transition-colors"
                title="Cara Pakai"
              >
                <Info size={14} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Reset canvas ke default?")) {
                    store.reset();
                    showToast("Canvas direset.");
                  }
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/90 backdrop-blur-sm border border-neutral-200 text-neutral-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 shadow-sm transition-colors"
                title="Reset Canvas"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Hint panel */}
            <HintPanel show={showHint} onClose={() => setShowHint(false)} />
          </motion.div>
        </Panel>

        {/* ── BOTTOM LEFT: Legend ── */}
        <Panel position="bottom-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatusLegend />
          </motion.div>
        </Panel>

        {/* ── BOTTOM CENTER: Hint bar ── */}
        <Panel position="bottom-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-neutral-200/50 px-3 py-1.5"
          >
            <p className="font-mono text-[9.5px] text-neutral-400 tracking-wide">
              Double-click canvas untuk node baru &nbsp;·&nbsp; Del untuk hapus &nbsp;·&nbsp; Scroll untuk zoom
            </p>
          </motion.div>
        </Panel>
      </ReactFlow>

      {/* Custom edge styles override */}
      <style jsx global>{`
        .react-flow__edge-path {
          stroke: #d1d5db;
          stroke-width: 1.5;
          transition: stroke 0.15s;
        }
        .react-flow__edge:hover .react-flow__edge-path {
          stroke: #60a5fa;
          stroke-width: 2;
          cursor: pointer;
        }
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: #60a5fa;
          stroke-width: 2;
        }
        .react-flow__handle {
          transition: all 0.15s;
          opacity: 0;
        }
        .react-flow__node:hover .react-flow__handle,
        .react-flow__node.selected .react-flow__handle {
          opacity: 1;
        }
        .react-flow__controls-button {
          border-bottom: 1px solid #f3f4f6 !important;
          background: transparent !important;
          color: #9ca3af !important;
        }
        .react-flow__controls-button:hover {
          background: #f9fafb !important;
          color: #374151 !important;
        }
        .react-flow__minimap {
          border-radius: 12px;
          overflow: hidden;
        }
        .react-flow__panel {
          margin: 16px;
        }
      `}</style>
    </div>
  );
}