import { describe, expect, it } from 'vitest';
import { AvlTree, balanceFactor, height, rotateLeft, rotateRight, validateAvl, validateBst, createNode } from './index';
import type { TreeNode } from './types';

/** Compact shape string, e.g. "20(10,30)" for easy structural assertions. */
function shape(n: TreeNode | null): string {
  if (!n) return '';
  if (!n.left && !n.right) return String(n.key);
  return `${n.key}(${shape(n.left)},${shape(n.right)})`;
}
const build = (keys: number[]) => AvlTree.fromKeys(keys);
const mustBeValid = (t: AvlTree) => expect(t.validate().errors).toEqual([]);

describe('basic insertion', () => {
  it('inserts into an empty tree', () => {
    const t = new AvlTree();
    const r = t.insert(10);
    expect(r.ok).toBe(true);
    expect(t.size).toBe(1);
    expect(t.root?.key).toBe(10);
    mustBeValid(t);
  });
  it('single-node tree has height 1 and BF 0', () => {
    const t = build([5]);
    expect(t.height).toBe(1);
    expect(balanceFactor(t.root)).toBe(0);
    expect(height(null)).toBe(0);
    expect(balanceFactor(null)).toBe(0);
  });
  it('multiple insertions keep BST order', () => {
    const t = build([30, 20, 40, 10, 25, 35, 50]);
    expect(t.inorder()).toEqual([10, 20, 25, 30, 35, 40, 50]);
    expect(shape(t.root)).toBe('30(20(10,25),40(35,50))');
    mustBeValid(t);
  });
  it('rejects duplicates and leaves the tree unchanged', () => {
    const t = build([2, 1, 3]);
    const before = shape(t.root);
    const r = t.insert(2);
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/already/);
    expect(shape(t.root)).toBe(before);
    expect(t.size).toBe(3);
    mustBeValid(t);
  });
  it('rejects invalid keys without touching the tree', () => {
    const t = build([1, 2, 3]);
    expect(t.insert(NaN).ok).toBe(false);
    expect(t.insert(1.5).ok).toBe(false);
    expect(t.insert(Infinity).ok).toBe(false);
    expect(t.insert(10 ** 9).ok).toBe(false);
    expect(t.size).toBe(3);
    mustBeValid(t);
  });
  it('accepts negative numbers and zero', () => {
    const t = build([0, -5, 5, -10, 10]);
    expect(t.inorder()).toEqual([-10, -5, 0, 5, 10]);
    mustBeValid(t);
  });
});

describe('rotations on insertion', () => {
  it('LL: 30, 20, 10 -> right rotation', () => {
    const t = new AvlTree();
    t.insert(30);
    t.insert(20);
    const r = t.insert(10);
    expect(r.rotations.map((x) => x.rotationCase)).toEqual(['LL']);
    expect(r.rotations[0].direction).toBe('right');
    expect(r.rotations[0].pivotKey).toBe(30);
    expect(r.rotations[0].newRootKey).toBe(20);
    expect(shape(t.root)).toBe('20(10,30)');
    mustBeValid(t);
  });
  it('RR: 10, 20, 30 -> left rotation', () => {
    const t = build([10, 20]);
    const r = t.insert(30);
    expect(r.rotations.map((x) => x.rotationCase)).toEqual(['RR']);
    expect(r.rotations[0].direction).toBe('left');
    expect(shape(t.root)).toBe('20(10,30)');
    mustBeValid(t);
  });
  it('LR: 30, 10, 20 -> left then right', () => {
    const t = build([30, 10]);
    const r = t.insert(20);
    expect(r.rotations.map((x) => [x.rotationCase, x.direction, x.pivotKey])).toEqual([
      ['LR', 'left', 10],
      ['LR', 'right', 30],
    ]);
    expect(shape(t.root)).toBe('20(10,30)');
    mustBeValid(t);
  });
  it('RL: 10, 30, 20 -> right then left', () => {
    const t = build([10, 30]);
    const r = t.insert(20);
    expect(r.rotations.map((x) => [x.rotationCase, x.direction, x.pivotKey])).toEqual([
      ['RL', 'right', 30],
      ['RL', 'left', 10],
    ]);
    expect(shape(t.root)).toBe('20(10,30)');
    mustBeValid(t);
  });
  it('sorted insertion 10..50 stays balanced', () => {
    const t = build([10, 20, 30, 40, 50]);
    expect(shape(t.root)).toBe('20(10,40(30,50))');
    expect(t.height).toBe(3);
    mustBeValid(t);
  });
  it('rotations are recorded in steps and match the final tree', () => {
    const t = build([30, 20]);
    const r = t.insert(10);
    const rotateSteps = r.steps.filter((s) => s.kind === 'rotate');
    expect(rotateSteps).toHaveLength(1);
    expect(shape(rotateSteps[0].tree)).toBe('20(10,30)');
    const imbalance = r.steps.find((s) => s.kind === 'imbalance');
    expect(imbalance?.imbalance).toMatchObject({ nodeKey: 30, balanceFactor: 2, childKey: 20, childBalanceFactor: 1, rotationCase: 'LL' });
  });
  it('pure rotation helpers keep BST order and fix heights', () => {
    const z = createNode(1, 30);
    const y = createNode(2, 20);
    const x = createNode(3, 10);
    z.left = y;
    y.left = x;
    y.height = 2;
    z.height = 3;
    const root = rotateRight(z);
    expect(shape(root)).toBe('20(10,30)');
    expect([root.height, root.left?.height, root.right?.height]).toEqual([2, 1, 1]);
    const back = rotateLeft(root);
    expect(shape(back)).toBe('30(20(10,),)');
    expect(validateBst(back)).toBe(true);
  });
});

