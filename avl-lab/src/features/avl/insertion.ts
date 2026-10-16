import { createNode } from './node';
import { OpContext } from './operationSteps';
import { rebalance } from './rebalance';
import type { Slot, TreeNode } from './types';

/** Recursive AVL insertion. Mirrors the pseudocode and the C/C++ listings. */
export function insertNode(ctx: OpContext, node: TreeNode | null, key: number, slot: Slot): TreeNode {
  if (!node) {
    const created = createNode(ctx.newUid(), key);
    ctx.setSlot(slot, created);
    ctx.stack.push('insert(empty)');
    ctx.emit({
      kind: 'create',
      title: `Create node ${key}`,
      explanation: `We reached an empty spot, so ${key} is placed here as a new leaf (height 1). Now we return back up the recursion, fixing heights and checking balance at every ancestor.`,
      highlights: { created: [created.uid], path: ctx.pathUids.slice() },
      line: 'insert.create',
    });
    ctx.stack.pop();
    return created;
  }

  ctx.enter(node, `insert(${node.key})`);

  if (key < node.key) {
    ctx.emit({
      kind: 'compare',
      title: `${key} < ${node.key}: go left`,
      explanation: `Compare ${key} with ${node.key}. ${key} is smaller, so by the BST rule it belongs in the LEFT subtree. Recurse into the left child (${node.left ? node.left.key : 'empty'}).`,
      highlights: { active: [node.uid], path: ctx.ancestors() },
      line: 'insert.goLeft',
    });
    node.left = insertNode(ctx, node.left, key, { parent: node, side: 'left' });
  } else if (key > node.key) {
    ctx.emit({
      kind: 'compare',
      title: `${key} > ${node.key}: go right`,
      explanation: `Compare ${key} with ${node.key}. ${key} is larger, so it belongs in the RIGHT subtree. Recurse into the right child (${node.right ? node.right.key : 'empty'}).`,
      highlights: { active: [node.uid], path: ctx.ancestors() },
      line: 'insert.goRight',
    });
    node.right = insertNode(ctx, node.right, key, { parent: node, side: 'right' });
  } else {
    ctx.aborted = true;
    ctx.emit({
      kind: 'duplicate',
      title: `${key} already exists`,
      explanation: `${key} equals the key of this node. This tool rejects duplicate keys, so the tree is left unchanged.`,
      highlights: { found: [node.uid], path: ctx.ancestors() },
      line: 'insert.duplicate',
    });
    ctx.leave(node);
    return node;
  }

  if (ctx.aborted) {
    ctx.leave(node);
    return node;
  }
  const result = rebalance(ctx, node, slot, 'insert');
  ctx.leave(node);
  return result;
}
