import { useCallback, useMemo, useRef, useState } from 'react';
import { AvlTree, type OperationResult, type TraversalType, type TreeNode } from '../features/avl';
import { PRESETS } from '../features/avl/presets';
import { distinctInts } from '../utils/random';
import { parseKeyInput, parseKeyList } from '../utils/parseKey';
import { usePlayback } from './usePlayback';

export type PlayMode = 'auto' | 'manual' | 'instant';
export interface HistoryEntry {
  id: number;
  label: string;
  ok: boolean;
  message: string;
  result: OperationResult | null;
}
export interface Feedback {
  kind: 'ok' | 'error' | 'info';
  text: string;
}

const MAX_HISTORY = 60;
const MAX_UNDO = 100;
const MAX_NODES = 127;

/**
 * Orchestrates the live AVL tree, undo/redo, recorded step sessions and playback.
 * The AvlTree instance is the single source of truth: the canvas shows the snapshots it recorded.
 */
export function useVisualizer() {
  const engine = useRef(new AvlTree());
  const idCounter = useRef(1);
  const [tree, setTree] = useState<TreeNode | null>(null);
  // Undo/redo stacks live in refs (updaters must be pure); `stackVersion` re-renders when they change.
  const undoRef = useRef<(TreeNode | null)[]>([]);
  const redoRef = useRef<(TreeNode | null)[]>([]);
  const [stackVersion, setStackVersion] = useState(0);
  const [session, setSession] = useState<OperationResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [playMode, setPlayMode] = useState<PlayMode>('auto');
  const playback = usePlayback(session?.steps.length ?? 0);

  const addHistory = useCallback((label: string, result: OperationResult | null, ok: boolean, message: string) => {
    setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), { id: idCounter.current++, label, ok, message, result }]);
  }, []);

  const startSession = useCallback(
    (result: OperationResult, mode: PlayMode) => {
      setSession(result);
      const last = Math.max(result.steps.length - 1, 0);
      if (mode === 'instant') playback.reset(last, false);
      else playback.reset(0, mode === 'auto');
    },
    [playback],
  );

  const commit = useCallback((before: TreeNode | null) => {
    undoRef.current = [...undoRef.current.slice(-(MAX_UNDO - 1)), before];
    redoRef.current = [];
    setStackVersion((v) => v + 1);
    setTree(engine.current.snapshot());
  }, []);

  const finish = useCallback(
    (label: string, result: OperationResult, changed: boolean, before: TreeNode | null) => {
      if (changed) commit(before);
      if (result.steps.length) startSession(result, playMode);
      setFeedback({ kind: result.ok ? 'ok' : 'error', text: result.message });
      addHistory(label, result, result.ok, result.message);
    },
    [addHistory, commit, playMode, startSession],
  );

  const insert = useCallback(
    (raw: string): boolean => {
      const p = parseKeyInput(raw);
      if (!p.ok) {
        setFeedback({ kind: 'error', text: p.error });
        return false;
      }
      if (engine.current.size >= MAX_NODES) {
        setFeedback({ kind: 'error', text: `The visualizer is limited to ${MAX_NODES} nodes to stay readable. Delete something first.` });
        return false;
      }
      const before = engine.current.snapshot();
      const r = engine.current.insert(p.value);
      finish(`Insert ${p.value}`, r, r.ok, before);
      return r.ok;
    },
    [finish],
  );

  const remove = useCallback(
    (raw: string): boolean => {
      const p = parseKeyInput(raw);
      if (!p.ok) {
        setFeedback({ kind: 'error', text: p.error });
        return false;
      }
      const before = engine.current.snapshot();
      const r = engine.current.delete(p.value);
      finish(`Delete ${p.value}`, r, r.ok, before);
      return r.ok;
    },
    [finish],
  );

  const search = useCallback(
    (raw: string) => {
      const p = parseKeyInput(raw);
      if (!p.ok) {
        setFeedback({ kind: 'error', text: p.error });
        return;
      }
      const r = engine.current.search(p.value);
      finish(`Search ${p.value}`, { ...r, ok: r.ok }, false, null);
      if (r.ok) setFeedback({ kind: r.found ? 'ok' : 'info', text: r.message });
    },
    [finish],
  );

  const traverse = useCallback(
    (type: TraversalType) => {
      const r = engine.current.traverse(type);
      finish(`${type} traversal`, r, false, null);
    },
    [finish],
  );

  const insertMany = useCallback(
    (raw: string) => {
      const { keys, errors } = parseKeyList(raw);
      if (!keys.length) {
        setFeedback({ kind: 'error', text: errors[0] ?? 'Type numbers separated by commas, e.g. 10, 20, 30.' });
        return;
      }
      const room = MAX_NODES - engine.current.size;
      const before = engine.current.snapshot();
      let added = 0;
      let rotations = 0;
      let dupes = 0;
      for (const k of keys.slice(0, Math.max(room, 0))) {
        const r = engine.current.insert(k, { record: false });
        if (r.ok) {
          added++;
          rotations += r.rotations.length;
        } else dupes++;
      }
      if (added) commit(before);
      setSession(null);
      const msg = `Inserted ${added} value${added === 1 ? '' : 's'} (${rotations} rotation${rotations === 1 ? '' : 's'})${dupes ? `, skipped ${dupes} duplicate${dupes === 1 ? '' : 's'}` : ''}${errors.length ? `, ignored ${errors.length} invalid entr${errors.length === 1 ? 'y' : 'ies'}` : ''}.`;
      setFeedback({ kind: added ? 'ok' : 'error', text: msg });
      addHistory(`Insert many (${keys.length})`, null, added > 0, msg);
    },
    [addHistory, commit],
  );

  const loadKeys = useCallback(
    (keys: number[], label: string) => {
      const before = engine.current.snapshot();
      engine.current.clear();
      let rotations = 0;
      for (const k of keys) rotations += engine.current.insert(k, { record: false }).rotations.length;
      commit(before);
      setSession(null);
      const msg = `${label}: ${keys.length} nodes, height ${engine.current.height}, ${rotations} rotation${rotations === 1 ? '' : 's'} used while building.`;
      setFeedback({ kind: 'ok', text: msg });
      addHistory(label, null, true, msg);
    },
    [addHistory, commit],
  );

  const loadPreset = useCallback(
    (id: string) => {
      const p = PRESETS.find((x) => x.id === id);
      if (p) loadKeys(p.keys, `Example: ${p.label}`);
    },
    [loadKeys],
  );

  const randomize = useCallback(() => {
    const n = 7 + Math.floor(Math.random() * 6);
    loadKeys(distinctInts(n, 1, 99), 'Random tree');
  }, [loadKeys]);

  const clear = useCallback(() => {
    if (!engine.current.root) {
      setFeedback({ kind: 'info', text: 'The tree is already empty.' });
      return;
    }
    const before = engine.current.snapshot();
    engine.current.clear();
    commit(before);
    setSession(null);
    setFeedback({ kind: 'info', text: 'Tree cleared.' });
    addHistory('Clear tree', null, true, 'Tree cleared.');
  }, [addHistory, commit]);

  const undo = useCallback(() => {
    const prev = undoRef.current.pop();
    if (prev === undefined) return;
    redoRef.current.push(engine.current.snapshot());
    engine.current.restore(prev);
    setTree(engine.current.snapshot());
    setSession(null);
    setStackVersion((v) => v + 1);
    setFeedback({ kind: 'info', text: 'Undid the last change.' });
  }, []);

  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (next === undefined) return;
    undoRef.current.push(engine.current.snapshot());
    engine.current.restore(next);
    setTree(engine.current.snapshot());
    setSession(null);
    setStackVersion((v) => v + 1);
    setFeedback({ kind: 'info', text: 'Redid the change.' });
  }, []);

  const replay = useCallback(
    (entry: HistoryEntry) => {
      if (entry.result?.steps.length) startSession(entry.result, playMode === 'instant' ? 'auto' : playMode);
    },
    [playMode, startSession],
  );

  const step = session ? (session.steps[playback.index] ?? null) : null;
  const displayedTree = step ? step.tree : tree;
  const report = useMemo(() => engine.current.validate(), [tree]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    tree,
    displayedTree,
    step,
    session,
    history,
    feedback,
    setFeedback,
    playMode,
    setPlayMode,
    playback,
    canUndo: stackVersion >= 0 && undoRef.current.length > 0,
    canRedo: stackVersion >= 0 && redoRef.current.length > 0,
    size: engine.current.size,
    height: engine.current.height,
    report,
    insert,
    remove,
    search,
    traverse,
    insertMany,
    loadPreset,
    randomize,
    clear,
    undo,
    redo,
    replay,
    endSession: () => setSession(null),
  };
}
