import { Check, History, X } from 'lucide-react';
import type { HistoryEntry } from '../../hooks/useVisualizer';

export function HistoryPanel({ history, onReplay }: { history: HistoryEntry[]; onReplay: (e: HistoryEntry) => void }) {
  if (!history.length) {
    return (
      <p className="flex items-start gap-2 text-sm text-muted">
        <History className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Your operations appear here, newest first. Operations that recorded steps can be replayed.
      </p>
    );
  }
  return (
    <ul className="scroll-thin max-h-72 space-y-1 overflow-auto pr-1" aria-label="Operation history">
      {[...history].reverse().map((h) => (
        <li key={h.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-raised">
          {h.ok ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-good" aria-label="succeeded" /> : <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" aria-label="no change" />}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{h.label}</p>
            <p className="text-muted">{h.message}</p>
          </div>
          {h.result && h.result.steps.length > 0 && (
            <button className="btn btn-sm" onClick={() => onReplay(h)} aria-label={`Replay ${h.label}`}>
              Replay
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
