# AVL LAB

> **Understand the balance. Master the rotations.**

AVL LAB is an interactive learning platform for AVL trees (self-balancing binary search trees). It runs entirely in the browser - no backend, database, account or API key.

A real AVL implementation (TypeScript) sits behind every picture: each animation is replayed from steps **recorded by the algorithm itself**, and every explanation is generated from the actual node heights and balance factors. Complete C and C++ programs are included, compiled and tested against the same engine.

## Features

| Section | What it offers |
| --- | --- |
| **Home** | Landing page with a live animated preview built from the real engine, learning roadmap and progress dashboard |
| **Learn AVL Trees** | Five lessons (trees → BST → why AVL → AVL property → height & balance factor), each with interactive visuals, key takeaways and a knowledge check; glossary |
| **Interactive Visualizer** | Insert / delete / search, four traversals, random trees, examples, undo/redo, step playback (start, pause, resume, next, previous, restart, speed, scrub), operation explanations, call stack, rotation pointer changes, node inspector, pseudocode highlighting, operation history, zoom / pan / fit |
| **Rotations Lab** | LL, RR, LR, RL: before → unbalanced → after trees, balance-factor tables, animated walkthrough, pointer changes, pseudocode / C / C++ snippets, the balance-factor decision rules, and a computed demo of why the `BF = 0` case on deletion needs a single rotation |
| **Algorithms & Pseudocode** | 13 algorithms with purpose, preconditions, inputs, outputs, steps, pseudocode, complexity and common mistakes |
| **C / C++ Implementation** | Complete menu-driven programs (`public/code/avl_tree.c`, `avl_tree.cpp`), syntax-highlighted viewer with line numbers, search, function navigation, per-function beginner explanations, working copy and download buttons, compile instructions and sample session |
| **Complexity Analysis** | AVL vs BST tables, best/average/worst cases, **measured** height curves, why height is logarithmic (Fibonacci trees), recursion stack space |
| **Practice & Quiz** | 30 questions in three levels (multiple choice, predict the rotation / resulting tree, calculate balance factors, find the invalid tree, deletion behaviour, match pseudocode, find the bug), shuffled, with explanations, scoring, results page, retry and resume |
| **About** | Purpose, technologies, limitations, privacy |

Also: dark theme by default plus a light theme, a setting to reduce/disable animations (and `prefers-reduced-motion` support), keyboard-accessible controls with visible focus, responsive layouts (phone → desktop), and locally stored progress (`localStorage`, resettable, nothing leaves your browser).

## Technology stack

React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · React Router · Lucide icons · SVG tree renderer · Vitest. The code viewer uses a small built-in C/C++ highlighter, so it works fully offline (no CDN/editor download).

## Getting started

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev        # development server (http://localhost:5173)
```

Other commands:

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run typecheck  # TypeScript only
npm test           # unit tests, randomized tests, C/C++ cross-checks
npm run test:c     # compile the C and C++ programs (warnings as errors) and run a demo
npm run test:e2e   # optional browser test (needs `npm run dev` running and CHROME_PATH=<chrome binary>)
```

### Running the C / C++ programs

```bash
gcc avl_tree.c   -o avl_tree        # or: g++ avl_tree.cpp -o avl_tree
./avl_tree                           # Windows: avl_tree.exe
```

(the files are in `public/code/` and can also be downloaded from the C / C++ pages).

## Project structure

```
src/
  features/
    avl/              AVL engine - NO React imports
      types.ts          TreeNode, Step, RotationInfo, ...
      node.ts           height, balanceFactor, updateHeight, cloneTree, ...
      rotations.ts      rotateLeft / rotateRight (single implementation, used everywhere)
      rebalance.ts      shared rebalance used by insertion AND deletion
      insertion.ts      recursive insertion with recorded steps
      deletion.ts       recursive deletion (leaf / one child / two children via successor)
      search.ts, traversal.ts, traversalSteps.ts
      operationSteps.ts the recorder: every step stores a deep copy of the live tree
      avlTree.ts        AvlTree class (insert, delete, search, traverse, validate, snapshot)
      validate.ts       recursive BST + height + balance validator
      bst.ts, bounds.ts, stats.ts, presets.ts, inspect.ts
    algorithms/       pseudocode reference (lines carry tags the engine emits)
    codeExamples/     source loader, function index, per-function docs, snippets
    lessons/          glossary, rotation scenarios (run on the real engine)
    quiz/             question bank (many answers are computed by the engine)
    progress/         localStorage progress model
  components/
    tree/             layout (Reingold-Tilford style), TreeCanvas (SVG, zoom/pan), TreeFigure, BalanceTable
    visualizer/       controls, playback, explanation, pseudocode, timeline, history, StepPlayer
    code/             CodeViewer, CodeBlock, highlighter, implementation page
    lessons/ quizzes/ layout/ common/
  pages/              one component per route
  hooks/              settings, progress, toast, playback, visualizer state
  utils/ styles/
public/code/          avl_tree.c, avl_tree.cpp (the real, downloadable sources)
```

