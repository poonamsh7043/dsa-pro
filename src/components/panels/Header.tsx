import React from 'react';
import { useGraphStore } from '../../store/graphStore';
import { AlgorithmType } from '../../types/algorithm';
import { PresetGraphId } from '../../types/graph';
import { PRESET_INFOS } from '../../utils/presets';
import { ALGORITHM_METAS } from '../../algorithms';
import {
  BarChart2,
  BookOpen,
  Grid as GridIcon,
  Shuffle,
} from 'lucide-react';

interface HeaderProps {
  onOpenRandomModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRandomModal }) => {
  const selectedAlgorithm = useGraphStore((s) => s.selectedAlgorithm);
  const setSelectedAlgorithm = useGraphStore((s) => s.setSelectedAlgorithm);
  const presetId = useGraphStore((s) => s.presetId);
  const loadPreset = useGraphStore((s) => s.loadPreset);
  const backtrackingM = useGraphStore((s) => s.backtrackingM);
  const setBacktrackingM = useGraphStore((s) => s.setBacktrackingM);

  const showAdjacencyPanel = useGraphStore((s) => s.showAdjacencyPanel);
  const setShowAdjacencyPanel = useGraphStore((s) => s.setShowAdjacencyPanel);
  const setShowComparisonModal = useGraphStore((s) => s.setShowComparisonModal);
  const setShowTheoryModal = useGraphStore((s) => s.setShowTheoryModal);

  return (
    <header className="h-14 border-b border-mono-800 bg-black/95 backdrop-blur-md px-4 flex items-center justify-between select-none z-20">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-white flex items-center justify-center text-black font-mono font-black text-xs shadow-sm">
            χ
          </div>
          <span className="font-mono font-bold tracking-tight text-sm text-white flex items-center gap-1.5">
            CHROMA<span className="text-mono-500 font-normal">.GRAPH</span>
          </span>
        </div>
        <span className="hidden md:inline-block text-[11px] font-mono text-mono-500 border-l border-mono-800 pl-3">
          3D GRAPH COLORING VISUALIZER
        </span>
      </div>

      {/* Center Controls: Algorithm & Preset Selectors */}
      <div className="flex items-center gap-2">
        {/* Algorithm Select */}
        <div className="flex items-center bg-mono-900 border border-mono-700 rounded p-0.5">
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value as AlgorithmType)}
            className="bg-transparent text-xs font-mono text-white px-2 py-1 outline-none cursor-pointer"
          >
            {Object.values(ALGORITHM_METAS).map((algo) => (
              <option key={algo.id} value={algo.id} className="bg-mono-900 text-white">
                {algo.name}
              </option>
            ))}
          </select>

          {/* If Backtracking, allow choosing m */}
          {selectedAlgorithm === 'backtracking' && (
            <div className="flex items-center border-l border-mono-700 pl-2 pr-1 gap-1 text-xs font-mono">
              <span className="text-mono-400">m =</span>
              <input
                type="number"
                min={2}
                max={8}
                value={backtrackingM}
                onChange={(e) => setBacktrackingM(parseInt(e.target.value) || 3)}
                className="w-10 bg-mono-800 border border-mono-600 rounded px-1 py-0.5 text-center text-white text-xs outline-none focus:border-white"
                title="Allowed number of colors for backtracking"
              />
            </div>
          )}
        </div>

        {/* Preset Select */}
        <div className="flex items-center bg-mono-900 border border-mono-700 rounded p-0.5">
          <select
            value={presetId}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'random') {
                onOpenRandomModal();
              } else if (val !== 'custom') {
                loadPreset(val as PresetGraphId);
              }
            }}
            className="bg-transparent text-xs font-mono text-white px-2 py-1 outline-none cursor-pointer"
          >
            <option value="custom" disabled hidden>
              Preset: Custom Graph
            </option>
            {Object.values(PRESET_INFOS).map((p) => (
              <option key={p.id} value={p.id} className="bg-mono-900 text-white">
                Preset: {p.name} (χ={p.chromaticNumber})
              </option>
            ))}
            <option value="random" className="bg-mono-900 text-white">
              🎲 Random Graph Generator...
            </option>
          </select>
        </div>

        {/* Quick Randomize Button */}
        <button
          onClick={onOpenRandomModal}
          className="p-1.5 bg-mono-900 hover:bg-mono-800 text-mono-300 hover:text-white border border-mono-700 hover:border-mono-500 rounded text-xs transition-colors"
          title="Open Random Graph Generator"
        >
          <Shuffle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Tools: Matrix, Compare, Theory */}
      <div className="flex items-center gap-2">
        {/* Toggle Live Adjacency Matrix */}
        <button
          onClick={() => setShowAdjacencyPanel(!showAdjacencyPanel)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono border transition-colors ${
            showAdjacencyPanel
              ? 'bg-white text-black border-white font-semibold'
              : 'bg-mono-900 text-mono-300 hover:text-white border-mono-700 hover:border-mono-500'
          }`}
          title="Toggle Live Adjacency List / Matrix"
        >
          <GridIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Matrix</span>
        </button>

        {/* Compare All Button */}
        <button
          onClick={() => setShowComparisonModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-mono-900 hover:bg-mono-800 text-mono-200 hover:text-white border border-mono-700 hover:border-mono-500 rounded text-xs font-mono transition-colors"
          title="Compare all algorithms on this graph"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Compare</span>
        </button>

        {/* Theory Modal Button */}
        <button
          onClick={() => setShowTheoryModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-mono-900 hover:bg-mono-800 text-mono-200 hover:text-white border border-mono-700 hover:border-mono-500 rounded text-xs font-mono transition-colors"
          title="Graph Coloring Theoretical Foundations & Theorems"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Theory</span>
        </button>
      </div>
    </header>
  );
};
