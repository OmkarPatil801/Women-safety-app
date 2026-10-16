import {
  AvlTree,
  balanceFactor,
  buildBst,
  findByKey,
  maxHeightForNodes,
  minNodesForHeight,
  minNode,
  preorder,
  validateAvl,
  type RotationCase,
  type TreeNode,
} from '../avl';

export type Level = 'beginner' | 'intermediate' | 'advanced';
export const LEVELS: { id: Level; label: string; blurb: string }[] = [
  { id: 'beginner', label: 'Beginner', blurb: 'Definitions, balance factor, and spotting the basic rotations.' },
  { id: 'intermediate', label: 'Intermediate', blurb: 'Predicting rotations and results, deletion, invalid trees.' },
  { id: 'advanced', label: 'Advanced', blurb: 'Deletion subtleties, complexity bounds and finding bugs in code.' },
];

export interface QuestionFigure {
  label: string;
  root: TreeNode | null;
  /** Hide the h / bf labels (they would give the answer away). */
  hideMetrics?: boolean;
}

interface Base {
  id: string;
  level: Level;
  topic: string;
  prompt: string;
  explanation: string;
  figures?: QuestionFigure[];
  /** C code shown with the question (bug-hunting). */
  code?: string;
}
export interface McqQuestion extends Base {
  type: 'mcq';
  options: string[];
  answer: number;
}
export interface NumericQuestion extends Base {
  type: 'numeric';
  answer: number;
}
export interface MatchQuestion extends Base {
  type: 'match';
  left: string[];
  right: string[];
  /** answer[i] = index in `right` that matches left[i] */
  answer: number[];
}
export type Question = McqQuestion | NumericQuestion | MatchQuestion;

const ROT_OPTIONS: RotationCase[] = ['LL', 'RR', 'LR', 'RL'];
const ROT_TEXT: Record<RotationCase, string> = {
  LL: 'LL - a single right rotation',
  RR: 'RR - a single left rotation',
  LR: 'LR - left rotation on the child, then right rotation',
  RL: 'RL - right rotation on the child, then left rotation',
};

/** The rotation case the engine really performs when `trigger` is inserted into the tree built from `setup`. */
function rotationFor(setup: number[], trigger: number): RotationCase {
  const t = AvlTree.fromKeys(setup);
  const r = t.insert(trigger);
  const c = r.rotations[0]?.rotationCase;
  if (!c) throw new Error('expected a rotation');
  return c;
}

function rotationQuestion(id: string, level: Level, seq: number[], extra = ''): McqQuestion {
  const answer = rotationFor(seq.slice(0, -1), seq[seq.length - 1]);
  return {
    id,
    type: 'mcq',
    level,
    topic: 'Rotations',
    prompt: `Insert ${seq.join(', ')} (in this order) into an empty AVL tree. Which rotation case occurs? ${extra}`.trim(),
    options: ROT_OPTIONS.map((c) => ROT_TEXT[c]),
    answer: ROT_OPTIONS.indexOf(answer),
    explanation: `The engine performs a ${answer} rotation. ${
      answer === 'LL' || answer === 'RR' ? 'The new key lands on the outside of the heavy side, so one rotation fixes it.' : 'The new key lands on the inside (zig-zag), so two rotations are needed.'
    }`,
  };
}

function bfQuestion(id: string, level: Level, keys: number[], mode: 'bst' | 'avl', target: number): NumericQuestion {
  const root = mode === 'bst' ? buildBst(keys) : AvlTree.fromKeys(keys).snapshot();
  const node = findByKey(root, target);
  if (!node) throw new Error('target missing');
  const bf = balanceFactor(node);
  const lh = node.left?.height ?? 0;
  const rh = node.right?.height ?? 0;
  return {
    id,
    type: 'numeric',
    level,
    topic: 'Balance factor',
    prompt: `What is the balance factor of node ${target} in this tree? (Use BF = height(left) − height(right), empty = 0, leaf = 1.) Type a whole number such as 2 or -1.`,
    figures: [{ label: `Tree built by inserting ${keys.join(', ')}${mode === 'bst' ? ' into a plain BST' : ' into an AVL tree'}`, root, hideMetrics: true }],
    answer: bf,
    explanation: `height(left) = ${lh}, height(right) = ${rh}, so BF(${target}) = ${lh} − ${rh} = ${bf}.`,
  };
}

