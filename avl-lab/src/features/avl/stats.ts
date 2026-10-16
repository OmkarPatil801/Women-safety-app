import { AvlTree } from './avlTree';
import { makeRng } from '../../utils/random';

export interface HeightCurves {
  /** n = 1..N */
  n: number[];
  /** Height after inserting 1, 2, ..., n in sorted order into an AVL tree. */
  avlSorted: number[];
  /** Height of a plain BST after the same sorted insertions (a chain). */
  bstSorted: number[];
  /** Height of a plain BST built from a random permutation (seeded, so reproducible). */
  bstRandom: number[];
}

/** Real heights measured by running the algorithms - nothing here is a formula. */
export function heightCurves(maxN: number, seed = 7): HeightCurves {
  const avl = new AvlTree();
  const rand = makeRng(seed);
  // Random permutation of 1..maxN
  const perm = Array.from({ length: maxN }, (_, i) => i + 1);
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  // Plain BST with parallel arrays; tracks the maximum depth (= height) incrementally.
  const key: number[] = [];
  const left: number[] = [];
  const right: number[] = [];
  let bstHeight = 0;

  const out: HeightCurves = { n: [], avlSorted: [], bstSorted: [], bstRandom: [] };
  for (let i = 1; i <= maxN; i++) {
    avl.insert(i, { record: false });

    const k = perm[i - 1];
    let depth = 1;
    if (key.length === 0) {
      key.push(k);
      left.push(-1);
      right.push(-1);
    } else {
      let cur = 0;
      for (;;) {
        depth++;
        const side = k < key[cur] ? left : right;
        if (side[cur] === -1) {
          side[cur] = key.length;
          key.push(k);
          left.push(-1);
          right.push(-1);
          break;
        }
        cur = side[cur];
      }
    }
    bstHeight = Math.max(bstHeight, depth);

    out.n.push(i);
    out.avlSorted.push(avl.height);
    out.bstSorted.push(i);
    out.bstRandom.push(bstHeight);
  }
  return out;
}
