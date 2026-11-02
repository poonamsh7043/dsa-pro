import { AlgorithmMeta, AlgorithmType, AlgorithmStep } from '../types/algorithm';
import { GraphEdge, GraphNode } from '../types/graph';
import { GREEDY_PSEUDOCODE, runGreedyColoring } from './greedy';
import { WELSH_POWELL_PSEUDOCODE, runWelshPowellColoring } from './welshPowell';
import { DSATUR_PSEUDOCODE, runDSaturColoring } from './dsatur';
import { BACKTRACKING_PSEUDOCODE, runBacktrackingColoring } from './backtracking';
import { BIPARTITE_PSEUDOCODE, runBipartiteCheck } from './bipartiteBfs';
import { validateColoring, ValidationResult } from './common';

export const ALGORITHM_METAS: Record<AlgorithmType, AlgorithmMeta> = {
  greedy: {
    id: 'greedy',
    name: 'Greedy Coloring',
    shortName: 'Greedy',
    description:
      'Iterates through vertices in their natural or index order, greedily assigning the lowest available color not held by already colored neighbors.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    guarantee: '≤ Δ + 1 colors (Can be suboptimal depending on order)',
    pseudocode: GREEDY_PSEUDOCODE,
  },
  'welsh-powell': {
    id: 'welsh-powell',
    name: 'Welsh-Powell (Degree-Descending)',
    shortName: 'Welsh-Powell',
    description:
      'Sorts vertices in descending order of their degrees deg(v). Coloring high-degree vertices first prevents dense bottlenecks later in the graph.',
    timeComplexity: 'O(V log V + E)',
    spaceComplexity: 'O(V)',
    guarantee: '≤ Δ + 1 colors (Significantly tighter than random greedy)',
    pseudocode: WELSH_POWELL_PSEUDOCODE,
  },
  dsatur: {
    id: 'dsatur',
    name: 'DSatur (Degree of Saturation)',
    shortName: 'DSatur',
    description:
      'Dynamically prioritizes uncolored vertices with the highest saturation degree ρ(v) (number of distinct neighbor colors). Breaks ties by uncolored degree.',
    timeComplexity: 'O(V² + E)',
    spaceComplexity: 'O(V)',
    guarantee: 'Exact for bipartite, cycles, wheels; near-optimal on general graphs',
    pseudocode: DSATUR_PSEUDOCODE,
  },
  backtracking: {
    id: 'backtracking',
    name: 'Backtracking m-Coloring',
    shortName: 'Backtracking',
    description:
      'Exact recursive depth-first search that tests if the graph is m-colorable. Backtracks whenever downstream assignments hit a conflict.',
    timeComplexity: 'O(m^V) worst-case',
    spaceComplexity: 'O(V) call stack',
    guarantee: 'Exact: finds true m-coloring or proves impossible (NP-Complete)',
    pseudocode: BACKTRACKING_PSEUDOCODE,
  },
  'bipartite-check': {
    id: 'bipartite-check',
    name: 'Bipartite Check (2-Coloring BFS)',
    shortName: 'Bipartite BFS',
    description:
      'Tests whether a graph is bipartite (2-colorable) using breadth-first search. Instantly detects odd cycles (which forbid 2-colorability).',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    guarantee: 'Exact: discovers whether χ(G) ≤ 2 or χ(G) ≥ 3',
    pseudocode: BIPARTITE_PSEUDOCODE,
  },
};

export function runAlgorithm(
  algorithm: AlgorithmType,
  nodes: GraphNode[],
  edges: GraphEdge[],
  options?: { maxColors?: number }
): AlgorithmStep[] {
  switch (algorithm) {
    case 'greedy':
      return runGreedyColoring(nodes, edges);
    case 'welsh-powell':
      return runWelshPowellColoring(nodes, edges);
    case 'dsatur':
      return runDSaturColoring(nodes, edges);
    case 'backtracking':
      return runBacktrackingColoring(nodes, edges, options?.maxColors ?? 3);
    case 'bipartite-check':
      return runBipartiteCheck(nodes, edges);
  }
}

export interface ComparisonItem {
  algorithm: AlgorithmType;
  name: string;
  colorsUsed: number;
  totalSteps: number;
  backtracks: number;
  isValid: boolean;
  isComplete: boolean;
  timeComplexity: string;
  validation: ValidationResult;
}

export function runAllAlgorithmsComparison(
  nodes: GraphNode[],
  edges: GraphEdge[],
  backtrackingM: number = 3
): ComparisonItem[] {
  const algorithms: AlgorithmType[] = ['greedy', 'welsh-powell', 'dsatur', 'backtracking', 'bipartite-check'];

  return algorithms.map((algo) => {
    const steps = runAlgorithm(algo, nodes, edges, { maxColors: backtrackingM });
    const lastStep = steps[steps.length - 1];
    const finalColors = lastStep ? lastStep.snapshot.colors : {};
    const validation = validateColoring(nodes, edges, finalColors);

    const backtracks = steps.filter((s) => s.action === 'backtrack' || s.action === 'conflict').length;

    return {
      algorithm: algo,
      name: ALGORITHM_METAS[algo].name,
      colorsUsed: validation.colorsUsed,
      totalSteps: steps.length,
      backtracks,
      isValid: validation.isValid,
      isComplete: validation.isComplete,
      timeComplexity: ALGORITHM_METAS[algo].timeComplexity,
      validation,
    };
  });
}
