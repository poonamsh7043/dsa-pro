import { GraphEdge, GraphNode } from '../types/graph';
import { AlgorithmStep } from '../types/algorithm';
import {
  buildAdjacency,
  formatNodeLabel,
  getForbiddenColors,
} from './common';
import { getColorDef } from '../utils/colors';

export const BACKTRACKING_PSEUDOCODE = [
  { line: 1, text: 'procedure SolveMColoring(G, m, vertexIndex = 0):', indent: 0 },
  { line: 2, text: '  if vertexIndex == |V|: return true  // All vertices successfully colored', indent: 1 },
  { line: 3, text: '  v ← V[vertexIndex]', indent: 1 },
  { line: 4, text: '  for color c from 1 to m:', indent: 1 },
  { line: 5, text: '    if isSafe(v, c):  // No neighbor of v has color c', indent: 2 },
  { line: 6, text: '      color[v] ← c', indent: 3 },
  { line: 7, text: '      if SolveMColoring(G, m, vertexIndex + 1): return true', indent: 3 },
  { line: 8, text: '      color[v] ← null  // Backtrack: downstream branches failed', indent: 3 },
  { line: 9, text: '  return false  // No valid color in {1..m} works for v', indent: 1 },
];

export function runBacktrackingColoring(
  nodes: GraphNode[],
  edges: GraphEdge[],
  maxColors: number = 3
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const { adjacencyList, nodesMap, degreeMap } = buildAdjacency(nodes, edges);

  const colors: Record<string, number | null> = {};
  nodes.forEach((n) => {
    colors[n.id] = null;
  });

  let stepCount = 0;
  const callStack: string[] = [];
  const MAX_EXPLORATION_STEPS = 120; // safety ceiling for smooth interactive playback

  const orderedNodes = nodes.map((n) => ({
    nodeId: n.id,
    degree: degreeMap[n.id] || 0,
    status: 'waiting' as const,
  }));

  steps.push({
    index: stepCount++,
    algorithm: 'backtracking',
    action: 'inspect',
    activeNodeId: null,
    color: null,
    forbiddenColors: [],
    pseudocodeLine: 1,
    title: `Initialize Backtracking (${maxColors}-Coloring Search)`,
    explanation: `Searching for a valid ${maxColors}-coloring using recursive depth-first backtracking. If an assignment leads to a dead end, the algorithm will backtrack and explore alternative branches.`,
    snapshot: {
      colors: { ...colors },
      activeNodeId: null,
      activeNeighbors: [],
      conflictingNodes: [],
      forbiddenColors: [],
      orderedNodes: orderedNodes.map((item) => ({ ...item })),
      backtrackStack: [],
      validSoFar: true,
      totalColorsUsed: 0,
    },
  });

  let solutionFound = false;

  function solve(vertexIdx: number): boolean {
    if (stepCount >= MAX_EXPLORATION_STEPS) {
      return false;
    }

    if (vertexIdx === nodes.length) {
      solutionFound = true;
      return true;
    }

    const node = nodes[vertexIdx];
    callStack.push(node.id);

    const neighbors = adjacencyList[node.id] || [];
    const forbidden = getForbiddenColors(node.id, adjacencyList, colors);

    const queueSnapshot = orderedNodes.map((item, idx) => ({
      ...item,
      status: (idx < vertexIdx
        ? 'processed'
        : idx === vertexIdx
        ? 'current'
        : 'waiting') as 'processed' | 'current' | 'waiting',
    }));

    // Inspect step
    steps.push({
      index: stepCount++,
      algorithm: 'backtracking',
      action: 'inspect',
      activeNodeId: node.id,
      color: null,
      forbiddenColors: forbidden,
      pseudocodeLine: 3,
      title: `Inspect ${node.label} (Index ${vertexIdx + 1}/${nodes.length})`,
      explanation: `Evaluating ${formatNodeLabel(
        node.id,
        nodesMap
      )} at depth ${vertexIdx}. Neighbors already colored: {${neighbors
        .filter((nbr) => colors[nbr] !== null)
        .map((nbr) => `${nodesMap[nbr]?.label} (${getColorDef(colors[nbr])?.label})`)
        .join(', ') || 'none'}}. Allowed palette limit m = ${maxColors}.`,
      snapshot: {
        colors: { ...colors },
        activeNodeId: node.id,
        activeNeighbors: neighbors,
        conflictingNodes: [],
        forbiddenColors: [...forbidden],
        orderedNodes: queueSnapshot,
        backtrackStack: [...callStack],
        validSoFar: true,
        totalColorsUsed: new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size,
      },
    });

    for (let c = 1; c <= maxColors; c++) {
      if (stepCount >= MAX_EXPLORATION_STEPS) return false;

      const isSafe = !forbidden.includes(c);
      const colorDef = getColorDef(c);

      if (!isSafe) {
        // Find conflicting neighbor
        const conflictNeighbor = neighbors.find((nbr) => colors[nbr] === c);
        steps.push({
          index: stepCount++,
          algorithm: 'backtracking',
          action: 'conflict',
          activeNodeId: node.id,
          color: c,
          forbiddenColors: forbidden,
          pseudocodeLine: 5,
          title: `Conflict: Cannot assign ${colorDef?.label} to ${node.label}`,
          explanation: `Cannot assign color ${colorDef?.label} to ${formatNodeLabel(
            node.id,
            nodesMap
          )} because adjacent neighbor ${formatNodeLabel(
            conflictNeighbor || '',
            nodesMap
          )} already has color ${colorDef?.label}.`,
          snapshot: {
            colors: { ...colors },
            activeNodeId: node.id,
            activeNeighbors: neighbors,
            conflictingNodes: conflictNeighbor ? [conflictNeighbor, node.id] : [node.id],
            forbiddenColors: [...forbidden],
            candidateColor: c,
            orderedNodes: queueSnapshot,
            backtrackStack: [...callStack],
            validSoFar: false,
            totalColorsUsed: new Set(Object.values(colors).filter((col): col is number => col !== null && col > 0)).size,
          },
        });
        continue;
      }

      // Safe: assign color c
      colors[node.id] = c;
      const totalUsed = new Set(Object.values(colors).filter((col): col is number => col !== null && col > 0)).size;

      steps.push({
        index: stepCount++,
        algorithm: 'backtracking',
        action: 'color',
        activeNodeId: node.id,
        color: c,
        forbiddenColors: forbidden,
        pseudocodeLine: 6,
        title: `Assign ${colorDef?.label} to ${node.label}`,
        explanation: `Color ${colorDef?.label} (${colorDef?.symbol}) is safe for ${formatNodeLabel(
          node.id,
          nodesMap
        )}. Assigned. Advancing to vertex ${vertexIdx + 2} in search tree.`,
        snapshot: {
          colors: { ...colors },
          activeNodeId: node.id,
          activeNeighbors: neighbors,
          conflictingNodes: [],
          forbiddenColors: [...forbidden],
          candidateColor: c,
          orderedNodes: queueSnapshot,
          backtrackStack: [...callStack],
          validSoFar: true,
          totalColorsUsed: totalUsed,
        },
      });

      // Recurse
      if (solve(vertexIdx + 1)) {
        return true;
      }

      if (stepCount >= MAX_EXPLORATION_STEPS) return false;

      // Backtrack: unassign color
      colors[node.id] = null;
      steps.push({
        index: stepCount++,
        algorithm: 'backtracking',
        action: 'backtrack',
        activeNodeId: node.id,
        color: null,
        forbiddenColors: forbidden,
        pseudocodeLine: 8,
        title: `Backtrack from ${node.label} (Reset Fill)`,
        explanation: `Dead end encountered in descendant branches! Uncoloring ${formatNodeLabel(
          node.id,
          nodesMap
        )} (draining fill back to empty) and trying next available color in {1..${maxColors}}.`,
        snapshot: {
          colors: { ...colors },
          activeNodeId: node.id,
          activeNeighbors: neighbors,
          conflictingNodes: [node.id],
          forbiddenColors: [...forbidden],
          orderedNodes: queueSnapshot,
          backtrackStack: [...callStack],
          validSoFar: false,
          totalColorsUsed: new Set(Object.values(colors).filter((col): col is number => col !== null && col > 0)).size,
        },
      });
    }

    callStack.pop();
    return false;
  }

  solve(0);

  if (solutionFound) {
    const finalUsed = new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size;
    steps.push({
      index: stepCount++,
      algorithm: 'backtracking',
      action: 'done',
      activeNodeId: null,
      color: null,
      forbiddenColors: [],
      pseudocodeLine: 2,
      title: `Backtracking ${maxColors}-Coloring Succeeded!`,
      explanation: `Valid ${maxColors}-coloring successfully found! All ${nodes.length} vertices colored with ${finalUsed} colors without any conflict.`,
      snapshot: {
        colors: { ...colors },
        activeNodeId: null,
        activeNeighbors: [],
        conflictingNodes: [],
        forbiddenColors: [],
        orderedNodes: orderedNodes.map((item) => ({ ...item, status: 'processed' as const })),
        backtrackStack: [],
        validSoFar: true,
        totalColorsUsed: finalUsed,
      },
    });
  } else {
    // No solution or search cutoff
    const reachedLimit = stepCount >= MAX_EXPLORATION_STEPS;
    steps.push({
      index: stepCount++,
      algorithm: 'backtracking',
      action: 'conflict',
      activeNodeId: null,
      color: null,
      forbiddenColors: [],
      pseudocodeLine: 9,
      title: reachedLimit ? `Search Limit Reached (${MAX_EXPLORATION_STEPS} steps)` : `Graph is NOT ${maxColors}-Colorable!`,
      explanation: reachedLimit
        ? `Exceeded exploration step limit (${MAX_EXPLORATION_STEPS} steps) while searching for a ${maxColors}-coloring. Graph likely has chromatic number χ(G) > ${maxColors}. Try increasing m.`
        : `Exhausted all search branches! The graph cannot be colored using m = ${maxColors} colors. Therefore, the chromatic number χ(G) ≥ ${
            maxColors + 1
          }.`,
      snapshot: {
        colors: { ...colors },
        activeNodeId: null,
        activeNeighbors: [],
        conflictingNodes: nodes.map((n) => n.id),
        forbiddenColors: [],
        orderedNodes: orderedNodes.map((item) => ({ ...item, status: 'waiting' as const })),
        backtrackStack: [],
        validSoFar: false,
        totalColorsUsed: new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size,
      },
    });
  }

  return steps;
}
