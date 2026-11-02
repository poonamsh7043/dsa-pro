import { GraphData, PresetGraphId, PresetInfo } from '../types/graph';

export const PRESET_INFOS: Record<PresetGraphId, PresetInfo> = {
  triangle: {
    id: 'triangle',
    name: 'Triangle (K₃)',
    description: 'Smallest odd cycle and clique. Requires 3 distinct colors.',
    chromaticNumber: 3,
    nodesCount: 3,
    edgesCount: 3,
    tags: ['Cycle', 'Clique', 'Odd Cycle'],
  },
  cycle5: {
    id: 'cycle5',
    name: 'Cycle C₅',
    description: 'Odd cycle of length 5. Cannot be 2-colored, requires 3 colors.',
    chromaticNumber: 3,
    nodesCount: 5,
    edgesCount: 5,
    tags: ['Cycle', 'Odd Cycle', 'Planar'],
  },
  bipartite: {
    id: 'bipartite',
    name: 'Bipartite (K₃,₃)',
    description: 'Complete bipartite graph with two sets of 3 vertices each. Requires exactly 2 colors.',
    chromaticNumber: 2,
    nodesCount: 6,
    edgesCount: 9,
    tags: ['Bipartite', 'Non-Planar', '2-Colorable'],
  },
  petersen: {
    id: 'petersen',
    name: 'Petersen Graph',
    description: 'Famous 10-vertex, 15-edge cubic graph with girth 5. Chromatic number is 3.',
    chromaticNumber: 3,
    nodesCount: 10,
    edgesCount: 15,
    tags: ['Cubic', 'Symmetric', 'Hypohamiltonian'],
  },
  complete5: {
    id: 'complete5',
    name: 'Complete Graph K₅',
    description: 'Every pair of vertices is connected. Requires 5 colors; non-planar by Kuratowski.',
    chromaticNumber: 5,
    nodesCount: 5,
    edgesCount: 10,
    tags: ['Complete', 'Clique', 'Non-Planar'],
  },
  wheel6: {
    id: 'wheel6',
    name: 'Wheel Graph W₆',
    description: 'Central hub connected to a 5-vertex outer cycle. Requires 4 colors.',
    chromaticNumber: 4,
    nodesCount: 6,
    edgesCount: 10,
    tags: ['Wheel', 'Planar', 'Hub'],
  },
  planar: {
    id: 'planar',
    name: 'Planar Map (8 Regions)',
    description: 'Dual graph of an 8-country territorial map. Demonstrates the Four Color Theorem.',
    chromaticNumber: 4,
    nodesCount: 8,
    edgesCount: 14,
    tags: ['Planar', 'Map Coloring', '4-Color Theorem'],
  },
  grid: {
    id: 'grid',
    name: 'Grid 3x3',
    description: '2D lattice graph. Bipartite (trees/grids are always 2-colorable).',
    chromaticNumber: 2,
    nodesCount: 9,
    edgesCount: 12,
    tags: ['Grid', 'Bipartite', 'Planar'],
  },
};

