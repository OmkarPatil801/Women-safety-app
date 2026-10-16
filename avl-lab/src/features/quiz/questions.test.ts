import { describe, expect, it } from 'vitest';
import { isCorrect, LEVELS, QUESTIONS, questionsForLevel } from './questions';

describe('quiz bank', () => {
  it('has unique ids and enough questions for every level', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    for (const l of LEVELS) expect(questionsForLevel(l.id).length).toBeGreaterThanOrEqual(8);
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(30);
  });
  it('every question is well-formed and its answer is in range', () => {
    for (const q of QUESTIONS) {
      expect(q.prompt.length).toBeGreaterThan(10);
      expect(q.explanation.length).toBeGreaterThan(20);
      if (q.type === 'mcq') {
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(q.options).size).toBe(q.options.length);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      } else if (q.type === 'match') {
        expect(q.left.length).toBe(q.right.length);
        expect([...q.answer].sort()).toEqual(q.right.map((_, i) => i));
      } else {
        expect(Number.isInteger(q.answer)).toBe(true);
      }
    }
  });
  it('computed answers match the engine (spot checks)', () => {
    const byId = (id: string) => QUESTIONS.find((q) => q.id === id)!;
    const opt = (id: string) => {
      const q = byId(id);
      return q.type === 'mcq' ? q.options[q.answer] : '';
    };
    expect(opt('beg-ll')).toMatch(/^LL/);
    expect(opt('beg-rr')).toMatch(/^RR/);
    expect(opt('int-lr')).toMatch(/^LR/);
    expect(opt('int-rl')).toMatch(/^RL/);
    expect((byId('beg-bf1') as { answer: number }).answer).toBe(1);
    expect((byId('int-bf2') as { answer: number }).answer).toBe(1);
    expect(opt('adv-cascade')).toBe('2');
    expect(opt('adv-minnodes')).toBe('7');
    expect(opt('adv-maxheight')).toBe('6');
    expect(opt('int-successor')).toMatch(/^30/);
    expect(opt('int-predict')).toBe('30, 20, 10, 25, 40, 50');
  });
  it('isCorrect handles every type', () => {
    const mcq = QUESTIONS.find((q) => q.type === 'mcq')!;
    expect(isCorrect(mcq, mcq.type === 'mcq' ? mcq.answer : -1)).toBe(true);
    expect(isCorrect(mcq, undefined)).toBe(false);
    const match = QUESTIONS.find((q) => q.type === 'match')!;
    expect(isCorrect(match, match.type === 'match' ? match.answer : [])).toBe(true);
    expect(isCorrect(match, [1, 0, 2, 3])).toBe(false);
  });
});
