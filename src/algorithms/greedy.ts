import { GraphEdge, GraphNode } from '../types/graph';
import { AlgorithmStep } from '../types/algorithm';
import {
  buildAdjacency,
  findSmallestAvailableColor,
  formatColorList,
  formatNodeLabel,
  getForbiddenColors,
} from './common';
import { getColorDef } from '../utils/colors';

export const GREEDY_PSEUDOCODE = [
  { line: 1, text: 'procedure GreedyColoring(G = (V, E)):', indent: 0 },
  { line: 2, text: '  for each vertex v in V (in input order):', indent: 1 },
  { line: 3, text: '    forbidden ← { color[u] | u ∈ neighbors(v) and color[u] ≠ null }', indent: 2 },
  { line: 4, text: '    c ← smallest integer ≥ 1 not in forbidden', indent: 2 },
  { line: 5, text: '    color[v] ← c', indent: 2 },
  { line: 6, text: '  return color', indent: 1 },
];

export function runGreedyColoring(nodes: GraphNode[], edges: GraphEdge[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const { adjacencyList, nodesMap, degreeMap } = buildAdjacency(nodes, edges);

  const colors: Record<string, number | null> = {};
  nodes.forEach((n) => {
    colors[n.id] = null;
  });

  let stepCount = 0;
  const orderedNodes = nodes.map((n) => ({
    nodeId: n.id,
    degree: degreeMap[n.id] || 0,
    status: 'waiting' as const,
  }));

  // Initial step
  steps.push({
    index: stepCount++,
    algorithm: 'greedy',
    action: 'inspect',
    activeNodeId: null,
    color: null,
    forbiddenColors: [],
    pseudocodeLine: 1,
    title: 'Initialize Greedy Coloring',
    explanation: `Starting Greedy coloring on ${nodes.length} vertices in standard order. Colors will be assigned sequentially using the smallest available integer.`,
    snapshot: {
      colors: { ...colors },
      activeNodeId: null,
      activeNeighbors: [],
      conflictingNodes: [],
      forbiddenColors: [],
      orderedNodes: orderedNodes.map((item) => ({ ...item })),
      validSoFar: true,
      totalColorsUsed: 0,
    },
  });

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const neighbors = adjacencyList[node.id] || [];

    // Step 1: Inspect vertex and neighbors
    const forbidden = getForbiddenColors(node.id, adjacencyList, colors);
    const coloredNeighbors = neighbors.filter((nbr) => colors[nbr] !== null && colors[nbr]! > 0);

    const queueSnapshot = orderedNodes.map((item, idx) => ({
      ...item,
      status: (idx < i ? 'processed' : idx === i ? 'current' : 'waiting') as 'processed' | 'current' | 'waiting',
    }));

    steps.push({
      index: stepCount++,
      algorithm: 'greedy',
      action: 'inspect',
      activeNodeId: node.id,
      color: null,
      forbiddenColors: forbidden,
      pseudocodeLine: 3,
      title: `Inspect ${node.label} (Vertex ${i + 1}/${nodes.length})`,
      explanation:
        coloredNeighbors.length > 0
          ? `${formatNodeLabel(node.id, nodesMap)} has colored neighbors {${coloredNeighbors
              .map((nId) => `${nodesMap[nId]?.label || nId} (${getColorDef(colors[nId])?.label})`)
              .join(', ')}}. Forbidden colors: [${formatColorList(forbidden)}].`
          : `${formatNodeLabel(node.id, nodesMap)} has no colored neighbors yet. All color classes are available.`,
      snapshot: {
        colors: { ...colors },
        activeNodeId: node.id,
        activeNeighbors: neighbors,
        conflictingNodes: [],
        forbiddenColors: [...forbidden],
        orderedNodes: queueSnapshot,
        validSoFar: true,
        totalColorsUsed: new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size,
      },
    });

    // Step 2: Assign lowest available color
    const chosenColor = findSmallestAvailableColor(forbidden)!;
    colors[node.id] = chosenColor;
    const colorDef = getColorDef(chosenColor);

    const totalUsed = new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size;

    steps.push({
      index: stepCount++,
      algorithm: 'greedy',
      action: 'color',
      activeNodeId: node.id,
      color: chosenColor,
      forbiddenColors: forbidden,
      pseudocodeLine: 5,
      title: `Assign ${colorDef?.label} to ${node.label}`,
      explanation: `Assigned color ${colorDef?.label} (${colorDef?.symbol} ${colorDef?.name}) to ${formatNodeLabel(
        node.id,
        nodesMap
      )} as it is the smallest color not forbidden by its neighbors.`,
      snapshot: {
        colors: { ...colors },
        activeNodeId: node.id,
        activeNeighbors: neighbors,
        conflictingNodes: [],
        forbiddenColors: [...forbidden],
        candidateColor: chosenColor,
        orderedNodes: queueSnapshot,
        validSoFar: true,
        totalColorsUsed: totalUsed,
      },
    });
  }

  // Done step
  const finalUsed = new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size;
  steps.push({
    index: stepCount++,
    algorithm: 'greedy',
    action: 'done',
    activeNodeId: null,
    color: null,
    forbiddenColors: [],
    pseudocodeLine: 6,
    title: 'Greedy Coloring Completed',
    explanation: `Greedy coloring finished! All ${nodes.length} vertices successfully colored using ${finalUsed} color class${
      finalUsed > 1 ? 'es' : ''
    }. Every adjacent pair has distinct colors.`,
    snapshot: {
      colors: { ...colors },
      activeNodeId: null,
      activeNeighbors: [],
      conflictingNodes: [],
      forbiddenColors: [],
      orderedNodes: orderedNodes.map((item) => ({ ...item, status: 'processed' as const })),
      validSoFar: true,
      totalColorsUsed: finalUsed,
    },
  });

  return steps;
}
