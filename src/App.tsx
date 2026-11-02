import React, { useState } from 'react';
import { Header } from './components/panels/Header';
import { Graph3DCanvas } from './components/scene/Graph3DCanvas';
import { PlaybackControls } from './components/panels/PlaybackControls';
import { ExplanationPanel } from './components/panels/ExplanationPanel';
import { PseudocodePanel } from './components/panels/PseudocodePanel';
import { StatsPanel } from './components/panels/StatsPanel';
import { GraphControls } from './components/panels/GraphControls';
import { AdjacencyPanel } from './components/panels/AdjacencyPanel';
import { ComparisonModal } from './components/panels/ComparisonModal';
import { TheoryModal } from './components/panels/TheoryModal';
import { RandomGraphModal } from './components/panels/RandomGraphModal';

export const App: React.FC = () => {
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white font-sans overflow-hidden">
      {/* Top Header */}
      <Header onOpenRandomModal={() => setIsRandomModalOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left / Center 3D Viewport with bottom Playback Controls */}
        <main className="flex-1 flex flex-col h-1/2 lg:h-full relative overflow-hidden border-b lg:border-b-0 lg:border-r border-mono-800">
          <div className="flex-1 relative">
            <Graph3DCanvas />
          </div>
          <PlaybackControls />
        </main>

        {/* Right Editorial Analysis Panels */}
        <aside className="w-full lg:w-[440px] xl:w-[480px] h-1/2 lg:h-full overflow-y-auto bg-black p-4 flex flex-col gap-3.5 border-mono-800 select-none">
          {/* Real-time Validation & Metric Stats */}
          <StatsPanel />

          {/* Live Step Explanation & Dynamic Queue */}
          <ExplanationPanel />

          {/* Synchronized Pseudocode with Sliding Line Highlight */}
          <PseudocodePanel />

          {/* Interactive Graph Manipulation Controls */}
          <GraphControls onOpenRandomModal={() => setIsRandomModalOpen(true)} />
        </aside>
      </div>

      {/* Overlay Drawers & Modals */}
      <AdjacencyPanel />
      <ComparisonModal />
      <TheoryModal />
      <RandomGraphModal
        isOpen={isRandomModalOpen}
        onClose={() => setIsRandomModalOpen(false)}
      />
    </div>
  );
};

export default App;
