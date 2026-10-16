import { CheckCircle2, XCircle } from 'lucide-react';
import { useId } from 'react';
import { CodeBlock } from '../code/CodeBlock';
import { TreeFigure } from '../tree/TreeFigure';
import type { Question } from '../../features/quiz/questions';

export type AnswerValue = number | number[] | undefined;

interface Props {
  q: Question;
  /** Display order of options (indexes into q.options / q.right). */
  order: number[];
  answer: AnswerValue;
  draft: string;
  submitted: boolean;
  correct: boolean;
  onAnswer: (a: AnswerValue) => void;
  onDraft: (s: string) => void;
}

/** Renders one question for any type. The correct answer is never revealed before submission. */
export function QuestionView({ q, order, answer, draft, submitted, correct, onAnswer, onDraft }: Props) {
  const uid = useId();
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium leading-7">{q.prompt}</p>
      {q.figures && (
        <div className={`grid gap-3 ${q.figures.length > 1 ? 'sm:grid-cols-3' : ''}`}>
          {q.figures.map((f, i) => (
            <TreeFigure key={i} root={f.root} showMetrics={!f.hideMetrics} caption={f.label} minHeight={q.figures!.length > 1 ? 180 : 220} maxHeight={q.figures!.length > 1 ? 280 : 340} ariaLabel={f.label} />
          ))}
        </div>
      )}
      {q.code && <CodeBlock lang="c" code={q.code} title="C code" />}

      {q.type === 'mcq' && (
        <div role="radiogroup" aria-label="Answer options" className="space-y-2">
          {order.map((orig, shown) => {
            const picked = answer === orig;
            const isRight = submitted && orig === q.answer;
            const isWrong = submitted && picked && orig !== q.answer;
            return (
              <label
                key={orig}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-[15px] transition-colors ${
                  isRight ? 'border-good bg-good/10' : isWrong ? 'border-bad bg-bad/10' : picked ? 'border-accent bg-accent/10' : 'border-line hover:border-accent/50'
                } ${submitted ? 'cursor-default' : ''}`}
              >
                <input type="radio" name={uid} className="mt-1 accent-[rgb(var(--c-accent))]" checked={picked} disabled={submitted} onChange={() => onAnswer(orig)} />
                <span className="font-mono text-xs text-muted">{String.fromCharCode(65 + shown)}</span>
                <span className="flex-1">{q.options[orig]}</span>
                {isRight && (
                  <span className="chip chip-good">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Correct answer
                  </span>
                )}
                {isWrong && (
                  <span className="chip chip-bad">
                    <XCircle className="h-3.5 w-3.5" aria-hidden /> Your answer
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}

      {q.type === 'numeric' && (
        <div>
          <label htmlFor={uid} className="label">
            Your answer (a whole number)
          </label>
          <input
            id={uid}
            className="input !w-40 font-mono"
            inputMode="numeric"
            value={draft}
            disabled={submitted}
            placeholder="e.g. -1"
            onChange={(e) => {
              onDraft(e.target.value);
              const t = e.target.value.trim();
              onAnswer(/^[+-]?\d+$/.test(t) ? Number(t) : undefined);
            }}
          />
          {draft.trim() !== '' && answer === undefined && !submitted && <p className="mt-1 text-xs text-warn">Please type a whole number such as 2, 0 or -1.</p>}
          {submitted && !correct && (
            <p className="mt-2 text-sm">
              Correct answer: <b className="font-mono">{q.answer}</b>
            </p>
          )}
        </div>
      )}

      {q.type === 'match' && (
        <ul className="space-y-3">
          {q.left.map((l, i) => {
            const chosen = Array.isArray(answer) ? answer[i] : undefined;
            const ok = submitted && chosen === q.answer[i];
            const bad = submitted && chosen !== q.answer[i];
            return (
              <li key={i} className={`rounded-xl border p-3 ${ok ? 'border-good bg-good/10' : bad ? 'border-bad bg-bad/10' : 'border-line'}`}>
                <label className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="flex-1 whitespace-pre-wrap rounded-lg bg-bg px-3 py-2 text-[13px]">{l}</code>
                  <select
                    className="input sm:!w-72"
                    value={chosen ?? ''}
                    disabled={submitted}
                    aria-label={`Operation for fragment ${i + 1}`}
                    onChange={(e) => {
                      const next = Array.isArray(answer) ? [...answer] : new Array(q.left.length).fill(-1);
                      next[i] = e.target.value === '' ? -1 : Number(e.target.value);
                      onAnswer(next);
                    }}
                  >
                    <option value="">Choose…</option>
                    {order.map((orig) => (
                      <option key={orig} value={orig}>
                        {q.right[orig]}
                      </option>
                    ))}
                  </select>
                </label>
                {bad && <p className="mt-1 text-xs">Correct: {q.right[q.answer[i]]}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
