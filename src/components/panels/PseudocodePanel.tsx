import React from 'react';
import { motion } from 'framer-motion';
import { useGraphStore } from '../../store/graphStore';
import { ALGORITHM_METAS } from '../../algorithms';
import { Code2 } from 'lucide-react';

export const PseudocodePanel: React.FC = () => {
  const selectedAlgorithm = useGraphStore((s) => s.selectedAlgorithm);
  const steps = useGraphStore((s) => s.steps);
  const currentStepIndex = useGraphStore((s) => s.currentStepIndex);

  const meta = ALGORITHM_METAS[selectedAlgorithm];
  const currentStep = steps[currentStepIndex];
  const activeLine = currentStep ? currentStep.pseudocodeLine : 1;

  return (
    <div className="bg-mono-950 border border-mono-850 rounded-lg p-3.5 flex flex-col gap-2.5 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="flex items-center gap-1.5 text-mono-300 font-semibold">
          <Code2 className="w-3.5 h-3.5 text-mono-400" />
          <span>ALGORITHM PSEUDOCODE</span>
        </span>
        <span className="text-[10px] text-mono-500 font-mono">
          Complexity: <span className="text-mono-300">{meta.timeComplexity}</span>
        </span>
      </div>

      {/* Code Block */}
      <div className="relative font-mono text-xs overflow-x-auto py-1 flex flex-col gap-0.5 bg-black/60 rounded border border-mono-900 p-2">
        {meta.pseudocode.map((lineObj) => {
          const isHighlighted = lineObj.line === activeLine;

          return (
            <div
              key={lineObj.line}
              className={`relative flex items-center py-0.5 px-2 rounded transition-colors ${
                isHighlighted ? 'text-black font-semibold' : 'text-mono-400 hover:text-mono-200'
              }`}
            >
              {/* Sliding Highlight Bar with Framer Motion layoutId */}
              {isHighlighted && (
                <motion.div
                  layoutId="pseudocode-active-line"
                  className="absolute inset-0 bg-white rounded shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              {/* Line Number */}
              <span
                className={`relative z-10 w-6 select-none text-[10px] tabular-nums ${
                  isHighlighted ? 'text-black/60' : 'text-mono-600'
                }`}
              >
                {lineObj.line}
              </span>

              {/* Line Code */}
              <span
                className="relative z-10 whitespace-pre"
                style={{ paddingLeft: `${lineObj.indent * 1.2}rem` }}
              >
                {lineObj.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