describe('deletion', () => {
  it('deletes a leaf', () => {
    const t = build([20, 10, 30]);
    const r = t.delete(10);
    expect(r.ok).toBe(true);
    expect(shape(t.root)).toBe('20(,30)');
    mustBeValid(t);
  });
  it('deletes a node with one child', () => {
    const t = build([20, 10, 30, 5]);
    t.delete(10);
    expect(shape(t.root)).toBe('20(5,30)');
    mustBeValid(t);
  });
  it('deletes a node with two children (successor)', () => {
    const t = build([40, 20, 60, 10, 30, 50, 70]);
    const r = t.delete(20);
    expect(r.ok).toBe(true);
    expect(t.inorder()).toEqual([10, 30, 40, 50, 60, 70]);
    expect(t.root?.left?.key).toBe(30);
    expect(r.steps.some((s) => s.kind === 'copy-successor')).toBe(true);
    mustBeValid(t);
  });
  it('deletes the root (two children)', () => {
    const t = build([40, 20, 60, 10, 30, 50, 70]);
    t.delete(40);
    expect(t.root?.key).toBe(50);
    expect(t.inorder()).toEqual([10, 20, 30, 50, 60, 70]);
    mustBeValid(t);
  });
  it('deletes the only node', () => {
    const t = build([1]);
    expect(t.delete(1).ok).toBe(true);
    expect(t.root).toBeNull();
    expect(t.size).toBe(0);
  });
  it('deleting a missing value changes nothing', () => {
    const t = build([2, 1, 3]);
    const before = shape(t.root);
    const r = t.delete(99);
    expect(r.ok).toBe(false);
    expect(shape(t.root)).toBe(before);
    mustBeValid(t);
  });
  it('deleting from an empty tree is graceful', () => {
    const t = new AvlTree();
    const r = t.delete(5);
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/empty/);
  });
  it('rebalances after deletion (RR via right-heavy)', () => {
    // 20(10,30(,40)): deleting 10 makes 20 right-heavy with child BF = -1 -> RR
    const t = build([20, 10, 30, 40]);
    const r = t.delete(10);
    expect(r.rotations.map((x) => x.rotationCase)).toEqual(['RR']);
    expect(shape(t.root)).toBe('30(20,40)');
    mustBeValid(t);
  });
  it('uses a SINGLE rotation when the heavy child has BF = 0 (deletion-only case)', () => {
    // 2(1,4(3,5)): deleting 1 leaves BF(2) = -2 and BF(4) = 0 -> one left rotation (RR), NOT a double rotation.
    const t = build([2, 1, 4, 3, 5]);
    expect(shape(t.root)).toBe('2(1,4(3,5))');
    const r = t.delete(1);
    const imb = r.steps.find((s) => s.kind === 'imbalance');
    expect(imb?.imbalance).toMatchObject({ nodeKey: 2, balanceFactor: -2, childKey: 4, childBalanceFactor: 0, rotationCase: 'RR' });
    expect(r.rotations).toHaveLength(1);
    expect(shape(t.root)).toBe('4(2(,3),5)');
    mustBeValid(t);
  });
  it('mirror image: left-heavy with child BF = 0 -> single right rotation (LL)', () => {
    const t = build([4, 5, 2, 1, 3]);
    const r = t.delete(5);
    expect(r.rotations.map((x) => x.rotationCase)).toEqual(['LL']);
    expect(shape(t.root)).toBe('2(1,4(3,))');
    mustBeValid(t);
  });
});

