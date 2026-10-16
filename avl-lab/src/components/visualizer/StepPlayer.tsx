import { ArrowRightLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Step } from '../../features/avl';
import { usePlayback } from '../../hooks/usePlayback';
import { useSettings } from '../../hooks/useSettings';
import { TreeCanvas, TreeLegend } from '../tree/TreeCanvas';
import { PlaybackBar } from './PlaybackBar';
import { StepTimeline } from './StepTimeline';
import { PseudocodePanel } from './PseudocodePanel';

interface StepPlayerProps {
  steps: Step[];
  /** Change this value to restart playback (e.g. when switching examples). */
  resetKey?: string | number;
  canvasHeight?: number;
  startAtEnd?: boolean;
  /** Called once per resetKey when the learner has reached the last step. */
  onReachedEnd?: () => void;
  showPseudocode?: boolean;
  showTimeline?: boolean;
}

/** Self-contained playback of recorded algorithm steps (used by lessons and the Rotations Lab). */
export function StepPlayer({ steps, resetKey, canvasHeight = 330, startAtEnd = false, onReachedEnd, showPseudocode = false, showTimeline = false }: StepPlayerProps) {
  const playback = usePlayback(steps.length);
  const { showMetrics } = useSettings();
  const [reported, setReported] = useState<string | number | undefined>(undefined);

  useEffect(() => {
    playback.reset(startAtEnd ? Math.max(steps.length - 1, 0) : 0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, steps]);

  const step = steps[playback.index];
  const atEnd = steps.length > 0 && playback.index >= steps.length - 1;
  useEffect(() => {
    if (atEnd && onReachedEnd && reported !== resetKey) {
      setReported(resetKey);
      onReachedEnd();
    }
  }, [atEnd, onReachedEnd, reported, resetKey]);

  if (!step) return null;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="min-w-0 space-y-3">
          <TreeCanvas root={step.tree} highlights={step.highlights} showMetrics={showMetrics} height={canvasHeight} interactive ariaLabel="Step-by-step tree" maxFitScale={1.1} />
          <PlaybackBar playback={playback} count={steps.length} />
          <TreeLegend items={['active', 'path', 'created', 'unbalanced', 'rotating', 'removed', 'found']} />
        </div>
        <div className="card card-pad min-w-0 self-start" aria-live="polite">
          <p className="panel-title mb-1">
            Step {step.index + 1} of {steps.length}
          </p>
          <h3 className="mb-1.5">{step.title}</h3>
          <p className="text-[15px] leading-7 text-ink/90">{step.explanation}</p>
          {step.imbalance && (
            <p className="mt-3 rounded-lg border border-bad/40 bg-bad/10 p-2.5 font-mono text-xs">
              BF({step.imbalance.nodeKey}) = {step.imbalance.balanceFactor > 0 ? '+' : ''}
              {step.imbalance.balanceFactor}, BF({step.imbalance.childKey}) = {step.imbalance.childBalanceFactor > 0 ? '+' : ''}
              {step.imbalance.childBalanceFactor} → {step.imbalance.rotationCase}
            </p>
          )}
          {step.callStack.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-semibold text-muted">Recursion call stack (top = innermost call)</p>
              <ol className="flex flex-col-reverse gap-1" aria-label="Call stack">
                {step.callStack.map((c, i) => (
                  <li key={i} className={`rounded-md border px-2 py-1 font-mono text-xs ${i === step.callStack.length - 1 ? 'border-accent/60 bg-accent/10' : 'border-line bg-bg text-muted'}`}>
                    {c}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {step.rotation && (
            <div className="mt-3 rounded-lg border border-warn/40 bg-warn/10 p-2.5 text-xs">
              <p className="mb-1 flex items-center gap-1.5 font-semibold">
                <ArrowRightLeft className="h-3.5 w-3.5 text-warn" aria-hidden /> Pointer changes
              </p>
              <ul className="space-y-1 font-mono text-[11.5px] leading-5">
                {step.rotation.pointerChanges.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {(showTimeline || showPseudocode) && (
        <div className="grid gap-3 md:grid-cols-2">
          {showTimeline && <StepTimeline steps={steps} index={playback.index} onSelect={playback.goTo} />}
          {showPseudocode && <PseudocodePanel line={step.line} />}
        </div>
      )}
    </div>
  );
}
