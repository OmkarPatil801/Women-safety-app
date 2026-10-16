import { describe, expect, it } from 'vitest';
import { validateAvl } from '../avl';
import { buildScenario, CASES, equalityDemo, wrongSingleRotation } from './rotationScenarios';

describe('rotation scenarios', () => {
  for (const c of CASES) {
    it(`${c.id}: ${[...c.setup, c.trigger].join(', ')} produces a ${c.id} rotation and a balanced result`, () => {
      const s = buildScenario(c);
      expect(s.rotations.every((r) => r.rotationCase === c.id)).toBe(true);
      expect(s.rotations).toHaveLength(c.id === 'LL' || c.id === 'RR' ? 1 : 2);
      expect(s.unbalancedKey).toBe(30 === c.setup[0] ? 30 : 10);
      expect(Math.abs(s.balanceFactor)).toBe(2);
      expect(validateAvl(s.finalTree).ok).toBe(true);
      expect(s.finalTree?.key).toBe(20);
      expect(s.finalTree?.left?.key).toBe(10);
      expect(s.finalTree?.right?.key).toBe(30);
    });
  }
  it('insertion parent, first unbalanced ancestor and rotation node are distinguished', () => {
    const ll = buildScenario(CASES[0]);
    expect(ll.insertionParentKey).toBe(20); // 10 is attached under 20
    expect(ll.unbalancedKey).toBe(30); // first unbalanced ancestor
    expect(ll.rotations[0].pivotKey).toBe(30); // rotation anchored at the unbalanced node
  });
  it('a single rotation in the LR / RL cases leaves the tree unbalanced', () => {
    for (const c of CASES.filter((x) => x.id === 'LR' || x.id === 'RL')) {
      const demo = wrongSingleRotation(buildScenario(c));
      expect(demo.valid).toBe(false);
    }
  });
  it('equality demo: single rotation is valid, double rotation breaks the AVL property', () => {
    const d = equalityDemo();
    expect(d.correctValid).toBe(true);
    expect(d.wrongValid).toBe(false);
    expect(d.steps.find((s) => s.kind === 'imbalance')?.imbalance).toMatchObject({ nodeKey: 10, childKey: 30, childBalanceFactor: 0, rotationCase: 'RR' });
  });
});
