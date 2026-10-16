import { balanceFactor, height, updateHeight } from './node';
import { OpContext } from './operationSteps';
import { rotateLeft, rotateRight } from './rotations';
import type { ImbalanceInfo, RebalanceMode, RotationCase, RotationDirection, RotationInfo, Slot, TreeNode } from './types';

const keyOrEmpty = (n: TreeNode | null): string => (n ? String(n.key) : 'empty');

/** Describe (before performing it) which pointers a rotation about `z` will change. */
function describeRotation(
  direction: RotationDirection,
  z: TreeNode,
  rotationCase: RotationCase,
  phase: RotationInfo['phase'],
  slot: Slot,
): RotationInfo {
  const y = (direction === 'right' ? z.left : z.right) as TreeNode;
  const middle = direction === 'right' ? y.right : y.left;
  const mine = direction === 'right' ? 'right' : 'left';
  const theirs = direction === 'right' ? 'left' : 'right';
  const parentText = slot.parent
    ? `${slot.parent.key}.${slot.side} now points to ${y.key}`
    : `the tree root pointer now points to ${y.key}`;
  return {
    rotationCase,
    direction,
    phase,
    pivotKey: z.key,
    newRootKey: y.key,
    movedSubtreeKey: middle ? middle.key : null,
    pointerChanges: [
      `${y.key}.${mine}: ${keyOrEmpty(middle)} → ${z.key}   (${z.key} moves down)`,
      `${z.key}.${theirs}: ${y.key} → ${keyOrEmpty(middle)}   (the middle subtree is handed over)`,
      `${parentText}   (${y.key} moves up)`,
    ],
  };
}

/**
 * Update the height of `node`, check its balance factor and, if |BF| > 1, rotate.
 * Used by BOTH insertion and deletion. Returns the (possibly new) subtree root.
 *
 *   BF > 1  : left heavy.  child BF >= 0 -> LL (right rotation),  child BF < 0 -> LR
 *   BF < -1 : right heavy. child BF <= 0 -> RR (left rotation),   child BF > 0 -> RL
 *
 * The "= 0" child case never happens after an insertion but is common after a deletion,
 * and it needs a SINGLE rotation.
 */