describe('search and traversal', () => {
  const t = build([30, 20, 40, 10, 25, 35, 50]);
  it('finds existing values', () => {
    const r = t.search(25);
    expect(r.found).toBe(true);
    expect(r.steps.at(-1)?.kind).toBe('found');
  });
  it('reports missing values', () => {
    const r = t.search(26);
    expect(r.found).toBe(false);
    expect(r.steps.at(-1)?.kind).toBe('not-found');
  });
  it('search on empty tree is graceful', () => {
    expect(new AvlTree().search(1).ok).toBe(false);
  });
  it('traversals produce the correct sequences', () => {
    expect(t.inorder()).toEqual([10, 20, 25, 30, 35, 40, 50]);
    expect(t.preorder()).toEqual([30, 20, 10, 25, 40, 35, 50]);
    expect(t.postorder()).toEqual([10, 25, 20, 35, 50, 40, 30]);
    expect(t.levelorder()).toEqual([30, 20, 40, 10, 25, 35, 50]);
  });
  it('step-by-step traversals agree with the plain ones', () => {
    expect(t.traverse('inorder').order).toEqual(t.inorder());
    expect(t.traverse('preorder').order).toEqual(t.preorder());
    expect(t.traverse('postorder').order).toEqual(t.postorder());
    expect(t.traverse('levelorder').order).toEqual(t.levelorder());
  });
  it('in-order of a valid AVL tree is sorted', () => {
    const r = build([9, 3, 7, 1, 8, 2, 6, 4, 5, 0]);
    const io = r.inorder();
    expect(io).toEqual([...io].sort((a, b) => a - b));
  });
});

describe('heights and balance factors', () => {
  it('computes heights with leaf = 1, empty = 0', () => {
    const t = build([20, 10, 30, 5]);
    expect(t.root?.height).toBe(3);
    expect(t.root?.left?.height).toBe(2);
    expect(t.root?.right?.height).toBe(1);
  });
  it('computes balance factors as left - right', () => {
    const t = build([20, 10, 30, 5]);
    expect(balanceFactor(t.root)).toBe(1);
    expect(balanceFactor(t.root?.left ?? null)).toBe(1);
    expect(balanceFactor(t.root?.right ?? null)).toBe(0);
  });
  it('validator detects violations', () => {
    const bad = createNode(1, 10);
    bad.right = createNode(2, 20);
    bad.right.right = createNode(3, 30);
    expect(validateAvl(bad).ok).toBe(false);
    const wrongOrder = createNode(1, 10);
    wrongOrder.left = createNode(2, 50);
    wrongOrder.height = 2;
    expect(validateBst(wrongOrder)).toBe(false);
  });
});

describe('snapshots', () => {
  it('step trees are deep copies, unaffected by later operations', () => {
    const t = build([30, 20]);
    const r = t.insert(10);
    const first = shape(r.steps[0].tree);
    t.insert(5);
    t.delete(30);
    expect(shape(r.steps[0].tree)).toBe(first);
  });
  it('the last step tree equals the final tree', () => {
    const t = build([1, 2, 3, 4, 5]);
    const r = t.insert(6);
    expect(shape(r.steps.at(-1)?.tree ?? null)).toBe(shape(r.finalTree));
  });
  it('every recorded step snapshot is a valid BST with consistent links', () => {
    const t = build([10, 20, 30, 40, 50, 25]);
    for (const k of [5, 45, 27, 22]) {
      const r = t.insert(k);
      for (const s of r.steps) expect(validateBst(s.tree)).toBe(true);
    }
    for (const k of [30, 10, 40]) {
      const r = t.delete(k);
      for (const s of r.steps) {
        // During successor deletion the copied key briefly appears twice, so BST strictness is only checked after.
        if (s.kind !== 'copy-successor' && s.kind !== 'find-successor') {
          const keys: number[] = [];
          const walk = (n: TreeNode | null): void => { if (n) { walk(n.left); keys.push(n.key); walk(n.right); } };
          walk(s.tree);
          if (new Set(keys).size === keys.length) expect(validateBst(s.tree)).toBe(true);
        }
      }
    }
    mustBeValid(t);
  });
  it('fromSnapshot continues uid numbering safely', () => {
    const t = build([1, 2, 3]);
    const copy = AvlTree.fromSnapshot(t.snapshot());
    copy.insert(4);
    const uids: number[] = [];
    const walk = (n: TreeNode | null): void => { if (n) { walk(n.left); uids.push(n.uid); walk(n.right); } };
    walk(copy.root);
    expect(new Set(uids).size).toBe(uids.length);
  });
});

