import type { TreeNode } from './types';

/** height(empty) = 0, height(leaf) = 1. */
export function height(node: TreeNode | null): number {
  return node ? node.height : 0;
}

/** BF(node) = height(left subtree) - height(right subtree). */
export function balanceFactor(node: TreeNode | null): number {
  return node ? height(node.left) - height(node.right) : 0;
}

/** Recompute the stored height from the children's stored heights. */
export function updateHeight(node: TreeNode): void {
  node.height = 1 + Math.max(height(node.left), height(node.right));
}

export function createNode(uid: number, key: number): TreeNode {
  return { uid, key, left: null, right: null, height: 1 };
}

/** Deep copy so snapshots never alias the live (mutable) tree. */
export function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    uid: node.uid,
    key: node.key,
    height: node.height,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

export function minNode(node: TreeNode): TreeNode {
  let cur = node;
  while (cur.left) cur = cur.left;
  return cur;
}

export function countNodes(node: TreeNode | null): number {
  return node ? 1 + countNodes(node.left) + countNodes(node.right) : 0;
}

/** Find a node by uid (used by the UI to inspect a selected node). */
export function findByUid(node: TreeNode | null, uid: number): TreeNode | null {
  if (!node) return null;
  if (node.uid === uid) return node;
  return findByUid(node.left, uid) ?? findByUid(node.right, uid);
}

export function findByKey(node: TreeNode | null, key: number): TreeNode | null {
  let cur = node;
  while (cur) {
    if (key === cur.key) return cur;
    cur = key < cur.key ? cur.left : cur.right;
  }
  return null;
}

/** Height computed from scratch by walking the tree (independent of stored heights). */
export function computeHeight(node: TreeNode | null): number {
  return node ? 1 + Math.max(computeHeight(node.left), computeHeight(node.right)) : 0;
}
