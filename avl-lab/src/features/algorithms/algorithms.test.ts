import { describe, expect, it } from 'vitest';
import { AvlTree } from '../avl';
import { ALL_TAGS, ALGORITHMS, resolveTag } from './algorithms';

describe('pseudocode tags', () => {
  it('every tag emitted by the engine exists in the pseudocode reference', () => {
    const t = AvlTree.fromKeys([50, 30, 70, 20, 40, 60, 80, 10, 25, 5]);
    const results = [
      t.insert(3), t.insert(3), t.insert(45), t.insert(55), t.insert(1), t.insert(12), t.insert(26),
      t.delete(999), t.delete(30), t.delete(5), t.delete(1), t.delete(80), t.delete(70), t.delete(60),
      t.search(25), t.search(1234),
      t.traverse('inorder'), t.traverse('preorder'), t.traverse('postorder'), t.traverse('levelorder'),
      AvlTree.fromKeys([30, 10]).insert(20), AvlTree.fromKeys([10, 30]).insert(20), AvlTree.fromKeys([10, 20]).insert(30),
    ];
    const seen = new Set<string>();
    for (const r of results) for (const s of r.steps) if (s.line) seen.add(s.line);
    const unknown = [...seen].filter((tag) => !resolveTag(tag));
    expect(unknown).toEqual([]);
    expect(seen.size).toBeGreaterThan(25);
  });
  it('has the 13 required algorithms with complete documentation', () => {
    expect(ALGORITHMS).toHaveLength(13);
    for (const a of ALGORITHMS) {
      expect(a.purpose && a.time && a.space).toBeTruthy();
      expect(a.steps.length).toBeGreaterThan(0);
      expect(a.mistakes.length).toBeGreaterThan(0);
      expect(a.pseudocode.length).toBeGreaterThan(2);
    }
    expect(ALL_TAGS.size).toBeGreaterThan(30);
  });
});
