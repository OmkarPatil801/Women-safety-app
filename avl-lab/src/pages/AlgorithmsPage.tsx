import { Clock, HardDrive, Network } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { CodeBlock } from '../components/code/CodeBlock';
import { Breadcrumbs, Callout, PageHeader } from '../components/common/ui';
import { ALGORITHMS, GLOSSARY_OF_NAMES } from '../features/algorithms/algorithms';

export default function AlgorithmsPage() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('algo') ?? ALGORITHMS[0].id;
  const algo = ALGORITHMS.find((a) => a.id === selectedId) ?? ALGORITHMS[0];
  const index = ALGORITHMS.indexOf(algo);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Algorithms & Pseudocode' }]} />
        <PageHeader eyebrow="Reference" title="Algorithms & Pseudocode" actions={<Link to="/visualizer" className="btn btn-primary"><Network className="h-4 w-4" /> Watch them run</Link>}>
          Thirteen algorithms in plain, language-independent pseudocode. Read the idea first, then see the real C and C++ versions. In the Interactive Visualizer, the &quot;Pseudocode&quot; tab highlights the line that each recorded step corresponds to.
        </PageHeader>
      </div>

      <details className="card card-pad">
        <summary className="cursor-pointer font-semibold">Names used in the pseudocode</summary>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
          {GLOSSARY_OF_NAMES.map((g) => (
            <div key={g.name}>
              <dt className="inline font-mono font-semibold text-accent">{g.name}</dt>
              <dd className="inline"> - {g.meaning}</dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <nav aria-label="Algorithms" className="card card-pad !p-3 self-start lg:sticky lg:top-6">
          <ol className="space-y-0.5">
            {ALGORITHMS.map((a, i) => (
              <li key={a.id}>
                <button
                  onClick={() => setParams({ algo: a.id })}
                  aria-current={a.id === algo.id ? 'true' : undefined}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${a.id === algo.id ? 'bg-accent/15 text-accent' : 'text-ink/80 hover:bg-raised'}`}
                >
                  <span className="w-5 text-right text-xs text-muted">{i + 1}</span>
                  {a.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0 space-y-5" aria-labelledby="algo-title">
          <header>
            <h2 id="algo-title" className="text-2xl">
              {index + 1}. {algo.title}
            </h2>
            <p className="mt-1 text-[15.5px] text-ink/90">{algo.purpose}</p>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            <Info title="Preconditions" items={algo.preconditions} />
            <Info title="Inputs" items={algo.inputs} />
            <Info title="Outputs" items={algo.outputs} />
          </div>

          <section>
            <h3 className="mb-2">How it works</h3>
            <ol className="prose-lab !mt-0">
              {algo.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </section>

          <CodeBlock lang="text" title={`${algo.title} - pseudocode`} code={algo.pseudocode.map((l) => l.text).join('\n')} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card card-pad !p-4">
              <p className="panel-title mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden /> Time complexity
              </p>
              <p className="font-mono text-sm text-accent">{algo.time}</p>
            </div>
            <div className="card card-pad !p-4">
              <p className="panel-title mb-1 flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5" aria-hidden /> Space complexity
              </p>
              <p className="font-mono text-sm text-accent">{algo.space}</p>
            </div>
          </div>

          <Callout kind="warn" title="Common mistakes">
            <ul className="!my-1 list-disc space-y-1 pl-5">
              {algo.mistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </Callout>

          <p className="text-sm text-muted">
            See this algorithm as real code: <Link to="/c">C implementation</Link> · <Link to="/cpp">C++ implementation</Link>
          </p>

          <div className="flex justify-between gap-2 border-t border-line pt-4">
            <button className="btn" disabled={index === 0} onClick={() => setParams({ algo: ALGORITHMS[index - 1].id })}>
              ← {index > 0 ? ALGORITHMS[index - 1].title : 'Previous'}
            </button>
            <button className="btn" disabled={index === ALGORITHMS.length - 1} onClick={() => setParams({ algo: ALGORITHMS[index + 1].id })}>
              {index < ALGORITHMS.length - 1 ? ALGORITHMS[index + 1].title : 'Next'} →
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

function Info({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card card-pad !p-4">
      <p className="panel-title mb-1.5">{title}</p>
      <ul className="space-y-1 text-sm">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
