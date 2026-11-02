import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '../../store/graphStore';
import { runAllAlgorithmsComparison } from '../../algorithms';
import { X, BarChart2, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { AlgorithmType } from '../../types/algorithm';

export const ComparisonModal: React.FC = () => {
  const showComparisonModal = useGraphStore((s) => s.showComparisonModal);
  const setShowComparisonModal = useGraphStore((s) => s.setShowComparisonModal);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const backtrackingM = useGraphStore((s) => s.backtrackingM);
  const setSelectedAlgorithm = useGraphStore((s) => s.setSelectedAlgorithm);

  const comparisonData = useMemo(() => {
    if (!showComparisonModal) return [];
    return runAllAlgorithmsComparison(nodes, edges, backtrackingM);
  }, [showComparisonModal, nodes, edges, backtrackingM]);

  if (!showComparisonModal) return null;

  const maxColors = Math.max(...comparisonData.map((d) => d.colorsUsed), 1);
  const maxSteps = Math.max(...comparisonData.map((d) => d.totalSteps), 1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-black border border-mono-750 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-mono-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-white text-black flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-mono font-bold text-base text-white tracking-tight">
                  ALGORITHM BENCHMARK & COMPARISON
                </h2>
                <p className="text-xs text-mono-400 font-mono">
                  Evaluating all 5 coloring algorithms on current graph (|V|={nodes.length}, |E|={edges.length})
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowComparisonModal(false)}
              className="p-1.5 rounded-lg text-mono-400 hover:text-white hover:bg-mono-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex flex-col gap-6">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Colors Used Horizontal Bar Chart */}
              <div className="bg-mono-950 border border-mono-850 p-4 rounded-lg flex flex-col gap-3">
                <span className="font-mono text-xs font-semibold text-mono-300">
                  COLORS USED (LOWER IS BETTER)
                </span>
                <div className="flex flex-col gap-2.5">
                  {comparisonData.map((item) => {
                    const pct = Math.max(10, (item.colorsUsed / maxColors) * 100);
                    return (
                      <div key={item.algorithm} className="flex flex-col gap-1 font-mono text-xs">
                        <div className="flex justify-between text-mono-300">
                          <span>{item.name}</span>
                          <span className="font-bold text-white">{item.colorsUsed} colors</span>
                        </div>
                        <div className="w-full h-2.5 bg-mono-900 rounded-sm overflow-hidden border border-mono-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full bg-white rounded-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Steps Bar Chart */}
              <div className="bg-mono-950 border border-mono-850 p-4 rounded-lg flex flex-col gap-3">
                <span className="font-mono text-xs font-semibold text-mono-300">
                  TOTAL STEPS / EXPLORATION DEPTH
                </span>
                <div className="flex flex-col gap-2.5">
                  {comparisonData.map((item) => {
                    const pct = Math.max(8, (item.totalSteps / maxSteps) * 100);
                    return (
                      <div key={item.algorithm} className="flex flex-col gap-1 font-mono text-xs">
                        <div className="flex justify-between text-mono-300">
                          <span>{item.name}</span>
                          <span className="font-bold text-white">{item.totalSteps} steps</span>
                        </div>
                        <div className="w-full h-2.5 bg-mono-900 rounded-sm overflow-hidden border border-mono-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full bg-mono-300 rounded-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="border border-mono-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-mono-900 border-b border-mono-800 text-mono-400">
                    <th className="p-3">Algorithm</th>
                    <th className="p-3">Colors Used</th>
                    <th className="p-3">Steps</th>
                    <th className="p-3">Backtracks</th>
                    <th className="p-3">Complexity</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Switch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mono-850">
                  {comparisonData.map((item) => (
                    <tr key={item.algorithm} className="hover:bg-mono-900/40 transition-colors">
                      <td className="p-3 font-bold text-white">{item.name}</td>
                      <td className="p-3 text-mono-200">
                        <span className="px-2 py-0.5 bg-mono-850 rounded border border-mono-700">
                          {item.colorsUsed}
                        </span>
                      </td>
                      <td className="p-3 text-mono-300">{item.totalSteps}</td>
                      <td className="p-3 text-mono-300">{item.backtracks}</td>
                      <td className="p-3 text-mono-400 text-[11px]">{item.timeComplexity}</td>
                      <td className="p-3">
                        {item.isValid ? (
                          <span className="inline-flex items-center gap-1 text-white font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-mono-400">
                            <AlertTriangle className="w-3.5 h-3.5 text-white" /> Conflict
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedAlgorithm(item.algorithm as AlgorithmType);
                            setShowComparisonModal(false);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-mono-200 text-black font-semibold rounded text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <span>Visualize</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
