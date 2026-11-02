// Verification test script for Graph Coloring Visualizer
// Tests all preset graphs across Greedy, Welsh-Powell, DSatur, and Backtracking m-coloring

function buildAdjacency(nodes, edges) {
  const adjacencyList = {};
  const degreeMap = {};
  const nodesMap = {};

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

function getForbiddenColors(nodeId, adjacencyList, colors) {
  const neighbors = adjacencyList[nodeId] || [];
  const forbidden = new Set();
  neighbors.forEach((nbrId) => {
    const col = colors[nbrId];
    if (col !== null && col !== undefined && col > 0) {
      forbidden.add(col);
    }
  });
  return Array.from(forbidden).sort((a, b) => a - b);
}

function findSmallestAvailableColor(forbidden, maxLimit) {
  let c = 1;
  while (forbidden.includes(c)) {
    c++;
    if (maxLimit && c > maxLimit) return null;
  }
  return c;
}

function validateColoring(nodes, edges, colors) {
  const conflicts = [];
  const used = new Set();

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

  const isComplete = nodes.every((n) => colors[n.id] !== null && colors[n.id] !== undefined && colors[n.id] > 0);
  const isValid = conflicts.length === 0;

  return { isValid, isComplete, conflicts, colorsUsed: used.size };
}

// Preset graphs
const PRESETS = {
  triangle: {
    nodes: [{ id: '1' }, { id: '2' }, { id: '3' }],
    edges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
      { id: 'e3', source: '3', target: '1' },
    ],
    chromatic: 3,
  },
  cycle5: {
    nodes: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }],
    edges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
      { id: 'e3', source: '3', target: '4' },
      { id: 'e4', source: '4', target: '5' },
      { id: 'e5', source: '5', target: '1' },
    ],
    chromatic: 3,
  },
  bipartite: {
    nodes: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' }],
    edges: [
      { id: 'e1', source: '1', target: '4' },
      { id: 'e2', source: '1', target: '5' },
      { id: 'e3', source: '1', target: '6' },
      { id: 'e4', source: '2', target: '4' },
      { id: 'e5', source: '2', target: '5' },
      { id: 'e6', source: '2', target: '6' },
      { id: 'e7', source: '3', target: '4' },
      { id: 'e8', source: '3', target: '5' },
      { id: 'e9', source: '3', target: '6' },
    ],
    chromatic: 2,
  },
  petersen: {
    nodes: Array.from({ length: 10 }, (_, i) => ({ id: `${i + 1}` })),
    edges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
      { id: 'e3', source: '3', target: '4' },
      { id: 'e4', source: '4', target: '5' },
      { id: 'e5', source: '5', target: '1' },
      { id: 'e6', source: '1', target: '6' },
      { id: 'e7', source: '2', target: '7' },
      { id: 'e8', source: '3', target: '8' },
      { id: 'e9', source: '4', target: '9' },
      { id: 'e10', source: '5', target: '10' },
      { id: 'e11', source: '6', target: '8' },
      { id: 'e12', source: '8', target: '10' },
      { id: 'e13', source: '10', target: '7' },
      { id: 'e14', source: '7', target: '9' },
      { id: 'e15', source: '9', target: '6' },
    ],
    chromatic: 3,
  },
  complete5: {
    nodes: Array.from({ length: 5 }, (_, i) => ({ id: `${i + 1}` })),
    edges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '1', target: '3' },
      { id: 'e3', source: '1', target: '4' },
      { id: 'e4', source: '1', target: '5' },
      { id: 'e5', source: '2', target: '3' },
      { id: 'e6', source: '2', target: '4' },
      { id: 'e7', source: '2', target: '5' },
      { id: 'e8', source: '3', target: '4' },
      { id: 'e9', source: '3', target: '5' },
      { id: 'e10', source: '4', target: '5' },
    ],
    chromatic: 5,
  },
  wheel6: {
    nodes: Array.from({ length: 6 }, (_, i) => ({ id: `${i + 1}` })),
    edges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '1', target: '3' },
      { id: 'e3', source: '1', target: '4' },
      { id: 'e4', source: '1', target: '5' },
      { id: 'e5', source: '1', target: '6' },
      { id: 'e6', source: '2', target: '3' },
      { id: 'e7', source: '3', target: '4' },
      { id: 'e8', source: '4', target: '5' },
      { id: 'e9', source: '5', target: '6' },
      { id: 'e10', source: '6', target: '2' },
    ],
    chromatic: 4,
  },
  planar: {
    nodes: Array.from({ length: 8 }, (_, i) => ({ id: `${i + 1}` })),
    edges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '1', target: '4' },
      { id: 'e3', source: '1', target: '3' },
      { id: 'e4', source: '2', target: '4' },
      { id: 'e5', source: '3', target: '4' },
      { id: 'e6', source: '2', target: '5' },
      { id: 'e7', source: '4', target: '5' },
      { id: 'e8', source: '4', target: '6' },
      { id: 'e9', source: '3', target: '6' },
      { id: 'e10', source: '5', target: '6' },
      { id: 'e11', source: '5', target: '7' },
      { id: 'e12', source: '6', target: '7' },
      { id: 'e13', source: '6', target: '8' },
      { id: 'e14', source: '7', target: '8' },
    ],
    chromatic: 4,
  },
};

