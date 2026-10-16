import { deleteNode } from './deletion';
import { insertNode } from './insertion';
import { cloneTree, countNodes, findByKey } from './node';
import { OpContext } from './operationSteps';
import { searchSteps } from './search';
import { inorder, levelorder, postorder, preorder } from './traversal';
import { TRAVERSAL_RULES, traversalSteps } from './traversalSteps';
import {
  MAX_ABS_KEY,
  type OperationResult,
  type TraversalType,
  type TreeNode,
  type TreeState,
  type ValidationReport,
} from './types';
import { validateAvl } from './validate';

export interface OpOptions {
  /** Record step snapshots (default true). Disable for bulk work such as randomized tests. */
  record?: boolean;
}

/** Returns an error message when `key` cannot be stored, otherwise null. */
export function validateKey(key: number): string | null {
  if (typeof key !== 'number' || !Number.isFinite(key)) return 'Enter a valid number.';
  if (!Number.isInteger(key)) return 'Only whole numbers (integers) are supported.';
  if (Math.abs(key) > MAX_ABS_KEY) return `Keys must be between −${MAX_ABS_KEY} and ${MAX_ABS_KEY}.`;
  return null;
}

/** An AVL tree. Source of truth for the visualizer, the lab, the tests and the quizzes. */
export class AvlTree {
  private state: TreeState = { root: null, nextUid: 1 };

  static fromKeys(keys: number[]): AvlTree {
    const t = new AvlTree();
    for (const k of keys) t.insert(k, { record: false });
    return t;
  }

  /** Rebuild a tree from a snapshot (a deep copy is taken). */
  static fromSnapshot(root: TreeNode | null): AvlTree {
    const t = new AvlTree();
    t.state.root = cloneTree(root);
    let max = 0;
    const walk = (n: TreeNode | null) => {
      if (!n) return;
      max = Math.max(max, n.uid);
      walk(n.left);
      walk(n.right);
    };
    walk(t.state.root);
    t.state.nextUid = max + 1;
    return t;
  }

  get root(): TreeNode | null {
    return this.state.root;
  }
  get size(): number {
    return countNodes(this.state.root);
  }
  get height(): number {
    return this.state.root ? this.state.root.height : 0;
  }
  snapshot(): TreeNode | null {
    return cloneTree(this.state.root);
  }
  /**
   * Replace the tree with a snapshot (used by undo/redo). The uid counter never moves backwards,
   * so a node created later can never be mistaken for a node deleted earlier.
   */
  restore(root: TreeNode | null): void {
    this.state.root = cloneTree(root);
    let max = 0;
    const walk = (n: TreeNode | null) => {
      if (!n) return;
      max = Math.max(max, n.uid);
      walk(n.left);
      walk(n.right);
    };
    walk(this.state.root);
    this.state.nextUid = Math.max(this.state.nextUid, max + 1);
  }
  clear(): void {
    this.state = { root: null, nextUid: 1 };
  }
  contains(key: number): boolean {
    return findByKey(this.state.root, key) !== null;
  }
  validate(): ValidationReport {
    return validateAvl(this.state.root);
  }

  inorder = (): number[] => inorder(this.state.root);
  preorder = (): number[] => preorder(this.state.root);
  postorder = (): number[] => postorder(this.state.root);
  levelorder = (): number[] => levelorder(this.state.root);

  private fail(type: OperationResult['type'], key: number | undefined, message: string): OperationResult {
    return { type, key, ok: false, message, steps: [], finalTree: this.snapshot(), rotations: [] };
  }

