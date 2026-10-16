import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ALGORITHMS } from '../../features/algorithms/algorithms';
import { functionSnippet, pseudoLinesFor, rebalanceLinesFor } from '../../features/codeExamples/snippets';
import type { Lang } from '../../features/codeExamples/sources';
import { buildScenario, wrongSingleRotation, type CaseConfig } from '../../features/lessons/rotationScenarios';
import { useProgress } from '../../hooks/useProgress';
import { BalanceTable } from '../tree/BalanceTable';
import { TreeFigure } from '../tree/TreeFigure';
import { CodeBlock } from '../code/CodeBlock';
import { Callout, KnowledgeCheck, Tabs, type QuickQuestion } from '../common/ui';
import { StepPlayer } from '../visualizer/StepPlayer';

const PRACTICE: Record<string, QuickQuestion> = {
  LL: {
    question: 'You insert 30, 20, 10 into an empty AVL tree. Which node is the FIRST unbalanced ancestor of the new node 10?',
    options: ['10', '20', '30'],
    answer: 2,
    explanation: 'Balance factors are computed on the way back up. 20 has BF +1 (allowed). 30 has BF +2 - the first violation - so the rotation is anchored at 30.',
  },
  RR: {
    question: 'For 10, 20, 30 (before rotating), what is the balance factor of the root 10?',
    options: ['+2', '−2', '0', '−1'],
    answer: 1,
    explanation: 'height(left) = 0 and height(right) = 2, so BF = 0 − 2 = −2 (right-heavy).',
  },
  LR: {
    question: 'In the LR case (30, 10, 20), which sequence of rotations fixes the tree?',
    options: ['One right rotation about 30', 'Left rotation about 10, then right rotation about 30', 'One left rotation about 10', 'Right rotation about 10, then left rotation about 30'],
    answer: 1,
    explanation: 'First the left child (10) is rotated left, turning the zig-zag into a straight line (LL shape). Then 30 is rotated right.',
  },
  RL: {
    question: 'In the RL case (10, 30, 20) the unbalanced node is 10 and its right child 30 has BF = +1. Which rotations are performed?',
    options: ['Left rotation about 10 only', 'Right rotation about 30, then left rotation about 10', 'Left rotation about 30, then right rotation about 10', 'Right rotation about 10 only'],
    answer: 1,
    explanation: 'BF(10) = −2 and its right child is LEFT-heavy (+1), so the extra height is on the inside: rotate the child right first, then the node left.',
  },
};

