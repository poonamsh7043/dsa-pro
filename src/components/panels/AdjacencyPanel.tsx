import React, { useState } from 'react';
import { useGraphStore } from '../../store/graphStore';
import { buildAdjacency } from '../../algorithms/common';
import { X, Network, Table } from 'lucide-react';

export const AdjacencyPanel: React.FC = () => {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const showAdjacencyPanel = useGraphStore((s) => s.showAdjacencyPanel);
  const setShowAdjacencyPanel = useGraphStore((s) => s.setShowAdjacencyPanel);

  const [activeTab, setActiveTab] = useState<'matrix' | 'list'>('matrix');
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

  if (!showAdjacencyPanel) return null;

  const { adjacencyList, degreeMap, nodesMap } = buildAdjacency(nodes, edges);

  // Build matrix
  const matrix: number[][] = [];
  const n = nodes.length;
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      const u = nodes[i].id;
      const v = nodes[j].id;
      const isConnected = (adjacencyList[u] || []).includes(v);
      matrix[i][j] = isConnected ? 1 : 0;
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-black/95 border-l border-mono-800 z-30 shadow-2xl flex flex-col backdrop-blur-md">
      {/* Header */}
      <div className="h-14 border-b border-mono-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-mono-400" />
          <span className="font-mono font-bold text-sm text-white">GRAPH TOPOLOGY</span>
        </div>
        <button
          onClick={() => setShowAdjacencyPanel(false)}
          className="p-1 text-mono-400 hover:text-white rounded hover:bg-mono-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-mono-800 bg-mono-950 px-4 py-2 gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
            activeTab === 'matrix'
              ? 'bg-white text-black font-bold'
              : 'text-mono-400 hover:text-white hover:bg-mono-900'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Matrix ({n}×{n})</span>
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
            activeTab === 'list'
              ? 'bg-white text-black font-bold'
              : 'text-mono-400 hover:text-white hover:bg-mono-900'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Adjacency List</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-mono text-xs">
        {activeTab === 'matrix' ? (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-mono-500">
              Symmetric binary adjacency matrix A where A[i][j] = 1 indicates an edge.
            </span>

            {n > 12 ? (
              <div className="text-[11px] text-mono-400 bg-mono-900 border border-mono-800 p-2 rounded">
                Matrix is large ({n} nodes). Scroll horizontally to inspect.
              </div>
            ) : null}

            <div className="overflow-x-auto border border-mono-800 rounded bg-mono-950 p-2">
              <table className="border-collapse text-center mx-auto text-[11px]">
                <thead>
                  <tr>
                    <th className="p-1 text-mono-600 font-normal"></th>
                    {nodes.map((node, j) => (
                      <th
                        key={node.id}
                        className={`p-1.5 text-mono-400 font-semibold ${
                          hoveredCell?.c === j ? 'text-white bg-mono-850' : ''
                        }`}
                      >
                        {node.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((rowNode, i) => (
                    <tr key={rowNode.id}>
                      <td
                        className={`p-1.5 text-mono-400 font-semibold text-right ${
                          hoveredCell?.r === i ? 'text-white bg-mono-850' : ''
                        }`}
                      >
                        {rowNode.label}
                      </td>
                      {nodes.map((colNode, j) => {
                        const val = matrix[i]?.[j] ?? 0;
                        const isHovered = hoveredCell?.r === i && hoveredCell?.c === j;
                        const isCross = hoveredCell?.r === i || hoveredCell?.c === j;

                        return (
                          <td
                            key={colNode.id}
                            onMouseEnter={() => setHoveredCell({ r: i, c: j })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`w-6 h-6 border border-mono-900 cursor-default transition-colors ${
                              val === 1
                                ? isHovered
                                  ? 'bg-white text-black font-bold ring-2 ring-white'
                                  : 'bg-mono-200 text-black font-bold'
                                : isCross
                                ? 'bg-mono-900 text-mono-600'
                                : 'text-mono-700'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-mono-500">
              Live adjacency list representing neighbors and degrees for all {n} vertices.
            </span>

            <div className="flex flex-col gap-1.5">
              {nodes.map((node) => {
                const neighbors = adjacencyList[node.id] || [];
                const deg = degreeMap[node.id] || 0;

                return (
                  <div
                    key={node.id}
                    className="p-2 bg-mono-950 border border-mono-850 rounded flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-mono-300">
                      <span className="font-bold text-white">{node.label}</span>
                      <span className="text-[10px] text-mono-500">deg(v) = {deg}</span>
                    </div>
                    <div className="text-[11px] text-mono-400">
                      Neighbors: {neighbors.length > 0 ? (
                        <span className="text-white">
                          {neighbors.map((nbrId) => nodesMap[nbrId]?.label || nbrId).join(', ')}
                        </span>
                      ) : (
                        <span className="text-mono-600 italic">None (Isolated node)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
