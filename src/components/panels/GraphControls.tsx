import React from 'react';
import { useGraphStore } from '../../store/graphStore';
import { PlusCircle, Share2, Trash2, XCircle, Shuffle } from 'lucide-react';

interface GraphControlsProps {
  onOpenRandomModal: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({ onOpenRandomModal }) => {
  const editorMode = useGraphStore((s) => s.editorMode);
  const setEditorMode = useGraphStore((s) => s.setEditorMode);
  const edgeStartNodeId = useGraphStore((s) => s.edgeStartNodeId);
  const cancelAddEdge = useGraphStore((s) => s.cancelAddEdge);
  const addVertex = useGraphStore((s) => s.addVertex);
  const clearGraph = useGraphStore((s) => s.clearGraph);
  const nodes = useGraphStore((s) => s.nodes);

  const startNodeLabel = nodes.find((n) => n.id === edgeStartNodeId)?.label;

  return (
    <div className="bg-mono-950 border border-mono-850 rounded-lg p-3 flex flex-col gap-2 shadow-md">
      <div className="flex items-center justify-between text-xs font-mono text-mono-400">
        <span className="font-semibold text-mono-300">GRAPH EDITOR</span>
        {editorMode === 'add-edge' && edgeStartNodeId && (
          <span className="text-[10px] text-white bg-mono-850 px-1.5 py-0.5 rounded border border-mono-700 animate-pulse">
            Selected: {startNodeLabel} → Click target
          </span>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {/* Add Vertex */}
        <button
          onClick={addVertex}
          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-mono-900 hover:bg-mono-800 text-mono-200 hover:text-white border border-mono-750 hover:border-mono-500 rounded text-xs font-mono transition-colors"
          title="Add a new vertex to the canvas"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Vertex</span>
        </button>

        {/* Add Edge */}
        <button
          onClick={() => {
            if (editorMode === 'add-edge') {
              setEditorMode('select');
              cancelAddEdge();
            } else {
              setEditorMode('add-edge');
            }
          }}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-mono border transition-colors ${
            editorMode === 'add-edge'
              ? 'bg-white text-black border-white font-bold'
              : 'bg-mono-900 hover:bg-mono-800 text-mono-200 hover:text-white border-mono-750 hover:border-mono-500'
          }`}
          title="Click two vertices in 3D scene to connect with an edge"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{editorMode === 'add-edge' ? 'Cancel' : '+ Edge'}</span>
        </button>

        {/* Random Graph */}
        <button
          onClick={onOpenRandomModal}
          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-mono-900 hover:bg-mono-800 text-mono-200 hover:text-white border border-mono-750 hover:border-mono-500 rounded text-xs font-mono transition-colors"
          title="Generate random graph"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Random</span>
        </button>

        {/* Delete Mode */}
        <button
          onClick={() => setEditorMode(editorMode === 'delete' ? 'select' : 'delete')}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-mono border transition-colors ${
            editorMode === 'delete'
              ? 'bg-white text-black border-white font-bold'
              : 'bg-mono-900 hover:bg-mono-800 text-mono-200 hover:text-white border-mono-750 hover:border-mono-500'
          }`}
          title="Click any vertex or edge in the 3D scene to delete it"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{editorMode === 'delete' ? 'Exit Del' : 'Delete'}</span>
        </button>

        {/* Clear Graph */}
        <button
          onClick={clearGraph}
          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-mono-900 hover:bg-mono-800 text-mono-300 hover:text-white border border-mono-750 hover:border-mono-500 rounded text-xs font-mono transition-colors"
          title="Clear all vertices and edges"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Editor Status Banner */}
      {editorMode === 'add-edge' && (
        <div className="bg-mono-900/90 border border-mono-800 rounded p-2 text-[11px] font-mono text-mono-300 flex items-center justify-between">
          <span>
            {edgeStartNodeId
              ? `Select second vertex to connect to ${startNodeLabel}...`
              : 'Click first vertex to start edge...'}
          </span>
          <button
            onClick={() => {
              setEditorMode('select');
              cancelAddEdge();
            }}
            className="text-mono-400 hover:text-white underline text-[10px]"
          >
            Cancel
          </button>
        </div>
      )}

      {editorMode === 'delete' && (
        <div className="bg-mono-900/90 border border-mono-700 rounded p-2 text-[11px] font-mono text-white flex items-center justify-between animate-pulse">
          <span>Click any node or edge in 3D to remove.</span>
          <button
            onClick={() => setEditorMode('select')}
            className="text-mono-300 hover:text-white underline text-[10px]"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
