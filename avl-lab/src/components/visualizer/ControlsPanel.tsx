import { CornerDownLeft, Dices, FlaskConical, Layers, Redo2, Search, Trash2, Undo2, Eraser, Plus } from 'lucide-react';
import { useId, useState } from 'react';
import type { TraversalType } from '../../features/avl';
import { PRESETS } from '../../features/avl';
import type { PlayMode, useVisualizer } from '../../hooks/useVisualizer';
import { MAX_ABS_KEY } from '../../features/avl';

type Viz = ReturnType<typeof useVisualizer>;

const TRAVERSALS: { id: TraversalType; label: string }[] = [
  { id: 'inorder', label: 'In-order' },
  { id: 'preorder', label: 'Pre-order' },
  { id: 'postorder', label: 'Post-order' },
  { id: 'levelorder', label: 'Level-order' },
];

export function ControlsPanel({ viz }: { viz: Viz }) {
  const [value, setValue] = useState('');
  const [many, setMany] = useState('');
  const inputId = useId();
  const manyId = useId();
  const fbId = useId();
  const empty = viz.size === 0;

  const run = (fn: (raw: string) => boolean | void, clear = true) => {
    const r = fn(value);
    if (clear && r !== false) setValue('');
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor={inputId} className="label">
          Value (whole number, −{MAX_ABS_KEY} to {MAX_ABS_KEY})
        </label>
        <input
          id={inputId}
          className="input font-mono"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 42"
          value={value}
          aria-describedby={fbId}
          aria-invalid={viz.feedback?.kind === 'error' ? true : undefined}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run(viz.insert)}
        />
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
          <CornerDownLeft className="h-3 w-3" aria-hidden /> Press Enter to insert
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <button className="btn btn-primary" onClick={() => run(viz.insert)}>
            <Plus className="h-4 w-4" /> Insert
          </button>
          <button className="btn btn-danger" onClick={() => run(viz.remove)}>
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button className="btn" onClick={() => run(viz.search, false)}>
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
      </div>

      <div id={fbId} role={viz.feedback?.kind === 'error' ? 'alert' : 'status'} aria-live="polite" className="min-h-[1.5rem]">
        {viz.feedback && (
          <p
            className={`rounded-lg border px-3 py-2 text-xs leading-5 ${
              viz.feedback.kind === 'error' ? 'border-bad/40 bg-bad/10 text-ink' : viz.feedback.kind === 'ok' ? 'border-good/40 bg-good/10 text-ink' : 'border-line bg-raised text-ink'
            }`}
          >
            {viz.feedback.text}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={manyId} className="label">
          Insert several (comma separated)
        </label>
        <div className="flex gap-2">
          <input
            id={manyId}
            className="input font-mono"
            placeholder="10, 20, 30, 40"
            value={many}
            onChange={(e) => setMany(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                viz.insertMany(many);
                setMany('');
              }
            }}
          />
          <button
            className="btn"
            onClick={() => {
              viz.insertMany(many);
              setMany('');
            }}
            aria-label="Insert all listed values"
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <p className="panel-title mb-2">Tree</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn" onClick={viz.randomize}>
            <Dices className="h-4 w-4" /> Random
          </button>
          <button className="btn" onClick={viz.clear} disabled={empty}>
            <Eraser className="h-4 w-4" /> Clear
          </button>
          <button className="btn" onClick={viz.undo} disabled={!viz.canUndo}>
            <Undo2 className="h-4 w-4" /> Undo
          </button>
          <button className="btn" onClick={viz.redo} disabled={!viz.canRedo}>
            <Redo2 className="h-4 w-4" /> Redo
          </button>
        </div>
        <label className="label mt-3 flex items-center gap-1.5">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden /> Load example
        </label>
        <select
          className="input"
          value=""
          onChange={(e) => e.target.value && viz.loadPreset(e.target.value)}
          aria-label="Load an example tree"
        >
          <option value="">Choose an example…</option>
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="panel-title mb-2">Traversals</p>
        <div className="grid grid-cols-2 gap-2">
          {TRAVERSALS.map((t) => (
            <button key={t.id} className="btn btn-sm" onClick={() => viz.traverse(t.id)} disabled={empty}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="play-mode">
          After each operation
        </label>
        <select id="play-mode" className="input" value={viz.playMode} onChange={(e) => viz.setPlayMode(e.target.value as PlayMode)}>
          <option value="auto">Play the steps automatically</option>
          <option value="manual">Stop at step 1 (step manually)</option>
          <option value="instant">Jump to the final tree</option>
        </select>
      </div>
    </div>
  );
}