  insert(key: number, opts: OpOptions = {}): OperationResult {
    const err = validateKey(key);
    if (err) return this.fail('insert', key, err);
    const ctx = new OpContext(this.state, opts.record !== false);
    ctx.emit({
      kind: 'start',
      title: `Insert ${key}`,
      explanation: `Insert ${key}: first walk down like an ordinary BST insert to find the empty spot, then walk back up fixing heights and rebalancing.`,
      line: 'insert.start',
    });
    insertNode(ctx, this.state.root, key, { parent: null, side: 'left' });
    const rotations = ctx.rotations;
    if (ctx.aborted) {
      const message = `${key} is already in the tree. Duplicates are rejected, so nothing changed.`;
      ctx.emit({ kind: 'done', title: 'Insertion rejected', explanation: message, line: 'insert.duplicate' });
      return { type: 'insert', key, ok: false, message, steps: ctx.steps, finalTree: this.snapshot(), rotations };
    }
    const message = rotations.length
      ? `Inserted ${key}. ${rotations.length} rotation${rotations.length > 1 ? 's' : ''} restored the balance (${[...new Set(rotations.map((r) => r.rotationCase))].join(', ')}).`
      : `Inserted ${key}. The tree stayed balanced, so no rotation was needed.`;
    ctx.emit({ kind: 'done', title: 'Insertion complete', explanation: message, line: 'insert.return' });
    return { type: 'insert', key, ok: true, message, steps: ctx.steps, finalTree: this.snapshot(), rotations };
  }

  delete(key: number, opts: OpOptions = {}): OperationResult {
    const err = validateKey(key);
    if (err) return this.fail('delete', key, err);
    if (!this.state.root) {
      return this.fail('delete', key, 'The tree is empty, so there is nothing to delete.');
    }
    const ctx = new OpContext(this.state, opts.record !== false);
    ctx.emit({
      kind: 'start',
      title: `Delete ${key}`,
      explanation: `Delete ${key}: search for it like in a BST, remove it using one of three cases (leaf, one child, two children), then rebalance every ancestor on the way back up.`,
      line: 'delete.start',
    });
    deleteNode(ctx, this.state.root, key, { parent: null, side: 'left' });
    const rotations = ctx.rotations;
    if (!ctx.found) {
      const message = `${key} is not in the tree, so nothing was deleted.`;
      ctx.emit({ kind: 'done', title: 'Nothing deleted', explanation: message, line: 'delete.empty' });
      return { type: 'delete', key, ok: false, message, steps: ctx.steps, finalTree: this.snapshot(), rotations };
    }
    const message = rotations.length
      ? `Deleted ${key}. ${rotations.length} rotation${rotations.length > 1 ? 's were' : ' was'} needed while rebalancing the ancestors.`
      : `Deleted ${key}. All ancestors were still balanced, so no rotation was needed.`;
    ctx.emit({ kind: 'done', title: 'Deletion complete', explanation: message, line: 'delete.return' });
    return { type: 'delete', key, ok: true, message, steps: ctx.steps, finalTree: this.snapshot(), rotations };
  }

  search(key: number, opts: OpOptions = {}): OperationResult {
    const err = validateKey(key);
    if (err) return this.fail('search', key, err);
    if (!this.state.root) return this.fail('search', key, 'The tree is empty, so the value cannot be found.');
    const ctx = new OpContext(this.state, opts.record !== false);
    ctx.emit({
      kind: 'start',
      title: `Search ${key}`,
      explanation: `Start at the root and compare ${key} with each node: smaller → go left, larger → go right, equal → found.`,
      line: 'search.start',
    });
    const hit = searchSteps(ctx, this.state.root, key);
    const message = hit ? `${key} was found.` : `${key} is not in the tree.`;
    return { type: 'search', key, ok: true, found: !!hit, message, steps: ctx.steps, finalTree: this.snapshot(), rotations: [] };
  }

  traverse(type: TraversalType, opts: OpOptions = {}): OperationResult {
    const info = TRAVERSAL_RULES[type];
    if (!this.state.root) return this.fail('traversal', undefined, 'The tree is empty, so there is nothing to traverse.');
    const ctx = new OpContext(this.state, opts.record !== false);
    ctx.emit({ kind: 'start', title: `${info.name} traversal`, explanation: info.rule, line: `${type}.start` });
    const order = traversalSteps(ctx, this.state.root, type);
    const sorted = type === 'inorder' ? ' The keys come out in ascending order - that is the BST property at work.' : '';
    const message = `${info.name}: ${order.join(', ')}.${sorted}`;
    ctx.emit({ kind: 'done', title: 'Traversal complete', explanation: message, highlights: { visited: [] }, line: `${type}.start` });
    return { type: 'traversal', traversal: type, ok: true, message, steps: ctx.steps, finalTree: this.snapshot(), order, rotations: [] };
  }
}
