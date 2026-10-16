import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { AvlTree, buildBst, inspectNode, type TreeNode } from '../../features/avl';
import { TreeFigure } from '../tree/TreeFigure';
import { NodeInspector } from '../visualizer/NodeInspector';

/** Shows the tree after each insertion; the learner steps through the sequence. */
export function InsertionStepper({ keys, mode, caption }: { keys: number[]; mode: 'bst' | 'avl'; caption?: ReactNode }) {
  const [i, setI] = useState(0);
  const frames = useMemo(() => {
    const out: { tree: TreeNode | null; rotated: boolean }[] = [];
    if (mode === 'bst') {
      keys.forEach((_, idx) => out.push({ tree: buildBst(keys.slice(0, idx + 1)), rotated: false }));
    } else {
      const t = new AvlTree();
      for (const k of keys) {
        const r = t.insert(k);
        out.push({ tree: t.snapshot(), rotated: r.rotations.length > 0 });
      }
    }
    return out;
  }, [keys, mode]);
  const frame = frames[i];
  return (
    <div className="card card-pad">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button className="btn btn-icon" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} aria-label="Previous insertion">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button className="btn btn-icon" onClick={() => setI((v) => Math.min(frames.length - 1, v + 1))} disabled={i === frames.length - 1} aria-label="Next insertion">
          <ChevronRight className="h-4 w-4" />
        </button>
        <p className="text-sm text-muted" aria-live="polite">
          Inserted so far:{' '}
          {keys.map((k, idx) => (
            <span key={k} className={`mx-0.5 rounded px-1.5 py-0.5 font-mono ${idx === i ? 'bg-accent text-[rgb(var(--c-on-accent))]' : idx < i ? 'bg-raised text-ink' : 'text-muted'}`}>
              {k}
            </span>
          ))}
        </p>
      </div>
      <TreeFigure
        root={frame.tree}
        highlights={frame.tree ? { created: findKeyUid(frame.tree, keys[i]) } : undefined}
        caption={
          <>
            After inserting <b className="font-mono text-ink">{keys[i]}</b> ({i + 1} of {keys.length}){frame.rotated && <span className="ml-1 text-warn"> - a rotation was needed</span>}. {caption}
          </>
        }
        minHeight={200}
      />
    </div>
  );
}

function findKeyUid(root: TreeNode, key: number): number[] {
  let cur: TreeNode | null = root;
  while (cur) {
    if (cur.key === key) return [cur.uid];
    cur = key < cur.key ? cur.left : cur.right;
  }
  // after rotations the key is still in the tree, but search by BST order always finds it
  return [];
}

/** Interactive tree where hovering / selecting a node shows its properties. */
export function PropertyExplorer({ root, extended = true, caption }: { root: TreeNode | null; extended?: boolean; caption?: ReactNode }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const info = useMemo(() => inspectNode(root, hovered ?? selected), [root, hovered, selected]);
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_17rem]">
      <TreeFigure root={root} selectedUid={selected} onSelect={setSelected} onHover={setHovered} caption={caption} minHeight={260} maxHeight={380} interactive ariaLabel="Interactive tree" />
      <div className="card card-pad self-start">
        <p className="panel-title mb-3">Node properties</p>
        <NodeInspector info={info} extended={extended} />
      </div>
    </div>
  );
}
