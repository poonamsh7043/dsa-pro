import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGraphStore } from '../../store/graphStore';
import { validateColoring } from '../../algorithms/common';
import confetti from 'canvas-confetti';
import { Palette, CheckCircle2, AlertOctagon, Undo2, Hash } from 'lucide-react';

export const StatsPanel: React.FC = () => {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const steps = useGraphStore((s) => s.steps);
  const currentStepIndex = useGraphStore((s) => s.currentStepIndex);

  const step = steps[currentStepIndex];
  const currentColors = step ? step.snapshot.colors : {};
  const validation = validateColoring(nodes, edges, currentColors);

  // Count backtracks and conflicts up to current step
  const backtracksCount = steps
    .slice(0, currentStepIndex + 1)
    .filter((s) => s.action === 'backtrack' || s.action === 'conflict').length;

  const isCompletedStep = step?.action === 'done' || currentStepIndex === steps.length - 1;
  const isFullyValid = validation.isComplete && validation.isValid;

  const confettiFired = useRef(false);

  useEffect(() => {
    if (isCompletedStep && isFullyValid && !confettiFired.current) {
      confettiFired.current = true;
      // Monochrome confetti burst: pure white, silver, slate
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ffffff', '#cccccc', '#888888', '#e5e5e5'],
        ticks: 180,
      });
    } else if (!isCompletedStep) {
      confettiFired.current = false;
    }
  }, [isCompletedStep, isFullyValid]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {/* Colors Used */}
      <div className="bg-mono-950 border border-mono-850 rounded-lg p-2.5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-mono-400 text-[11px] font-mono">
          <Palette className="w-3.5 h-3.5 text-mono-400" />
          <span>COLORS USED</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <motion.span
            key={validation.colorsUsed}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-xl font-mono font-bold text-white tabular-nums"
          >
            {validation.colorsUsed}
          </motion.span>
          <span className="text-[10px] font-mono text-mono-500">
            {validation.colorsUsed === 1 ? 'class' : 'classes'}
          </span>
        </div>
      </div>

      {/* Steps Executed */}
      <div className="bg-mono-950 border border-mono-850 rounded-lg p-2.5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-mono-400 text-[11px] font-mono">
          <Hash className="w-3.5 h-3.5 text-mono-400" />
          <span>CURRENT STEP</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <motion.span
            key={currentStepIndex}
            initial={{ y: -2 }}
            animate={{ y: 0 }}
            className="text-xl font-mono font-bold text-white tabular-nums"
          >
            {Math.min(currentStepIndex + 1, steps.length)}
          </motion.span>
          <span className="text-[10px] font-mono text-mono-500">/ {steps.length}</span>
        </div>
      </div>

      {/* Backtracks / Conflicts */}
      <div className="bg-mono-950 border border-mono-850 rounded-lg p-2.5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-mono-400 text-[11px] font-mono">
          <Undo2 className="w-3.5 h-3.5 text-mono-400" />
          <span>BACKTRACKS</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <motion.span
            key={backtracksCount}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="text-xl font-mono font-bold text-white tabular-nums"
          >
            {backtracksCount}
          </motion.span>
          <span className="text-[10px] font-mono text-mono-500">events</span>
        </div>
      </div>

      {/* Validation Status Badge */}
      <div className="bg-mono-950 border border-mono-850 rounded-lg p-2.5 flex flex-col gap-1 justify-between">
        <div className="flex items-center gap-1.5 text-mono-400 text-[11px] font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-mono-400" />
          <span>STATUS</span>
        </div>
        <div>
          {isFullyValid ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-black font-mono font-bold text-[11px] border border-white shadow-sm">
              <span>Valid coloring ✔</span>
            </div>
          ) : !validation.isValid ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-black font-mono font-bold text-[11px] border border-white animate-shake">
              <AlertOctagon className="w-3 h-3 text-black" />
              <span>Conflict ✖</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-mono-900 text-mono-300 font-mono text-[11px] border border-mono-750">
              <span>Coloring in progress...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
