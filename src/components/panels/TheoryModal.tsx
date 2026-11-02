import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '../../store/graphStore';
import { X, BookOpen, Cpu, Calendar, Grid, Globe, Award } from 'lucide-react';

export const TheoryModal: React.FC = () => {
  const showTheoryModal = useGraphStore((s) => s.showTheoryModal);
  const setShowTheoryModal = useGraphStore((s) => s.setShowTheoryModal);

  const [activeTab, setActiveTab] = useState<'concepts' | 'theorems' | 'applications' | 'complexity'>('concepts');

  if (!showTheoryModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-black border border-mono-750 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-mono-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-white text-black flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-mono font-bold text-base text-white tracking-tight">
                  GRAPH COLORING THEORY & MATHEMATICS
                </h2>
                <p className="text-xs text-mono-400 font-mono">
                  Formal definitions, classic theorems, algorithmic complexities, and real-world systems
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTheoryModal(false)}
              className="p-1.5 rounded-lg text-mono-400 hover:text-white hover:bg-mono-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-mono-800 bg-mono-950 px-6 py-2 gap-2 text-xs font-mono">
            {[
              { id: 'concepts', label: 'Definitions & χ(G)' },
              { id: 'theorems', label: 'Famous Theorems' },
              { id: 'applications', label: 'Real Applications' },
              { id: 'complexity', label: 'Algorithm Complexities' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-black font-bold'
                    : 'text-mono-400 hover:text-white hover:bg-mono-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto flex flex-col gap-6 font-sans text-sm text-mono-300 leading-relaxed">
            {activeTab === 'concepts' && (
              <div className="flex flex-col gap-4">
                <div className="bg-mono-950 border border-mono-850 p-4 rounded-lg flex flex-col gap-2">
                  <h3 className="font-mono font-bold text-white text-sm">Formal Definition: Proper Vertex Coloring</h3>
                  <p>
                    Given an undirected graph G = (V, E), a <strong className="text-white">proper vertex k-coloring</strong> is a function:
                  </p>
                  <pre className="p-2.5 bg-black border border-mono-800 rounded font-mono text-xs text-white">
                    c: V → &#123;1, 2, ..., k&#125;  such that  ∀ (u, v) ∈ E,  c(u) ≠ c(v)
                  </pre>
                  <p>
                    No two adjacent vertices may share the same color. Each color class <code className="text-mono-200 bg-mono-900 px-1 py-0.5 rounded font-mono">V_i = c⁻¹(i)</code> forms an <strong className="text-white">independent set</strong> (a set of mutually non-adjacent vertices).
                  </p>
                </div>

                <div className="bg-mono-950 border border-mono-850 p-4 rounded-lg flex flex-col gap-2">
                  <h3 className="font-mono font-bold text-white text-sm">Chromatic Number χ(G)</h3>
                  <p>
                    The <strong className="text-white">chromatic number χ(G)</strong> is the smallest integer k for which a proper k-coloring of G exists.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-mono-300">
                    <li><strong className="text-white">χ(G) = 1:</strong> Graph has no edges (completely empty graph).</li>
                    <li><strong className="text-white">χ(G) = 2:</strong> Graph is <strong className="text-white">bipartite</strong> (contains no odd cycles).</li>
                    <li><strong className="text-white">χ(K_n) = n:</strong> Complete graph of n vertices requires n distinct colors.</li>
                    <li><strong className="text-white">χ(C_n):</strong> If n is even, χ(C_n) = 2. If n is odd, χ(C_n) = 3.</li>
                    <li><strong className="text-white">Clique Lower Bound:</strong> χ(G) ≥ ω(G), where ω(G) is the clique number (size of largest complete subgraph).</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'theorems' && (
              <div className="flex flex-col gap-4">
                <div className="bg-mono-950 border border-mono-850 p-4 rounded-lg flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-white" />
                    <h3 className="font-mono font-bold text-white text-sm">Brooks' Theorem (1941)</h3>
                  </div>
                  <p>
                    For any connected graph G with maximum degree <strong className="text-white">Δ(G)</strong>:
                  </p>
                  <pre className="p-2.5 bg-black border border-mono-800 rounded font-mono text-xs text-white">
                    χ(G) ≤ Δ(G) + 1
                  </pre>
                  <p>
                    Furthermore, <strong className="text-white">χ(G) ≤ Δ(G)</strong> unless G is a <strong className="text-white">complete graph K_(Δ+1)</strong> or an <strong className="text-white">odd cycle C_(2k+1)</strong> (in which case χ(G) = Δ + 1).
                  </p>
                </div>

                <div className="bg-mono-950 border border-mono-850 p-4 rounded-lg flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-white" />
                    <h3 className="font-mono font-bold text-white text-sm">The Four Color Theorem (Appel & Haken 1976)</h3>
                  </div>
                  <p>
                    Every <strong className="text-white">planar graph</strong> (a graph that can be drawn on a plane without edge crossings) has chromatic number:
                  </p>
                  <pre className="p-2.5 bg-black border border-mono-800 rounded font-mono text-xs text-white">
                    χ(G) ≤ 4
                  </pre>
                  <p>
                    Famous as the first major mathematical theorem proved with heavy computer assistance, checking over 1,936 reducible configurations.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-mono-950 border border-mono-850 p-3.5 rounded-lg flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-white">
                    <Cpu className="w-4 h-4" />
                    <h4 className="font-mono font-bold text-xs">Compiler Register Allocation</h4>
                  </div>
                  <p className="text-xs text-mono-400">
                    Chaitin's algorithm models CPU variables with overlapping live ranges as an interference graph. Color classes correspond to available physical hardware registers (e.g., RAX, RBX).
                  </p>
                </div>

                <div className="bg-mono-950 border border-mono-850 p-3.5 rounded-lg flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-4 h-4" />
                    <h4 className="font-mono font-bold text-xs">Exam & Flight Scheduling</h4>
                  </div>
                  <p className="text-xs text-mono-400">
                    Courses with shared enrolled students cannot have exams at the same time slot. An edge links conflicting exams; colors represent non-conflicting time slots.
                  </p>
                </div>

                <div className="bg-mono-950 border border-mono-850 p-3.5 rounded-lg flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-white">
                    <Grid className="w-4 h-4" />
                    <h4 className="font-mono font-bold text-xs">Sudoku Puzzles</h4>
                  </div>
                  <p className="text-xs text-mono-400">
                    A 9x9 Sudoku grid is an 81-vertex graph where edges connect cells in the same row, column, or 3x3 box. Solving the puzzle is equivalent to completing a partial 9-coloring!
                  </p>
                </div>

                <div className="bg-mono-950 border border-mono-850 p-3.5 rounded-lg flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-white">
                    <Globe className="w-4 h-4" />
                    <h4 className="font-mono font-bold text-xs">Radio Frequency Assignment</h4>
                  </div>
                  <p className="text-xs text-mono-400">
                    Cellular towers located close to one another cannot transmit on the same electromagnetic frequency without destructive interference. Colors represent distinct frequency bands.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'complexity' && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-mono-400">
                  Deciding whether a general graph can be colored with <strong className="text-white">k colors for k ≥ 3 is NP-Complete</strong> (Karp's 21 NP-complete problems). For k = 2, testing bipartiteness takes linear time O(V + E) via BFS/DFS.
                </p>

                <div className="border border-mono-800 rounded-lg overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-mono-900 border-b border-mono-800 text-mono-400">
                        <th className="p-2.5">Algorithm</th>
                        <th className="p-2.5">Time Complexity</th>
                        <th className="p-2.5">Space</th>
                        <th className="p-2.5">Approximation / Guarantee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-mono-850">
                      <tr>
                        <td className="p-2.5 font-bold text-white">Greedy</td>
                        <td className="p-2.5 text-mono-300">O(V + E)</td>
                        <td className="p-2.5 text-mono-400">O(V)</td>
                        <td className="p-2.5 text-mono-400">Can use up to V/2 colors for Crown graphs</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-white">Welsh-Powell</td>
                        <td className="p-2.5 text-mono-300">O(V log V + E)</td>
                        <td className="p-2.5 text-mono-400">O(V)</td>
                        <td className="p-2.5 text-mono-400">≤ Δ(G) + 1 colors, tight on sparse graphs</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-white">DSatur</td>
                        <td className="p-2.5 text-mono-300">O(V² + E)</td>
                        <td className="p-2.5 text-mono-400">O(V)</td>
                        <td className="p-2.5 text-mono-400">Exact for bipartite, cycles, wheels; near-optimal</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-white">Backtracking</td>
                        <td className="p-2.5 text-mono-300">O(m^V) worst-case</td>
                        <td className="p-2.5 text-mono-400">O(V)</td>
                        <td className="p-2.5 text-mono-400">Exact chromatic number χ(G), exponential time</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-white">Bipartite BFS</td>
                        <td className="p-2.5 text-mono-300">O(V + E)</td>
                        <td className="p-2.5 text-mono-400">O(V)</td>
                        <td className="p-2.5 text-mono-400">Exact 2-coloring or odd-cycle witness</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
