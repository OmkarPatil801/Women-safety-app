import { createNode, updateHeight } from './node';
import type { TreeNode } from './types';

/**
 * Plain (non-balancing) BST insertion, used by lessons to show skewed trees and invalid-AVL examples.
 * Iterative so that deliberately skewed trees with thousands of nodes cannot overflow the call stack.
 * Heights are recomputed with the same convention as the AVL engine (empty = 0, leaf = 1).
 */
export function buildBst(keys: number[]): TreeNode | null {
  let root: TreeNode | null = null;
  let uid = 1;
  for (const key of keys) {
    if (!root) {
      root = createNode(uid++, key);
      continue;
    }
    const path: TreeNode[] = [];
    let cur: TreeNode = root;
    let duplicate = false;
    for (;;) {
      path.push(cur);
      if (key === cur.key) {
        duplicate = true;
        break;
      }
      const next: TreeNode | null = key < cur.key ? cur.left : cur.right;
      if (!next) {
        const created = createNode(uid++, key);
        if (key < cur.key) cur.left = created;
        else cur.right = created;
        break;
      }
      cur = next;
    }
    if (!duplicate) for (let i = path.length - 1; i >= 0; i--) updateHeight(path[i]);
  }
  return root;
}
