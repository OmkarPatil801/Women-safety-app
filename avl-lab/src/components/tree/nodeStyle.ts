import type { Highlights } from '../../features/avl';

export type NodeState = 'unbalanced' | 'rotating' | 'created' | 'removed' | 'found' | 'active' | 'visited' | 'path' | 'selected' | 'normal';

/** Highest-priority state wins. */
export function resolveNodeState(uid: number, h: Highlights | undefined, selected: boolean): NodeState {
  if (h) {
    if (h.unbalanced?.includes(uid)) return 'unbalanced';
    if (h.rotating?.includes(uid)) return 'rotating';
    if (h.created?.includes(uid)) return 'created';
    if (h.removed?.includes(uid)) return 'removed';
    if (h.found?.includes(uid)) return 'found';
    if (h.active?.includes(uid)) return 'active';
    if (h.visited?.includes(uid)) return 'visited';
    if (h.path?.includes(uid)) return 'path';
  }
  return selected ? 'selected' : 'normal';
}

export const STATE_LABEL: Record<NodeState, string> = {
  unbalanced: 'unbalanced',
  rotating: 'rotating',
  created: 'new',
  removed: 'to remove',
  found: 'found',
  active: 'current',
  visited: '',
  path: '',
  selected: 'selected',
  normal: '',
};

export const STATE_DESCRIPTION: { state: NodeState; text: string }[] = [
  { state: 'active', text: 'Node being examined now' },
  { state: 'path', text: 'Already visited on the path' },
  { state: 'created', text: 'Newly created node' },
  { state: 'unbalanced', text: 'First unbalanced ancestor (|BF| > 1)' },
  { state: 'rotating', text: 'Nodes taking part in a rotation' },
  { state: 'removed', text: 'Node being deleted / replaced' },
  { state: 'found', text: 'Search hit / duplicate' },
  { state: 'visited', text: 'Traversal output (numbered)' },
  { state: 'selected', text: 'Selected node' },
];

/** CSS colour strings (using the theme tokens) for a node state. */
export function stateColors(state: NodeState): { fill: string; stroke: string; text: string; width: number; dash?: string } {
  const v = (name: string, a = 1) => `rgb(var(--${name}) / ${a})`;
  switch (state) {
    case 'unbalanced':
      return { fill: v('c-bad', 0.22), stroke: v('c-bad'), text: v('c-ink'), width: 3 };
    case 'rotating':
      return { fill: v('c-warn', 0.25), stroke: v('c-warn'), text: v('c-ink'), width: 3 };
    case 'created':
      return { fill: v('c-good', 0.28), stroke: v('c-good'), text: v('c-ink'), width: 3 };
    case 'removed':
      return { fill: v('c-bad', 0.15), stroke: v('c-bad'), text: v('c-ink'), width: 3, dash: '5 4' };
    case 'found':
      return { fill: v('c-good', 0.3), stroke: v('c-good'), text: v('c-ink'), width: 4 };
    case 'active':
      return { fill: v('c-accent', 0.35), stroke: v('c-accent'), text: v('c-ink'), width: 3.5 };
    case 'visited':
      return { fill: v('c-info', 0.28), stroke: v('c-info'), text: v('c-ink'), width: 3 };
    case 'path':
      return { fill: v('tree-node'), stroke: v('c-accent', 0.75), text: v('c-ink'), width: 2.5 };
    case 'selected':
      return { fill: v('tree-node'), stroke: v('c-ink'), text: v('c-ink'), width: 3 };
    default:
      return { fill: v('tree-node'), stroke: v('c-line'), text: v('c-ink'), width: 2 };
  }
}
