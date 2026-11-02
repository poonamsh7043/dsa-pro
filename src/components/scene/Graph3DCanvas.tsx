import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGraphStore } from '../../store/graphStore';
import { CameraController } from './CameraController';
import { GridFloor } from './GridFloor';
import { GraphNode3D } from './GraphNode3D';
import { GraphEdge3D } from './GraphEdge3D';
import { Camera, Layers, Play, Pause, Eye } from 'lucide-react';
import { COLOR_CLASSES } from '../../utils/colors';

const ForceSimulatorTick: React.FC = () => {
  const isSimulatingForces = useGraphStore((s) => s.isSimulatingForces);
  const tickForceSimulation = useGraphStore((s) => s.tickForceSimulation);

  useFrame(() => {
    if (isSimulatingForces) {
      tickForceSimulation();
    }
  });

  return null;
};

export const Graph3DCanvas: React.FC = () => {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const is2D = useGraphStore((s) => s.is2D);
  const toggle2D = useGraphStore((s) => s.toggle2D);
  const triggerCameraReset = useGraphStore((s) => s.triggerCameraReset);
  const isSimulatingForces = useGraphStore((s) => s.isSimulatingForces);
  const toggleForceSimulation = useGraphStore((s) => s.toggleForceSimulation);
  const isColorMode = useGraphStore((s) => s.isColorMode);
  const toggleColorMode = useGraphStore((s) => s.toggleColorMode);

  const steps = useGraphStore((s) => s.steps);
  const currentStepIndex = useGraphStore((s) => s.currentStepIndex);
  const currentStep = steps[currentStepIndex];

  const currentColors = currentStep?.snapshot?.colors || {};
  const activeNodeId = currentStep?.snapshot?.activeNodeId || null;
  const activeNeighbors = currentStep?.snapshot?.activeNeighbors || [];
  const conflictingNodes = currentStep?.snapshot?.conflictingNodes || [];
  const isBacktracking = currentStep?.action === 'backtrack';

  const nodesMap = React.useMemo(() => {
    const map = new Map();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Set of active edges
  const activeEdgeKeys = React.useMemo(() => {
    const set = new Set<string>();
    if (!activeNodeId) return set;
    activeNeighbors.forEach((nbrId) => {
      set.add(`${activeNodeId}-${nbrId}`);
      set.add(`${nbrId}-${activeNodeId}`);
    });
    return set;
  }, [activeNodeId, activeNeighbors]);

  // Set of conflict edges
  const conflictEdgeKeys = React.useMemo(() => {
    const set = new Set<string>();
    if (conflictingNodes.length >= 2) {
      for (let i = 0; i < conflictingNodes.length; i++) {
        for (let j = i + 1; j < conflictingNodes.length; j++) {
          set.add(`${conflictingNodes[i]}-${conflictingNodes[j]}`);
          set.add(`${conflictingNodes[j]}-${conflictingNodes[i]}`);
        }
      }
    }
    return set;
  }, [conflictingNodes]);

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden">
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 2.5, 8], fov: 48 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        shadows
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 8, 28]} />

        {/* Ambient & Rim Lighting */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[6, 8, 7]} intensity={1.4} castShadow />
        <directionalLight position={[-6, -4, -5]} intensity={0.5} />
        <pointLight position={[0, 4, 3]} intensity={0.8} color="#ffffff" />

        {/* Faint Grid Floor */}
        <GridFloor />

        {/* Dynamic Force Simulation Tick */}
        <ForceSimulatorTick />

        {/* Edges */}
        <group>
          {edges.map((edge) => {
            const isEdgeActive = activeEdgeKeys.has(`${edge.source}-${edge.target}`);
            const isEdgeConflict = conflictEdgeKeys.has(`${edge.source}-${edge.target}`);
            return (
              <GraphEdge3D
                key={edge.id}
                edge={edge}
                sourceNode={nodesMap.get(edge.source)}
                targetNode={nodesMap.get(edge.target)}
                isActive={isEdgeActive}
                isConflicting={isEdgeConflict}
              />
            );
          })}
        </group>

        {/* Vertices */}
        <group>
          {nodes.map((node) => {
            const isActive = activeNodeId === node.id;
            const isNeighbor = activeNeighbors.includes(node.id);
            const isConflicting = conflictingNodes.includes(node.id);
            const colorIndex = currentColors[node.id];

            return (
              <GraphNode3D
                key={node.id}
                node={node}
                isActive={isActive}
                isNeighbor={isNeighbor}
                isConflicting={isConflicting}
                isBacktracking={isBacktracking && isActive}
                colorIndex={colorIndex}
              />
            );
          })}
        </group>

        {/* Smooth Camera Controller */}
        <CameraController />
      </Canvas>

      {/* Top Floating Viewport Toolbar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Reset Camera */}
          <button
            onClick={triggerCameraReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-mono-900/90 hover:bg-mono-800 text-mono-200 hover:text-white border border-mono-700 hover:border-mono-500 rounded text-xs font-mono transition-colors shadow-lg backdrop-blur-md"
            title="Reset camera to default view"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>

          {/* 2D / 3D Layout Toggle */}
          <button
            onClick={toggle2D}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-colors border shadow-lg backdrop-blur-md ${
              is2D
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-mono-900/90 text-mono-300 hover:text-white border-mono-700 hover:border-mono-500'
            }`}
            title="Toggle between 3D spherical layout and flat 2D layout"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{is2D ? '2D Flat' : '3D Spatial'}</span>
          </button>

          {/* Force Simulation Toggle */}
          <button
            onClick={toggleForceSimulation}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-colors border shadow-lg backdrop-blur-md ${
              isSimulatingForces
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-mono-900/90 text-mono-300 hover:text-white border-mono-700 hover:border-mono-500'
            }`}
            title="Toggle physics spring/repulsion force layout"
          >
            {isSimulatingForces ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>Forces {isSimulatingForces ? 'On' : 'Off'}</span>
          </button>
        </div>

        {/* Color Palette Toggle & Graph Metric Pill */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleColorMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-colors border shadow-lg backdrop-blur-md ${
              isColorMode
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-mono-900/90 text-mono-300 hover:text-white border-mono-700 hover:border-mono-500'
            }`}
            title="Toggle between strictly monochrome shades and accessible color palette"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isColorMode ? 'Color Mode' : 'Monochrome'}</span>
          </button>

          <div className="px-2.5 py-1.5 bg-mono-900/90 border border-mono-800 rounded text-xs font-mono text-mono-400 backdrop-blur-md">
            |V| = <span className="text-white font-bold">{nodes.length}</span> |E| ={' '}
            <span className="text-white font-bold">{edges.length}</span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-mono-900/90 border border-mono-800 rounded text-[11px] font-mono text-mono-400 backdrop-blur-md pointer-events-auto">
          <span className="text-mono-500 font-semibold tracking-wider uppercase text-[10px]">Color Classes:</span>
          <div className="flex items-center gap-2.5 overflow-x-auto max-w-sm">
            {COLOR_CLASSES.slice(0, 6).map((c) => (
              <div key={c.index} className="flex items-center gap-1">
                <span
                  className="w-3.5 h-3.5 flex items-center justify-center rounded-sm text-[9px] font-bold"
                  style={{
                    backgroundColor: isColorMode ? c.colorFill : c.monoFill,
                    color: isColorMode ? c.colorText : c.monoText,
                    border: `1px solid ${isColorMode ? c.colorBorder : c.monoBorder}`,
                  }}
                >
                  {c.symbol}
                </span>
                <span className="text-mono-300">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
