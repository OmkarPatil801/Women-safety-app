import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { RotationCase } from '../features/avl';
import { computeStats, emptyProgress, PROGRESS_KEY, sanitizeProgress, type ProgressData, type ProgressStats } from '../features/progress/progress';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';

interface ProgressApi {
  data: ProgressData;
  stats: ProgressStats;
  completeLesson: (id: string) => void;
  exploreRotation: (c: RotationCase) => void;
  recordAnswer: (questionId: string, correct: boolean, topic: string) => void;
  recordVisualizerOp: (type?: string) => void;
  saveResult: (r: NonNullable<ProgressData['lastResult']>) => void;
  reset: () => void;
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData>(() => sanitizeProgress(readStorage<unknown>(PROGRESS_KEY, null)));
  useEffect(() => writeStorage(PROGRESS_KEY, data), [data]);

  const completeLesson = useCallback(
    (id: string) => setData((d) => (d.lessons.includes(id) ? d : { ...d, lessons: [...d.lessons, id] })),
    [],
  );
  const exploreRotation = useCallback(
    (c: RotationCase) => setData((d) => (d.rotations.includes(c) ? d : { ...d, rotations: [...d.rotations, c] })),
    [],
  );
  const recordAnswer = useCallback(
    (qid: string, correct: boolean, topic: string) =>
      setData((d) => ({ ...d, quiz: { ...d.quiz, [qid]: { correct, topic, attempts: (d.quiz[qid]?.attempts ?? 0) + 1 } } })),
    [],
  );
  const recordVisualizerOp = useCallback(
    (type?: string) => setData((d) => ({ ...d, visualizerOps: d.visualizerOps + 1, ops: type && !d.ops.includes(type) ? [...d.ops, type] : d.ops })),
    [],
  );
  const saveResult = useCallback((lastResult: NonNullable<ProgressData['lastResult']>) => setData((d) => ({ ...d, lastResult })), []);
  const reset = useCallback(() => {
    removeStorage(PROGRESS_KEY);
    setData(emptyProgress());
  }, []);

  const stats = useMemo(() => computeStats(data), [data]);
  const value = useMemo(
    () => ({ data, stats, completeLesson, exploreRotation, recordAnswer, recordVisualizerOp, saveResult, reset }),
    [data, stats, completeLesson, exploreRotation, recordAnswer, recordVisualizerOp, saveResult, reset],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProgress must be used inside ProgressProvider');
  return v;
}
