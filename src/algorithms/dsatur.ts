import { GraphEdge, GraphNode } from '../types/graph';
import { AlgorithmStep, NodeEvaluation } from '../types/algorithm';
import {
  buildAdjacency,
  findSmallestAvailableColor,
  formatColorList,
  formatNodeLabel,
  getForbiddenColors,
} from './common';
import { getColorDef } from '../utils/colors';

export const DSATUR_PSEUDOCODE = [
  { line: 1, text: 'procedure DSaturColoring(G = (V, E)):', indent: 0 },
  { line: 2, text: '  Compute saturation degree ρ(v) = 0 for all v in V', indent: 1 },
  { line: 3, text: '  Pick vertex with max degree, assign Color 1; update neighbors’ ρ', indent: 1 },
  { line: 4, text: '  while uncolored vertices remain:', indent: 1 },
  { line: 5, text: '    v* ← vertex with max ρ(v) [tie-breaker: max uncolored degree]', indent: 2 },
  { line: 6, text: '    forbidden ← { color[u] | u ∈ neighbors(v*) and color[u] ≠ null }', indent: 2 },
  { line: 7, text: '    c ← smallest integer ≥ 1 not in forbidden', indent: 2 },
  { line: 8, text: '    color[v*] ← c; update ρ(w) for all uncolored neighbors w of v*', indent: 2 },
  { line: 9, text: '  return color', indent: 1 },
];