// Deterministic PRNG so failures are reproducible.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('randomized tests', () => {
  it('keeps every invariant after every insert/delete (matches a reference set)', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const rand = rng(seed);
      const t = new AvlTree();
      const ref = new Set<number>();
      for (let i = 0; i < 600; i++) {
        const key = Math.floor(rand() * 120) - 20;
        if (rand() < 0.55) {
          const r = t.insert(key, { record: false });
          expect(r.ok).toBe(!ref.has(key));
          ref.add(key);
        } else {
          const r = t.delete(key, { record: false });
          expect(r.ok).toBe(ref.has(key));
          ref.delete(key);
        }
        const report = t.validate();
        if (!report.ok) throw new Error(`seed ${seed} step ${i} key ${key}: ${report.errors.join('; ')}`);
        expect(t.inorder()).toEqual([...ref].sort((a, b) => a - b));
      }
    }
  });
  it('recorded operations produce the same trees as unrecorded ones', () => {
    const rand = rng(42);
    const a = new AvlTree();
    const b = new AvlTree();
    for (let i = 0; i < 150; i++) {
      const key = Math.floor(rand() * 60);
      const del = rand() < 0.4;
      if (del) {
        a.delete(key, { record: true });
        b.delete(key, { record: false });
      } else {
        a.insert(key, { record: true });
        b.insert(key, { record: false });
      }
      expect(shape(a.root)).toBe(shape(b.root));
    }
  });
  it('height stays logarithmic: h <= 1.44 log2(n+2)', () => {
    const t = new AvlTree();
    for (let i = 1; i <= 1000; i++) t.insert(i % 9999, { record: false });
    expect(t.height).toBeLessThanOrEqual(Math.ceil(1.4405 * Math.log2(t.size + 2)));
  });
});

describe('height bounds', () => {
  it('minNodesForHeight follows N(h) = N(h-1) + N(h-2) + 1', async () => {
    const { minNodesForHeight, maxHeightForNodes, buildMinimalAvl } = await import('./bounds');
    expect([1, 2, 3, 4, 5, 6].map(minNodesForHeight)).toEqual([1, 2, 4, 7, 12, 20]);
    expect(maxHeightForNodes(20)).toBe(6);
    expect(maxHeightForNodes(19)).toBe(5);
    for (let h = 1; h <= 10; h++) {
      const tree = buildMinimalAvl(h);
      expect(validateAvl(tree).ok).toBe(true);
      expect(tree?.height).toBe(h);
      let count = 0;
      const walk = (n: TreeNode | null): void => { if (n) { count++; walk(n.left); walk(n.right); } };
      walk(tree);
      expect(count).toBe(minNodesForHeight(h));
    }
  });
});

describe('presets', () => {
  it('every preset builds a valid AVL tree', async () => {
    const { PRESETS } = await import('./presets');
    for (const p of PRESETS) {
      const t = AvlTree.fromKeys(p.keys);
      expect(t.validate().errors, p.id).toEqual([]);
      expect(t.size).toBe(p.keys.length);
    }
  });
  it('Fibonacci preset: deleting 12 needs two rotations at different levels', () => {
    const t = AvlTree.fromKeys([8, 5, 11, 3, 7, 10, 12, 2, 4, 6, 9, 1]);
    const r = t.delete(12);
    expect(r.rotations.map((x) => x.pivotKey)).toEqual([11, 8]);
    mustBeValid(t);
  });
});

describe('height curves', () => {
  it('measures real heights: AVL stays logarithmic, sorted BST is a chain', async () => {
    const { heightCurves } = await import('./stats');
    const c = heightCurves(300);
    expect(c.n).toHaveLength(300);
    for (let i = 0; i < 300; i++) {
      const n = c.n[i];
      expect(c.bstSorted[i]).toBe(n);
      expect(c.avlSorted[i]).toBeLessThanOrEqual(Math.ceil(1.4405 * Math.log2(n + 2)));
      expect(c.avlSorted[i]).toBeGreaterThanOrEqual(Math.ceil(Math.log2(n + 1)));
      expect(c.bstRandom[i]).toBeGreaterThanOrEqual(Math.ceil(Math.log2(n + 1)));
      expect(c.bstRandom[i]).toBeLessThanOrEqual(n);
    }
    expect(c.avlSorted[299]).toBeLessThan(12);
  });
});
