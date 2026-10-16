import { ChevronsLeft, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import type { usePlayback } from '../../hooks/usePlayback';

type Playback = ReturnType<typeof usePlayback>;

const SPEEDS = [0.5, 1, 1.5, 2, 4];

export function PlaybackBar({ playback, count }: { playback: Playback; count: number }) {
  const disabled = count === 0;
  const atEnd = playback.index >= count - 1;
  return (
    <div className="card flex flex-wrap items-center gap-2 p-3" role="group" aria-label="Step playback controls">
      <button className="btn btn-icon" onClick={() => playback.goTo(0)} disabled={disabled || playback.index === 0} aria-label="Go to first step" title="First step">
        <ChevronsLeft className="h-4 w-4" />
      </button>
      <button className="btn btn-icon" onClick={playback.prev} disabled={disabled || playback.index === 0} aria-label="Previous step" title="Previous step (←)">
        <SkipBack className="h-4 w-4" />
      </button>
      {playback.playing ? (
        <button className="btn btn-primary min-w-[96px]" onClick={playback.pause} aria-label="Pause">
          <Pause className="h-4 w-4" /> Pause
        </button>
      ) : (
        <button className="btn btn-primary min-w-[96px]" onClick={playback.play} disabled={disabled} aria-label={atEnd ? 'Start again from the first step' : playback.index > 0 ? 'Resume' : 'Start'}>
          <Play className="h-4 w-4" /> {atEnd && count > 0 ? 'Replay' : playback.index > 0 ? 'Resume' : 'Start'}
        </button>
      )}
      <button className="btn btn-icon" onClick={playback.next} disabled={disabled || atEnd} aria-label="Next step" title="Next step (→)">
        <SkipForward className="h-4 w-4" />
      </button>
      <button className="btn btn-icon" onClick={playback.restart} disabled={disabled} aria-label="Restart operation" title="Restart operation">
        <RotateCcw className="h-4 w-4" />
      </button>
      <div className="mx-1 hidden h-6 w-px bg-line sm:block" />
      <label className="flex items-center gap-2 text-xs text-muted">
        Speed
        <select className="input !min-h-[34px] !w-auto !py-1 text-xs" value={playback.speed} onChange={(e) => playback.setSpeed(Number(e.target.value))} aria-label="Animation speed">
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
      </label>
      <div className="ml-auto flex min-w-[160px] flex-1 items-center gap-3 sm:max-w-sm">
        <input
          type="range"
          min={0}
          max={Math.max(count - 1, 0)}
          value={playback.index}
          disabled={disabled}
          onChange={(e) => playback.goTo(Number(e.target.value))}
          className="w-full accent-[rgb(var(--c-accent))]"
          aria-label="Step position"
        />
        <span className="whitespace-nowrap text-xs tabular-nums text-muted" aria-live="polite">
          {disabled ? 'no steps' : `Step ${playback.index + 1} / ${count}`}
        </span>
      </div>
    </div>
  );
}
