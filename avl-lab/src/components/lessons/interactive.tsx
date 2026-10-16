import { useMemo, useState } from 'react';
import { AvlTree, buildBst, createNode, validateAvl, type TreeNode } from '../../features/avl';
import { TreeFigure } from '../tree/TreeFigure';
import { StepPlayer } from '../visualizer/StepPlayer';
import { PropertyExplorer } from './visuals';
import { parseKeyInput } from '../../utils/parseKey';


/** Search in a plain BST with recorded steps. */
export function BstSearchDemo({ keys }: { keys: number[] }) {
  const [text, setText] = useState('25');
  const [run, setRun] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState(25);
  const steps = useMemo(() => {
    const t = AvlTree.fromSnapshot(buildBst(keys));
    return t.search(target).steps;
  }, [keys, target, run]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="card card-pad space-y-3">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const p = parseKeyInput(text);
          if (!p.ok) return setError(p.error);
          setError(null);
          setTarget(p.value);
          setRun((r) => r + 1);
        }}
      >
        <div>
          <label className="label" htmlFor="bst-search">
            Search for
          </label>
          <input id="bst-search" className="input !w-32 font-mono" value={text} onChange={(e) => setText(e.target.value)} inputMode="numeric" />
        </div>
        <button className="btn btn-primary" type="submit">
          Search
        </button>
        <span className="text-xs text-muted">Try a value that exists (35) and one that does not (27).</span>
      </form>
      {error && (
        <p role="alert" className="text-sm text-bad">
          {error}
        </p>
      )}
      <StepPlayer steps={steps} resetKey={`${target}-${run}`} canvasHeight={280} />
    </div>
  );
}

/** Sorted insertion into a plain BST vs. an AVL tree, for 3..8 nodes. */
export function SkewVsBalanced() {
  const [n, setN] = useState(5);
  const keys = useMemo(() => Array.from({ length: n }, (_, i) => (i + 1) * 10), [n]);
  const bst = useMemo(() => buildBst(keys), [keys]);
  const avl = useMemo(() => AvlTree.fromKeys(keys).snapshot(), [keys]);
  const last = keys[keys.length - 1];
  const countFor = (root: TreeNode | null) => AvlTree.fromSnapshot(root).search(last).steps.filter((s) => s.kind === 'compare' || s.kind === 'found').length;
  return (
    <div className="card card-pad space-y-4">
      <div>
        <label htmlFor="skew-n" className="label">
          Insert {n} sorted values: {keys.slice(0, 4).join(', ')}
          {n > 4 ? ', …' : ''}
          {n > 4 ? `, ${last}` : ''}
        </label>
        <input id="skew-n" type="range" min={3} max={8} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full max-w-sm accent-[rgb(var(--c-accent))]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <TreeFigure root={bst} tone="bad" caption={<>Plain BST: height <b className="text-bad">{bst?.height}</b> - looks like a linked list</>} minHeight={220} maxHeight={400} />
          <p className="mt-2 text-center text-sm">Finding {last} takes <b className="text-bad">{countFor(bst)}</b> comparisons</p>
        </div>
        <div>
          <TreeFigure root={avl} tone="good" caption={<>AVL tree: height <b className="text-good">{avl?.height}</b> - kept balanced by rotations</>} minHeight={220} maxHeight={400} />
          <p className="mt-2 text-center text-sm">Finding {last} takes <b className="text-good">{countFor(avl)}</b> comparisons</p>
        </div>
      </div>
    </div>
  );
}

function manual(): TreeNode {
  // 30(20(,35),40): 35 sits in the LEFT subtree of 30 although 35 > 30 -> not a BST.
  const n35 = createNode(3, 35);
  const n20 = createNode(2, 20);
  n20.right = n35;
  n20.height = 2;
  const n40 = createNode(4, 40);
  const root = createNode(1, 30);
  root.left = n20;
  root.right = n40;
  root.height = 3;
  return root;
}

