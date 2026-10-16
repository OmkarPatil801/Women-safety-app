import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, Breadcrumbs, PageHeader } from '../components/common/ui';
import { TreeCanvas, TreeLegend } from '../components/tree/TreeCanvas';
import { ControlsPanel } from '../components/visualizer/ControlsPanel';
import { ExplanationPanel } from '../components/visualizer/ExplanationPanel';
import { HistoryPanel } from '../components/visualizer/HistoryPanel';
import { PlaybackBar } from '../components/visualizer/PlaybackBar';
import { PseudocodePanel } from '../components/visualizer/PseudocodePanel';
import { StepTimeline } from '../components/visualizer/StepTimeline';
import { inspectNode } from '../features/avl';
import { useProgress } from '../hooks/useProgress';
import { useSettings } from '../hooks/useSettings';
import { useVisualizer } from '../hooks/useVisualizer';

type BottomTab = 'timeline' | 'pseudocode' | 'history';

export default function VisualizerPage() {
  const viz = useVisualizer();
  const { showMetrics, setShowMetrics } = useSettings();
  const { recordVisualizerOp } = useProgress();
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tab, setTab] = useState<BottomTab>('timeline');
  const [syncCode, setSyncCode] = useState(true);

  // Count real operations for the progress dashboard.
  const opCount = viz.history.length;
  const lastType = viz.history[viz.history.length - 1]?.result?.type;
  useEffect(() => {
    if (opCount > 0) recordVisualizerOp(lastType);
  }, [opCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drop the selection when the node no longer exists in the displayed tree.
  const info = useMemo(() => inspectNode(viz.displayedTree, hovered ?? selected), [viz.displayedTree, hovered, selected]);
  useEffect(() => {
    if (selected !== null && !inspectNode(viz.displayedTree, selected)) setSelected(null);
  }, [viz.displayedTree, selected]);

  // Keyboard shortcuts for stepping (when not typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, select, textarea, [role="slider"]')) return;
      if (e.key === 'ArrowRight' && viz.session) viz.playback.next();
      if (e.key === 'ArrowLeft' && viz.session) viz.playback.prev();
      if (e.key === ' ' && viz.session && t.tagName !== 'BUTTON') {
        e.preventDefault();
        viz.playback.playing ? viz.playback.pause() : viz.playback.play();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viz.session, viz.playback]);

  const stepCount = viz.session?.steps.length ?? 0;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Interactive Visualizer' }]} />
      <PageHeader
        eyebrow="Workspace"
        title="Interactive AVL Tree Visualizer"
        actions={
          <>
            <Link to="/rotations" className="btn">Rotations Lab</Link>
            <Link to="/algorithms" className="btn">Pseudocode</Link>
          </>
        }
      >
        A real AVL tree runs behind this canvas. Every step you see was recorded by the algorithm, so you can pause, step backwards and inspect any node.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[290px_minmax(0,1fr)_350px]">
        <aside className="card card-pad order-1 lg:row-span-2 xl:row-span-1" aria-label="Controls">
          <ControlsPanel viz={viz} />
        </aside>

        <section className="order-2 min-w-0 space-y-3" aria-label="Tree canvas">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-sm text-muted">
              <span>
                <b className="text-ink">{viz.displayedTree ? viz.size : 0}</b> nodes
              </span>
              <span>
                height <b className="text-ink">{viz.height}</b>
              </span>
              <span className={`chip ${viz.report.ok ? 'chip-good' : 'chip-bad'}`}>{viz.report.ok ? 'Valid AVL tree ✓' : 'Invalid ✗'}</span>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={showMetrics} onChange={(e) => setShowMetrics(e.target.checked)} className="accent-[rgb(var(--c-accent))]" />
              Show height &amp; balance factor
            </label>
          </div>
          <TreeCanvas
            root={viz.displayedTree}
            highlights={viz.step?.highlights}
            selectedUid={selected}
            onSelect={setSelected}
            onHover={setHovered}
            showMetrics={showMetrics}
            className="h-[360px] sm:h-[460px] lg:h-[520px]"
            empty={
              <div className="max-w-xs">
                <p className="text-base font-semibold">Your tree is empty</p>
                <p className="mt-1 text-sm text-muted">Type a number and press Enter, or load an example from the left panel. Try inserting 10, 20, 30 to see your first rotation.</p>
              </div>
            }
          />
          {viz.step?.kind === 'visit' || viz.step?.note ? (
            <p className="rounded-xl border border-info/40 bg-info/10 px-3 py-2 font-mono text-xs" aria-live="polite">
              {viz.step?.note}
            </p>
          ) : null}
          <PlaybackBar playback={viz.playback} count={stepCount} />
          <TreeLegend />
        </section>

        <aside className="order-3 min-w-0 lg:col-start-2 xl:col-start-3" aria-label="Explanation">
          <ExplanationPanel
            step={viz.step}
            session={viz.session}
            info={info}
            size={viz.size}
            height={viz.height}
            valid={viz.report.ok}
            errors={viz.report.errors}
          />
        </aside>
      </div>

      <section className="card card-pad mt-4" aria-label="Timeline, pseudocode and history">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <Tabs
            label="Bottom panel"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'timeline', label: `Step timeline${stepCount ? ` (${stepCount})` : ''}` },
              { id: 'pseudocode', label: 'Pseudocode' },
              { id: 'history', label: `History${viz.history.length ? ` (${viz.history.length})` : ''}` },
            ]}
          />
          {tab === 'pseudocode' && (
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={syncCode} onChange={(e) => setSyncCode(e.target.checked)} className="accent-[rgb(var(--c-accent))]" />
              Follow the current step
            </label>
          )}
        </div>
        {tab === 'timeline' && <StepTimeline steps={viz.session?.steps ?? []} index={viz.playback.index} onSelect={viz.playback.goTo} />}
        {tab === 'pseudocode' && <PseudocodePanel line={viz.step?.line} sync={syncCode} />}
        {tab === 'history' && <HistoryPanel history={viz.history} onReplay={viz.replay} />}
      </section>
    </div>
  );
}
