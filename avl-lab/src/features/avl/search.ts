import { OpContext } from './operationSteps';
import type { TreeNode } from './types';

/** Iterative BST search that records every comparison. */
export function searchSteps(ctx: OpContext, root: TreeNode | null, key: number): TreeNode | null {
  const visited: number[] = [];
  let cur: TreeNode | null = root;
  if (!cur) return null;
  while (cur) {
    if (key === cur.key) {
      ctx.emit({
        kind: 'found',
        title: `Found ${key}`,
        explanation: `${key} equals the key of this node, so the search succeeds after visiting ${visited.length + 1} node${visited.length ? 's' : ''}.`,
        highlights: { found: [cur.uid], path: visited },
        line: 'search.found',
      });
      return cur;
    }
    const goLeft: boolean = key < cur.key;
    const next: TreeNode | null = goLeft ? cur.left : cur.right;
    ctx.emit({
      kind: 'compare',
      title: `${key} ${goLeft ? '<' : '>'} ${cur.key}: go ${goLeft ? 'left' : 'right'}`,
      explanation: `${key} is ${goLeft ? 'smaller' : 'larger'} than ${cur.key}, so if it exists it must be in the ${goLeft ? 'LEFT' : 'RIGHT'} subtree. ${
        next ? `Move to ${next.key}.` : `But that child is empty, so the key is not in the tree.`
      }`,
      highlights: { active: [cur.uid], path: visited.slice() },
      line: goLeft ? 'search.goLeft' : 'search.goRight',
    });
    visited.push(cur.uid);
    cur = next;
  }
  ctx.emit({
    kind: 'not-found',
    title: `${key} not found`,
    explanation: `The search ran off the tree after ${visited.length} comparison${visited.length === 1 ? '' : 's'}, so ${key} is not stored.`,
    highlights: { path: visited },
    line: 'search.notFound',
  });
  return null;
}
