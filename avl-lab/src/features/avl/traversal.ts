import type { TreeNode } from './types';

export function inorder(root: TreeNode | null, out: number[] = []): number[] {
  if (!root) return out;
  inorder(root.left, out);
  out.push(root.key);
  inorder(root.right, out);
  return out;
}

export function preorder(root: TreeNode | null, out: number[] = []): number[] {
  if (!root) return out;
  out.push(root.key);
  preorder(root.left, out);
  preorder(root.right, out);
  return out;
}

export function postorder(root: TreeNode | null, out: number[] = []): number[] {
  if (!root) return out;
  postorder(root.left, out);
  postorder(root.right, out);
  out.push(root.key);
  return out;
}

export function levelorder(root: TreeNode | null): number[] {
  const out: number[] = [];
  if (!root) return out;
  const queue: TreeNode[] = [root];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    out.push(node.key);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return out;
}
