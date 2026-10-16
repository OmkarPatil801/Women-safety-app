import { AvlTree, cloneTree, findByUid, rotateLeft, rotateRight, validateAvl, type RotationCase, type RotationInfo, type Step, type TreeNode } from '../avl';

export interface CaseConfig {
  id: RotationCase;
  title: string;
  longName: string;
  /** Keys inserted first (in order), then `trigger`. */
  setup: number[];
  trigger: number;
  where: string;
  rotation: string;
}

export const CASES: CaseConfig[] = [
  { id: 'LL', title: 'Case A: LL - Left-Left', longName: 'Left-Left', setup: [30, 20], trigger: 10, where: 'the left subtree of the left child', rotation: 'one right rotation' },
  { id: 'RR', title: 'Case B: RR - Right-Right', longName: 'Right-Right', setup: [10, 20], trigger: 30, where: 'the right subtree of the right child', rotation: 'one left rotation' },
  { id: 'LR', title: 'Case C: LR - Left-Right', longName: 'Left-Right', setup: [30, 10], trigger: 20, where: 'the right subtree of the left child', rotation: 'a left rotation on the left child, then a right rotation on the unbalanced node' },
  { id: 'RL', title: 'Case D: RL - Right-Left', longName: 'Right-Left', setup: [10, 30], trigger: 20, where: 'the left subtree of the right child', rotation: 'a right rotation on the right child, then a left rotation on the unbalanced node' },
];

export interface Scenario {
  config: CaseConfig;
  steps: Step[];
  rotations: RotationInfo[];
  beforeInsert: TreeNode | null;
  /** The tree right after the key was attached (heights NOT yet fixed) - the unbalanced picture. */
  unbalanced: TreeNode;
  /** Tree after the last rotation step. */
  afterRotation: TreeNode;
  finalTree: TreeNode | null;
  /** Key of the parent the new node was attached to. */
  insertionParentKey: number | null;
  /** Key of the first unbalanced ancestor (the node the rotation is anchored at). */
  unbalancedKey: number;
  /** uid of the first unbalanced ancestor in `unbalanced`. */
  unbalancedUid: number;
  balanceFactor: number;
  childKey: number;
  childBalanceFactor: number;
}

/** Run the REAL engine on the case's insertion sequence and extract the interesting snapshots. */
export function buildScenario(config: CaseConfig): Scenario {
  const tree = AvlTree.fromKeys(config.setup);
  const beforeInsert = tree.snapshot();
  const result = tree.insert(config.trigger);
  const steps = result.steps;
  const imbalance = steps.find((s) => s.kind === 'imbalance');
  if (!imbalance || !imbalance.imbalance) throw new Error(`Scenario ${config.id} did not cause an imbalance`);
  const created = steps.find((s) => s.kind === 'create');
  const createdUid = created?.highlights.created?.[0];
  let insertionParentKey: number | null = null;
  if (created?.tree && createdUid !== undefined) {
    const walk = (n: TreeNode | null, parent: TreeNode | null): void => {
      if (!n) return;
      if (n.uid === createdUid) insertionParentKey = parent ? parent.key : null;
      walk(n.left, n);
      walk(n.right, n);
    };
    walk(created.tree, null);
  }
  const lastRotate = [...steps].reverse().find((s) => s.kind === 'rotate');
  // The unbalanced picture is the imbalance step's tree (heights already updated at the unbalanced node).
  const unbalanced = imbalance.tree as TreeNode;
  const unbalancedUid = imbalance.highlights.unbalanced?.[0] ?? -1;
  return {
    config,
    steps,
    rotations: result.rotations,
    beforeInsert,
    unbalanced,
    afterRotation: (lastRotate?.tree ?? result.finalTree) as TreeNode,
    finalTree: result.finalTree,
    insertionParentKey,
    unbalancedKey: imbalance.imbalance.nodeKey,
    unbalancedUid: findByUid(unbalanced, unbalancedUid) ? unbalancedUid : -1,
    balanceFactor: imbalance.imbalance.balanceFactor,
    childKey: imbalance.imbalance.childKey,
    childBalanceFactor: imbalance.imbalance.childBalanceFactor,
  };
}

export interface WrongRotationDemo {
  tree: TreeNode;
  valid: boolean;
  firstError: string | undefined;
}

/**
 * What would happen if we used the SINGLE rotation in a double-rotation case (LR / RL)?
 * Uses the real rotation helpers on a copy of the unbalanced tree and validates the result.
 */
export function wrongSingleRotation(s: Scenario): WrongRotationDemo {
  const copy = cloneTree(s.unbalanced) as TreeNode;
  const tree = s.config.id === 'LR' ? rotateRight(copy) : rotateLeft(copy);
  const report = validateAvl(tree);
  return { tree, valid: report.ok, firstError: report.errors[0] };
}

export interface EqualityDemo {
  before: TreeNode;
  deleteKey: number;
  /** After removing the key but before any rebalancing. */
  afterRemoval: TreeNode;
  /** Tree after the CORRECT (single) rotation. */
  correct: TreeNode;
  correctValid: boolean;
  /** Tree after the WRONG (double) rotation. */
  wrong: TreeNode;
  wrongValid: boolean;
  wrongError: string | undefined;
  steps: Step[];
}

/**
 * Deletion case where the heavy child has balance factor 0.
 * Built by deleting 3 from 10(5(3,),30(20(15,),40(35,45))): node 10 becomes right-heavy (BF -2)
 * while its right child 30 is perfectly balanced (BF 0).
 */
export function equalityDemo(): EqualityDemo {
  const keys = [10, 5, 30, 3, 20, 40, 15, 35, 45];
  const t = AvlTree.fromKeys(keys);
  const before = t.snapshot() as TreeNode;

  // The state right after removing 3 but BEFORE any rebalancing: detach 3 and fix stored heights on the path.
  const raw = cloneTree(before) as TreeNode;
  const five = raw.left as TreeNode;
  five.left = null;
  five.height = 1;
  raw.height = 1 + Math.max(five.height, (raw.right as TreeNode).height);
  // WRONG: pretend BF(child) = 0 needs the double rotation (RL) and apply it with the real rotation helpers.
  const wrongCopy = cloneTree(raw) as TreeNode;
  const y = wrongCopy.right as TreeNode;
  wrongCopy.right = rotateRight(y); // first half of the double rotation (right rotation of the child)
  const wrong = rotateLeft(wrongCopy); // second half
  const wrongReport = validateAvl(wrong);

  const res = t.delete(3);
  const correct = t.snapshot() as TreeNode;
  return {
    before,
    deleteKey: 3,
    afterRemoval: raw,
    correct,
    correctValid: t.validate().ok,
    wrong,
    wrongValid: wrongReport.ok,
    wrongError: wrongReport.errors[0],
    steps: res.steps,
  };
}
