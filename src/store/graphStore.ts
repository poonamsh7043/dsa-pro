import { create } from 'zustand';
import { GraphEdge, GraphNode, PresetGraphId } from '../types/graph';
import { AlgorithmStep, AlgorithmType } from '../types/algorithm';
import { getPresetGraph, generateRandomGraph } from '../utils/presets';
import { runAlgorithm } from '../algorithms';
import { stepForceSimulation } from '../utils/forceLayout';

export type EditorMode = 'select' | 'add-edge' | 'delete';

interface GraphState {
  // Graph structure
  nodes: GraphNode[];
  edges: GraphEdge[];
  presetId: PresetGraphId | 'custom';
  is2D: boolean;
  isSimulatingForces: boolean;
  isColorMode: boolean; // default false = strictly monochrome

  // Algorithm & Steps
  selectedAlgorithm: AlgorithmType;
  backtrackingM: number;
  steps: AlgorithmStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.25x to 4x

  // Editor
  editorMode: EditorMode;
  edgeStartNodeId: string | null;
  selectedNodeId: string | null;

  // Modals & Drawers
  showAdjacencyPanel: boolean;
  showComparisonModal: boolean;
  showTheoryModal: boolean;
  cameraResetTrigger: number;
  cameraFocusNodeId: string | null;

  // Actions
  loadPreset: (presetId: PresetGraphId) => void;
  loadRandom: (nodeCount: number, edgeProbability: number) => void;
  addVertex: () => void;
  startAddEdge: (sourceId: string) => void;
  completeAddEdge: (targetId: string) => void;
  cancelAddEdge: () => void;
  deleteVertex: (id: string) => void;
  deleteEdge: (id: string) => void;
  clearGraph: () => void;
  updateNodePosition: (id: string, x: number, y: number, z: number) => void;
  toggle2D: () => void;
  toggleColorMode: () => void;
  toggleForceSimulation: () => void;
  tickForceSimulation: () => void;

  setSelectedAlgorithm: (algo: AlgorithmType) => void;
  setBacktrackingM: (m: number) => void;
  recomputeAlgorithm: () => void;

  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  resetPlayback: () => void;
  seekStep: (stepIndex: number) => void;
  setPlaybackSpeed: (speed: number) => void;

  setEditorMode: (mode: EditorMode) => void;
  setSelectedNodeId: (id: string | null) => void;
  setShowAdjacencyPanel: (show: boolean) => void;
  setShowComparisonModal: (show: boolean) => void;
  setShowTheoryModal: (show: boolean) => void;
  triggerCameraReset: () => void;
  setCameraFocusNodeId: (id: string | null) => void;
}