function invalidTreeQuestion(): McqQuestion {
  const valid1 = AvlTree.fromKeys([30, 20, 40, 10, 25]).snapshot();
  const invalid = buildBst([30, 20, 40, 10, 5]); // 20 has a left chain 10 -> 5: BF(20) = +2
  const valid2 = AvlTree.fromKeys([20, 10, 30, 40]).snapshot();
  const figs = [valid1, invalid, valid2];
  const verdicts = figs.map((f) => validateAvl(f).ok);
  const answer = verdicts.indexOf(false);
  if (verdicts.filter((v) => !v).length !== 1) throw new Error('exactly one invalid tree expected');
  return {
    id: 'int-invalid',
    type: 'mcq',
    level: 'intermediate',
    topic: 'AVL property',
    prompt: 'Exactly one of these trees is NOT a valid AVL tree. Which one?',
    figures: figs.map((root, i) => ({ label: `Tree ${String.fromCharCode(65 + i)}`, root, hideMetrics: true })),
    options: ['Tree A', 'Tree B', 'Tree C', 'All three are valid'],
    answer,
    explanation: `The validator reports: ${validateAvl(figs[answer]).errors[0]}. In tree B the node 20 has a left subtree of height 2 and no right subtree, so its balance factor is +2 (the root 30 is at +2 as well).`,
  };
}

function predictTreeQuestion(): McqQuestion {
  const seq = [10, 20, 30, 40, 50, 25];
  const t = AvlTree.fromKeys(seq);
  const right = preorder(t.root).join(', ');
  const plain = preorder(buildBst(seq)).join(', ');
  const distractors = [plain, preorder(AvlTree.fromKeys([10, 20, 30, 40, 50]).root).join(', '), [...preorder(t.root)].reverse().join(', ')].filter((d) => d !== right);
  const options = [right, ...distractors].slice(0, 4);
  return {
    id: 'int-predict',
    type: 'mcq',
    level: 'intermediate',
    topic: 'Insertion',
    prompt: `Insert ${seq.join(', ')} (in order) into an empty AVL tree. What is the PRE-ORDER traversal of the final tree?`,
    options,
    answer: 0,
    explanation: `Final tree pre-order: ${right}. A plain BST would give ${plain}. After 10, 20, 30 the root becomes 20 (RR); inserting 50 triggers another RR at 30, making 40 the parent of 30 and 50. Finally 25 lands under 30 and the root 20 becomes right-heavy (BF −2) with a LEFT-heavy right child, which is the RL case: 30 ends up as the new root.`,
  };
}

function successorQuestion(): McqQuestion {
  const keys = [40, 20, 60, 10, 30, 50, 70];
  const t = AvlTree.fromKeys(keys);
  const target = 20;
  const node = findByKey(t.root, target) as TreeNode;
  const succ = minNode(node.right as TreeNode).key;
  t.delete(target, { record: false });
  const replaced = findByKey(t.root, succ);
  if (!replaced || t.contains(target)) throw new Error('deletion demo failed');
  return {
    id: 'int-successor',
    type: 'mcq',
    level: 'intermediate',
    topic: 'Deletion',
    prompt: 'In this tree you delete the node 20, which has two children. With successor-based deletion, which key takes its place?',
    figures: [{ label: 'Before deleting 20', root: AvlTree.fromKeys(keys).snapshot() }],
    options: ['10 (largest key in the left subtree)', `${succ} (smallest key in the right subtree)`, '40 (the parent)', '60 (the root\'s right child)'],
    answer: 1,
    explanation: `The in-order successor is the smallest key of the right subtree. 20's right subtree is just ${succ}, so ${succ} is copied into the node and the original ${succ} is removed.`,
  };
}

function cascadeQuestion(): McqQuestion {
  const keys = [8, 5, 11, 3, 7, 10, 12, 2, 4, 6, 9, 1];
  const t = AvlTree.fromKeys(keys);
  const before = t.snapshot();
  const r = t.delete(12);
  const n = r.rotations.length;
  return {
    id: 'adv-cascade',
    type: 'mcq',
    level: 'advanced',
    topic: 'Deletion',
    prompt: 'This is the smallest possible AVL tree of height 5. You delete the leaf 12. How many rotations does the AVL algorithm perform in total?',
    figures: [{ label: 'Before deleting 12', root: before }],
    options: ['0', '1', String(n), '4'].filter((v, i, a) => a.indexOf(v) === i),
    answer: ['0', '1', String(n), '4'].filter((v, i, a) => a.indexOf(v) === i).indexOf(String(n)),
    explanation: `Removing 12 makes 11 left-heavy → a right rotation about 11 fixes it, but that subtree is now one level shorter than before, so 8 becomes unbalanced too and needs another rotation. Deletion can need a rotation at EVERY level on the way up (here ${n}); insertion needs at most one fix.`,
  };
}

