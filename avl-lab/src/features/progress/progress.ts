import type { RotationCase } from '../avl';

/** Everything persisted about the learner. Lives only in this browser's localStorage. */
export interface ProgressData {
  version: 1;
  lessons: string[];
  rotations: RotationCase[];
  /** One entry per quiz question ever answered. `correct` reflects the most recent answer. */
  quiz: Record<string, { correct: boolean; attempts: number; topic: string }>;
  visualizerOps: number;
  /** Distinct visualizer operation types the learner has actually run (insert, delete, search, traversal). */
  ops: string[];
  lastResult?: { score: number; total: number; level: string; date: string };
}

export const PROGRESS_KEY = 'avl-lab:progress:v1';
export const emptyProgress = (): ProgressData => ({ version: 1, lessons: [], rotations: [], quiz: {}, visualizerOps: 0, ops: [] });

export function sanitizeProgress(raw: unknown): ProgressData {
  const base = emptyProgress();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<ProgressData>;
  return {
    version: 1,
    lessons: Array.isArray(r.lessons) ? r.lessons.filter((x): x is string => typeof x === 'string') : [],
    rotations: Array.isArray(r.rotations) ? r.rotations.filter((x): x is RotationCase => ['LL', 'RR', 'LR', 'RL'].includes(x as string)) : [],
    quiz: r.quiz && typeof r.quiz === 'object' ? r.quiz : {},
    visualizerOps: typeof r.visualizerOps === 'number' ? r.visualizerOps : 0,
    ops: Array.isArray(r.ops) ? r.ops.filter((x): x is string => typeof x === 'string') : [],
    lastResult: r.lastResult,
  };
}

export interface ProgressStats {
  lessonsDone: number;
  rotationsDone: number;
  answered: number;
  correct: number;
  accuracy: number | null;
  revisionTopics: { topic: string; wrong: number }[];
}

export function computeStats(p: ProgressData): ProgressStats {
  const entries = Object.values(p.quiz);
  const answered = entries.length;
  const correct = entries.filter((e) => e.correct).length;
  const wrongByTopic = new Map<string, number>();
  for (const e of entries) if (!e.correct) wrongByTopic.set(e.topic, (wrongByTopic.get(e.topic) ?? 0) + 1);
  return {
    lessonsDone: p.lessons.length,
    rotationsDone: new Set(p.rotations).size,
    answered,
    correct,
    accuracy: answered ? Math.round((correct / answered) * 100) : null,
    revisionTopics: [...wrongByTopic.entries()].map(([topic, wrong]) => ({ topic, wrong })).sort((a, b) => b.wrong - a.wrong),
  };
}
