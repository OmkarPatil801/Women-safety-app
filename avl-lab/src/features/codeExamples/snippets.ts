import type { RotationCase } from '../avl';
import { FUNCTIONS, findRange } from './functionIndex';
import { SOURCES, type Lang } from './sources';

export interface Snippet {
  code: string;
  /** 1-based line number of the first line in the original file. */
  startLine: number;
}

function dedent(lines: string[]): string {
  const indents = lines.filter((l) => l.trim()).map((l) => /^ */.exec(l)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join('\n');
}

/** Extract one function from the REAL source file (so snippets can never drift from the downloadable code). */
export function functionSnippet(lang: Lang, id: string): Snippet | null {
  const entry = FUNCTIONS[lang].find((f) => f.id === id);
  if (!entry) return null;
  const lines = SOURCES[lang].text.split('\n');
  const r = findRange(lines, entry.match);
  if (!r) return null;
  return { code: dedent(lines.slice(r.start, r.end + 1)), startLine: r.start + 1 };
}

/** 0-based lines of rebalance() that implement the given case. */
export function rebalanceLinesFor(code: string, c: RotationCase): number[] {
  const lines = code.split('\n');
  const find = (text: string) => lines.map((l, i) => (l.includes(text) ? i : -1)).filter((i) => i >= 0);
  switch (c) {
    case 'LL':
      return [...find('if (balance > 1)'), ...find('return rightRotate(node)')];
    case 'LR':
      return [...find('if (balance > 1)'), ...find('getBalance(node->left) < 0'), ...find('node->left = leftRotate'), ...find('return rightRotate(node)')];
    case 'RR':
      return [...find('if (balance < -1)'), ...find('return leftRotate(node)')];
    case 'RL':
      return [...find('if (balance < -1)'), ...find('getBalance(node->right) > 0'), ...find('node->right = rightRotate'), ...find('return leftRotate(node)')];
  }
}

/** Pseudocode (rebalance) lines for a case, by tag. */
export function pseudoLinesFor(tags: (string | undefined)[], c: RotationCase): number[] {
  const want: Record<RotationCase, string[]> = {
    LL: ['rebalance.leftHeavy', 'rebalance.right'],
    LR: ['rebalance.leftHeavy', 'rebalance.lrFirst', 'rebalance.right'],
    RR: ['rebalance.rightHeavy', 'rebalance.left'],
    RL: ['rebalance.rightHeavy', 'rebalance.rlFirst', 'rebalance.left'],
  };
  return tags.map((t, i) => (t && want[c].includes(t) ? i : -1)).filter((i) => i >= 0);
}
