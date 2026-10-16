import type { TreeNode } from '../../features/avl';

export const H_GAP = 62;
export const V_GAP = 88;
export const NODE_R = 23;
const PAD_X = 50;
const PAD_TOP = 40;
const PAD_BOTTOM = 56;

export interface LayoutNode {
  uid: number;
  key: number;
  x: number;
  y: number;
  depth: number;
  height: number;
  balance: number;
  leftHeight: number;
  rightHeight: number;
  parentUid: number | null;
  side: 'left' | 'right' | null;
  leftUid: number | null;
  rightUid: number | null;
}
export interface LayoutEdge {
  /** uid of the child (stable id for the edge). */
  childUid: number;
  parentUid: number;
  side: 'left' | 'right';
}
export interface TreeLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  byUid: Map<number, LayoutNode>;
  width: number;
  height: number;
}

interface Contour {
  /** left[d] / right[d]: leftmost / rightmost x at depth d below the subtree root (root x = 0). */
  left: number[];
  right: number[];
}

/**
 * Reingold-Tilford style "tidy" layout for binary trees.
 *
 * Every subtree is laid out on its own, remembering its left and right contour (the outline at each depth).
 * Two sibling subtrees are then pushed apart just far enough that their contours keep at least H_GAP between
 * them at every shared depth, and the parent is centred above its two children. A lone child is offset by half
 * a gap to its side so left/right stays visible. Nodes on the same level are therefore always >= H_GAP apart,
 * so nothing overlaps for any shape (balanced, ragged or completely skewed).
 */
export function computeLayout(root: TreeNode | null): TreeLayout {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const byUid = new Map<number, LayoutNode>();
  if (!root) return { nodes, edges, byUid, width: 0, height: 0 };

  /** Offset of each child relative to its parent, filled while measuring. */
  const dx = new Map<number, number>();

  const measure = (n: TreeNode): Contour => {
    const L = n.left ? measure(n.left) : null;
    const R = n.right ? measure(n.right) : null;
    if (!L && !R) return { left: [0], right: [0] };
    if (L && !R) {
      dx.set((n.left as TreeNode).uid, -H_GAP / 2);
      return { left: [0, ...L.left.map((v) => v - H_GAP / 2)], right: [0, ...L.right.map((v) => v - H_GAP / 2)] };
    }
    if (R && !L) {
      dx.set((n.right as TreeNode).uid, H_GAP / 2);
      return { left: [0, ...R.left.map((v) => v + H_GAP / 2)], right: [0, ...R.right.map((v) => v + H_GAP / 2)] };
    }
    const l = L as Contour;
    const r = R as Contour;
    let sep = H_GAP;
    const shared = Math.min(l.right.length, r.left.length);
    for (let d = 0; d < shared; d++) sep = Math.max(sep, H_GAP + l.right[d] - r.left[d]);
    dx.set((n.left as TreeNode).uid, -sep / 2);
    dx.set((n.right as TreeNode).uid, sep / 2);
    const depth = Math.max(l.left.length, r.left.length);
    const left = [0];
    const right = [0];
    for (let d = 0; d < depth; d++) {
      left.push(d < l.left.length ? l.left[d] - sep / 2 : r.left[d] + sep / 2);
      right.push(d < r.right.length ? r.right[d] + sep / 2 : l.right[d] - sep / 2);
    }
    return { left, right };
  };

  const contour = measure(root);
  const minX = Math.min(...contour.left);
  const maxX = Math.max(...contour.right);
  const originX = PAD_X - minX;

  // Top-down pass turns the relative offsets into absolute coordinates (explicit stack: no recursion limit).
  type Frame = { node: TreeNode; x: number; depth: number; parent: TreeNode | null; side: 'left' | 'right' | null };
  const stack: Frame[] = [{ node: root, x: originX, depth: 0, parent: null, side: null }];
  let maxDepth = 0;
  while (stack.length) {
    const f = stack.pop() as Frame;
    const n = f.node;
    const ln: LayoutNode = {
      uid: n.uid,
      key: n.key,
      x: f.x,
      y: PAD_TOP + f.depth * V_GAP,
      depth: f.depth,
      height: n.height,
      balance: (n.left ? n.left.height : 0) - (n.right ? n.right.height : 0),
      leftHeight: n.left ? n.left.height : 0,
      rightHeight: n.right ? n.right.height : 0,
      parentUid: f.parent ? f.parent.uid : null,
      side: f.side,
      leftUid: n.left ? n.left.uid : null,
      rightUid: n.right ? n.right.uid : null,
    };
    maxDepth = Math.max(maxDepth, f.depth);
    nodes.push(ln);
    byUid.set(ln.uid, ln);
    if (f.parent && f.side) edges.push({ childUid: n.uid, parentUid: f.parent.uid, side: f.side });
    if (n.right) stack.push({ node: n.right, x: f.x + (dx.get(n.right.uid) as number), depth: f.depth + 1, parent: n, side: 'right' });
    if (n.left) stack.push({ node: n.left, x: f.x + (dx.get(n.left.uid) as number), depth: f.depth + 1, parent: n, side: 'left' });
  }

  return {
    nodes,
    edges,
    byUid,
    width: PAD_X * 2 + (maxX - minX),
    height: PAD_TOP + maxDepth * V_GAP + PAD_BOTTOM,
  };
}
