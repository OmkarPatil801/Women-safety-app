import { describe, expect, it } from 'vitest';
import { computeStats, emptyProgress, sanitizeProgress } from './progress';

describe('progress', () => {
  it('starts empty with no fake percentages', () => {
    const s = computeStats(emptyProgress());
    expect(s).toMatchObject({ lessonsDone: 0, rotationsDone: 0, answered: 0, correct: 0, accuracy: null });
  });
  it('derives accuracy and revision topics from real answers', () => {
    const p = emptyProgress();
    p.quiz = {
      a: { correct: true, attempts: 1, topic: 'Rotations' },
      b: { correct: false, attempts: 2, topic: 'Deletion' },
      c: { correct: false, attempts: 1, topic: 'Deletion' },
      d: { correct: true, attempts: 1, topic: 'Height' },
    };
    const s = computeStats(p);
    expect(s.accuracy).toBe(50);
    expect(s.revisionTopics).toEqual([{ topic: 'Deletion', wrong: 2 }]);
  });
  it('sanitizes corrupted storage', () => {
    expect(sanitizeProgress('garbage')).toEqual(emptyProgress());
    expect(sanitizeProgress({ lessons: [1, 'a'], rotations: ['LL', 'XX'], ops: ['insert', 5] })).toMatchObject({ lessons: ['a'], rotations: ['LL'], ops: ['insert'] });
  });
});
