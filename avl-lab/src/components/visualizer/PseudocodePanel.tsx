import { useEffect, useRef, useState } from 'react';
import { ALGORITHMS, resolveTag } from '../../features/algorithms/algorithms';
import { revealInContainer } from '../../utils/scroll';

/**
 * Shows pseudocode and highlights the line that matches the current recorded step.
 * Highlighting is step-level: each step carries the tag of the pseudocode line it corresponds to.
 */
export function PseudocodePanel({ line, sync = true }: { line?: string; sync?: boolean }) {
  const resolved = sync ? resolveTag(line) : null;
  const [manualId, setManualId] = useState('insert');
  const activeId = resolved ? resolved.algo.id : manualId;
  const algo = ALGORITHMS.find((a) => a.id === activeId) ?? ALGORITHMS[0];
  const activeRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resolved) setManualId(resolved.algo.id);
  }, [resolved?.algo.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    revealInContainer(boxRef.current, activeRef.current);
  }, [resolved?.lineIndex, activeId]);

  return (
    <div className="flex h-full flex-col">
      <label className="mb-2 flex items-center gap-2 text-xs text-muted">
        Algorithm
        <select className="input !min-h-[34px] !py-1 text-xs" value={algo.id} onChange={(e) => setManualId(e.target.value)} aria-label="Choose algorithm to show">
          {ALGORITHMS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </label>
      <div ref={boxRef} className="scroll-thin max-h-72 overflow-auto rounded-xl border border-line bg-bg py-2 font-mono text-[12.5px] leading-6" role="region" aria-label={`Pseudocode for ${algo.title}`} tabIndex={0}>
        {algo.pseudocode.map((l, i) => {
          const active = resolved && resolved.algo.id === algo.id && resolved.lineIndex === i;
          return (
            <div key={i} ref={active ? activeRef : undefined} className={`flex px-3 ${active ? 'bg-accent/20' : ''}`} aria-current={active ? 'step' : undefined}>
              <span className="w-6 shrink-0 select-none text-right text-muted/60">{i + 1}</span>
              <span className={`ml-3 whitespace-pre ${active ? 'font-semibold text-accent' : ''}`}>{l.text || ' '}</span>
              {active && <span className="ml-auto pl-3 text-[10px] font-sans font-semibold uppercase tracking-wide text-accent">now</span>}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">
        The highlighted line is the pseudocode line that the current step corresponds to (recorded by the algorithm itself, not guessed).
      </p>
    </div>
  );
}