function minNodesQuestion(): McqQuestion {
  const m = minNodesForHeight(4);
  return {
    id: 'adv-minnodes',
    type: 'mcq',
    level: 'advanced',
    topic: 'Complexity',
    prompt: 'What is the minimum number of nodes an AVL tree of height 4 can have? (Hint: N(h) = N(h−1) + N(h−2) + 1.)',
    options: [String(m), String(m + 1), '10', '15'].filter((v, i, a) => a.indexOf(v) === i),
    answer: 0,
    explanation: `N(1) = 1, N(2) = 2, N(3) = 4, N(4) = N(3) + N(2) + 1 = ${m}. The recurrence is Fibonacci-like, which is why height grows only logarithmically with the number of nodes.`,
  };
}

function maxHeightQuestion(): McqQuestion {
  const h = maxHeightForNodes(20);
  return {
    id: 'adv-maxheight',
    type: 'mcq',
    level: 'advanced',
    topic: 'Complexity',
    prompt: 'What is the greatest possible height of an AVL tree that contains 20 nodes?',
    options: [String(h), String(h - 1), String(h + 2), '20'].filter((v, i, a) => a.indexOf(v) === i),
    answer: 0,
    explanation: `The smallest AVL trees have 1, 2, 4, 7, 12, 20, 33 nodes for heights 1…7. Height ${h} fits in 20 nodes (it needs at least 20), height ${h + 1} would need at least 33.`,
  };
}

const BUG_ROTATE = `Node *rightRotate(Node *z) {
    Node *y = z->left;
    Node *T2 = y->right;
    y->right = z;
    z->left = T2;
    updateHeight(y);   /* (A) */
    updateHeight(z);   /* (B) */
    return y;
}`;

const BUG_INSERT = `Node *insert(Node *node, int key) {
    if (node == NULL) return createNode(key);
    if (key < node->key)
        insert(node->left, key);
    else if (key > node->key)
        insert(node->right, key);
    return rebalance(node);
}`;

const BUG_BALANCE = `int getBalance(const Node *node) {
    if (node == NULL) return 0;
    return height(node->right) - height(node->left);
}
/* rebalance() still says: if (balance > 1) { ... rightRotate(node) ... } */`;

const BUG_DELETE = `Node *child = node->left ? node->left : node->right;
free(node);
if (child == NULL) {
    return NULL;
}
return node->left ? node->left : node->right;`;