export function runDSaturColoring(nodes: GraphNode[], edges: GraphEdge[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const { adjacencyList, nodesMap, degreeMap } = buildAdjacency(nodes, edges);

  const colors: Record<string, number | null> = {};
  nodes.forEach((n) => {
    colors[n.id] = null;
  });

  let stepCount = 0;

  // Helper to compute saturation degree of a node
  function getSaturation(nodeId: string): number {
    const neighbors = adjacencyList[nodeId] || [];
    const distinctColors = new Set<number>();
    neighbors.forEach((nbr) => {
      const c = colors[nbr];
      if (c !== null && c !== undefined && c > 0) {
        distinctColors.add(c);
      }
    });
    return distinctColors.size;
  }

  // Helper to compute uncolored degree
  function getUncoloredDegree(nodeId: string): number {
    const neighbors = adjacencyList[nodeId] || [];
    return neighbors.filter((nbr) => colors[nbr] === null || colors[nbr] === undefined).length;
  }

  // Helper to build sorted node queue
  function buildQueue(activeId: string | null = null): NodeEvaluation[] {
    return [...nodes]
      .map((n) => {
        const isColored = colors[n.id] !== null && colors[n.id] !== undefined;
        return {
          nodeId: n.id,
          degree: degreeMap[n.id],
          saturationDegree: getSaturation(n.id),
          uncoloredDegree: getUncoloredDegree(n.id),
          status: isColored
            ? ('processed' as const)
            : n.id === activeId
            ? ('current' as const)
            : ('waiting' as const),
        };
      })
      .sort((a, b) => {
        // Colored nodes at bottom
        const aColored = colors[a.nodeId] !== null && colors[a.nodeId] !== undefined;
        const bColored = colors[b.nodeId] !== null && colors[b.nodeId] !== undefined;
        if (aColored && !bColored) return 1;
        if (!aColored && bColored) return -1;
        // Uncolored: sort by saturation degree descending
        const satDiff = (b.saturationDegree || 0) - (a.saturationDegree || 0);
        if (satDiff !== 0) return satDiff;
        // Tie break by uncolored degree
        const uncolDiff = (b.uncoloredDegree || 0) - (a.uncoloredDegree || 0);
        if (uncolDiff !== 0) return uncolDiff;
        return a.nodeId.localeCompare(b.nodeId);
      });
  }

  // Initial step
  steps.push({
    index: stepCount++,
    algorithm: 'dsatur',
    action: 'inspect',
    activeNodeId: null,
    color: null,
    forbiddenColors: [],
    pseudocodeLine: 2,
    title: 'Initialize DSatur (Saturation Degrees = 0)',
    explanation:
      'DSatur (Degree of Saturation) dynamically prioritizes vertices with the highest number of differently colored neighbors (ρ). Initializing all saturation degrees to 0.',
    snapshot: {
      colors: { ...colors },
      activeNodeId: null,
      activeNeighbors: [],
      conflictingNodes: [],
      forbiddenColors: [],
      orderedNodes: buildQueue(),
      validSoFar: true,
      totalColorsUsed: 0,
    },
  });

  const coloredCount = () => Object.values(colors).filter((c) => c !== null && c > 0).length;

  while (coloredCount() < nodes.length) {
    // Pick uncolored vertex with maximal saturation degree
    const uncoloredNodes = nodes.filter((n) => colors[n.id] === null || colors[n.id] === undefined);

    let chosenNode = uncoloredNodes[0];
    let maxSat = -1;
    let maxUncoloredDeg = -1;

    for (const node of uncoloredNodes) {
      const sat = getSaturation(node.id);
      const uncoloredDeg = getUncoloredDegree(node.id);

      if (
        sat > maxSat ||
        (sat === maxSat && uncoloredDeg > maxUncoloredDeg) ||
        (sat === maxSat && uncoloredDeg === maxUncoloredDeg && node.id < chosenNode.id)
      ) {
        maxSat = sat;
        maxUncoloredDeg = uncoloredDeg;
        chosenNode = node;
      }
    }

    const neighbors = adjacencyList[chosenNode.id] || [];
    const forbidden = getForbiddenColors(chosenNode.id, adjacencyList, colors);
    const coloredNeighbors = neighbors.filter((nbr) => colors[nbr] !== null && colors[nbr]! > 0);

    const queueBeforeColor = buildQueue(chosenNode.id);

    // Step 1: Select and inspect maximal saturation vertex
    steps.push({
      index: stepCount++,
      algorithm: 'dsatur',
      action: 'inspect',
      activeNodeId: chosenNode.id,
      color: null,
      forbiddenColors: forbidden,
      pseudocodeLine: 5,
      title: `Select ${chosenNode.label} (Max Saturation ρ=${maxSat})`,
      explanation: `${formatNodeLabel(
        chosenNode.id,
        nodesMap
      )} has the highest saturation degree (ρ = ${maxSat}, uncolored neighbors = ${maxUncoloredDeg}). Neighbors already colored: {${
        coloredNeighbors.length > 0
          ? coloredNeighbors
              .map((nId) => `${nodesMap[nId]?.label || nId} (${getColorDef(colors[nId])?.label})`)
              .join(', ')
          : 'none'
      }}. Forbidden colors: [${formatColorList(forbidden)}].`,
      snapshot: {
        colors: { ...colors },
        activeNodeId: chosenNode.id,
        activeNeighbors: neighbors,
        conflictingNodes: [],
        forbiddenColors: [...forbidden],
        orderedNodes: queueBeforeColor,
        validSoFar: true,
        totalColorsUsed: new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size,
      },
    });

    // Step 2: Assign lowest available color
    const chosenColor = findSmallestAvailableColor(forbidden)!;
    colors[chosenNode.id] = chosenColor;
    const colorDef = getColorDef(chosenColor);
    const totalUsed = new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size;

    const queueAfterColor = buildQueue(chosenNode.id);

    steps.push({
      index: stepCount++,
      algorithm: 'dsatur',
      action: 'color',
      activeNodeId: chosenNode.id,
      color: chosenColor,
      forbiddenColors: forbidden,
      pseudocodeLine: 8,
      title: `Assign ${colorDef?.label} to ${chosenNode.label} & Update Neighbor Saturation`,
      explanation: `Assigned ${colorDef?.label} (${colorDef?.symbol} ${colorDef?.name}) to ${formatNodeLabel(
        chosenNode.id,
        nodesMap
      )}. Updated saturation degrees for uncolored neighbors: {${neighbors
        .filter((nbr) => colors[nbr] === null)
        .map((nbr) => `${nodesMap[nbr]?.label}: ρ=${getSaturation(nbr)}`)
        .join(', ') || 'none'}}.`,
      snapshot: {
        colors: { ...colors },
        activeNodeId: chosenNode.id,
        activeNeighbors: neighbors,
        conflictingNodes: [],
        forbiddenColors: [...forbidden],
        candidateColor: chosenColor,
        orderedNodes: queueAfterColor,
        validSoFar: true,
        totalColorsUsed: totalUsed,
      },
    });
  }

  // Final step
  const finalUsed = new Set(Object.values(colors).filter((c): c is number => c !== null && c > 0)).size;
  steps.push({
    index: stepCount++,
    algorithm: 'dsatur',
    action: 'done',
    activeNodeId: null,
    color: null,
    forbiddenColors: [],
    pseudocodeLine: 9,
    title: 'DSatur Coloring Completed',
    explanation: `DSatur successfully colored the graph with ${finalUsed} color class${
      finalUsed > 1 ? 'es' : ''
    }. By dynamically prioritizing the most constrained vertices, DSatur frequently finds an optimal coloring.`,
    snapshot: {
      colors: { ...colors },
      activeNodeId: null,
      activeNeighbors: [],
      conflictingNodes: [],
      forbiddenColors: [],
      orderedNodes: buildQueue(),
      validSoFar: true,
      totalColorsUsed: finalUsed,
    },
  });

  return steps;
}
