import React, { useEffect, useRef } from 'react';
import { useGraphStore } from '../../store/graphStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const PlaybackControls: React.FC = () => {
  const steps = useGraphStore((s) => s.steps);
  const currentStepIndex = useGraphStore((s) => s.currentStepIndex);
  const isPlaying = useGraphStore((s) => s.isPlaying);
  const playbackSpeed = useGraphStore((s) => s.playbackSpeed);

  const play = useGraphStore((s) => s.play);
  const pause = useGraphStore((s) => s.pause);
  const stepForward = useGraphStore((s) => s.stepForward);
  const stepBackward = useGraphStore((s) => s.stepBackward);
  const resetPlayback = useGraphStore((s) => s.resetPlayback);
  const seekStep = useGraphStore((s) => s.seekStep);
  const setPlaybackSpeed = useGraphStore((s) => s.setPlaybackSpeed);

  const totalSteps = steps.length;
  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  // Autoplay interval runner
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const delay = Math.max(120, 1000 / playbackSpeed);
      timerRef.current = window.setInterval(() => {
        stepForward();
      }, delay);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, stepForward]);

  // Keyboard Shortcuts: Space (Play/Pause), Left (Step Back), Right (Step Fwd), R (Reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) pause();
        else play();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetPlayback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, stepForward, stepBackward, resetPlayback]);

  // Handle timeline scrubber drag/click
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetStep = Math.round(ratio * (totalSteps - 1));
    seekStep(targetStep);
  };

  return (
    <div className="border-t border-mono-800 bg-mono-950/90 backdrop-blur-md px-4 py-3 select-none flex flex-col gap-2.5">
      {/* Interactive Timeline Scrubber */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-mono-400 w-24 tabular-nums">
          Step <span className="text-white font-bold">{Math.min(currentStepIndex + 1, totalSteps)}</span> / {totalSteps}
        </span>

        <div
          onClick={handleScrubberClick}
          className="relative flex-1 h-3 flex items-center cursor-pointer group py-1"
          title="Click to jump to any step"
        >
          {/* Base Track */}
          <div className="w-full h-1 bg-mono-850 rounded-full overflow-hidden border border-mono-800">
            {/* Progress Fill */}
            <motion.div
              className="h-full bg-white transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Scrubber Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border border-black shadow-[0_0_8px_rgba(255,255,255,0.6)] group-hover:scale-125 transition-transform"
            style={{ left: `calc(${progressPercent}% - 6px)` }}
          />

          {/* Action markers on track */}
          <div className="absolute inset-0 pointer-events-none flex items-center">
            {totalSteps > 1 &&
              totalSteps <= 40 &&
              steps.map((st, i) => {
                const isConflict = st.action === 'conflict' || st.action === 'backtrack';
                if (!isConflict) return null;
                const pos = (i / (totalSteps - 1)) * 100;
                return (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-white ring-1 ring-black -translate-x-1/2"
                    style={{ left: `${pos}%` }}
                    title={`Conflict / Backtrack at step ${i + 1}`}
                  />
                );
              })}
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-mono-500" />
          <div className="flex bg-mono-900 border border-mono-800 rounded p-0.5 text-[11px] font-mono">
            {[0.5, 1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-white text-black font-semibold'
                    : 'text-mono-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Playback Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Reset */}
          <button
            onClick={resetPlayback}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-mono-900 hover:bg-mono-800 text-mono-300 hover:text-white border border-mono-800 hover:border-mono-600 rounded text-xs font-mono transition-colors"
            title="Reset to beginning (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Step Back */}
          <button
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            className="p-1.5 bg-mono-900 hover:bg-mono-800 disabled:opacity-40 disabled:cursor-not-allowed text-mono-300 hover:text-white border border-mono-800 rounded text-xs font-mono transition-colors"
            title="Step Back (Left Arrow)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={isPlaying ? pause : play}
            className="flex items-center gap-2 px-4 py-1.5 bg-white hover:bg-mono-200 text-black font-mono font-bold text-xs rounded transition-all shadow-md active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-black" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black ml-0.5" />
                <span>{currentStepIndex >= totalSteps - 1 ? 'REPLAY' : 'PLAY'}</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            className="p-1.5 bg-mono-900 hover:bg-mono-800 disabled:opacity-40 disabled:cursor-not-allowed text-mono-300 hover:text-white border border-mono-800 rounded text-xs font-mono transition-colors"
            title="Step Forward (Right Arrow)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard hints pill */}
        <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-mono-500">
          <span>
            <kbd className="px-1 py-0.5 bg-mono-900 border border-mono-800 rounded text-mono-400">Space</kbd> Play
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-mono-900 border border-mono-800 rounded text-mono-400">←</kbd>
            <kbd className="px-1 py-0.5 bg-mono-900 border border-mono-800 rounded text-mono-400 ml-0.5">→</kbd> Step
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-mono-900 border border-mono-800 rounded text-mono-400">R</kbd> Reset
          </span>
        </div>
      </div>
    </div>
  );
};
