# CHROMA.GRAPH // 3D Graph Coloring Visualizer

An interactive web application that visualizes **Graph Coloring Algorithms** with step-by-step 3D spatial animation, real-time mathematical validation, and synchronized plain-English explanations.

Built with **React**, **Three.js** (`@react-three/fiber` & `@react-three/drei`), **TypeScript**, **Framer Motion**, **Zustand**, and **Tailwind CSS**.

---

## ✦ Strictly Monochrome Aesthetic

The application is built around a pure monochrome, high-contrast editorial look:
- **Palette**: Pitch black (`#000000`), deep grays (`#0a0a0a`, `#141414`), crisp white (`#ffffff`), and subtle gray wireframe borders.
- **Typography**: Monospace (`JetBrains Mono` / `IBM Plex Mono`) for all numbers, node labels, pseudocode lines, and metric tickers.
- **Node Colors in Monochrome**:
  - Color classes $C_1 \dots C_k$ are rendered as distinct grayscale values (white, silver, medium gray, charcoal, slate) **coupled with geometric symbols** (`●`, `■`, `▲`, `◆`, `★`, `⬢`, `✚`, `✦`) and badges (`C1`, `C2`, etc.) so that color classes remain unmistakably distinguishable even without hue.
  - **Color Mode Toggle**: A header toggle allows users to switch to an accessible, color-blind-friendly chromatic palette whenever desired.
  - **Monochrome Conflicts**: Whenever an edge constraint is violated or a backtrack occurs, the active nodes and edges flash white with an animated shake and an `✖` indicator (never red).

---

## ✦ Quick Start

```bash
# 1. Navigate to the project directory
cd graph-coloring-visualizer

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open your browser to `http://localhost:5173`.

---

## ✦ Algorithms Visualized

| Algorithm | Complexity | Guarantee | Step-by-Step Visualization |
| :--- | :--- | :--- | :--- |
| **Greedy Coloring** | $O(V + E)$ | $\le \Delta + 1$ | Colors vertices in sequential order, scanning already-colored neighbors and selecting the smallest available integer. |
| **Welsh-Powell** | $O(V \log V + E)$ | $\le \Delta + 1$ | Pre-sorts vertices in descending order of their degree $\deg(v)$. The dynamic queue panel visually animates the sorted vertices. |
| **DSatur (Degree of Saturation)** | $O(V^2 + E)$ | Exact for bipartite, cycles, wheels; near-optimal | Dynamically prioritizes vertices with the maximum saturation degree $\rho(v)$ (number of different neighbor colors). The queue panel animates live reordering as $\rho(v)$ updates. |
| **Backtracking $m$-Coloring** | $O(m^V)$ | Exact $\chi(G)$ (NP-Complete) | Recursive depth-first exploration with user-configurable $m$. When a branch fails, active vertices shake, their fills drain back to empty, and the camera focuses on the backtrack point. |
| **Bipartite Check (2-Coloring BFS)** | $O(V + E)$ | Exact 2-coloring or odd-cycle witness | Tests if $\chi(G) \le 2$. Traverses components with alternating colors ($C_1 \leftrightarrow C_2$). If an odd cycle is found, highlights the conflict edge and vertices. |

---

## ✦ 3D Scene Features

- **Spatial Force-Directed Simulation**: Real-time Coulomb repulsion and Hooke spring attraction to arrange graphs organically.
- **2D / 3D Layout Toggle**: Switch between free-form 3D spherical graphs and 2D flat planar layouts with a single click.
- **Interactive OrbitControls**: Rotate, zoom, and pan around the graph, plus a **Reset View** camera button.
- **Draggable Vertices**: Click and drag any node across 3D/2D space using raycast plane projection.
- **Active Highlights**:
  - Active vertex: Pulsing white halo ring and spring scale expansion ($1.25\times$).
  - Active neighbors: Bright highlighted connection lines.
  - Camera tracking: Camera gently glides toward active nodes during key algorithm events.
- **Camera-Facing Billboards**: HTML labels dynamically scale and track the camera, displaying node IDs, degree, and color badges ($C_i$).