export const QUESTIONS: Question[] = [
  /* ------------------------------ Beginner ------------------------------ */
  {
    id: 'beg-formula',
    type: 'mcq',
    level: 'beginner',
    topic: 'Balance factor',
    prompt: 'Which balance-factor formula is used in this implementation?',
    options: ['Height(right) − Height(left)', 'Height(left) − Height(right)', 'Height(left) + Height(right)', 'Number of descendants'],
    answer: 1,
    explanation: 'BF(node) = height(left subtree) − height(right subtree). A positive value means left-heavy; the rotation conditions in the code assume exactly this order.',
  },
  rotationQuestion('beg-ll', 'beginner', [30, 20, 10]),
  rotationQuestion('beg-rr', 'beginner', [10, 20, 30]),
  {
    id: 'beg-leaf',
    type: 'mcq',
    level: 'beginner',
    topic: 'Height',
    prompt: 'With the convention used in this implementation, what is the height of a leaf node?',
    options: ['0', '1', '2', '−1'],
    answer: 1,
    explanation: 'Empty subtree = 0 and leaf = 1. Other books use leaf = 0, empty = −1; both work if used consistently, but mixing them causes bugs.',
  },
  {
    id: 'beg-allowed',
    type: 'mcq',
    level: 'beginner',
    topic: 'AVL property',
    prompt: 'Which balance factors are allowed at every node of an AVL tree?',
    options: ['Only 0', '−1, 0 and +1', '−2 to +2', 'Any value as long as the root is balanced'],
    answer: 1,
    explanation: 'The AVL condition is |BF| ≤ 1 at EVERY node. A balance factor of ±2 triggers a rotation.',
  },
  {
    id: 'beg-search',
    type: 'mcq',
    level: 'beginner',
    topic: 'Complexity',
    prompt: 'What is the worst-case time complexity of searching in an AVL tree containing n nodes?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    answer: 1,
    explanation: 'The height of an AVL tree is O(log n) and a search follows one root-to-leaf path, so it takes O(log n) comparisons in the worst case.',
  },
  bfQuestion('beg-bf1', 'beginner', [30, 20, 40, 10], 'bst', 30),
  {
    id: 'beg-sorted',
    type: 'mcq',
    level: 'beginner',
    topic: 'BST',
    prompt: 'Why can inserting 10, 20, 30, 40, 50 into an ordinary BST be a problem?',
    options: ['The BST property is violated', 'Every key goes to the right, producing a chain of height 5', 'Duplicate keys appear', 'The tree runs out of memory'],
    answer: 1,
    explanation: 'The BST is still valid, but each new key is the largest so far and goes right, so the tree degenerates into a linked list and searches cost O(n).',
  },
  {
    id: 'beg-inorder',
    type: 'mcq',
    level: 'beginner',
    topic: 'Traversals',
    prompt: 'What does an in-order traversal of a valid BST (or AVL tree) produce?',
    options: ['Keys in descending order', 'Keys in ascending (sorted) order', 'Keys level by level', 'Keys in insertion order'],
    answer: 1,
    explanation: 'In-order visits left subtree, node, right subtree. By the BST property that is exactly sorted order.',
  },
  {
    id: 'beg-preserved',
    type: 'mcq',
    level: 'beginner',
    topic: 'Rotations',
    prompt: 'Which property is always preserved by a rotation?',
    options: ['The height of the tree', 'The root of the tree', 'The in-order sequence of the keys (BST ordering)', 'The number of leaves'],
    answer: 2,
    explanation: 'Rotations only reshape the tree. The left-to-right (in-order) order of the keys never changes, so the BST property still holds.',
  },

  /* ---------------------------- Intermediate ---------------------------- */
  {
    id: 'int-neg2',
    type: 'mcq',
    level: 'intermediate',
    topic: 'Rotations',
    prompt: 'A node has a balance factor of −2 and its right child has a balance factor of −1. Which rotation should be performed?',
    options: ['Right rotation on the node', 'Left rotation on the node', 'Left rotation on the right child, then right rotation on the node', 'Right rotation on the right child, then left rotation on the node'],
    answer: 1,
    explanation: 'BF(z) < −1 and BF(right child) ≤ 0 is the RR case: the extra height is on the outside right, so ONE left rotation on z fixes it.',
  },
  {
    id: 'int-heights',
    type: 'mcq',
    level: 'intermediate',
    topic: 'Rotations',
    prompt: 'Why must node heights be updated after a rotation?',
    options: [
      'Because rotation changes the keys stored in the nodes',
      'Because the nodes that moved now have different subtrees, and heights are stored values that would otherwise be stale',
      'Because heights are only needed for printing',
      'They do not need to be updated after a rotation',
    ],
    answer: 1,
    explanation: 'Heights are stored in the nodes. A rotation gives two nodes new children, so their stored heights (and therefore later balance factors) are wrong until recomputed - the lower node first, then the new subtree root.',
  },
  rotationQuestion('int-lr', 'intermediate', [30, 10, 20]),
  rotationQuestion('int-rl', 'intermediate', [10, 30, 20]),
  predictTreeQuestion(),
  bfQuestion('int-bf2', 'intermediate', [50, 30, 70, 20, 40, 60, 80, 10], 'avl', 20),
  invalidTreeQuestion(),
  successorQuestion(),
  {
    id: 'int-match',
    type: 'match',
    level: 'intermediate',
    topic: 'Pseudocode',
    prompt: 'Match each pseudocode fragment to the operation it belongs to.',
    left: [
      'height(node.left) − height(node.right)',
      'y ← z.left;  T2 ← y.right;  y.right ← z;  z.left ← T2',
      'current ← node;  while current.left is not empty: current ← current.left',
      'queue.enqueue(node.left);  queue.enqueue(node.right)',
    ],
    right: ['Balance factor', 'Right rotation', 'Find the minimum (successor helper)', 'Level-order traversal'],
    answer: [0, 1, 2, 3],
    explanation: 'The subtraction is the balance factor; moving y up with T2 handed to z is a right rotation; walking left until no left child finds the minimum; enqueuing children is breadth-first traversal.',
  },
  {
    id: 'int-onefix',
    type: 'mcq',
    level: 'intermediate',
    topic: 'Insertion',
    prompt: 'After a single insertion into an AVL tree, how many rebalancing fixes (a single or a double rotation) are needed at most?',
    options: ['Exactly one at the root', 'At most one (single or double rotation)', 'Up to log n rotations', 'None - insertion never unbalances a tree'],
    answer: 1,
    explanation: 'An insertion increases the height of one subtree by one. The first unbalanced ancestor is fixed with one single/double rotation, which restores that subtree to its old height, so no ancestor above is affected.',
  },
  {
    id: 'int-delete-levels',
    type: 'mcq',
    level: 'intermediate',
    topic: 'Deletion',
    prompt: 'Which statement about rebalancing after a DELETION is correct?',
    options: ['It never needs a rotation', 'It may need a rotation at several ancestors on the way up', 'It stops at the first ancestor, exactly like insertion', 'It only looks at the root'],
    answer: 1,
    explanation: 'A deletion can shorten a subtree; after rotating, that subtree can end up shorter than before, which may unbalance the next ancestor too. So the walk to the root must continue.',
  },

  /* ------------------------------ Advanced ------------------------------ */
  {
    id: 'adv-bf0',
    type: 'mcq',
    level: 'advanced',
    topic: 'Deletion',
    prompt: 'After a deletion, BF(z) = +2 and the left child has BF = 0. Which fix is correct?',
    options: ['A single right rotation (LL treatment)', 'A left rotation on the child, then a right rotation (LR)', 'No rotation is needed', 'A single left rotation'],
    answer: 0,
    explanation: 'The condition is "BF(left child) ≥ 0 → single right rotation". With BF = 0 (possible only after deletion) a double rotation can leave the tree unbalanced; the Rotations Lab shows a computed counter-example.',
  },
  cascadeQuestion(),
  {
    id: 'adv-bug-order',
    type: 'mcq',
    level: 'advanced',
    topic: 'Bugs',
    prompt: 'This rightRotate has a bug. What is it?',
    code: BUG_ROTATE,
    options: ['Heights are updated in the wrong order: (B) must come before (A)', 'T2 is attached to the wrong pointer', 'It should return z, not y', 'Nothing is wrong'],
    answer: 0,
    explanation: 'After the rotation z is a child of y, so y\'s height depends on z\'s NEW height. z must be updated first, otherwise y is computed from a stale height of z.',
  },
  {
    id: 'adv-bug-insert',
    type: 'mcq',
    level: 'advanced',
    topic: 'Bugs',
    prompt: 'This insertion function never adds any node to the tree (for a non-empty tree). Why?',
    code: BUG_INSERT,
    options: ['The result of the recursive calls is thrown away - it must be assigned: node->left = insert(node->left, key)', 'createNode is never called', 'rebalance is called too early', 'The comparison should be key <= node->key'],
    answer: 0,
    explanation: 'The recursive call returns the new subtree root, but the code ignores it, so the parent never links to the new node (and rotations deeper down are never attached either).',
  },
  {
    id: 'adv-bug-balance',
    type: 'mcq',
    level: 'advanced',
    topic: 'Bugs',
    prompt: 'getBalance below was changed to right − left, but rebalance() was not changed. What goes wrong?',
    code: BUG_BALANCE,
    options: ['Nothing: the sign convention does not matter', 'Left-heavy trees are treated as right-heavy and vice versa, so wrong rotations are applied', 'The code does not compile', 'Heights stop being updated'],
    answer: 1,
    explanation: 'All the conditions in rebalance() (> 1 → right rotation, < −1 → left rotation) assume BF = left − right. Flipping the sign makes the code rotate in the wrong direction and can make the tree worse.',
  },
  {
    id: 'adv-bug-free',
    type: 'mcq',
    level: 'advanced',
    topic: 'Bugs',
    prompt: 'What is wrong with this part of a deletion function?',
    code: BUG_DELETE,
    options: ['It reads node->left / node->right after free(node) (use after free)', 'It should free the child instead', 'It returns NULL for non-leaf nodes', 'It leaks memory'],
    answer: 0,
    explanation: 'After free(node) the memory is invalid; the last line reads node->left again. The child pointer was already saved in `child` - return that instead.',
  },
  minNodesQuestion(),
  maxHeightQuestion(),
  {
    id: 'adv-stack',
    type: 'mcq',
    level: 'advanced',
    topic: 'Complexity',
    prompt: 'What is the space complexity of the recursive AVL insertion (not counting the tree itself)?',
    options: ['O(1)', 'O(log n), the recursion depth equals the tree height', 'O(n)', 'O(n log n)'],
    answer: 1,
    explanation: 'One stack frame per level of the path from the root; the height is O(log n) in an AVL tree. (In a skewed plain BST the same recursion could need O(n).)',
  },
];

export function questionsForLevel(level: Level | 'all'): Question[] {
  return level === 'all' ? QUESTIONS : QUESTIONS.filter((q) => q.level === level);
}

/** Whether the learner's answer is right. `answer` is an index (mcq), a number (numeric) or an index list (match). */
export function isCorrect(q: Question, answer: number | number[] | undefined): boolean {
  if (answer === undefined) return false;
  if (q.type === 'match') return Array.isArray(answer) && answer.length === q.answer.length && answer.every((a, i) => a === q.answer[i]);
  return answer === q.answer;
}
