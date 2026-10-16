import { useEffect, useRef } from 'react';
import type { Step } from '../../features/avl';
import { revealInContainer } from '../../utils/scroll';

const DOT: Record<Step['kind'], string> = {
  start: 'bg-muted',
  compare: 'bg-accent',
  create: 'bg-good',
  duplicate: 'bg-warn',
  found: 'bg-good',
  'not-found': 'bg-warn',
  'find-successor': 'bg-info',
  'copy-successor': 'bg-info',
  remove: 'bg-bad',
  check: 'bg-muted',
  imbalance: 'bg-bad',
  rotate: 'bg-warn',
  visit: 'bg-info',
  done: 'bg-good',
};

export function StepTimeline({ steps, index, onSelect }: { steps: Step[]; index: number; onSelect: (i: number) => void }) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => revealInContainer(listRef.current, activeRef.current), [index]);
  if (!steps.length) return <p className="text-sm text-muted">Run an insert, delete, search or traversal and every recorded step appears here. Click a step to jump to it.</p>;
  return (
    <ol ref={listRef} className="scroll-thin max-h-72 space-y-1 overflow-auto pr-1" aria-label="Step timeline">
      {steps.map((s, i) => (
        <li key={i}>
          <button
            ref={i === index ? activeRef : undefined}
            onClick={() => onSelect(i)}
            aria-current={i === index ? 'step' : undefined}
            className={`flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${i === index ? 'bg-accent/15 text-ink' : 'text-muted hover:bg-raised hover:text-ink'}`}
          >
            <span className="mt-1 flex shrink-0 items-center gap-1.5">
              <span className="w-5 text-right tabular-nums">{i + 1}</span>
              <span className={`h-2 w-2 rounded-full ${DOT[s.kind]}`} aria-hidden />
            </span>
            <span className="flex-1">
              {s.title}
              {s.kind === 'rotate' && <span className="ml-1.5 rounded bg-warn/20 px-1 text-[10px] font-semibold uppercase text-warn">rotation</span>}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