export function RotationCaseView({ config }: { config: CaseConfig }) {
  const scenario = useMemo(() => buildScenario(config), [config]);
  const { exploreRotation, data } = useProgress();
  const [lang, setLang] = useState<'pseudo' | Lang>('pseudo');
  const double = config.id === 'LR' || config.id === 'RL';
  const wrong = useMemo(() => (double ? wrongSingleRotation(scenario) : null), [double, scenario]);
  const seq = [...config.setup, config.trigger].join(', ');
  const explored = data.rotations.includes(config.id);

  const rebalancePseudo = ALGORITHMS.find((a) => a.id === 'rebalance')!;
  const pseudoCode = rebalancePseudo.pseudocode.map((l) => l.text).join('\n');
  const pseudoHl = pseudoLinesFor(rebalancePseudo.pseudocode.map((l) => l.tag), config.id);
  const snippetC = functionSnippet('c', 'rebalance')!;
  const snippetCpp = functionSnippet('cpp', 'rebalance')!;
  const rotateName = config.id === 'LL' || config.id === 'LR' ? 'rightRotate' : 'leftRotate';
  const firstRotateName = config.id === 'LR' ? 'leftRotate' : config.id === 'RL' ? 'rightRotate' : null;

  const info = scenario.rotations;
  const first = info[0];
  const last = info[info.length - 1];
  const unbalancedFlag = scenario.unbalancedUid >= 0 ? [scenario.unbalancedUid] : [];

  return (
    <div className="space-y-8">
      {/* 1. Summary */}
      <section className="card card-pad">
        <div className="flex flex-wrap items-center gap-2">
          <h2>{config.title}</h2>
          {explored && (
            <span className="chip chip-good">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> explored
            </span>
          )}
        </div>
        <p className="mt-2 text-[15.5px] leading-7 text-ink/90">
          Insert <b className="font-mono">{seq}</b> into an empty AVL tree. The imbalance appears in <b>{config.where}</b>, so the fix is <b>{config.rotation}</b>.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-bg p-3">
            <dt className="panel-title">Inserted value &amp; location</dt>
            <dd className="mt-1 text-sm">
              <b className="font-mono">{config.trigger}</b> is attached as the {config.trigger < (scenario.insertionParentKey ?? 0) ? 'left' : 'right'} child of <b className="font-mono">{scenario.insertionParentKey}</b>.
            </dd>
          </div>
          <div className="rounded-xl border border-bad/40 bg-bad/5 p-3">
            <dt className="panel-title text-bad">First unbalanced ancestor</dt>
            <dd className="mt-1 text-sm">
              <b className="font-mono">{scenario.unbalancedKey}</b>, with BF = <b className="font-mono">{scenario.balanceFactor > 0 ? '+' : ''}{scenario.balanceFactor}</b>. Its {scenario.balanceFactor > 0 ? 'left' : 'right'} child{' '}
              <b className="font-mono">{scenario.childKey}</b> has BF = <b className="font-mono">{scenario.childBalanceFactor > 0 ? '+' : ''}{scenario.childBalanceFactor}</b>.
            </dd>
          </div>
          <div className="rounded-xl border border-warn/40 bg-warn/5 p-3">
            <dt className="panel-title text-warn">Rotation performed on</dt>
            <dd className="mt-1 text-sm">
              {double ? (
                <>
                  1) <b className="font-mono">{first.pivotKey}</b> ({first.direction}), then 2) <b className="font-mono">{last.pivotKey}</b> ({last.direction})
                </>
              ) : (
                <>
                  <b className="font-mono">{first.pivotKey}</b> ({first.direction} rotation)
                </>
              )}
              . New subtree root: <b className="font-mono">{last.newRootKey}</b>.
            </dd>
          </div>
        </dl>
        <Callout kind="info" title="Three different nodes - do not mix them up">
          <p>
            The <b>insertion location</b> is where the new node is attached ({scenario.insertionParentKey}). The <b>first unbalanced ancestor</b> is the lowest node on the path back to the root whose balance factor is outside [−1, 1] ({scenario.unbalancedKey}). The <b>rotation node</b> is the node the rotation is performed on - for a single rotation that is the unbalanced ancestor; for a double rotation the first rotation is on its child.
          </p>
        </Callout>
      </section>

      {/* 2. Before / unbalanced / after */}
      <section aria-label="Before and after">
        <h3 className="mb-3">Before → unbalanced → after</h3>
        <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <TreeFigure root={scenario.beforeInsert} caption={<>1. Before inserting {config.trigger}</>} />
          <ArrowRight className="mx-auto hidden h-5 w-5 text-muted md:block" aria-hidden />
          <TreeFigure root={scenario.unbalanced} highlights={{ unbalanced: unbalancedFlag }} tone="bad" caption={<>2. After inserting {config.trigger}: <b className="text-bad">violates AVL</b></>} />
          <ArrowRight className="mx-auto hidden h-5 w-5 text-muted md:block" aria-hidden />
          <TreeFigure root={scenario.finalTree} tone="good" caption={<>3. After the rotation{double ? 's' : ''}: <b className="text-good">balanced</b></>} />
        </div>
      </section>

      {/* 3. Balance factors */}
      <section aria-label="Balance factors" className="grid gap-4 lg:grid-cols-2">
        <div className="card card-pad">
          <h3 className="mb-1">Balance factors before the rotation</h3>
          <p className="mb-3 text-sm text-muted">
            BF = height(left) − height(right). Node {scenario.unbalancedKey} has BF {scenario.balanceFactor > 0 ? '+' : ''}
            {scenario.balanceFactor}, so its {scenario.balanceFactor > 0 ? 'left' : 'right'} side is two levels taller than the other side - that breaks the rule |BF| ≤ 1.
          </p>
          <BalanceTable root={scenario.unbalanced} flagged={unbalancedFlag} label="Balance factors before the rotation (table)" />
        </div>
        <div className="card card-pad">
          <h3 className="mb-1">Heights and balance factors after the rotation</h3>
          <p className="mb-3 text-sm text-muted">
            After the rotation{double ? 's' : ''} the heights of the moved nodes were recalculated, and every balance factor is back inside [−1, 1].
          </p>
          <BalanceTable root={scenario.finalTree} label="Balance factors after the rotation (table)" />
        </div>
      </section>

      {/* 4. Animation */}
      <section aria-label="Animated walkthrough">
        <h3 className="mb-1">Watch it happen</h3>
        <p className="mb-3 text-sm text-muted">These are the real recorded steps of inserting {config.trigger} ({scenario.steps.length} steps). Press Start, or use Next to go one step at a time.</p>
        <StepPlayer steps={scenario.steps} resetKey={config.id} canvasHeight={300} onReachedEnd={() => exploreRotation(config.id)} showTimeline />
      </section>

      {/* 5. Pointer changes */}
      <section className="card card-pad" aria-label="How the pointers change">
        <h3 className="mb-2">What the pointers do</h3>
        <ol className="space-y-4">
          {info.map((r, i) => (
            <li key={i}>
              <p className="font-medium">
                {double ? `Rotation ${i + 1} of 2: ` : ''}
                {r.direction === 'right' ? 'Right' : 'Left'} rotation about <span className="font-mono">{r.pivotKey}</span>
                <span className="text-muted"> - {r.newRootKey} moves up, {r.pivotKey} moves down{r.movedSubtreeKey !== null ? `, subtree ${r.movedSubtreeKey} changes parent` : ', the middle subtree is empty'}</span>
              </p>
              <ul className="mt-1.5 space-y-1 rounded-lg bg-bg p-3 font-mono text-xs leading-5">
                {r.pointerChanges.map((c, j) => (
                  <li key={j}>• {c}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        {double && wrong && (
          <div className="mt-5 border-t border-line pt-4">
            <h4 className="mb-1 font-semibold">Why is a single rotation not enough?</h4>
            <p className="mb-3 text-sm text-muted">
              Let us try the single {config.id === 'LR' ? 'right' : 'left'} rotation about {scenario.unbalancedKey} anyway (computed with the same rotation function the algorithm uses):
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TreeFigure root={scenario.unbalanced} caption="Unbalanced tree" tone="bad" />
              <TreeFigure root={wrong.tree} caption={<>After ONLY one rotation: <b className="text-bad">{wrong.valid ? 'balanced' : 'still unbalanced'}</b></>} tone={wrong.valid ? 'good' : 'bad'} />
            </div>
            <p className="mt-3 text-sm">
              The zig-zag shape just flips direction: <span className="font-mono">{wrong.firstError}</span>. The child must be rotated first so the extra height moves to the outside, and only then can the second rotation fix the root of the subtree.
            </p>
          </div>
        )}
      </section>

      {/* 6. Code */}
      <section aria-label="Pseudocode and code" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3>The code behind it</h3>
          <Tabs
            label="Code language"
            value={lang}
            onChange={setLang}
            tabs={[
              { id: 'pseudo', label: 'Pseudocode' },
              { id: 'c', label: 'C' },
              { id: 'cpp', label: 'C++' },
            ]}
          />
        </div>
        {lang === 'pseudo' && <CodeBlock lang="text" title="rebalance - pseudocode (highlighted lines apply to this case)" code={pseudoCode} highlightLines={pseudoHl} />}
        {lang === 'c' && (
          <>
            <CodeBlock lang="c" title="avl_tree.c - rebalance()" code={snippetC.code} startLine={snippetC.startLine} highlightLines={rebalanceLinesFor(snippetC.code, config.id)} />
            <RotateCode lang="c" id={rotateName} extra={firstRotateName} />
          </>
        )}
        {lang === 'cpp' && (
          <>
            <CodeBlock lang="cpp" title="avl_tree.cpp - rebalance()" code={snippetCpp.code} startLine={snippetCpp.startLine} highlightLines={rebalanceLinesFor(snippetCpp.code, config.id)} />
            <RotateCode lang="cpp" id={rotateName} extra={firstRotateName} />
          </>
        )}
        <p className="text-xs text-muted">These snippets are extracted from the same source files you can download on the C and C++ pages.</p>
      </section>

      {/* 7. Practice */}
      <section aria-label="Practice question">
        <KnowledgeCheck q={PRACTICE[config.id]} />
      </section>
    </div>
  );
}

function RotateCode({ lang, id, extra }: { lang: Lang; id: string; extra: string | null }) {
  const main = functionSnippet(lang, id);
  const other = extra ? functionSnippet(lang, extra) : null;
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {other && <CodeBlock lang={lang} title={`${extra}() - step 1`} code={other.code} startLine={other.startLine} />}
      {main && <CodeBlock lang={lang} title={`${id}()${extra ? ' - step 2' : ''}`} code={main.code} startLine={main.startLine} />}
    </div>
  );
}