const CHECK_EXAMPLES: { id: string; label: string; build: () => TreeNode | null; blurb: string }[] = [
  { id: 'perfect', label: 'Perfectly balanced', build: () => AvlTree.fromKeys([30, 20, 40, 10, 25, 35, 50]).snapshot(), blurb: 'Every balance factor is 0 or ±1.' },
  { id: 'uneven', label: 'Uneven but still AVL', build: () => AvlTree.fromKeys([30, 20, 40, 10]).snapshot(), blurb: 'Node 30 is left-heavy (+1). That is allowed.' },
  { id: 'skew', label: 'Valid BST, not AVL', build: () => buildBst([30, 20, 10]), blurb: 'The BST order is fine, but the root has BF = +2.' },
  { id: 'notbst', label: 'Balanced, not a BST', build: manual, blurb: 'The shape looks fine, but 35 is stored in the left subtree of 30.' },
];

export function AvlChecker() {
  const [id, setId] = useState('perfect');
  const ex = CHECK_EXAMPLES.find((e) => e.id === id)!;
  const tree = useMemo(() => ex.build(), [ex]);
  const report = useMemo(() => validateAvl(tree), [tree]);
  return (
    <div className="card card-pad space-y-3">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Example tree">
        {CHECK_EXAMPLES.map((e) => (
          <button key={e.id} role="radio" aria-checked={id === e.id} className={`btn btn-sm ${id === e.id ? 'border-accent bg-accent/15 text-accent' : ''}`} onClick={() => setId(e.id)}>
            {e.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_20rem]">
        <TreeFigure root={tree} flagUnbalanced tone={report.ok ? 'good' : 'bad'} caption={ex.blurb} minHeight={220} />
        <div className="self-start rounded-xl border border-line bg-bg p-3 text-sm" aria-live="polite">
          <p className={`mb-2 font-semibold ${report.ok ? 'text-good' : 'text-bad'}`}>{report.ok ? '✓ Valid AVL tree' : '✗ Not a valid AVL tree'}</p>
          <p className="mb-1 text-xs text-muted">The validator checks three things at every node: BST order, correct stored height, and |BF| ≤ 1.</p>
          {report.errors.length > 0 && (
            <ul className="mt-2 space-y-1 font-mono text-xs">
              {report.errors.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const BF_EXAMPLES: { bf: number; keys: number[]; text: string }[] = [
  { bf: 2, keys: [30, 20, 10], text: 'The left subtree has height 2 and the right is empty: 2 − 0 = +2. Too left-heavy → violation (LL case).' },
  { bf: 1, keys: [30, 20, 40, 10], text: 'Left height 2, right height 1: 2 − 1 = +1. Left-heavy but allowed.' },
  { bf: 0, keys: [30, 20, 40], text: 'Both sides have height 1: 1 − 1 = 0. Perfectly balanced.' },
  { bf: -1, keys: [30, 20, 40, 50], text: 'Left height 1, right height 2: 1 − 2 = −1. Right-heavy but allowed.' },
  { bf: -2, keys: [10, 20, 30], text: 'Left is empty (0) and right has height 2: 0 − 2 = −2. Too right-heavy → violation (RR case).' },
];

export function BfExplorer() {
  const [bf, setBf] = useState(1);
  const ex = BF_EXAMPLES.find((e) => e.bf === bf)!;
  const root = useMemo(() => buildBst(ex.keys), [ex]);
  return (
    <div className="card card-pad space-y-4">
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Choose a balance factor to see an example">
        <span className="text-sm text-muted">Show an example where the root has BF =</span>
        {[2, 1, 0, -1, -2].map((v) => (
          <button key={v} role="radio" aria-checked={bf === v} className={`btn btn-sm font-mono ${bf === v ? 'border-accent bg-accent/15 text-accent' : ''} ${Math.abs(v) > 1 ? 'text-bad' : ''}`} onClick={() => setBf(v)}>
            {v > 0 ? `+${v}` : v}
          </button>
        ))}
      </div>
      <p className={`rounded-lg border p-3 text-sm ${Math.abs(bf) > 1 ? 'border-bad/40 bg-bad/10' : 'border-good/40 bg-good/10'}`}>
        <b>{Math.abs(bf) > 1 ? 'Violation. ' : 'Allowed. '}</b>
        {ex.text}
      </p>
      <PropertyExplorer root={root} extended={false} caption="Click or hover any node. h = height, bf = balance factor (↙ left-heavy, ↘ right-heavy)." />
    </div>
  );
}
