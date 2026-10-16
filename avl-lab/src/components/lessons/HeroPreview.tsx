import { useEffect, useMemo, useState } from 'react';
import { AvlTree, type Highlights, type Step, type TreeNode } from '../../features/avl';
import { useSettings } from '../../hooks/useSettings';
import { TreeCanvas } from '../tree/TreeCanvas';

interface Frame {
  tree: TreeNode | null;
  highlights: Highlights;
  caption: string;
}

/** Frames come from really inserting the keys into an AVL tree and keeping the most instructive recorded steps. */
function buildFrames(keys: number[]): Frame[] {
  const tree = new AvlTree();
  const frames: Frame[] = [{ tree: null, highlights: {}, caption: 'An empty AVL tree' }];
  for (const k of keys) {
    const r = tree.insert(k);
    const keep = r.steps.filter((s: Step) => s.kind === 'create' || s.kind === 'imbalance' || s.kind === 'rotate' || (s.kind === 'done' && r.rotations.length === 0));
    // The 'done' step after a rotation duplicates the last rotate step, so it is skipped above.
    for (const s of keep) frames.push({ tree: s.tree, highlights: s.highlights, caption: s.kind === 'done' ? `Inserted ${k}` : s.title });
  }
  return frames;
}

export function HeroPreview() {
  const { animations } = useSettings();
  const frames = useMemo(() => buildFrames([30, 20, 10, 40, 50, 25, 5]), []);
  const [i, setI] = useState(animations ? 0 : frames.length - 1);

  useEffect(() => {
    if (!animations) {
      setI(frames.length - 1);
      return;
    }
    const last = i >= frames.length - 1;
    const id = window.setTimeout(() => setI(last ? 0 : i + 1), last ? 3200 : 1300);
    return () => window.clearTimeout(id);
  }, [i, animations, frames.length]);

  const f = frames[Math.min(i, frames.length - 1)];
  return (
    <figure className="card overflow-hidden p-3" aria-label="Animated preview of an AVL tree being built">
      <TreeCanvas root={f.tree} highlights={f.highlights} interactive={false} height={310} ariaLabel="AVL tree preview" maxFitScale={1} empty={<p className="text-sm text-muted">An empty AVL tree</p>} />
      <figcaption className="mt-2 flex items-center justify-between gap-2 px-1 text-xs text-muted" aria-live="off">
        <span className="font-medium text-ink">{f.caption}</span>
        <span>Generated live by the AVL engine</span>
      </figcaption>
    </figure>
  );
}
