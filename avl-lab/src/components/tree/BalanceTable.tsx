import { useMemo } from 'react';
import type { TreeNode } from '../../features/avl';
import { ScrollRegion } from '../common/ui';
import { computeLayout } from './layout';

/** Table of height / subtree heights / balance factor for every node (sorted by key). */
export function BalanceTable({ root, flagged = [], label = 'Balance factor table' }: { root: TreeNode | null; flagged?: number[]; label?: string }) {
  const rows = useMemo(() => computeLayout(root).nodes.slice().sort((a, b) => a.key - b.key), [root]);
  if (!rows.length) return null;
  return (
    <ScrollRegion label={label}>
      <table className="table-lab" aria-label="Heights and balance factors">
        <thead>
          <tr>
            <th>Node</th>
            <th>h(left)</th>
            <th>h(right)</th>
            <th>Height</th>
            <th>BF = L − R</th>
            <th>Verdict</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const bad = Math.abs(r.balance) > 1;
            return (
              <tr key={r.uid} className={flagged.includes(r.uid) || bad ? 'bg-bad/5' : ''}>
                <td className="font-mono font-semibold">{r.key}</td>
                <td className="font-mono">{r.leftHeight}</td>
                <td className="font-mono">{r.rightHeight}</td>
                <td className="font-mono">{r.height}</td>
                <td className="whitespace-nowrap font-mono">
                  {r.leftHeight} − {r.rightHeight} = {r.balance > 0 ? '+' : ''}
                  {r.balance}
                </td>
                <td>{bad ? <span className="chip chip-bad">violates</span> : <span className="chip chip-good">ok</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollRegion>
  );
}
