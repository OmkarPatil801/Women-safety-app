import { OpContext } from './operationSteps';
import type { TraversalType, TreeNode } from './types';

export const TRAVERSAL_RULES: Record<TraversalType, { name: string; rule: string }> = {
  inorder: { name: 'In-order', rule: 'Left subtree → Node → Right subtree. On a BST this visits keys in sorted (ascending) order.' },
  preorder: { name: 'Pre-order', rule: 'Node → Left subtree → Right subtree. Visits a parent before its children (useful for copying a tree).' },
  postorder: { name: 'Post-order', rule: 'Left subtree → Right subtree → Node. Visits children before their parent (useful for deleting a tree).' },
  levelorder: { name: 'Level-order', rule: 'Visit level by level, left to right, using a queue (breadth-first).' },
};

/** Records every "visit" of a traversal; returns the visiting order. */
export function traversalSteps(ctx: OpContext, root: TreeNode | null, type: TraversalType): number[] {
  const order: number[] = [];
  const visitedUids: number[] = [];

  const visit = (node: TreeNode, line: string, extra = '') => {
    order.push(node.key);
    visitedUids.push(node.uid);
    ctx.emit({
      kind: 'visit',
      title: `Visit ${node.key}`,
      explanation: `${node.key} is visited and added to the output. ${extra}`.trim(),
      highlights: { active: [node.uid], visited: visitedUids.slice() },
      line,
      note: `Output so far: ${order.join(', ')}`,
    });
  };

  if (type === 'levelorder') {
    const queue: TreeNode[] = root ? [root] : [];
    let head = 0;
    while (head < queue.length) {
      const node = queue[head++];
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
      const waiting = queue.slice(head).map((n) => n.key);
      visit(
        node,
        'levelorder.dequeue',
        `Its children are added to the queue. Queue now: [${waiting.join(', ')}].`,
      );
    }
    return order;
  }

  const walk = (node: TreeNode | null) => {
    if (!node) return;
    ctx.stack.push(`${type}(${node.key})`);
    if (type === 'preorder') visit(node, 'preorder.visit');
    walk(node.left);
    if (type === 'inorder') visit(node, 'inorder.visit', 'The whole left subtree is finished, so now the node itself.');
    walk(node.right);
    if (type === 'postorder') visit(node, 'postorder.visit', 'Both subtrees are finished, so now the node itself.');
    ctx.stack.pop();
  };
  walk(root);
  return order;
}
