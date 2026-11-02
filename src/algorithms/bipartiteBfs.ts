import { GraphEdge, GraphNode } from '../types/graph';
import { AlgorithmStep } from '../types/algorithm';
import {
  buildAdjacency,
  formatNodeLabel,
} from './common';
import { getColorDef } from '../utils/colors';

export const BIPARTITE_PSEUDOCODE = [
  { line: 1, text: 'procedure CheckBipartite2Color(G = (V, E)):', indent: 0 },
  { line: 2, text: '  for each unvisited component root r in V:', indent: 1 },
  { line: 3, text: '    color[r] ← C1; queue.push(r)', indent: 2 },
  { line: 4, text: '    while queue is not empty:', indent: 2 },
  { line: 5, text: '      u ← queue.pop()', indent: 3 },
  { line: 6, text: '      for each neighbor v of u:', indent: 3 },
  { line: 7, text: '        if color[v] == color[u]: return FALSE (Odd Cycle Found!)', indent: 4 },
  { line: 8, text: '        if color[v] == null: color[v] ← 3 - color[u]; queue.push(v)', indent: 4 },
  { line: 9, text: '  return TRUE (Graph is Bipartite / 2-Colorable)', indent: 1 },
];

export function runBipartiteCheck(nodes: GraphNode[], edges: GraphEdge[]): AlgorithmStep[] {
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

  steps.push({
    index: stepCount++,
    algorithm: 'bipartite-check',
    action: 'inspect',
    activeNodeId: null,
    color: null,
    forbiddenColors: [],
    pseudocodeLine: 1,
    title: 'Initialize Bipartite (2-Coloring) Verification',
    explanation:
      'A graph is bipartite if and only if its vertices can be partitioned into two independent sets (2-colorable). This algorithm uses BFS to test for odd cycles.',
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

  let isBipartite = true;
  let conflictEdge: { u: string; v: string } | null = null;

  for (const root of nodes) {
    if (colors[root.id] !== null) continue;
    if (!isBipartite) break;

    // Assign root to Color 1
    colors[root.id] = 1;
    const queue: string[] = [root.id];
    const c1Def = getColorDef(1);

    steps.push({
      index: stepCount++,
      algorithm: 'bipartite-check',
      action: 'color',
      activeNodeId: root.id,
      color: 1,
      forbiddenColors: [],
      pseudocodeLine: 3,
      title: `Start Component at ${root.label} (Assign ${c1Def?.label})`,
      explanation: `Discovered new unvisited component. Assigned ${formatNodeLabel(
        root.id,
        nodesMap
      )} to Partition A (${c1Def?.label} ${c1Def?.symbol}) and enqueued.`,
      snapshot: {
        colors: { ...colors },
        activeNodeId: root.id,
        activeNeighbors: adjacencyList[root.id] || [],
        conflictingNodes: [],
        forbiddenColors: [],
        orderedNodes: orderedNodes.map((item) => ({
          ...item,
          status: item.nodeId === root.id ? 'current' : colors[item.nodeId] ? 'processed' : 'waiting',
        })),
        validSoFar: true,
        totalColorsUsed: 1,
      },
    });

    while (queue.length > 0 && isBipartite) {
      const uId = queue.shift()!;
      const uColor = colors[uId]!;
      const expectedNeighborColor = uColor === 1 ? 2 : 1;
      const expectedDef = getColorDef(expectedNeighborColor);
      const neighbors = adjacencyList[uId] || [];

      steps.push({
        index: stepCount++,
        algorithm: 'bipartite-check',
        action: 'inspect',
        activeNodeId: uId,
        color: uColor,
        forbiddenColors: [uColor],
        pseudocodeLine: 5,
        title: `BFS Visit ${nodesMap[uId]?.label} (Color ${getColorDef(uColor)?.label})`,
        explanation: `Exploring neighbors of ${formatNodeLabel(
          uId,
          nodesMap
        )}. All adjacent neighbors must take alternating color ${expectedDef?.label} (${expectedDef?.symbol}).`,
        snapshot: {
          colors: { ...colors },
          activeNodeId: uId,
          activeNeighbors: neighbors,
          conflictingNodes: [],
          forbiddenColors: [uColor],
          orderedNodes: orderedNodes.map((item) => ({
            ...item,
            status: item.nodeId === uId ? 'current' : colors[item.nodeId] ? 'processed' : 'waiting',
          })),
          validSoFar: true,
          totalColorsUsed: new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size,
        },
      });

      for (const vId of neighbors) {
        if (colors[vId] === null) {
          // Color neighbor with alternating color
          colors[vId] = expectedNeighborColor;
          queue.push(vId);

          steps.push({
            index: stepCount++,
            algorithm: 'bipartite-check',
            action: 'color',
            activeNodeId: vId,
            color: expectedNeighborColor,
            forbiddenColors: [uColor],
            pseudocodeLine: 8,
            title: `Assign Alternating Color ${expectedDef?.label} to ${nodesMap[vId]?.label}`,
            explanation: `${formatNodeLabel(vId, nodesMap)} is uncolored. Assigned alternating color ${
              expectedDef?.label
            } (${expectedDef?.symbol}) to maintain bipartite partition.`,
            snapshot: {
              colors: { ...colors },
              activeNodeId: vId,
              activeNeighbors: [uId],
              conflictingNodes: [],
              forbiddenColors: [uColor],
              orderedNodes: orderedNodes.map((item) => ({
                ...item,
                status: colors[item.nodeId] ? 'processed' : 'waiting',
              })),
              validSoFar: true,
              totalColorsUsed: new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size,
            },
          });
        } else if (colors[vId] === uColor) {
          // Conflict! Odd cycle detected!
          isBipartite = false;
          conflictEdge = { u: uId, v: vId };
          const sameColorDef = getColorDef(uColor);

          steps.push({
            index: stepCount++,
            algorithm: 'bipartite-check',
            action: 'conflict',
            activeNodeId: vId,
            color: uColor,
            forbiddenColors: [uColor],
            pseudocodeLine: 7,
            title: `ODD CYCLE CONFLICT: ${nodesMap[uId]?.label} ↔ ${nodesMap[vId]?.label}`,
            explanation: `MONOCHROME CONFLICT: Both adjacent vertices ${formatNodeLabel(
              uId,
              nodesMap
            )} and ${formatNodeLabel(
              vId,
              nodesMap
            )} share the same color ${sameColorDef?.label} (${sameColorDef?.symbol})! This proves an odd cycle exists. The graph is NOT bipartite!`,
            snapshot: {
              colors: { ...colors },
              activeNodeId: vId,
              activeNeighbors: [uId],
              conflictingNodes: [uId, vId],
              forbiddenColors: [uColor],
              orderedNodes: orderedNodes.map((item) => ({ ...item })),
              validSoFar: false,
              totalColorsUsed: new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size,
            },
          });
          break;
        }
      }
    }
  }

  // Done step
  if (isBipartite) {
    steps.push({
      index: stepCount++,
      algorithm: 'bipartite-check',
      action: 'done',
      activeNodeId: null,
      color: null,
      forbiddenColors: [],
      pseudocodeLine: 9,
      title: 'Bipartite Verification: SUCCESS (χ(G) ≤ 2)',
      explanation:
        'Graph is strictly BIPARTITE! Vertices are divided into 2 independent sets without any internal edges. Chromatic number χ(G) ≤ 2.',
      snapshot: {
        colors: { ...colors },
        activeNodeId: null,
        activeNeighbors: [],
        conflictingNodes: [],
        forbiddenColors: [],
        orderedNodes: orderedNodes.map((item) => ({ ...item, status: 'processed' as const })),
        validSoFar: true,
        totalColorsUsed: new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size,
      },
    });
  } else {
    steps.push({
      index: stepCount++,
      algorithm: 'bipartite-check',
      action: 'conflict',
      activeNodeId: null,
      color: null,
      forbiddenColors: [],
      pseudocodeLine: 7,
      title: 'Bipartite Verification: NOT BIPARTITE (χ(G) ≥ 3)',
      explanation: `Graph contains an odd-length cycle involving edge (${nodesMap[conflictEdge?.u || '']?.label} — ${
        nodesMap[conflictEdge?.v || '']?.label
      }). Graph requires at least 3 colors.`,
      snapshot: {
        colors: { ...colors },
        activeNodeId: null,
        activeNeighbors: conflictEdge ? [conflictEdge.u, conflictEdge.v] : [],
        conflictingNodes: conflictEdge ? [conflictEdge.u, conflictEdge.v] : [],
        forbiddenColors: [],
        orderedNodes: orderedNodes.map((item) => ({ ...item })),
        validSoFar: false,
        totalColorsUsed: new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size,
      },
    });
  }

  return steps;
}
