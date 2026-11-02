import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '../../store/graphStore';
import { getColorDef, getNodeTextColor } from '../../utils/colors';
import { AlertTriangle, CheckCircle, Info, RefreshCw, Slash, ListOrdered } from 'lucide-react';

export const ExplanationPanel: React.FC = () => {
  const steps = useGraphStore((s) => s.steps);
  const currentStepIndex = useGraphStore((s) => s.currentStepIndex);
  const isColorMode = useGraphStore((s) => s.isColorMode);
  const selectedAlgorithm = useGraphStore((s) => s.selectedAlgorithm);
  const nodes = useGraphStore((s) => s.nodes);

  const step = steps[currentStepIndex];
  if (!step) return null;

  const forbiddenColors = step.forbiddenColors || [];
  const orderedNodes = step.snapshot.orderedNodes || [];
  const assignedColorDef = getColorDef(step.color);

  const getActionBadge = () => {
    switch (step.action) {
      case 'inspect':
        return {
          label: 'INSPECTING',
          icon: <Info className="w-3 h-3 text-mono-300" />,
          style: 'bg-mono-900 border-mono-700 text-mono-200',
        };
      case 'color':
        return {
          label: 'ASSIGN COLOR',
          icon: <CheckCircle className="w-3 h-3 text-white" />,
          style: 'bg-white text-black border-white font-bold',
        };
      case 'conflict':
        return {
          label: 'CONFLICT DETECTED',
          icon: <AlertTriangle className="w-3 h-3 text-black" />,
          style: 'bg-white text-black border-white animate-shake font-bold',
        };
      case 'backtrack':
        return {
          label: 'BACKTRACKING',
          icon: <RefreshCw className="w-3 h-3 text-white" />,
          style: 'bg-mono-800 text-white border-mono-500',
        };
      case 'sort':
        return {
          label: 'SORTING QUEUE',
          icon: <ListOrdered className="w-3 h-3 text-mono-300" />,
          style: 'bg-mono-900 border-mono-700 text-mono-300',
        };
      case 'done':
        return {
          label: 'COMPLETE',
          icon: <CheckCircle className="w-3 h-3 text-white" />,
          style: 'bg-white text-black border-white font-bold',
        };
    }
  };

  const actionBadge = getActionBadge();

  // Helper map node ID to label
  const nodeLabelMap = new Map(nodes.map((n) => [n.id, n.label]));

  return (
    <div className="bg-mono-950 border border-mono-850 rounded-lg p-4 flex flex-col gap-3 shadow-md">
      {/* Header with Action Badge and Step Counter */}
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border ${actionBadge.style}`}
        >
          {actionBadge.icon}
          <span>{actionBadge.label}</span>
        </div>

        <span className="font-mono text-xs text-mono-400">
          Step <span className="text-white font-bold">{currentStepIndex + 1}</span> of {steps.length}
        </span>
      </div>

      {/* Animated Title & Explanation */}
      <div className="min-h-[72px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex flex-col gap-1.5"
          >
            <h3 className="font-mono font-bold text-sm text-white tracking-tight flex items-center gap-2">
              {step.title}
              {assignedColorDef && (
                <span
                  className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold inline-flex items-center gap-1"
                  style={{
                    backgroundColor: isColorMode ? assignedColorDef.colorFill : assignedColorDef.monoFill,
                    color: getNodeTextColor(step.color, isColorMode),
                  }}
                >
                  {assignedColorDef.symbol} {assignedColorDef.label}
                </span>
              )}
            </h3>

            <p className="text-xs text-mono-300 leading-relaxed font-sans">{step.explanation}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Forbidden Colors Badge List */}
      {forbiddenColors.length > 0 && (
        <div className="pt-2 border-t border-mono-850 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-mono-400 flex items-center gap-1">
            <Slash className="w-3 h-3 text-mono-500" />
            Forbidden Colors:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {forbiddenColors.map((colIdx) => {
              const def = getColorDef(colIdx);
              if (!def) return null;
              return (
                <motion.span
                  key={colIdx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border border-mono-700 bg-mono-900 text-mono-200"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{
                      backgroundColor: isColorMode ? def.colorFill : def.monoFill,
                    }}
                  />
                  <span>
                    {def.label} ({def.symbol})
                  </span>
                </motion.span>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Sorted Queue (For Welsh-Powell degree order & DSatur saturation degrees) */}
      {orderedNodes.length > 0 && (selectedAlgorithm === 'welsh-powell' || selectedAlgorithm === 'dsatur') && (
        <div className="pt-2 border-t border-mono-850 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-mono-400">
            <span className="flex items-center gap-1">
              <ListOrdered className="w-3 h-3 text-mono-500" />
              {selectedAlgorithm === 'dsatur' ? 'Dynamic Saturation Queue (ρ):' : 'Degree-Descending Order:'}
            </span>
            <span className="text-[10px] text-mono-500">
              {selectedAlgorithm === 'dsatur' ? 'Max ρ picked first' : 'Highest deg first'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {orderedNodes.map((item) => {
              const label = nodeLabelMap.get(item.nodeId) || item.nodeId;
              const isCurrent = item.status === 'current';
              const isProcessed = item.status === 'processed';

              return (
                <motion.div
                  key={item.nodeId}
                  layout
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap border transition-colors ${
                    isCurrent
                      ? 'bg-white text-black border-white font-bold ring-2 ring-white/40'
                      : isProcessed
                      ? 'bg-mono-900/60 text-mono-400 border-mono-850'
                      : 'bg-mono-900 text-mono-200 border-mono-750'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`text-[9px] ${isCurrent ? 'text-black/70' : 'text-mono-500'}`}>
                    {selectedAlgorithm === 'dsatur' ? `ρ=${item.saturationDegree ?? 0}` : `d=${item.degree ?? 0}`}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