const initialPreset: PresetGraphId = 'petersen';
const initialGraph = getPresetGraph(initialPreset);
const initialAlgo: AlgorithmType = 'dsatur';
const initialSteps = runAlgorithm(initialAlgo, initialGraph.nodes, initialGraph.edges, { maxColors: 3 });

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  presetId: initialPreset,
  is2D: false,
  isSimulatingForces: false,
  isColorMode: false, // Default is STRICTLY monochrome

  selectedAlgorithm: initialAlgo,
  backtrackingM: 3,
  steps: initialSteps,
  currentStepIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,

  editorMode: 'select',
  edgeStartNodeId: null,
  selectedNodeId: null,

  showAdjacencyPanel: false,
  showComparisonModal: false,
  showTheoryModal: false,
  cameraResetTrigger: 0,
  cameraFocusNodeId: null,

  loadPreset: (presetId) => {
    const graph = getPresetGraph(presetId);
    const { selectedAlgorithm, backtrackingM } = get();
    const newSteps = runAlgorithm(selectedAlgorithm, graph.nodes, graph.edges, { maxColors: backtrackingM });
    set({
      nodes: graph.nodes,
      edges: graph.edges,
      presetId,
      steps: newSteps,
      currentStepIndex: 0,
      isPlaying: false,
      edgeStartNodeId: null,
      selectedNodeId: null,
      cameraResetTrigger: Date.now(),
    });
  },

  loadRandom: (nodeCount, edgeProbability) => {
    const graph = generateRandomGraph(nodeCount, edgeProbability);
    const { selectedAlgorithm, backtrackingM } = get();
    const newSteps = runAlgorithm(selectedAlgorithm, graph.nodes, graph.edges, { maxColors: backtrackingM });
    set({
      nodes: graph.nodes,
      edges: graph.edges,
      presetId: 'custom',
      steps: newSteps,
      currentStepIndex: 0,
      isPlaying: false,
      edgeStartNodeId: null,
      selectedNodeId: null,
      cameraResetTrigger: Date.now(),
    });
  },

  addVertex: () => {
    const { nodes, edges, selectedAlgorithm, backtrackingM } = get();
    const nextId = `${nodes.length > 0 ? Math.max(...nodes.map((n) => parseInt(n.id) || 0)) + 1 : 1}`;
    const newLabel = `V${nextId}`;
    const angle = Math.random() * Math.PI * 2;
    const r = 2.0 + Math.random() * 1.0;
    const newNode: GraphNode = {
      id: nextId,
      label: newLabel,
      position: {
        x: Number((r * Math.cos(angle)).toFixed(2)),
        y: Number((r * Math.sin(angle)).toFixed(2)),
        z: get().is2D ? 0 : Number(((Math.random() - 0.5) * 1.5).toFixed(2)),
      },
    };
    const updatedNodes = [...nodes, newNode];
    const newSteps = runAlgorithm(selectedAlgorithm, updatedNodes, edges, { maxColors: backtrackingM });
    set({
      nodes: updatedNodes,
      presetId: 'custom',
      steps: newSteps,
      currentStepIndex: 0,
      isPlaying: false,
      selectedNodeId: nextId,
    });
  },

  startAddEdge: (sourceId) => {
    set({ edgeStartNodeId: sourceId });
  },

  completeAddEdge: (targetId) => {
    const { edgeStartNodeId, nodes, edges, selectedAlgorithm, backtrackingM } = get();
    if (!edgeStartNodeId || edgeStartNodeId === targetId) {
      set({ edgeStartNodeId: null });
      return;
    }
    // Check if edge already exists
    const exists = edges.some(
      (e) =>
        (e.source === edgeStartNodeId && e.target === targetId) ||
        (e.source === targetId && e.target === edgeStartNodeId)
    );
    if (exists) {
      set({ edgeStartNodeId: null });
      return;
    }
    const newEdge: GraphEdge = {
      id: `e${edgeStartNodeId}-${targetId}`,
      source: edgeStartNodeId,
      target: targetId,
    };
    const updatedEdges = [...edges, newEdge];
    const newSteps = runAlgorithm(selectedAlgorithm, nodes, updatedEdges, { maxColors: backtrackingM });
    set({
      edges: updatedEdges,
      presetId: 'custom',
      edgeStartNodeId: null,
      steps: newSteps,
      currentStepIndex: 0,
      isPlaying: false,
    });
  },

  cancelAddEdge: () => {
    set({ edgeStartNodeId: null });
  },

  deleteVertex: (id) => {
    const { nodes, edges, selectedAlgorithm, backtrackingM, selectedNodeId } = get();
    const updatedNodes = nodes.filter((n) => n.id !== id);
    const updatedEdges = edges.filter((e) => e.source !== id && e.target !== id);
    const newSteps = runAlgorithm(selectedAlgorithm, updatedNodes, updatedEdges, { maxColors: backtrackingM });
    set({
      nodes: updatedNodes,
      edges: updatedEdges,
      presetId: 'custom',
      steps: newSteps,
      currentStepIndex: 0,
      isPlaying: false,
      selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
      edgeStartNodeId: null,
    });
  },

  deleteEdge: (id) => {
    const { nodes, edges, selectedAlgorithm, backtrackingM } = get();
    const updatedEdges = edges.filter((e) => e.id !== id);
    const newSteps = runAlgorithm(selectedAlgorithm, nodes, updatedEdges, { maxColors: backtrackingM });
    set({
      edges: updatedEdges,
      presetId: 'custom',
      steps: newSteps,
      currentStepIndex: 0,
      isPlaying: false,
    });
  },

  clearGraph: () => {
    const { selectedAlgorithm, backtrackingM } = get();
    const newSteps = runAlgorithm(selectedAlgorithm, [], [], { maxColors: backtrackingM });
    set({
      nodes: [],
      edges: [],
      presetId: 'custom',
      steps: newSteps,
      currentStepIndex: 0,
      isPlaying: false,
      selectedNodeId: null,
      edgeStartNodeId: null,
    });
  },

  updateNodePosition: (id, x, y, z) => {
    const { nodes, is2D } = get();
    const updated = nodes.map((n) =>
      n.id === id
        ? {
            ...n,
            position: {
              x: Number(x.toFixed(3)),
              y: Number(y.toFixed(3)),
              z: is2D ? 0 : Number(z.toFixed(3)),
            },
          }
        : n
    );
    set({ nodes: updated });
  },

  toggle2D: () => {
    const is2D = !get().is2D;
    const updatedNodes = get().nodes.map((n) => ({
      ...n,
      position: {
        x: n.position.x,
        y: n.position.y,
        z: is2D ? 0 : (Math.random() - 0.5) * 1.5,
      },
    }));
    set({ is2D, nodes: updatedNodes, cameraResetTrigger: Date.now() });
  },

  toggleColorMode: () => {
    set((state) => ({ isColorMode: !state.isColorMode }));
  },

  toggleForceSimulation: () => {
    set((state) => ({ isSimulatingForces: !state.isSimulatingForces }));
  },

  tickForceSimulation: () => {
    const { nodes, edges, is2D, isSimulatingForces } = get();
    if (!isSimulatingForces) return;
    const simulated = stepForceSimulation(nodes, edges, { is2D });
    set({ nodes: simulated });
  },

  setSelectedAlgorithm: (algo) => {
    const { nodes, edges, backtrackingM } = get();
    const newSteps = runAlgorithm(algo, nodes, edges, { maxColors: backtrackingM });
    set({
      selectedAlgorithm: algo,
      steps: newSteps,
      currentStepIndex: 0,
      isPlaying: false,
    });
  },

  setBacktrackingM: (m) => {
    const { nodes, edges, selectedAlgorithm } = get();
    const safeM = Math.max(2, Math.min(m, 8));
    const newSteps = runAlgorithm(selectedAlgorithm, nodes, edges, { maxColors: safeM });
    set({
      backtrackingM: safeM,
      steps: newSteps,
      currentStepIndex: 0,
      isPlaying: false,
    });
  },

  recomputeAlgorithm: () => {
    const { selectedAlgorithm, nodes, edges, backtrackingM } = get();
    const newSteps = runAlgorithm(selectedAlgorithm, nodes, edges, { maxColors: backtrackingM });
    set({
      steps: newSteps,
      currentStepIndex: 0,
      isPlaying: false,
    });
  },

  play: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex >= steps.length - 1) {
      set({ currentStepIndex: 0, isPlaying: true });
    } else {
      set({ isPlaying: true });
    }
  },

  pause: () => {
    set({ isPlaying: false });
  },

  stepForward: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  stepBackward: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1, isPlaying: false });
    }
  },

  resetPlayback: () => {
    set({ currentStepIndex: 0, isPlaying: false });
  },

  seekStep: (stepIndex) => {
    const { steps } = get();
    const bounded = Math.max(0, Math.min(stepIndex, steps.length - 1));
    set({ currentStepIndex: bounded, isPlaying: false });
  },

  setPlaybackSpeed: (speed) => {
    set({ playbackSpeed: Math.max(0.25, Math.min(speed, 4)) });
  },

  setEditorMode: (mode) => {
    set({ editorMode: mode, edgeStartNodeId: null });
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id });
  },

  setShowAdjacencyPanel: (show) => {
    set({ showAdjacencyPanel: show });
  },

  setShowComparisonModal: (show) => {
    set({ showComparisonModal: show });
  },

  setShowTheoryModal: (show) => {
    set({ showTheoryModal: show });
  },

  triggerCameraReset: () => {
    set({ cameraResetTrigger: Date.now(), cameraFocusNodeId: null });
  },

  setCameraFocusNodeId: (id) => {
    set({ cameraFocusNodeId: id });
  },
}));
