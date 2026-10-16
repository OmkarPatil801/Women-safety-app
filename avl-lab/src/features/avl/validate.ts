import { computeHeight } from './node';
import type { TreeNode, ValidationReport } from './types';

/**
 * Recursively verify:
 *  1. BST ordering (every key lies strictly between the bounds inherited from its ancestors)
 *  2. stored heights equal the real heights
 *  3. every balance factor is within [-1, 1]
 */
export function validateAvl(root: TreeNode | null): ValidationReport {
  const errors: string[] = [];

  const walk = (node: TreeNode | null, lo: number, hi: number): number => {
    if (!node) return 0;
    if (!(node.key > lo && node.key < hi)) {
      errors.push(`BST violation: key ${node.key} is outside (${lo}, ${hi})`);
    }
    const lh = walk(node.left, lo, node.key);
    const rh = walk(node.right, node.key, hi);
    const realHeight = 1 + Math.max(lh, rh);
    if (node.height !== realHeight) {
      errors.push(`Height mismatch at ${node.key}: stored ${node.height}, real ${realHeight}`);
    }
    const bf = lh - rh;
    if (Math.abs(bf) > 1) errors.push(`Balance violation at ${node.key}: BF = ${bf}`);
    return realHeight;
  };

  walk(root, -Infinity, Infinity);
  // Cross-check with the independent helper.
  if (root && computeHeight(root) !== root.height) {
    errors.push('Root height does not match computed height');
  }
  return { ok: errors.length === 0, errors };
}

/** Same as validateAvl but without the balance requirement (a plain BST check). */
export function validateBst(root: TreeNode | null): boolean {
  const walk = (node: TreeNode | null, lo: number, hi: number): boolean => {
    if (!node) return true;
    if (!(node.key > lo && node.key < hi)) return false;
    return walk(node.left, lo, node.key) && walk(node.right, node.key, hi);
  };
  return walk(root, -Infinity, Infinity);
}
