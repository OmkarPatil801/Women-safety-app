import { describe, expect, it } from 'vitest';
import { functionSnippet, rebalanceLinesFor } from './snippets';

describe('snippets come from the real source files', () => {
  it('extracts rightRotate and rebalance for both languages', () => {
    for (const lang of ['c', 'cpp'] as const) {
      const r = functionSnippet(lang, 'rightRotate');
      expect(r?.code).toContain('z->left = T2;');
      const rb = functionSnippet(lang, 'rebalance')!;
      expect(rebalanceLinesFor(rb.code, 'LR').length).toBe(4);
      expect(rebalanceLinesFor(rb.code, 'LL').length).toBe(2);
      expect(rebalanceLinesFor(rb.code, 'RL').length).toBe(4);
      expect(rebalanceLinesFor(rb.code, 'RR').length).toBe(2);
    }
  });
});
