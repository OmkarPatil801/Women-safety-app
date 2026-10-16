import { describe, expect, it } from 'vitest';
import { AvlTree, buildBst } from '../../features/avl';
import { computeLayout, H_GAP, NODE_R } from './layout';

describe('tree layout', () => {
  it('returns an empty layout for no tree', () => {
    const l = computeLayout(null);
    expect(l.nodes).toHaveLength(0);
    expect(l.width).toBe(0);
  });
  it('places every node, with parent above child and left child left of parent', () => {
    const l = computeLayout(AvlTree.fromKeys([30, 20, 40, 10, 25, 35, 50]).root);
    expect(l.nodes).toHaveLength(7);
    expect(l.edges).toHaveLength(6);
    for (const e of l.edges) {
      const p = l.byUid.get(e.parentUid)!;
      const c = l.byUid.get(e.childUid)!;
      expect(c.y).toBeGreaterThan(p.y);
      if (e.side === 'left') expect(c.x).toBeLessThan(p.x);
      else expect(c.x).toBeGreaterThan(p.x);
    }
  });
  it('centres a parent above two children and keeps sibling subtrees one gap apart', () => {
    const l = computeLayout(AvlTree.fromKeys([30, 20, 40, 10, 25, 35, 50]).root);
    const root = l.nodes.find((n) => n.depth === 0)!;
    const a = l.byUid.get(root.leftUid!)!;
    const b = l.byUid.get(root.rightUid!)!;
    expect(root.x).toBeCloseTo((a.x + b.x) / 2);
    const bottom = l.nodes.filter((n) => n.depth === 2).sort((p, q) => p.x - q.x);
    for (let i = 1; i < bottom.length; i++) expect(bottom[i].x - bottom[i - 1].x).toBeGreaterThanOrEqual(H_GAP - 1e-6);
  });
  it('is much narrower than one slot per node for balanced trees', () => {
    const l = computeLayout(AvlTree.fromKeys(Array.from({ length: 31 }, (_, i) => i + 1)).root);
    expect(l.width).toBeLessThan(31 * H_GAP * 0.7);
  });
  it('never overlaps nodes, for balanced, random and skewed shapes', () => {
    const shapes = [
      AvlTree.fromKeys(Array.from({ length: 63 }, (_, i) => (i * 37) % 101)).root,
      buildBst(Array.from({ length: 40 }, (_, i) => i)),
      buildBst(Array.from({ length: 40 }, (_, i) => 40 - i)),
      buildBst([50, 10, 90, 5, 15, 85, 95, 1]),
    ];
    for (const root of shapes) {
      const { nodes } = computeLayout(root);
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          expect(d).toBeGreaterThan(NODE_R * 2);
        }
    }
  });
  it('lays out a skewed 3000-node BST without recursion problems', () => {
    const l = computeLayout(buildBst(Array.from({ length: 3000 }, (_, i) => i)));
    expect(l.nodes).toHaveLength(3000);
    expect(l.width).toBeGreaterThan(2999 * (H_GAP / 2));
  });
  it('reports balance factors from stored heights', () => {
    const l = computeLayout(buildBst([30, 20, 10]));
    expect(l.byUid.get(1)!.balance).toBe(2);
  });
});
