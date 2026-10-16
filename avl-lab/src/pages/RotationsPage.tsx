import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotationCaseView } from '../components/lessons/RotationCaseView';
import { Breadcrumbs, Callout, PageHeader, Tabs } from '../components/common/ui';
import { TreeFigure } from '../components/tree/TreeFigure';
import { StepPlayer } from '../components/visualizer/StepPlayer';
import { CASES, equalityDemo } from '../features/lessons/rotationScenarios';
import type { RotationCase } from '../features/avl';
import { useProgress } from '../hooks/useProgress';

export default function RotationsPage() {
  const [active, setActive] = useState<RotationCase>('LL');
  const { data } = useProgress();
  const config = CASES.find((c) => c.id === active)!;
  const demo = useMemo(() => equalityDemo(), []);

  return (
    <div className="space-y-10">
      <div>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Rotations Lab' }]} />
        <PageHeader eyebrow="Rotations Lab" title="The four rotation cases">
          A rotation is a tiny local rearrangement that lowers the heavy side and raises the light side without breaking the BST order. Every picture and animation on this page is produced by the real AVL algorithm.
        </PageHeader>
        <div className="card card-pad">
          <h2 className="mb-2 text-lg">How to read the names</h2>
          <p className="prose-lab !mt-0 text-sm">
            Find the <b>first unbalanced ancestor</b> z (|BF| &gt; 1). The two letters say where the extra height is: the first letter is the side of z (<b>L</b>eft or <b>R</b>ight), the second is the side of z&apos;s child. <b>LL</b> and <b>RR</b> are &quot;straight lines&quot; and need one rotation. <b>LR</b> and <b>RL</b> are &quot;zig-zags&quot; and need two.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span>Explored so far:</span>
            {CASES.map((c) => (
              <span key={c.id} className={`chip ${data.rotations.includes(c.id) ? 'chip-good' : ''}`}>
                {data.rotations.includes(c.id) && <CheckCircle2 className="h-3 w-3" aria-hidden />} {c.id}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-20 -mx-4 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
        <Tabs
          label="Rotation case"
          value={active}
          onChange={setActive}
          tabs={CASES.map((c) => ({ id: c.id, label: `${c.id} · ${c.longName}` }))}
        />
      </div>

      <RotationCaseView key={config.id} config={config} />

      <section className="space-y-4" aria-label="Balance factor rules">
        <h2>Which rotation? The balance-factor rules</h2>
        <p className="prose-lab text-[15.5px]">
          The algorithm looks at the balance factor of the unbalanced node <b>z</b> and of its <b>heavy child</b>. The same four rules are used for insertion and for deletion.
        </p>
        <div className="card overflow-x-auto">
          <table className="table-lab" aria-label="Rotation decision table">
            <thead>
              <tr>
                <th>BF(z)</th>
                <th>BF(heavy child)</th>
                <th>Case</th>
                <th>What to do</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="font-mono">&gt; 1 (left-heavy)</td><td className="font-mono">≥ 0</td><td><span className="chip chip-accent">LL</span></td><td>Right rotation on z</td></tr>
              <tr><td className="font-mono">&gt; 1 (left-heavy)</td><td className="font-mono">&lt; 0</td><td><span className="chip chip-accent">LR</span></td><td>Left rotation on z.left, then right rotation on z</td></tr>
              <tr><td className="font-mono">&lt; −1 (right-heavy)</td><td className="font-mono">≤ 0</td><td><span className="chip chip-info">RR</span></td><td>Left rotation on z</td></tr>
              <tr><td className="font-mono">&lt; −1 (right-heavy)</td><td className="font-mono">&gt; 0</td><td><span className="chip chip-info">RL</span></td><td>Right rotation on z.right, then left rotation on z</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" title="Why the equality cases (= 0) matter">
          <p>
            After an <b>insertion</b> the heavy child can never have BF = 0, so beginners often write <code>&gt; 0</code> / <code>&lt; 0</code> tests and never notice. After a <b>deletion</b> it can happen, and then the extra height sits under <i>both</i> of the child&apos;s subtrees. A <b>single</b> rotation is the correct fix; using the double rotation here can leave the tree unbalanced. That is why LL uses <code>≥ 0</code> and RR uses <code>≤ 0</code>.
          </p>
        </Callout>

        <div className="card card-pad space-y-4">
          <h3>Demonstration: deletion where the child&apos;s BF is 0</h3>
          <p className="text-sm text-muted">
            Start with the valid AVL tree below and delete <b className="text-ink">{demo.deleteKey}</b>. Node 10 becomes right-heavy (BF = −2) while its right child 30 has BF = 0. Both results below are computed with the real rotation functions.
          </p>
          <div className="grid gap-3 md:grid-cols-4">
            <TreeFigure root={demo.before} caption="Valid AVL tree" tone="good" minHeight={220} />
            <TreeFigure root={demo.afterRemoval} caption={<>After removing {demo.deleteKey}: BF(10) = −2, BF(30) = 0</>} tone="bad" minHeight={220} />
            <TreeFigure root={demo.correct} caption={<><b className="text-good">Correct:</b> ONE left rotation about 10 - {demo.correctValid ? 'valid AVL tree' : 'invalid'}</>} tone="good" minHeight={220} />
            <TreeFigure root={demo.wrong} caption={<><b className="text-bad">Wrong:</b> double rotation (RL) - {demo.wrongValid ? 'valid' : 'NOT a valid AVL tree'}</>} tone="bad" minHeight={220} />
          </div>
          {demo.wrongError && <p className="rounded-lg border border-bad/40 bg-bad/10 p-3 font-mono text-xs">Validator says: {demo.wrongError}</p>}
          <details className="rounded-xl border border-line bg-bg p-3">
            <summary className="cursor-pointer text-sm font-medium">Step through the correct deletion</summary>
            <div className="mt-3">
              <StepPlayer steps={demo.steps} resetKey="equality" canvasHeight={320} />
            </div>
          </details>
        </div>
        <p className="text-sm text-muted">
          Want to try your own sequences? Open the <Link to="/visualizer">Interactive Visualizer</Link> or see the <Link to="/algorithms">rebalance pseudocode</Link>.
        </p>
      </section>
    </div>
  );
}
