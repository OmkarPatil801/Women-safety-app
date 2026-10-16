import type { Lang } from './sources';

export type GroupId = 'structure' | 'rotations' | 'insertion' | 'deletion' | 'search' | 'traversals' | 'memory' | 'main';

export const GROUPS: { id: GroupId; label: string }[] = [
  { id: 'structure', label: 'Node & helpers' },
  { id: 'rotations', label: 'Rotations & rebalance' },
  { id: 'insertion', label: 'Insertion' },
  { id: 'deletion', label: 'Deletion' },
  { id: 'search', label: 'Search' },
  { id: 'traversals', label: 'Traversals' },
  { id: 'memory', label: 'Cleanup' },
  { id: 'main', label: 'Menu (main)' },
];

export interface FnEntry {
  id: string;
  label: string;
  group: GroupId;
  /** The declaration line starts with this text (after trimming). */
  match: string;
}

export const FUNCTIONS: Record<Lang, FnEntry[]> = {
  c: [
    { id: 'node', label: 'struct Node', group: 'structure', match: 'typedef struct Node {' },
    { id: 'height', label: 'height()', group: 'structure', match: 'int height(' },
    { id: 'max', label: 'max()', group: 'structure', match: 'int max(' },
    { id: 'getBalance', label: 'getBalance()', group: 'structure', match: 'int getBalance(' },
    { id: 'updateHeight', label: 'updateHeight()', group: 'structure', match: 'void updateHeight(' },
    { id: 'createNode', label: 'createNode()', group: 'structure', match: 'Node *createNode(' },
    { id: 'rightRotate', label: 'rightRotate()', group: 'rotations', match: 'Node *rightRotate(' },
    { id: 'leftRotate', label: 'leftRotate()', group: 'rotations', match: 'Node *leftRotate(' },
    { id: 'rebalance', label: 'rebalance()', group: 'rotations', match: 'Node *rebalance(' },
    { id: 'insert', label: 'insert()', group: 'insertion', match: 'Node *insert(' },
    { id: 'minValueNode', label: 'minValueNode()', group: 'deletion', match: 'Node *minValueNode(' },
    { id: 'delete', label: 'deleteNode()', group: 'deletion', match: 'Node *deleteNode(' },
    { id: 'search', label: 'search()', group: 'search', match: 'Node *search(' },
    { id: 'inorder', label: 'inorder()', group: 'traversals', match: 'void inorder(' },
    { id: 'preorder', label: 'preorder()', group: 'traversals', match: 'void preorder(' },
    { id: 'postorder', label: 'postorder()', group: 'traversals', match: 'void postorder(' },
    { id: 'queue', label: 'Queue (helper)', group: 'traversals', match: 'typedef struct {' },
    { id: 'levelOrder', label: 'levelOrder()', group: 'traversals', match: 'void levelOrder(' },
    { id: 'freeTree', label: 'freeTree()', group: 'memory', match: 'Node *freeTree(' },
    { id: 'main', label: 'main()', group: 'main', match: 'int main(' },
  ],
  cpp: [
    { id: 'node', label: 'struct Node', group: 'structure', match: 'struct Node {' },
    { id: 'height', label: 'height()', group: 'structure', match: 'static int height(' },
    { id: 'getBalance', label: 'getBalance()', group: 'structure', match: 'static int getBalance(' },
    { id: 'updateHeight', label: 'updateHeight()', group: 'structure', match: 'static void updateHeight(' },
    { id: 'rightRotate', label: 'rightRotate()', group: 'rotations', match: 'static Node *rightRotate(' },
    { id: 'leftRotate', label: 'leftRotate()', group: 'rotations', match: 'static Node *leftRotate(' },
    { id: 'rebalance', label: 'rebalance()', group: 'rotations', match: 'static Node *rebalance(' },
    { id: 'insertPublic', label: 'insert() (public)', group: 'insertion', match: 'bool insert(int key)' },
    { id: 'insert', label: 'insert() (recursive)', group: 'insertion', match: 'static Node *insert(' },
    { id: 'removePublic', label: 'remove() (public)', group: 'deletion', match: 'bool remove(int key)' },
    { id: 'minValueNode', label: 'minValueNode()', group: 'deletion', match: 'static Node *minValueNode(' },
    { id: 'delete', label: 'remove() (recursive)', group: 'deletion', match: 'static Node *remove(' },
    { id: 'search', label: 'search()', group: 'search', match: 'bool search(int key) const' },
    { id: 'inorder', label: 'inorder()', group: 'traversals', match: 'static void inorder(' },
    { id: 'preorder', label: 'preorder()', group: 'traversals', match: 'static void preorder(' },
    { id: 'postorder', label: 'postorder()', group: 'traversals', match: 'static void postorder(' },
    { id: 'levelOrder', label: 'levelOrder() (std::queue)', group: 'traversals', match: 'void levelOrder() const' },
    { id: 'freeTree', label: '~AVLTree / destroy()', group: 'memory', match: 'static void destroy(' },
    { id: 'main', label: 'main()', group: 'main', match: 'int main(' },
  ],
};

export interface LineRange {
  /** 0-based inclusive start line (includes the comment block above the declaration). */
  start: number;
  /** 0-based inclusive end line. */
  end: number;
}

/** Locate a function by its declaration text and match braces to find its end. */
export function findRange(lines: string[], match: string): LineRange | null {
  const declIdx = lines.findIndex((l) => l.trim().startsWith(match));
  if (declIdx < 0) return null;
  let depth = 0;
  let seenOpen = false;
  let end = declIdx;
  scan: for (let i = declIdx; i < lines.length; i++) {
    // Ignore braces inside // comments (strings never contain braces in these sources).
    const code = lines[i].replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    for (const ch of code) {
      if (ch === '{') {
        depth++;
        seenOpen = true;
      } else if (ch === '}') {
        depth--;
        if (seenOpen && depth === 0) {
          end = i;
          break scan;
        }
      }
    }
    end = i;
  }
  // include a leading comment block
  let start = declIdx;
  while (start > 0 && /^\s*(\/\/|\/\*|\*)/.test(lines[start - 1])) start--;
  return { start, end };
}