export function getPresetGraph(presetId: PresetGraphId): GraphData {
  switch (presetId) {
    case 'triangle': {
      const radius = 2.4;
      const nodes = [
        { id: '1', label: 'A', position: { x: 0, y: radius, z: 0 } },
        { id: '2', label: 'B', position: { x: -radius * 0.866, y: -radius * 0.5, z: 0.5 } },
        { id: '3', label: 'C', position: { x: radius * 0.866, y: -radius * 0.5, z: -0.5 } },
      ];
      const edges = [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-1', source: '3', target: '1' },
      ];
      return { nodes, edges };
    }

    case 'cycle5': {
      const radius = 2.6;
      const nodes = Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        return {
          id: `${i + 1}`,
          label: `V${i + 1}`,
          position: {
            x: Number((radius * Math.cos(angle)).toFixed(2)),
            y: Number((radius * Math.sin(angle)).toFixed(2)),
            z: Number((Math.sin(angle * 2) * 0.6).toFixed(2)),
          },
        };
      });
      const edges = [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e4-5', source: '4', target: '5' },
        { id: 'e5-1', source: '5', target: '1' },
      ];
      return { nodes, edges };
    }

    case 'bipartite': {
      // K3,3 with left column and right column spaced nicely
      const nodes = [
        { id: '1', label: 'L1', position: { x: -2.5, y: 1.8, z: 0.5 } },
        { id: '2', label: 'L2', position: { x: -2.5, y: 0.0, z: -0.5 } },
        { id: '3', label: 'L3', position: { x: -2.5, y: -1.8, z: 0.5 } },
        { id: '4', label: 'R1', position: { x: 2.5, y: 1.8, z: -0.5 } },
        { id: '5', label: 'R2', position: { x: 2.5, y: 0.0, z: 0.5 } },
        { id: '6', label: 'R3', position: { x: 2.5, y: -1.8, z: -0.5 } },
      ];
      const edges: { id: string; source: string; target: string }[] = [];
      for (let l = 1; l <= 3; l++) {
        for (let r = 4; r <= 6; r++) {
          edges.push({ id: `e${l}-${r}`, source: `${l}`, target: `${r}` });
        }
      }
      return { nodes, edges };
    }

    case 'petersen': {
      // Outer 5-gon (radius 3.2) and inner 5-star (radius 1.6)
      const outerR = 3.2;
      const innerR = 1.6;
      const nodes = [];
      // Outer 5: 1..5
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        nodes.push({
          id: `${i + 1}`,
          label: `O${i + 1}`,
          position: {
            x: Number((outerR * Math.cos(angle)).toFixed(2)),
            y: Number((outerR * Math.sin(angle)).toFixed(2)),
            z: Number((Math.sin(angle) * 0.4).toFixed(2)),
          },
        });
      }
      // Inner 5: 6..10
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        nodes.push({
          id: `${i + 6}`,
          label: `I${i + 1}`,
          position: {
            x: Number((innerR * Math.cos(angle)).toFixed(2)),
            y: Number((innerR * Math.sin(angle)).toFixed(2)),
            z: Number((-Math.sin(angle) * 0.4).toFixed(2)),
          },
        });
      }
      const edges = [
        // Outer cycle
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e4-5', source: '4', target: '5' },
        { id: 'e5-1', source: '5', target: '1' },
        // Outer to Inner spokes
        { id: 'e1-6', source: '1', target: '6' },
        { id: 'e2-7', source: '2', target: '7' },
        { id: 'e3-8', source: '3', target: '8' },
        { id: 'e4-9', source: '4', target: '9' },
        { id: 'e5-10', source: '5', target: '10' },
        // Inner star (connect step of 2: 6-8, 8-10, 10-7, 7-9, 9-6)
        { id: 'e6-8', source: '6', target: '8' },
        { id: 'e8-10', source: '8', target: '10' },
        { id: 'e10-7', source: '10', target: '7' },
        { id: 'e7-9', source: '7', target: '9' },
        { id: 'e9-6', source: '9', target: '6' },
      ];
      return { nodes, edges };
    }

    case 'complete5': {
      const radius = 2.6;
      const nodes = Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        return {
          id: `${i + 1}`,
          label: `K${i + 1}`,
          position: {
            x: Number((radius * Math.cos(angle)).toFixed(2)),
            y: Number((radius * Math.sin(angle)).toFixed(2)),
            z: Number((Math.cos(angle * 2) * 0.8).toFixed(2)),
          },
        };
      });
      const edges: { id: string; source: string; target: string }[] = [];
      for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
          edges.push({ id: `e${i + 1}-${j + 1}`, source: `${i + 1}`, target: `${j + 1}` });
        }
      }
      return { nodes, edges };
    }

    case 'wheel6': {
      const radius = 2.8;
      // Central hub + 5 rim nodes
      const nodes = [
        { id: '1', label: 'Hub', position: { x: 0, y: 0, z: 1.0 } },
      ];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        nodes.push({
          id: `${i + 2}`,
          label: `R${i + 1}`,
          position: {
            x: Number((radius * Math.cos(angle)).toFixed(2)),
            y: Number((radius * Math.sin(angle)).toFixed(2)),
            z: -0.4,
          },
        });
      }
      const edges = [
        // Spoke edges from Hub (1) to all Rim (2..6)
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e1-3', source: '1', target: '3' },
        { id: 'e1-4', source: '1', target: '4' },
        { id: 'e1-5', source: '1', target: '5' },
        { id: 'e1-6', source: '1', target: '6' },
        // Rim cycle
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e4-5', source: '4', target: '5' },
        { id: 'e5-6', source: '5', target: '6' },
        { id: 'e6-2', source: '6', target: '2' },
      ];
      return { nodes, edges };
    }

    case 'planar': {
      // 8 regions sharing boundaries
      const nodes = [
        { id: '1', label: 'North', position: { x: 0.0, y: 2.8, z: 0.2 } },
        { id: '2', label: 'West', position: { x: -2.5, y: 1.0, z: -0.3 } },
        { id: '3', label: 'East', position: { x: 2.5, y: 1.0, z: 0.3 } },
        { id: '4', label: 'Central', position: { x: 0.0, y: 0.5, z: 0.8 } },
        { id: '5', label: 'Mid-West', position: { x: -1.6, y: -1.2, z: -0.2 } },
        { id: '6', label: 'Mid-East', position: { x: 1.6, y: -1.2, z: 0.2 } },
        { id: '7', label: 'South-Bay', position: { x: 0.0, y: -2.0, z: 0.0 } },
        { id: '8', label: 'Isle', position: { x: 3.2, y: -2.4, z: -0.4 } },
      ];
      const edges = [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e1-4', source: '1', target: '4' },
        { id: 'e1-3', source: '1', target: '3' },
        { id: 'e2-4', source: '2', target: '4' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e2-5', source: '2', target: '5' },
        { id: 'e4-5', source: '4', target: '5' },
        { id: 'e4-6', source: '4', target: '6' },
        { id: 'e3-6', source: '3', target: '6' },
        { id: 'e5-6', source: '5', target: '6' },
        { id: 'e5-7', source: '5', target: '7' },
        { id: 'e6-7', source: '6', target: '7' },
        { id: 'e6-8', source: '6', target: '8' },
        { id: 'e7-8', source: '7', target: '8' },
      ];
      return { nodes, edges };
    }

    case 'grid': {
      const nodes = [];
      const edges = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const id = `${r * 3 + c + 1}`;
          nodes.push({
            id,
            label: `(${r},${c})`,
            position: {
              x: (c - 1) * 2.2,
              y: -(r - 1) * 2.2,
              z: ((r + c) % 2 === 0 ? 0.3 : -0.3),
            },
          });
        }
      }
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const u = r * 3 + c + 1;
          if (c < 2) {
            const v = r * 3 + c + 2;
            edges.push({ id: `e${u}-${v}`, source: `${u}`, target: `${v}` });
          }
          if (r < 2) {
            const v = (r + 1) * 3 + c + 1;
            edges.push({ id: `e${u}-${v}`, source: `${u}`, target: `${v}` });
          }
        }
      }
      return { nodes, edges };
    }
  }
}

