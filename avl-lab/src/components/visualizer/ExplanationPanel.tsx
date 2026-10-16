import { AlertTriangle, ArrowRightLeft, Layers3 } from 'lucide-react';
import type { NodeInfo, OperationResult, Step } from '../../features/avl';
import { NodeInspector } from './NodeInspector';

const COMPLEXITY: Record<OperationResult['type'], { time: string; space: string; note: string }> = {
  insert: { time: 'O(log n)', space: 'O(log n) call stack', note: 'One walk down and back up the path; at most one single or double rotation.' },
  delete: { time: 'O(log n)', space: 'O(log n) call stack', note: 'Search + successor walk + walk back up; up to O(log n) rotations.' },
  search: { time: 'O(log n)', space: 'O(1) iterative', note: 'Each comparison discards one subtree; AVL height is at most about 1.44·log₂(n).' },
  traversal: { time: 'O(n)', space: 'O(h) stack / O(w) queue', note: 'Every node is visited exactly once.' },
};

export function ExplanationPanel({
  step,
  session,
  info,
  size,
  height,
  valid,
  errors,
}: {
  step: Step | null;
  session: OperationResult | null;
  info: NodeInfo | null;
  size: number;
  height: number;
  valid: boolean;
  errors: string[];
}) {
  const complexity = session ? COMPLEXITY[session.type] : null;
  return (
    <div className="space-y-4">
      <section className="card card-pad" aria-live="polite" aria-label="Operation explanation">
        <p className="panel-title mb-2">{step ? `Step ${step.index + 1} · ${step.kind.replace('-', ' ')}` : 'Explanation'}</p>
        {step ? (
          <>
            <h3 className="mb-1.5">{step.title}</h3>
            <p className="text-[15px] leading-7 text-ink/90">{step.explanation}</p>
            {step.note && <p className="mt-2 rounded-lg bg-info/10 px-3 py-2 font-mono text-xs text-ink">{step.note}</p>}
            {step.imbalance && (
              <div className="mt-3 rounded-xl border border-bad/40 bg-bad/10 p-3 text-sm">
                <p className="mb-1 flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-bad" aria-hidden /> Balance-factor check
                </p>
                <ul className="space-y-0.5 font-mono text-xs">
                  <li>
                    BF({step.imbalance.nodeKey}) = {step.imbalance.balanceFactor > 0 ? '+' : ''}
                    {step.imbalance.balanceFactor}
                  </li>
                  <li>
                    BF(child {step.imbalance.childKey}) = {step.imbalance.childBalanceFactor > 0 ? '+' : ''}
                    {step.imbalance.childBalanceFactor}
                  </li>
                  <li className="font-semibold">→ {step.imbalance.rotationCase} case</li>
                </ul>
              </div>
            )}
            {step.rotation && (
              <div className="mt-3 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
                <p className="mb-1 flex items-center gap-1.5 font-semibold">
                  <ArrowRightLeft className="h-4 w-4 text-warn" aria-hidden />
                  {step.rotation.direction === 'right' ? 'Right' : 'Left'} rotation about {step.rotation.pivotKey}
                  <span className="chip chip-warn ml-auto">{step.rotation.rotationCase}</span>
                </p>
                <p className="text-xs text-muted">
                  Pivot (moves down): <b className="text-ink">{step.rotation.pivotKey}</b> · New subtree root (moves up): <b className="text-ink">{step.rotation.newRootKey}</b> · Middle subtree handed over:{' '}
                  <b className="text-ink">{step.rotation.movedSubtreeKey ?? 'empty'}</b>
                </p>
                <p className="mt-2 text-xs font-semibold">Pointer changes</p>
                <ul className="mt-1 space-y-1 font-mono text-[11.5px] leading-5">
                  {step.rotation.pointerChanges.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}
            {step.callStack.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <Layers3 className="h-3.5 w-3.5" aria-hidden /> Recursion call stack (top = innermost)
                </p>
                <ol className="flex flex-col-reverse gap-1" aria-label="Call stack">
                  {step.callStack.map((c, i) => (
                    <li key={i} className={`rounded-md border px-2 py-1 font-mono text-xs ${i === step.callStack.length - 1 ? 'border-accent/60 bg-accent/10' : 'border-line bg-bg text-muted'}`}>
                      {c}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="mb-1.5">Ready</h3>
            <p className="text-[15px] leading-7 text-ink/90">
              Insert, delete or search a value and every decision the algorithm makes is explained here, step by step. Use the playback bar to pause, go back, or change the speed.
            </p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-bg p-2">
                <dt className="text-[11px] text-muted">Nodes</dt>
                <dd className="text-lg font-semibold">{size}</dd>
              </div>
              <div className="rounded-xl bg-bg p-2">
                <dt className="text-[11px] text-muted">Height</dt>
                <dd className="text-lg font-semibold">{height}</dd>
              </div>
              <div className="rounded-xl bg-bg p-2">
                <dt className="text-[11px] text-muted">AVL valid</dt>
                <dd className={`text-lg font-semibold ${valid ? 'text-good' : 'text-bad'}`}>{valid ? 'Yes ✓' : 'No ✗'}</dd>
              </div>
            </dl>
            {!valid && <p className="mt-2 text-xs text-bad">{errors[0]}</p>}
          </>
        )}
      </section>

      <section className="card card-pad" aria-label="Node properties">
        <p className="panel-title mb-3">Node properties</p>
        <NodeInspector info={info} />
      </section>

      {complexity && (
        <section className="card card-pad" aria-label="Complexity of this operation">
          <p className="panel-title mb-2">Complexity of this operation</p>
          <p className="text-sm">
            Time <b className="font-mono text-accent">{complexity.time}</b> · Space <b className="font-mono text-accent">{complexity.space}</b>
          </p>
          <p className="mt-1 text-xs text-muted">{complexity.note}</p>
        </section>
      )}
    </div>
  );
}
