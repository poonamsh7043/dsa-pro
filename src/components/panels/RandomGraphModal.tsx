import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '../../store/graphStore';
import { X, Shuffle, Sparkles } from 'lucide-react';

interface RandomGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RandomGraphModal: React.FC<RandomGraphModalProps> = ({ isOpen, onClose }) => {
  const loadRandom = useGraphStore((s) => s.loadRandom);

  const [nodeCount, setNodeCount] = useState<number>(8);
  const [edgeProbability, setEdgeProbability] = useState<number>(0.35);

  if (!isOpen) return null;

  const maxPossibleEdges = (nodeCount * (nodeCount - 1)) / 2;
  const estimatedEdges = Math.round(maxPossibleEdges * edgeProbability);

  const handleGenerate = () => {
    loadRandom(nodeCount, edgeProbability);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-black border border-mono-750 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-mono-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center">
                <Shuffle className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-mono font-bold text-sm text-white">RANDOM GRAPH GENERATOR</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-mono-400 hover:text-white hover:bg-mono-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 flex flex-col gap-4 font-mono text-xs">
            {/* Node Count Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-mono-300">
                <span>Number of Vertices (|V|):</span>
                <span className="font-bold text-white text-sm">{nodeCount}</span>
              </div>
              <input
                type="range"
                min={3}
                max={15}
                value={nodeCount}
                onChange={(e) => setNodeCount(parseInt(e.target.value))}
                className="w-full accent-white cursor-pointer bg-mono-800"
              />
              <span className="text-[10px] text-mono-500">Range: 3 to 15 nodes</span>
            </div>

            {/* Edge Density Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-mono-300">
                <span>Edge Connection Density (p):</span>
                <span className="font-bold text-white text-sm">{Math.round(edgeProbability * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.15}
                max={0.7}
                step={0.05}
                value={edgeProbability}
                onChange={(e) => setEdgeProbability(parseFloat(e.target.value))}
                className="w-full accent-white cursor-pointer bg-mono-800"
              />
              <span className="text-[10px] text-mono-500">
                Expected edges: ~{estimatedEdges} of {maxPossibleEdges} max
              </span>
            </div>

            {/* Hint */}
            <div className="p-2.5 rounded bg-mono-950 border border-mono-850 text-[11px] text-mono-400">
              Guarantees a connected graph spanning tree first, then adds random cross-edges according to probability p.
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-mono-850">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded text-mono-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-1.5 bg-white hover:bg-mono-200 text-black font-bold rounded flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Graph</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
