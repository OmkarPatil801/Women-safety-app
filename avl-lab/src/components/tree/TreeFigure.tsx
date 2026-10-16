import { useMemo, type ReactNode } from 'react';
import type { Highlights, TreeNode } from '../../features/avl';
import { TreeCanvas } from './TreeCanvas';
import { computeLayout } from './layout';

interface TreeFigureProps {
  root: TreeNode | null;
  caption?: ReactNode;
  highlights?: Highlights;
  showMetrics?: boolean;
  selectedUid?: number | null;
  onSelect?: (uid: number | null) => void;
  onHover?: (uid: number | null) => void;
  nodeNotes?: Record<number, string>;
  minHeight?: number;
  maxHeight?: number;
  ariaLabel?: string;
  /** Allow zoom/pan (off by default for small figures). */
  interactive?: boolean;
  tone?: 'default' | 'bad' | 'good';
  /** Automatically ring every node whose |balance factor| > 1. */
  flagUnbalanced?: boolean;
}

/** A small, self-sizing tree diagram with a caption. */
export function TreeFigure({
  root,
  caption,
  highlights,
  showMetrics = true,
  selectedUid,
  onSelect,
  onHover,
  nodeNotes,
  minHeight = 120,
  maxHeight = 420,
  ariaLabel,
  interactive = false,
  tone = 'default',
  flagUnbalanced = false,
}: TreeFigureProps) {
  const layout = useMemo(() => computeLayout(root), [root]);
  const merged = useMemo<Highlights | undefined>(() => {
    if (!flagUnbalanced) return highlights;
    const bad = layout.nodes.filter((n) => Math.abs(n.balance) > 1).map((n) => n.uid);
    return { ...highlights, unbalanced: [...(highlights?.unbalanced ?? []), ...bad] };
  }, [flagUnbalanced, highlights, layout]);
  const height = Math.max(minHeight, Math.min(maxHeight, layout.height * 0.95 + 8));
  const ring = tone === 'bad' ? 'ring-1 ring-bad/50 rounded-2xl' : tone === 'good' ? 'ring-1 ring-good/50 rounded-2xl' : '';
  return (
    <figure className={`min-w-0 ${ring}`}>
      <TreeCanvas
        root={root}
        highlights={merged}
        showMetrics={showMetrics}
        selectedUid={selectedUid}
        onSelect={onSelect}
        onHover={onHover}
        nodeNotes={nodeNotes}
        interactive={interactive}
        height={height}
        ariaLabel={ariaLabel ?? 'Tree diagram'}
        maxFitScale={1}
        empty={<p className="text-sm text-muted">Empty tree</p>}
      />
      {caption && <figcaption className="mt-2 text-center text-sm text-muted">{caption}</figcaption>}
    </figure>
  );
}
