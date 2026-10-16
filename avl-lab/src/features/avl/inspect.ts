import { countNodes, height } from './node';
import type { TreeNode } from './types';

export type BalanceStatus = 'balanced' | 'left-heavy' | 'right-heavy' | 'unbalanced';

export interface NodeInfo {
  key: number;
  uid: number;
  depth: number;
  parentKey: number | null;
  leftKey: number | null;
  rightKey: number | null;
  height: number;
  leftHeight: number;
  rightHeight: number;
  balance: number;
  status: BalanceStatus;
  isRoot: boolean;
  isLeaf: boolean;
  subtreeSize: number;
}

/** Everything a learner might want to know about one node, computed from the displayed tree. */
export function inspectNode(root: TreeNode | null, uid: number | null): NodeInfo | null {
  if (!root || uid === null) return null;
  let parent: TreeNode | null = null;
  const stack: { n: TreeNode; depth: number; parent: TreeNode | null }[] = [{ n: root, depth: 0, parent: null }];
  while (stack.length) {
    const { n, depth, parent: p } = stack.pop()!;
    if (n.uid === uid) {
      parent = p;
      const balance = height(n.left) - height(n.right);
      return {
        key: n.key,
        uid: n.uid,
        depth,
        parentKey: parent ? parent.key : null,
        leftKey: n.left ? n.left.key : null,
        rightKey: n.right ? n.right.key : null,
        height: n.height,
        leftHeight: height(n.left),
        rightHeight: height(n.right),
        balance,
        status: Math.abs(balance) > 1 ? 'unbalanced' : balance > 0 ? 'left-heavy' : balance < 0 ? 'right-heavy' : 'balanced',
        isRoot: parent === null,
        isLeaf: !n.left && !n.right,
        subtreeSize: countNodes(n),
      };
    }
    if (n.left) stack.push({ n: n.left, depth: depth + 1, parent: n });
    if (n.right) stack.push({ n: n.right, depth: depth + 1, parent: n });
  }
  return null;
}