## How the AVL implementation works

* **Convention** - empty subtree height = 0, leaf = 1. `BF(node) = height(left) − height(right)`; every node must satisfy `−1 ≤ BF ≤ 1`.
* **Source of truth** - `AvlTree` holds the live (mutable) tree. Operations are recursive, exactly like the C/C++ code, and they re-link the tree *before* each snapshot, so every recorded step is a complete, consistent tree. The UI only *renders* these snapshots (it never fakes an intermediate state).
* **Rebalancing** - `rebalance()` updates the height, computes the balance factor and, if |BF| > 1, rotates based on the **child's** balance factor: `BF > 1`: child `≥ 0` → right rotation (LL), else left-then-right (LR); `BF < −1`: child `≤ 0` → left rotation (RR), else right-then-left (RL). The same function serves insertion and deletion; the `= 0` child case (possible only after a deletion) is handled with a single rotation.
* **Deletion** - leaf, one child, and two children (the in-order successor's key is copied up, then the successor is removed). Ancestors are rebalanced on the way back up, so a deletion can rotate at several levels.
* **Duplicates** are rejected with an explanation. Keys must be integers in −9999…9999. The visualizer holds at most 127 nodes.
* **Layout** - a Reingold-Tilford style contour layout (parents centred over children, subtree contours kept ≥ 1 gap apart), computed from the tree on every change. Node identity is a stable `uid`, which is what lets nodes glide smoothly when a rotation moves them.
* **Pseudocode sync** - every step carries a line tag such as `insert.goLeft` or `rebalance.right`; a test checks that all tags the engine can emit exist in the pseudocode reference. Highlighting is per recorded step.

## Testing

```bash
npm test
```

* **Engine unit tests** - empty/single-node trees, multiple and duplicate insertions, LL/RR/LR/RL, leaf / one-child / two-children / root deletion, missing values, rebalancing after deletion (including the `BF = 0` case and a deletion that rotates at two levels), search, all traversals, heights and balance factors, snapshot isolation.
* **Randomized tests** - thousands of random insertions/deletions against a reference `Set`, validating BST order, stored heights and `|BF| ≤ 1` after **every** operation; recorded and unrecorded runs must produce identical trees.
* **C / C++ cross-check** - both programs are compiled (`-Wall -Wextra -pedantic -Werror`, AddressSanitizer + UBSan) and driven with random operations; traversals and height must equal the TypeScript engine's. Skipped automatically if `gcc`/`g++` are not installed.
* **Browser test** (`npm run test:e2e`, optional) - drives the real UI with Playwright: navigation, input validation, insertion/deletion/search/traversals, step playback, undo/redo, zoom/pan, rotations, copy & download of the C/C++ sources, lessons, quiz, localStorage persistence, themes, responsive layouts (no horizontal overflow at 390 px and 768 px).
* Layout (no overlap for balanced, random and skewed shapes), pseudocode tags, code-viewer function ranges, quiz bank, progress model, rotation scenarios.

## Limitations

* Educational implementation: the visualizer is capped at 127 nodes and integer keys in −9999…9999; trees larger than ~30 nodes are shown small (zoom/pan/fit are provided).
* The syntax highlighter is a small custom one (C/C++ only), not a full editor like Monaco - by design, to keep the app offline and lightweight.
* Pseudocode highlighting is step-level (each recorded step maps to one line), not an instruction-by-instruction debugger.
* The C/C++ programs were verified with GCC/G++ on Linux; other compilers (e.g. MSVC) should work but were not tested.
* Progress is stored per browser; clearing site data resets it.
