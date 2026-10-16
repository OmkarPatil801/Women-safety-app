import { minNode } from './node';
import { OpContext } from './operationSteps';
import { rebalance } from './rebalance';
import type { Slot, TreeNode } from './types';

/**
 * Recursive AVL deletion (successor-based for nodes with two children).
 * `purpose` only changes the wording of the explanations.
 */
export function deleteNode(
  ctx: OpContext,
  node: TreeNode | null,
  key: number,
  slot: Slot,
  purpose: 'target' | 'successor' = 'target',
): TreeNode | null {
  if (!node) {
    ctx.aborted = true;
    ctx.stack.push('delete(empty)');
    ctx.emit({
      kind: 'not-found',
      title: `${key} not found`,
      explanation: `We fell off the tree at an empty spot, so ${key} is not stored in this tree. Nothing is deleted.`,
      highlights: { path: ctx.pathUids.slice() },
      line: 'delete.empty',
    });
    ctx.stack.pop();
    return null;
  }

  ctx.enter(node, `delete(${node.key})`);

  if (key < node.key) {
    ctx.emit({
      kind: 'compare',
      title: `${key} < ${node.key}: go left`,
      explanation: `${key} is smaller than ${node.key}, so the node to delete (if it exists) is in the LEFT subtree.`,
      highlights: { active: [node.uid], path: ctx.ancestors() },
      line: 'delete.goLeft',
    });
    node.left = deleteNode(ctx, node.left, key, { parent: node, side: 'left' }, purpose);
  } else if (key > node.key) {
    ctx.emit({
      kind: 'compare',
      title: `${key} > ${node.key}: go right`,
      explanation: `${key} is larger than ${node.key}, so the node to delete (if it exists) is in the RIGHT subtree.`,
      highlights: { active: [node.uid], path: ctx.ancestors() },
      line: 'delete.goRight',
    });
    node.right = deleteNode(ctx, node.right, key, { parent: node, side: 'right' }, purpose);
  } else {
    ctx.found = true;
    const what = purpose === 'successor' ? `the successor ${key} (now a duplicate of its copy above)` : `${key}`;
    ctx.emit({
      kind: 'found',
      title: `Found ${key}`,
      explanation: `This is ${what}. ${
        !node.left && !node.right
          ? 'It has no children (a leaf).'
          : !node.left || !node.right
            ? 'It has exactly one child.'
            : 'It has two children.'
      }`,
      highlights: { removed: [node.uid], path: ctx.ancestors() },
      line: 'delete.match',
    });

    if (!node.left || !node.right) {
      const child = node.left ?? node.right;
      ctx.setSlot(slot, child);
      ctx.emit({
        kind: 'remove',
        title: child ? `Replace ${key} with its only child ${child.key}` : `Remove leaf ${key}`,
        explanation: child
          ? `With one child, the parent simply skips over ${key} and points at its child ${child.key}. The BST order is untouched.`
          : `A leaf can simply be removed: the parent's pointer becomes empty.`,
        highlights: { active: child ? [child.uid] : [], path: ctx.ancestors() },
        line: 'delete.oneChild',
      });
      ctx.leave(node);
      // `child` is already a valid AVL subtree; ancestors rebalance as the recursion unwinds.
      return child;
    }

    // Two children: replace the key with the in-order successor, then delete the successor.
    const startNode = node.right;
    const chain: number[] = [];
    let succ = startNode;
    ctx.emit({
      kind: 'find-successor',
      title: `Find the in-order successor of ${key}`,
      explanation: `With two children we cannot just remove the node. The in-order successor is the SMALLEST key in the right subtree: go to the right child (${startNode.key}) and then keep going left.`,
      highlights: { removed: [node.uid], active: [startNode.uid] },
      line: 'delete.twoChildren',
    });
    while (succ.left) {
      chain.push(succ.uid);
      succ = succ.left;
      ctx.emit({
        kind: 'find-successor',
        title: `Go left to ${succ.key}`,
        explanation: `${succ.key} is the left child of the previous node, so keep walking left.`,
        highlights: { removed: [node.uid], path: chain.slice(), active: [succ.uid] },
        line: 'delete.twoChildren',
      });
    }
    ctx.emit({
      kind: 'find-successor',
      title: `Successor is ${succ.key}`,
      explanation: `${succ.key} has no left child, so it is the smallest key in the right subtree: the successor of ${key}.`,
      highlights: { removed: [node.uid], found: [succ.uid], path: chain },
      line: 'delete.twoChildren',
    });
    const successor = minNode(startNode);
    const oldKey = node.key;
    node.key = successor.key;
    ctx.emit({
      kind: 'copy-successor',
      title: `Copy ${successor.key} into the node`,
      explanation: `The node that held ${oldKey} now holds ${successor.key}. The BST property still holds (everything on the left is smaller, everything on the right is larger). Next we delete the original ${successor.key} from the right subtree - it has at most one child, so that is an easy case.`,
      highlights: { active: [node.uid], removed: [successor.uid] },
      line: 'delete.copySuccessor',
    });
    node.right = deleteNode(ctx, node.right, successor.key, { parent: node, side: 'right' }, 'successor');
  }

  if (ctx.aborted) {
    ctx.leave(node);
    return node;
  }
  const result = rebalance(ctx, node, slot, 'delete');
  ctx.leave(node);
  return result;
}
