import { GraphEdge, GraphNode } from '../types/graph';
import { getColorDef } from '../utils/colors';

export interface GraphAdjacency {
  adjacencyList: Record<string, string[]>;
  degreeMap: Record<string, number>;
  nodesMap: Record<string, GraphNode>;
}

export function buildAdjacency(nodes: GraphNode[], edges: GraphEdge[]): GraphAdjacency {
  const adjacencyList: Record<string, string[]> = {};
  const degreeMap: Record<string, number> = {};
  const nodesMap: Record<string, GraphNode> = {};

  nodes.forEach((n) => {
    adjacencyList[n.id] = [];
    degreeMap[n.id] = 0;
    nodesMap[n.id] = n;
  });

  edges.forEach((e) => {
    if (adjacencyList[e.source] && adjacencyList[e.target]) {
      if (!adjacencyList[e.source].includes(e.target)) {
        adjacencyList[e.source].push(e.target);
      }
      if (!adjacencyList[e.target].includes(e.source)) {
        adjacencyList[e.target].push(e.source);
      }
    }
  });

  nodes.forEach((n) => {
    degreeMap[n.id] = adjacencyList[n.id].length;
  });

  return { adjacencyList, degreeMap, nodesMap };
}

export function getForbiddenColors(
  nodeId: string,
  adjacencyList: Record<string, string[]>,
  colors: Record<string, number | null>
): number[] {
  const neighbors = adjacencyList[nodeId] || [];
  const forbidden = new Set<number>();
  neighbors.forEach((nbrId) => {
    const col = colors[nbrId];
    if (col !== null && col !== undefined && col > 0) {
      forbidden.add(col);
    }
  });
  return Array.from(forbidden).sort((a, b) => a - b);
}

export function findSmallestAvailableColor(forbidden: number[], maxColorLimit?: number): number | null {
  let color = 1;
  while (forbidden.includes(color)) {
    color++;
    if (maxColorLimit && color > maxColorLimit) {
      return null;
    }
  }
  return color;
}

export function formatColorList(colors: number[]): string {
  if (colors.length === 0) return 'none';
  return colors
    .map((c) => {
      const def = getColorDef(c);
      return `${def?.label || `C${c}`} (${def?.symbol || ''})`;
    })
    .join(', ');
}

export function formatNodeLabel(nodeId: string, nodesMap: Record<string, GraphNode>): string {
  const node = nodesMap[nodeId];
  return node ? `${node.label} (ID: ${nodeId})` : `Vertex ${nodeId}`;
}

export interface ValidationResult {
  isValid: boolean;
  isComplete: boolean;
  conflicts: { source: string; target: string; color: number }[];
  colorsUsed: number;
  distinctColors: number[];
}

export function validateColoring(
  nodes: GraphNode[],
  edges: GraphEdge[],
  colors: Record<string, number | null>
): ValidationResult {
  const conflicts: { source: string; target: string; color: number }[] = [];
  const used = new Set<number>();

  nodes.forEach((n) => {
    const c = colors[n.id];
    if (c !== null && c !== undefined && c > 0) {
      used.add(c);
    }
  });

  edges.forEach((e) => {
    const c1 = colors[e.source];
    const c2 = colors[e.target];
    if (c1 && c2 && c1 === c2) {
      conflicts.push({ source: e.source, target: e.target, color: c1 });
    }
  });

  const isComplete = nodes.every((n) => colors[n.id] !== null && colors[n.id] !== undefined && (colors[n.id] as number) > 0);
  const isValid = conflicts.length === 0;

  return {
    isValid,
    isComplete,
    conflicts,
    colorsUsed: used.size,
    distinctColors: Array.from(used).sort((a, b) => a - b),
  };
}