export function rebalance(ctx: OpContext, node: TreeNode, slot: Slot, mode: RebalanceMode): TreeNode {
  const oldHeight = node.height;
  updateHeight(node);
  const lh = height(node.left);
  const rh = height(node.right);
  const bf = lh - rh;
  const heightText =
    node.height === oldHeight
      ? `height(${node.key}) = 1 + max(${lh}, ${rh}) = ${node.height} (unchanged).`
      : `height(${node.key}) = 1 + max(${lh}, ${rh}) = ${node.height} (was ${oldHeight}).`;
  const balanced = Math.abs(bf) <= 1;

  ctx.emit({
    kind: 'check',
    title: balanced ? `Node ${node.key} is balanced` : `Node ${node.key} is UNBALANCED`,
    explanation:
      `${heightText} Balance factor BF(${node.key}) = height(left) − height(right) = ${lh} − ${rh} = ${bf}. ` +
      (balanced
        ? `That is inside [−1, 1], so no rotation is needed here.`
        : `That is outside [−1, 1], so the AVL property is violated at ${node.key}.`),
    highlights: { active: [node.uid], unbalanced: balanced ? [] : [node.uid], path: ctx.ancestors() },
    line: balanced ? 'rebalance.done' : 'rebalance.bf',
  });

  if (balanced) return node;

  if (bf > 1) {
    const child = node.left as TreeNode;
    const childBf = balanceFactor(child);
    const rotationCase: RotationCase = childBf >= 0 ? 'LL' : 'LR';
    const imbalance: ImbalanceInfo = {
      nodeKey: node.key,
      balanceFactor: bf,
      childKey: child.key,
      childBalanceFactor: childBf,
      rotationCase,
    };
    ctx.emit({
      kind: 'imbalance',
      title: `${rotationCase} case at ${node.key}`,
      explanation:
        `${node.key} is left-heavy (BF = ${bf}). Its left child ${child.key} has BF = ${childBf}. ` +
        (rotationCase === 'LL'
          ? `Since the child's BF is ≥ 0 the extra height is on the OUTSIDE (left-left), so ONE right rotation about ${node.key} fixes it.` +
            (childBf === 0 && mode === 'delete'
              ? ` (BF = 0 can only happen after a deletion; a single rotation is still correct.)`
              : '')
          : `Since the child's BF is < 0 the extra height is on the INSIDE (left-right). One rotation would only move the problem, so we first rotate ${child.key} left, then rotate ${node.key} right.`),
      highlights: { unbalanced: [node.uid], active: [child.uid], path: ctx.ancestors() },
      line: 'rebalance.leftHeavy',
      imbalance,
    });
    if (rotationCase === 'LR') {
      const info = describeRotation('left', child, 'LR', 'first', { parent: node, side: 'left' });
      node.left = rotateLeft(child);
      ctx.rotations.push(info);
      ctx.emit({
        kind: 'rotate',
        title: `Rotate ${child.key} left (LR, step 1 of 2)`,
        explanation: `Left rotation about ${child.key}: ${info.newRootKey} moves up. This turns the left-right shape into a left-left shape. Heights of ${child.key} and ${info.newRootKey} were recalculated.`,
        highlights: { rotating: [child.uid, node.left.uid], unbalanced: [node.uid] },
        line: 'rebalance.lrFirst',
        rotation: info,
      });
    }
    const pivot = node;
    const info = describeRotation('right', pivot, rotationCase, rotationCase === 'LR' ? 'second' : 'single', slot);
    const newRoot = rotateRight(pivot);
    ctx.setSlot(slot, newRoot);
    ctx.rotations.push(info);
    ctx.emit({
      kind: 'rotate',
      title: `Rotate ${pivot.key} right${rotationCase === 'LR' ? ' (LR, step 2 of 2)' : ` (${rotationCase})`}`,
      explanation:
        `Right rotation about ${pivot.key}: its left child ${newRoot.key} moves up and ${pivot.key} becomes its right child. ` +
        `New heights: height(${pivot.key}) = ${pivot.height}, height(${newRoot.key}) = ${newRoot.height}; ` +
        `BF(${newRoot.key}) = ${balanceFactor(newRoot)}.`,
      highlights: { rotating: [pivot.uid, newRoot.uid], active: [newRoot.uid] },
      line: 'rebalance.right',
      rotation: info,
    });
    return newRoot;
  }

  const child = node.right as TreeNode;
  const childBf = balanceFactor(child);
  const rotationCase: RotationCase = childBf <= 0 ? 'RR' : 'RL';
  const imbalance: ImbalanceInfo = {
    nodeKey: node.key,
    balanceFactor: bf,
    childKey: child.key,
    childBalanceFactor: childBf,
    rotationCase,
  };
  ctx.emit({
    kind: 'imbalance',
    title: `${rotationCase} case at ${node.key}`,
    explanation:
      `${node.key} is right-heavy (BF = ${bf}). Its right child ${child.key} has BF = ${childBf}. ` +
      (rotationCase === 'RR'
        ? `Since the child's BF is ≤ 0 the extra height is on the OUTSIDE (right-right), so ONE left rotation about ${node.key} fixes it.` +
          (childBf === 0 && mode === 'delete'
            ? ` (BF = 0 can only happen after a deletion; a single rotation is still correct.)`
            : '')
        : `Since the child's BF is > 0 the extra height is on the INSIDE (right-left). One rotation would only move the problem, so we first rotate ${child.key} right, then rotate ${node.key} left.`),
    highlights: { unbalanced: [node.uid], active: [child.uid], path: ctx.ancestors() },
    line: 'rebalance.rightHeavy',
    imbalance,
  });
  if (rotationCase === 'RL') {
    const info = describeRotation('right', child, 'RL', 'first', { parent: node, side: 'right' });
    node.right = rotateRight(child);
    ctx.rotations.push(info);
    ctx.emit({
      kind: 'rotate',
      title: `Rotate ${child.key} right (RL, step 1 of 2)`,
      explanation: `Right rotation about ${child.key}: ${info.newRootKey} moves up. This turns the right-left shape into a right-right shape. Heights of ${child.key} and ${info.newRootKey} were recalculated.`,
      highlights: { rotating: [child.uid, node.right.uid], unbalanced: [node.uid] },
      line: 'rebalance.rlFirst',
      rotation: info,
    });
  }
  const pivot = node;
  const info = describeRotation('left', pivot, rotationCase, rotationCase === 'RL' ? 'second' : 'single', slot);
  const newRoot = rotateLeft(pivot);
  ctx.setSlot(slot, newRoot);
  ctx.rotations.push(info);
  ctx.emit({
    kind: 'rotate',
    title: `Rotate ${pivot.key} left${rotationCase === 'RL' ? ' (RL, step 2 of 2)' : ` (${rotationCase})`}`,
    explanation:
      `Left rotation about ${pivot.key}: its right child ${newRoot.key} moves up and ${pivot.key} becomes its left child. ` +
      `New heights: height(${pivot.key}) = ${pivot.height}, height(${newRoot.key}) = ${newRoot.height}; ` +
      `BF(${newRoot.key}) = ${balanceFactor(newRoot)}.`,
    highlights: { rotating: [pivot.uid, newRoot.uid], active: [newRoot.uid] },
    line: 'rebalance.left',
    rotation: info,
  });
  return newRoot;
}