export function generateRandomGraph(nodeCount: number = 7, edgeProbability: number = 0.4): GraphData {
  const n = Math.max(3, Math.min(nodeCount, 16));
  const p = Math.max(0.15, Math.min(edgeProbability, 0.8));
  const nodes = [];
  const edges = [];

  const radius = 2.8;
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n;
    const phi = ((i % 3) - 1) * 0.4;
    nodes.push({
      id: `${i + 1}`,
      label: `V${i + 1}`,
      position: {
        x: Number((radius * Math.cos(angle)).toFixed(2)),
        y: Number((radius * Math.sin(angle)).toFixed(2)),
        z: Number((Math.sin(angle * 2 + phi) * 1.0).toFixed(2)),
      },
    });
  }

  // Ensure connected graph with spanning tree first
  const connected = [1];
  const unvisited = Array.from({ length: n - 1 }, (_, i) => i + 2);
  while (unvisited.length > 0) {
    const uIdx = Math.floor(Math.random() * connected.length);
    const u = connected[uIdx];
    const vIdx = Math.floor(Math.random() * unvisited.length);
    const v = unvisited.splice(vIdx, 1)[0];
    edges.push({ id: `e${Math.min(u, v)}-${Math.max(u, v)}`, source: `${u}`, target: `${v}` });
    connected.push(v);
  }

  // Add random edges according to probability
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      const edgeExists = edges.some(
        (e) => (e.source === `${i}` && e.target === `${j}`) || (e.source === `${j}` && e.target === `${i}`)
      );
      if (!edgeExists && Math.random() < p) {
        edges.push({ id: `e${i}-${j}`, source: `${i}`, target: `${j}` });
      }
    }
  }

  return { nodes, edges };
}
