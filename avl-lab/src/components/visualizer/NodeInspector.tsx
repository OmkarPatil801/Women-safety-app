import { MousePointerClick } from 'lucide-react';
import type { NodeInfo } from '../../features/avl';

const STATUS: Record<NodeInfo['status'], { text: string; cls: string }> = {
  balanced: { text: 'Balanced (BF = 0)', cls: 'chip-good' },
  'left-heavy': { text: 'Left-heavy (BF = +1) - allowed', cls: 'chip-accent' },
  'right-heavy': { text: 'Right-heavy (BF = −1) - allowed', cls: 'chip-info' },
  unbalanced: { text: 'UNBALANCED - needs rebalancing', cls: 'chip-bad' },
};

export function NodeInspector({ info, extended = false }: { info: NodeInfo | null; extended?: boolean }) {
  if (!info) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-dashed border-line p-3 text-sm text-muted">
        <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>Select a node (click, tap, or hover) to inspect its height, subtree heights and balance factor.</span>
      </div>
    );
  }
  const st = STATUS[info.status];
  const rows: [string, string][] = [
    ['Value', String(info.key)],
    ['Left child', info.leftKey === null ? 'empty' : String(info.leftKey)],
    ['Right child', info.rightKey === null ? 'empty' : String(info.rightKey)],
    ['Height', String(info.height)],
    ['Left subtree height', String(info.leftHeight)],
    ['Right subtree height', String(info.rightHeight)],
    ['Balance factor', `${info.leftHeight} − ${info.rightHeight} = ${info.balance > 0 ? '+' : ''}${info.balance}`],
  ];
  if (extended) {
    rows.splice(1, 0, ['Parent', info.parentKey === null ? 'none (this is the root)' : String(info.parentKey)], ['Depth', String(info.depth)]);
    rows.push(['Subtree size', `${info.subtreeSize} node${info.subtreeSize === 1 ? '' : 's'}`], ['Role', info.isRoot ? 'root' : info.isLeaf ? 'leaf' : 'internal node']);
  }
  return (
    <div>
      <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-mono font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <p className={`chip mt-3 ${st.cls}`}>{st.text}</p>
    </div>
  );
}
