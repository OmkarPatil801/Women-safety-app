import { updateHeight } from './node';
import type { TreeNode } from './types';

/**
 * Right rotation about `z` (z must have a left child y).
 *
 *        z                y
 *       / \              / \
 *      y   T3    ->    T1   z
 *     / \                  / \
 *   T1   T2              T2   T3
 *
 * Returns the new subtree root (y). The caller must attach it to z's old parent.
 * This is the single implementation used by insertion, deletion, the visualizer and the lab.
 */
export function rotateRight(z: TreeNode): TreeNode {
  const y = z.left;
  if (!y) throw new Error('rotateRight requires a left child');
  const t2 = y.right;
  y.right = z;
  z.left = t2;
  // Order matters: z is now below y, so z's height must be fixed first.
  updateHeight(z);
  updateHeight(y);
  return y;
}

/**
 * Left rotation about `z` (z must have a right child y).
 *
 *      z                    y
 *     / \                  / \
 *   T1   y      ->        z   T3
 *       / \              / \
 *     T2   T3          T1   T2
 */
export function rotateLeft(z: TreeNode): TreeNode {
  const y = z.right;
  if (!y) throw new Error('rotateLeft requires a right child');
  const t2 = y.left;
  y.left = z;
  z.right = t2;
  updateHeight(z);
  updateHeight(y);
  return y;
}
