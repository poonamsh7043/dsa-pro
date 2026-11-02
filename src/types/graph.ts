export interface NodePosition {
  x: number;
  y: number;
  z: number;
}

export interface GraphNode {
  id: string;
  label: string;
  position: NodePosition;
  targetPosition?: NodePosition;
  velocity?: NodePosition;
  colorIndex?: number | null; // null if uncolored, 1..k
  isFixed?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string; // node id
  target: string; // node id
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type PresetGraphId =
  | 'triangle'
  | 'cycle5'
  | 'bipartite'
  | 'petersen'
  | 'complete5'
  | 'wheel6'
  | 'planar'
  | 'grid';

export interface PresetInfo {
  id: PresetGraphId;
  name: string;
  description: string;
  chromaticNumber: number;
  nodesCount: number;
  edgesCount: number;
  tags: string[];
}
