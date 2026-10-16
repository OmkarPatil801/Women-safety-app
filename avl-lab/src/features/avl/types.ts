/**
 * Core types for the AVL engine. The engine is UI-independent: nothing in this
 * folder imports React.
 */

/** A node of the tree. `uid` is a stable identity (keys can be copied between nodes during deletion). */
export interface TreeNode {
  uid: number;
  key: number;
  left: TreeNode | null;
  right: TreeNode | null;
  /** Convention used everywhere: empty subtree = 0, leaf = 1. */
  height: number;
}

export type RotationCase = 'LL' | 'RR' | 'LR' | 'RL';
export type RotationDirection = 'left' | 'right';
export type OperationType = 'insert' | 'delete' | 'search' | 'traversal';
export type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'levelorder';
export type RebalanceMode = 'insert' | 'delete';

export type StepKind =
  | 'start'
  | 'compare'
  | 'create'
  | 'duplicate'
  | 'found'
  | 'not-found'
  | 'find-successor'
  | 'copy-successor'
  | 'remove'
  | 'check'
  | 'imbalance'
  | 'rotate'
  | 'visit'
  | 'done';

/** Which nodes (by uid) to emphasise when rendering a step. */
export interface Highlights {
  /** The node the algorithm is looking at right now. */
  active?: number[];
  /** Nodes already visited along the current path. */
  path?: number[];
  /** Nodes taking part in a rotation. */
  rotating?: number[];
  /** Newly created nodes. */
  created?: number[];
  /** Nodes about to disappear / just replaced. */
  removed?: number[];
  /** Search hit. */
  found?: number[];
  /** Traversal output so far. */
  visited?: number[];
  /** First unbalanced ancestor. */
  unbalanced?: number[];
}

export interface RotationInfo {
  /** The rotation case this rotation belongs to (LL, RR, LR, RL). */
  rotationCase: RotationCase;
  direction: RotationDirection;
  /** 'single' for LL/RR, 'first'/'second' for the two halves of LR/RL. */
  phase: 'single' | 'first' | 'second';
  /** Key of the node the rotation is performed ON (it moves down). */
  pivotKey: number;
  /** Key of the node that becomes the new subtree root (it moves up). */
  newRootKey: number;
  /** Key of the middle subtree root that is re-attached (null if empty). */
  movedSubtreeKey: number | null;
  /** Human-readable pointer changes. */
  pointerChanges: string[];
}

export interface ImbalanceInfo {
  nodeKey: number;
  balanceFactor: number;
  childKey: number;
  childBalanceFactor: number;
  rotationCase: RotationCase;
}

export interface Step {
  index: number;
  kind: StepKind;
  title: string;
  explanation: string;
  /** Full snapshot of the tree at this moment (deep copy; safe to keep). */
  tree: TreeNode | null;
  highlights: Highlights;
  /** Pseudocode line tag such as `insert.goLeft`, resolved against the algorithm reference. */
  line?: string;
  /** Recursion stack at this moment, outermost call first. */
  callStack: string[];
  rotation?: RotationInfo;
  imbalance?: ImbalanceInfo;
  /** Extra data shown by traversal steps (e.g. queue contents). */
  note?: string;
}

export interface OperationResult {
  type: OperationType;
  key?: number;
  traversal?: TraversalType;
  ok: boolean;
  message: string;
  steps: Step[];
  /** Tree after the operation (deep copy). */
  finalTree: TreeNode | null;
  found?: boolean;
  /** Visiting order for traversals. */
  order?: number[];
  rotations: RotationInfo[];
}

export interface ValidationReport {
  ok: boolean;
  errors: string[];
}

/** Largest absolute key accepted by the visualizer (keeps labels readable). */
export const MAX_ABS_KEY = 9999;

/** Mutable state shared between an AvlTree and the operations that run on it. */
export interface TreeState {
  root: TreeNode | null;
  nextUid: number;
}

/** A "slot" is the pointer that references a subtree: either the tree root or parent.left/right. */
export interface Slot {
  parent: TreeNode | null;
  side: 'left' | 'right';
}
