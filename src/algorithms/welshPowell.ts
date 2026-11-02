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

export const WELSH_POWELL_PSEUDOCODE = [
  { line: 1, text: 'procedure WelshPowellColoring(G = (V, E)):', indent: 0 },
  { line: 2, text: '  Compute degrees deg(v) for all v in V', indent: 1 },
  { line: 3, text: '  Sort vertices in descending order of degrees: deg(v₁) ≥ deg(v₂) ≥ ...', indent: 1 },
  { line: 4, text: '  for each vertex v in sorted order:', indent: 1 },
  { line: 5, text: '    forbidden ← { color[u] | u ∈ neighbors(v) and color[u] ≠ null }', indent: 2 },
  { line: 6, text: '    c ← smallest integer ≥ 1 not in forbidden', indent: 2 },
  { line: 7, text: '    color[v] ← c', indent: 2 },
  { line: 8, text: '  return color', indent: 1 },
];

export function runWelshPowellColoring(nodes: GraphNode[], edges: GraphEdge[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const { adjacencyList, nodesMap, degreeMap } = buildAdjacency(nodes, edges);

  const colors: Record<string, number | null> = {};
  nodes.forEach((n) => {
    colors[n.id] = null;
  });

  let stepCount = 0;

  // Initial step with unsorted queue
  const initialQueue = nodes.map((n) => ({
    nodeId: n.id,
    degree: degreeMap[n.id] || 0,
    status: 'waiting' as const,
  }));

  steps.push({
    index: stepCount++,
    algorithm: 'welsh-powell',
    action: 'inspect',
    activeNodeId: null,
    color: null,
    forbiddenColors: [],
    pseudocodeLine: 2,
    title: 'Calculate Vertex Degrees',
    explanation: `Calculated degree deg(v) for all ${nodes.length} vertices. Vertices with higher degrees have more neighbors and present the tightest coloring constraints.`,
    snapshot: {
      colors: { ...colors },
      activeNodeId: null,
      activeNeighbors: [],
      conflictingNodes: [],
      forbiddenColors: [],
      orderedNodes: initialQueue.map((item) => ({ ...item })),
      validSoFar: true,
      totalColorsUsed: 0,
    },
  });

  // Sort nodes by degree descending (tie-break by label/id)
  const sortedNodes = [...nodes].sort((a, b) => {
    const dDiff = (degreeMap[b.id] || 0) - (degreeMap[a.id] || 0);
    if (dDiff !== 0) return dDiff;
    return a.id.localeCompare(b.id);
  });

  const sortedQueue = sortedNodes.map((n) => ({
    nodeId: n.id,
    degree: degreeMap[n.id] || 0,
    status: 'waiting' as const,
  }));

  steps.push({
    index: stepCount++,
    algorithm: 'welsh-powell',
    action: 'sort',
    activeNodeId: null,
    color: null,
    forbiddenColors: [],
    pseudocodeLine: 3,
    title: 'Sort Vertices Descending by Degree',
    explanation: `Sorted vertices: [${sortedNodes
      .map((n) => `${n.label} (deg=${degreeMap[n.id]})`)
      .join(', ')}]. By coloring highly-connected vertices first, Welsh-Powell minimizes worst-case color proliferation.`,
    snapshot: {
      colors: { ...colors },
      activeNodeId: null,
      activeNeighbors: [],
      conflictingNodes: [],
      forbiddenColors: [],
      orderedNodes: sortedQueue.map((item) => ({ ...item })),
      validSoFar: true,
      totalColorsUsed: 0,
    },
  });

  for (let i = 0; i < sortedNodes.length; i++) {
    const node = sortedNodes[i];
    const neighbors = adjacencyList[node.id] || [];

    const forbidden = getForbiddenColors(node.id, adjacencyList, colors);
    const coloredNeighbors = neighbors.filter((nbr) => colors[nbr] !== null && colors[nbr]! > 0);

    const queueSnapshot = sortedQueue.map((item, idx) => ({
      ...item,
      status: (idx < i ? 'processed' : idx === i ? 'current' : 'waiting') as 'processed' | 'current' | 'waiting',
    }));

    // Step: inspect current node in sorted order
    steps.push({
      index: stepCount++,
      algorithm: 'welsh-powell',
      action: 'inspect',
      activeNodeId: node.id,
      color: null,
      forbiddenColors: forbidden,
      pseudocodeLine: 5,
      title: `Inspect ${node.label} (Sorted Rank ${i + 1}/${sortedNodes.length}, deg=${degreeMap[node.id]})`,
      explanation:
        coloredNeighbors.length > 0
          ? `${formatNodeLabel(node.id, nodesMap)} has degree ${degreeMap[node.id]}. Neighbors already colored: {${coloredNeighbors
              .map((nId) => `${nodesMap[nId]?.label || nId} (${getColorDef(colors[nId])?.label})`)
              .join(', ')}}. Forbidden colors: [${formatColorList(forbidden)}].`
          : `${formatNodeLabel(node.id, nodesMap)} (degree ${degreeMap[node.id]}) has no colored neighbors yet. Can receive Color Class 1.`,
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

    // Step: color current node
    const chosenColor = findSmallestAvailableColor(forbidden)!;
    colors[node.id] = chosenColor;
    const colorDef = getColorDef(chosenColor);
    const totalUsed = new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size;

    steps.push({
      index: stepCount++,
      algorithm: 'welsh-powell',
      action: 'color',
      activeNodeId: node.id,
      color: chosenColor,
      forbiddenColors: forbidden,
      pseudocodeLine: 7,
      title: `Assign ${colorDef?.label} to ${node.label}`,
      explanation: `Assigned color ${colorDef?.label} (${colorDef?.symbol} ${colorDef?.name}) to ${formatNodeLabel(
        node.id,
        nodesMap
      )}. Lowest integer avoiding neighbors' colors.`,
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
    algorithm: 'welsh-powell',
    action: 'done',
    activeNodeId: null,
    color: null,
    forbiddenColors: [],
    pseudocodeLine: 8,
    title: 'Welsh-Powell Coloring Completed',
    explanation: `Welsh-Powell completed! All ${nodes.length} vertices successfully colored in degree-descending order using ${finalUsed} color class${
      finalUsed > 1 ? 'es' : ''
    }.`,
    snapshot: {
      colors: { ...colors },
      activeNodeId: null,
      activeNeighbors: [],
      conflictingNodes: [],
      forbiddenColors: [],
      orderedNodes: sortedQueue.map((item) => ({ ...item, status: 'processed' as const })),
      validSoFar: true,
      totalColorsUsed: finalUsed,
    },
  });

  return steps;
}
