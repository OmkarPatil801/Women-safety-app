import { ScrollRegion } from '../common/ui';
import { useMemo, useState } from 'react';
import { buildMinimalAvl, heightCurves, minNodesForHeight } from '../../features/avl';
import { TreeFigure } from '../tree/TreeFigure';

const W = 640;
const H = 300;
const M = { l: 44, r: 16, t: 16, b: 36 };

/** Line chart of measured heights. Series are told apart by dash pattern AND direct labels, not colour alone. */
export function HeightChart({ maxN = 500, marker }: { maxN?: number; marker?: number }) {
  const curves = useMemo(() => heightCurves(maxN), [maxN]);
  const maxY = Math.max(...curves.bstSorted.slice(0, maxN));
  const x = (n: number) => M.l + ((n - 1) / (maxN - 1)) * (W - M.l - M.r);
  const y = (v: number) => H - M.b - (v / maxY) * (H - M.t - M.b);
  const path = (vals: number[]) => vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(curves.n[i]).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const ticksX = [1, Math.round(maxN / 4), Math.round(maxN / 2), Math.round((3 * maxN) / 4), maxN];
  const ticksY = [0, Math.round(maxY / 2), maxY];
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-line bg-bg" role="img" aria-label="Chart of tree height against number of nodes for a sorted-input BST, a random-input BST and an AVL tree">
        {ticksY.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="rgb(var(--c-line))" strokeDasharray="3 4" />
            <text x={M.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="rgb(var(--c-muted))">{t}</text>
          </g>
        ))}
        {ticksX.map((t) => (
          <text key={t} x={x(t)} y={H - 14} textAnchor="middle" fontSize="11" fill="rgb(var(--c-muted))">{t}</text>
        ))}
        <text x={W / 2} y={H - 1} textAnchor="middle" fontSize="11" fill="rgb(var(--c-muted))">number of nodes n</text>
        <text x={12} y={H / 2} fontSize="11" fill="rgb(var(--c-muted))" transform={`rotate(-90 12 ${H / 2})`} textAnchor="middle">height</text>
        <path d={path(curves.bstSorted)} fill="none" stroke="rgb(var(--c-bad))" strokeWidth="2.5" />
        <path d={path(curves.bstRandom)} fill="none" stroke="rgb(var(--c-warn))" strokeWidth="2.5" strokeDasharray="7 4" />
        <path d={path(curves.avlSorted)} fill="none" stroke="rgb(var(--c-good))" strokeWidth="3" strokeDasharray="1 0" />
        <text x={x(maxN * 0.55)} y={y(maxN * 0.55) - 8} fontSize="12" fontWeight="600" fill="rgb(var(--c-bad))">plain BST, sorted input (height = n)</text>
        <text x={x(maxN * 0.45)} y={y(curves.bstRandom[Math.floor(maxN * 0.45)]) - 10} fontSize="12" fontWeight="600" fill="rgb(var(--c-warn))" >plain BST, random input</text>
        <text x={x(maxN * 0.5)} y={y(curves.avlSorted[Math.floor(maxN * 0.5)]) + 20} fontSize="12" fontWeight="600" fill="rgb(var(--c-good))">AVL tree (any order)</text>
        {marker !== undefined && marker <= maxN && <line x1={x(marker)} x2={x(marker)} y1={M.t} y2={H - M.b} stroke="rgb(var(--c-accent))" strokeWidth="1.5" strokeDasharray="2 3" />}
      </svg>
      <figcaption className="mt-2 text-xs text-muted">Heights were measured by actually inserting 1…{maxN} (AVL and plain BST) and a seeded random permutation (random BST).</figcaption>
    </figure>
  );
}

export function HeightExplorer() {
  const [n, setN] = useState(100);
  const curves = useMemo(() => heightCurves(1000), []);
  const i = n - 1;
  const rows = [
    { label: 'Plain BST - sorted input', value: curves.bstSorted[i], cls: 'bg-bad' },
    { label: 'Plain BST - random input', value: curves.bstRandom[i], cls: 'bg-warn' },
    { label: 'AVL tree', value: curves.avlSorted[i], cls: 'bg-good' },
  ];
  const max = n;
  return (
    <div className="card card-pad space-y-4">
      <div>
        <label htmlFor="n-slider" className="label">
          Number of nodes n = <b className="text-ink">{n}</b>
        </label>
        <input id="n-slider" type="range" min={1} max={1000} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-[rgb(var(--c-accent))]" />
      </div>
      <ul className="space-y-3" aria-label="Measured heights">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{r.label}</span>
              <b className="font-mono">height {r.value}</b>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-raised" aria-hidden>
              <div className={`h-full rounded-full ${r.cls}`} style={{ width: `${Math.max((r.value / max) * 100, 1.5)}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">
        For n = {n}: the best conceivable height is ⌈log₂(n+1)⌉ = <b className="text-ink">{Math.ceil(Math.log2(n + 1))}</b>, and the AVL guarantee is height ≤ 1.44·log₂(n+2) ≈ <b className="text-ink">{(1.4405 * Math.log2(n + 2)).toFixed(1)}</b>. Searching costs at most one comparison per level.
      </p>
    </div>
  );
}

export function FibonacciExplorer() {
  const [h, setH] = useState(5);
  const root = useMemo(() => buildMinimalAvl(h), [h]);
  return (
    <div className="card card-pad space-y-3">
      <div>
        <label htmlFor="h-slider" className="label">
          Height h = <b className="text-ink">{h}</b>: the sparsest possible AVL tree has only <b className="text-ink">{minNodesForHeight(h)}</b> nodes
        </label>
        <input id="h-slider" type="range" min={1} max={7} value={h} onChange={(e) => setH(Number(e.target.value))} className="w-full max-w-sm accent-[rgb(var(--c-accent))]" />
      </div>
      <TreeFigure root={root} showMetrics={h <= 5} minHeight={240} maxHeight={420} caption="Every node is as unbalanced as the rule allows (BF = +1 almost everywhere) - this is the tallest an AVL tree can be for its size." interactive={h > 5} />
    </div>
  );
}

export function MinNodesTable() {
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <ScrollRegion label="Minimum nodes per AVL height (table)" className="card">
      <table className="table-lab" aria-label="Minimum nodes per AVL height">
        <thead>
          <tr>
            <th>Height h</th>
            <th>Fewest nodes N(h)</th>
            <th>N(h) = N(h−1) + N(h−2) + 1</th>
            <th>log₂(N(h)+1)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <tr key={h}>
              <td className="font-mono">{h}</td>
              <td className="font-mono">{minNodesForHeight(h)}</td>
              <td className="font-mono text-muted">{h <= 2 ? 'base case' : `${minNodesForHeight(h - 1)} + ${minNodesForHeight(h - 2)} + 1`}</td>
              <td className="font-mono">{Math.log2(minNodesForHeight(h) + 1).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollRegion>
  );
}
