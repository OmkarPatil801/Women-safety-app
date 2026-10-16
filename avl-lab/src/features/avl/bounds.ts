import { createNode, updateHeight } from './node';
import type { TreeNode } from './types';

/** Fewest nodes an AVL tree of height h can have: N(0)=0, N(1)=1, N(h)=N(h-1)+N(h-2)+1 (Fibonacci-like). */
export function minNodesForHeight(h: number): number {
  if (h <= 0) return 0;
  let a = 0; // N(h-2)
  let b = 1; // N(h-1)  (starting at h = 1)
  for (let i = 2; i <= h; i++) [a, b] = [b, a + b + 1];
  return b;
}

/** Largest possible height of an AVL tree with n nodes. */
export function maxHeightForNodes(n: number): number {
  let h = 0;
  while (minNodesForHeight(h + 1) <= n) h++;
  return h;
}

/** Build an actual AVL tree of height h with the minimum number of nodes (a "Fibonacci tree"). */
export function buildMinimalAvl(h: number): TreeNode | null {
  let next = 1;
  const build = (height: number, lo: number): { node: TreeNode | null; keys: number } => {
    if (height <= 0) return { node: null, keys: 0 };
    const left = build(height - 1, lo);
    const rootKey = lo + left.keys;
    const right = build(height - 2, rootKey + 1);
    const node = createNode(next++, rootKey);
    node.left = left.node;
    node.right = right.node;
    updateHeight(node);
    return { node, keys: left.keys + 1 + right.keys };
  };
  return build(h, 1).node;
}
