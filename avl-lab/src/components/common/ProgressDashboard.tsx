import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { LESSONS } from '../lessons/lessons';
import { useProgress } from '../../hooks/useProgress';
import { useToast } from '../../hooks/useToast';
import { Modal, ProgressBar } from './ui';

/** Every number here comes from real recorded activity in this browser (localStorage). */
export function ProgressDashboard() {
  const { stats, data, reset } = useProgress();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const empty = stats.lessonsDone === 0 && stats.rotationsDone === 0 && stats.answered === 0 && data.visualizerOps === 0;
  return (
    <section className="card card-pad" aria-label="Learning progress">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg">Your learning progress</h2>
          <p className="text-xs text-muted">Saved only in this browser. No account, no tracking.</p>
        </div>
        <button className="btn btn-sm btn-danger" onClick={() => setConfirm(true)} disabled={empty}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset progress
        </button>
      </div>
      {empty && <p className="mb-4 rounded-xl border border-dashed border-line p-3 text-sm text-muted">Nothing recorded yet. Complete a lesson, explore a rotation, or answer a quiz question and your progress will appear here.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <ProgressBar value={stats.lessonsDone} max={LESSONS.length} label="Lessons completed" />
        <ProgressBar value={stats.rotationsDone} max={4} label="Rotation cases explored" />
        <ProgressBar value={stats.correct} max={Math.max(stats.answered, 1)} label={`Quiz: correct of answered${stats.accuracy !== null ? ` (${stats.accuracy}% accuracy)` : ''}`} />
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-bg p-2">
            <div className="text-xl font-semibold">{stats.answered}</div>
            <div className="text-[11px] text-muted">questions answered</div>
          </div>
          <div className="rounded-xl bg-bg p-2">
            <div className="text-xl font-semibold">{data.visualizerOps}</div>
            <div className="text-[11px] text-muted">visualizer sessions</div>
          </div>
        </div>
      </div>
      {stats.revisionTopics.length > 0 && (
        <div className="mt-4">
          <p className="panel-title mb-2">Topics to revise (questions you last answered wrongly)</p>
          <div className="flex flex-wrap gap-2">
            {stats.revisionTopics.map((t) => (
              <span key={t.topic} className="chip chip-warn">
                {t.topic} · {t.wrong}
              </span>
            ))}
          </div>
        </div>
      )}
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset all progress?">
        <p className="mb-4 text-sm text-muted">This deletes your completed lessons, explored rotations and quiz history from this browser. It cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => setConfirm(false)} autoFocus>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              reset();
              setConfirm(false);
              toast('Progress reset.', 'info');
            }}
          >
            Yes, reset
          </button>
        </div>
      </Modal>
    </section>
  );
}
