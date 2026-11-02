export type AlgorithmType =
  | 'greedy'
  | 'welsh-powell'
  | 'dsatur'
  | 'backtracking'
  | 'bipartite-check';

export type StepAction =
  | 'inspect'       // Inspecting a node or evaluating its neighbors
  | 'color'         // Assigning a color to the node
  | 'conflict'      // Detected conflict or no valid color available
  | 'backtrack'     // Undoing assignment and returning to previous node
  | 'sort'          // Welsh-Powell sorting or DSatur reordering
  | 'done';         // Algorithm successfully completed or terminated

export interface NodeEvaluation {
  nodeId: string;
  degree?: number;
  saturationDegree?: number;
  uncoloredDegree?: number;
  status?: 'processed' | 'current' | 'waiting';
}

export interface StepSnapshot {
  colors: Record<string, number | null>; // node id -> color class (1-based, null = uncolored)
  activeNodeId: string | null;
  activeNeighbors: string[];
  conflictingNodes: string[];
  forbiddenColors: number[]; // colors taken by neighbors of activeNodeId
  candidateColor?: number | null;
  orderedNodes?: NodeEvaluation[]; // queue state (for Welsh-Powell / DSatur)
  backtrackStack?: string[]; // Call stack for backtracking
  validSoFar: boolean;
  totalColorsUsed: number;
}

export interface AlgorithmStep {
  index: number;
  algorithm: AlgorithmType;
  action: StepAction;
  activeNodeId: string | null;
  color: number | null; // color assigned in this step, if any
  forbiddenColors: number[];
  pseudocodeLine: number; // 1-based line number in pseudocode
  title: string;
  explanation: string;
  snapshot: StepSnapshot;
}

export interface AlgorithmMeta {
  id: AlgorithmType;
  name: string;
  shortName: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  guarantee: string;
  pseudocode: { line: number; text: string; indent: number }[];
}

export interface ColorDef {
  index: number;
  label: string; // e.g. "C1", "C2"
  symbol: string; // "●", "■", "▲", "◆", "★", "⬢"
  name: string;
  monoFill: string;
  monoBorder: string;
  monoText: string;
  colorFill: string;
  colorBorder: string;
  colorText: string;
}