---

## ✦ Controls & Playback

- **Play / Pause**: Spacebar or central play button.
- **Step Forward / Backward**: Left/Right Arrow keys or step buttons.
- **Reset**: `R` key or Reset button.
- **Speed Slider**: $0.25\times$ to $4\times$ execution speed.
- **Timeline Scrubber**: Click anywhere on the progress bar to scrub directly to that step. Conflict and backtrack steps are marked directly on the track.

---

## ✦ Graph Presets & Editor

- **Built-in Presets**:
  - **Triangle ($K_3$)**: $\chi = 3$
  - **Cycle $C_5$**: Odd cycle, $\chi = 3$
  - **Bipartite ($K_{3,3}$)**: $\chi = 2$
  - **Petersen Graph**: 10 vertices, 15 edges, $\chi = 3$
  - **Complete Graph $K_5$**: 5 vertices, 10 edges, $\chi = 5$
  - **Wheel Graph $W_6$**: 6 vertices, $\chi = 4$
  - **Planar Map**: 8 regions, dual planar graph, $\chi = 4$ (Four Color Theorem)
  - **Grid $3 \times 3$**: Bipartite lattice, $\chi = 2$
- **Interactive Graph Editor**:
  - **+ Vertex**: Spawn new vertices on the canvas.
  - **+ Edge**: Click source vertex, then click target vertex.
  - **Delete**: Click any vertex or edge to remove it.
  - **Random Graph Generator**: Customize $|V|$ (3 to 15) and edge probability $p$ (0.15 to 0.70) with spanning tree connectivity guarantee.
  - **Clear**: Reset canvas.

---

## ✦ Additional Features

1. **Synchronized Pseudocode Panel**: The active line of code highlights and slides smoothly between lines using Framer Motion spring layouts.
2. **Real-time Color Validation**: Every step runs a validation check across all edges to ensure proper coloring and calculate distinct chromatic classes.
3. **Monochrome Confetti**: Triggers a burst of pure white and silver confetti when an algorithm successfully completes a valid proper coloring.
4. **Live Adjacency Matrix & List**: Collapsible side drawer with interactive $N \times N$ matrix (hovering crosshairs) and adjacency degree list.
5. **Algorithm Comparison Benchmark**: One-click modal running all 5 algorithms on the current graph with animated monochrome bar charts comparing colors used, exploration steps, and runtimes.
6. **Theoretical Foundations Reference**: Interactive modal detailing the chromatic number $\chi(G)$, Brooks' Theorem, the Four Color Theorem, NP-completeness, and real-world applications (register allocation, exam scheduling, Sudoku).

---

## ✦ Verification Testing

All algorithms and preset graphs have been validated through our automated test suite:

```bash
node scripts/verify-all.mjs
```

Result:
```text
=== GRAPH COLORING PRESET VERIFICATION TEST ===
[TEST PRESET: TRIANGLE]   Greedy: ✓ | Welsh-Powell: ✓ | DSatur: ✓ | Backtracking: ✓
[TEST PRESET: CYCLE5]     Greedy: ✓ | Welsh-Powell: ✓ | DSatur: ✓ | Backtracking: ✓
[TEST PRESET: BIPARTITE]  Greedy: ✓ | Welsh-Powell: ✓ | DSatur: ✓ | Backtracking: ✓
[TEST PRESET: PETERSEN]   Greedy: ✓ | Welsh-Powell: ✓ | DSatur: ✓ | Backtracking: ✓
[TEST PRESET: COMPLETE5]  Greedy: ✓ | Welsh-Powell: ✓ | DSatur: ✓ | Backtracking: ✓
[TEST PRESET: WHEEL6]     Greedy: ✓ | Welsh-Powell: ✓ | DSatur: ✓ | Backtracking: ✓
[TEST PRESET: PLANAR]     Greedy: ✓ | Welsh-Powell: ✓ | DSatur: ✓ | Backtracking: ✓
>>> ALL ALGORITHMS PRODUCED 100% VALID COLORINGS ACROSS ALL PRESETS! <<<
```

---

## ✦ License

MIT
