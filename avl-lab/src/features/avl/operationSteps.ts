import { cloneTree } from './node';
import type { Highlights, ImbalanceInfo, RotationInfo, Slot, Step, StepKind, TreeNode, TreeState } from './types';

export interface StepInput {
  kind: StepKind;
  title: string;
  explanation: string;
  highlights?: Highlights;
  line?: string;
  rotation?: RotationInfo;
  imbalance?: ImbalanceInfo;
  note?: string;
}

/**
 * Records the states of an operation. Every step stores a deep copy of the LIVE tree,
 * so playback shows exactly what the algorithm produced - there are no staged animations.
 *
 * Operations eagerly re-link the tree via `setSlot` before emitting, which means the live
 * root is always a complete, consistent tree at the instant a step is recorded.
 */
export class OpContext {
  readonly steps: Step[] = [];
  readonly rotations: RotationInfo[] = [];
  /** Labels of the active recursive calls, outermost first. */
  readonly stack: string[] = [];
  /** uids of nodes on the active recursive path, outermost first. */
  readonly pathUids: number[] = [];
  aborted = false;
  found = false;

  constructor(
    readonly state: TreeState,
    readonly record: boolean,
  ) {}

  newUid(): number {
    return this.state.nextUid++;
  }

  /** Point `slot` at `node` (updates the tree root when the slot has no parent). */
  setSlot(slot: Slot, node: TreeNode | null): void {
    if (slot.parent) slot.parent[slot.side] = node;
    else this.state.root = node;
  }

  emit(input: StepInput): void {
    if (!this.record) return;
    this.steps.push({
      index: this.steps.length,
      kind: input.kind,
      title: input.title,
      explanation: input.explanation,
      tree: cloneTree(this.state.root),
      highlights: input.highlights ?? {},
      line: input.line,
      callStack: [...this.stack],
      rotation: input.rotation,
      imbalance: input.imbalance,
      note: input.note,
    });
  }

  enter(node: TreeNode | null, label: string): void {
    this.stack.push(label);
    if (node) this.pathUids.push(node.uid);
  }

  leave(node: TreeNode | null): void {
    this.stack.pop();
    if (node) this.pathUids.pop();
  }

  /** Nodes above the current one on the recursion path. */
  ancestors(): number[] {
    return this.pathUids.slice(0, -1);
  }
}