// Algorithm Implementations
function runGreedy(nodes, edges) {
  const { adjacencyList } = buildAdjacency(nodes, edges);
  const colors = {};
  nodes.forEach((n) => {
    const forbidden = getForbiddenColors(n.id, adjacencyList, colors);
    colors[n.id] = findSmallestAvailableColor(forbidden);
  });
  return colors;
}

function runWelshPowell(nodes, edges) {
  const { adjacencyList, degreeMap } = buildAdjacency(nodes, edges);
  const sorted = [...nodes].sort((a, b) => (degreeMap[b.id] || 0) - (degreeMap[a.id] || 0) || a.id.localeCompare(b.id));
  const colors = {};
  sorted.forEach((n) => {
    const forbidden = getForbiddenColors(n.id, adjacencyList, colors);
    colors[n.id] = findSmallestAvailableColor(forbidden);
  });
  return colors;
}

function runDSatur(nodes, edges) {
  const { adjacencyList, degreeMap } = buildAdjacency(nodes, edges);
  const colors = {};
  nodes.forEach((n) => { colors[n.id] = null; });

  function getSat(nodeId) {
    const forbidden = new Set();
    (adjacencyList[nodeId] || []).forEach((nbr) => {
      if (colors[nbr]) forbidden.add(colors[nbr]);
    });
    return forbidden.size;
  }

  function getUncolored(nodeId) {
    return (adjacencyList[nodeId] || []).filter((nbr) => colors[nbr] === null).length;
  }

  while (Object.values(colors).filter((c) => c !== null).length < nodes.length) {
    const uncolored = nodes.filter((n) => colors[n.id] === null);
    let chosen = uncolored[0];
    let maxSat = -1;
    let maxUncol = -1;

    for (const node of uncolored) {
      const sat = getSat(node.id);
      const uncol = getUncolored(node.id);
      if (sat > maxSat || (sat === maxSat && uncol > maxUncol)) {
        maxSat = sat;
        maxUncol = uncol;
        chosen = node;
      }
    }

    const forbidden = getForbiddenColors(chosen.id, adjacencyList, colors);
    colors[chosen.id] = findSmallestAvailableColor(forbidden);
  }

  return colors;
}

function runBacktracking(nodes, edges, maxColors) {
  const { adjacencyList } = buildAdjacency(nodes, edges);
  const colors = {};
  nodes.forEach((n) => { colors[n.id] = null; });

  function solve(idx) {
    if (idx === nodes.length) return true;
    const node = nodes[idx];
    const forbidden = getForbiddenColors(node.id, adjacencyList, colors);
    for (let c = 1; c <= maxColors; c++) {
      if (!forbidden.includes(c)) {
        colors[node.id] = c;
        if (solve(idx + 1)) return true;
        colors[node.id] = null;
      }
    }
    return false;
  }

  const success = solve(0);
  return { colors, success };
}

console.log('=== GRAPH COLORING PRESET VERIFICATION TEST ===\n');

let allPassed = true;

for (const [presetKey, preset] of Object.entries(PRESETS)) {
  console.log(`[TEST PRESET: ${presetKey.toUpperCase()}] (|V|=${preset.nodes.length}, |E|=${preset.edges.length}, χ=${preset.chromatic})`);

  // 1. Greedy
  const greedyColors = runGreedy(preset.nodes, preset.edges);
  const greedyVal = validateColoring(preset.nodes, preset.edges, greedyColors);
  if (!greedyVal.isValid || !greedyVal.isComplete) {
    console.error(`  FAIL Greedy: valid=${greedyVal.isValid}, complete=${greedyVal.isComplete}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Greedy: PASSED (used ${greedyVal.colorsUsed} colors)`);
  }

  // 2. Welsh-Powell
  const wpColors = runWelshPowell(preset.nodes, preset.edges);
  const wpVal = validateColoring(preset.nodes, preset.edges, wpColors);
  if (!wpVal.isValid || !wpVal.isComplete) {
    console.error(`  FAIL Welsh-Powell: valid=${wpVal.isValid}, complete=${wpVal.isComplete}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Welsh-Powell: PASSED (used ${wpVal.colorsUsed} colors)`);
  }

  // 3. DSatur
  const dsaturColors = runDSatur(preset.nodes, preset.edges);
  const dsaturVal = validateColoring(preset.nodes, preset.edges, dsaturColors);
  if (!dsaturVal.isValid || !dsaturVal.isComplete) {
    console.error(`  FAIL DSatur: valid=${dsaturVal.isValid}, complete=${dsaturVal.isComplete}`);
    allPassed = false;
  } else {
    console.log(`  ✓ DSatur: PASSED (used ${dsaturVal.colorsUsed} colors, optimal=${dsaturVal.colorsUsed === preset.chromatic})`);
  }

  // 4. Backtracking with m = chromatic
  const bt = runBacktracking(preset.nodes, preset.edges, preset.chromatic);
  const btVal = validateColoring(preset.nodes, preset.edges, bt.colors);
  if (!bt.success || !btVal.isValid || !btVal.isComplete) {
    console.error(`  FAIL Backtracking: success=${bt.success}, valid=${btVal.isValid}, complete=${btVal.isComplete}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Backtracking (m=${preset.chromatic}): PASSED (found exact ${btVal.colorsUsed}-coloring)`);
  }

  console.log('');
}

if (allPassed) {
  console.log('>>> ALL ALGORITHMS PRODUCED 100% VALID COLORINGS ACROSS ALL PRESETS! <<<');
  process.exit(0);
} else {
  console.error('>>> SOME PRESETS FAILED VALIDATION! <<<');
  process.exit(1);
}
