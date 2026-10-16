export interface Preset {
  id: string;
  label: string;
  description: string;
  keys: number[];
}

/** Keys are inserted one by one with the real AVL algorithm, so rotations happen exactly as they would live. */
export const PRESETS: Preset[] = [
  { id: 'balanced', label: 'Balanced 7 nodes', description: 'A perfect tree: 30, 20, 40, 10, 25, 35, 50.', keys: [30, 20, 40, 10, 25, 35, 50] },
  { id: 'sorted', label: 'Sorted input 10…70', description: 'Sorted inserts would make a plain BST a line; AVL rotates instead.', keys: [10, 20, 30, 40, 50, 60, 70] },
  { id: 'textbook', label: 'Textbook example', description: 'A mixed tree with different heights.', keys: [50, 30, 70, 20, 40, 60, 80, 10, 25, 35] },
  { id: 'deletion', label: 'Deletion-rotation setup', description: 'Delete 1 from this tree to see a rotation triggered by a deletion.', keys: [2, 1, 4, 3, 5] },
  { id: 'fibonacci', label: 'Fibonacci tree (cascading deletion)', description: 'Smallest AVL tree of height 5. Delete 12 and watch TWO rotations at different levels.', keys: [8, 5, 11, 3, 7, 10, 12, 2, 4, 6, 9, 1] },
  { id: 'cascade', label: 'Deep tree (15 nodes)', description: 'Try deleting a leaf on the right and watch ancestors rebalance.', keys: [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15] },
];
