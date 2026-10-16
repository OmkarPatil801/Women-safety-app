export interface GlossaryEntry {
  term: string;
  short: string;
  long: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'Node', short: 'One element of a tree that stores a value and links to other nodes.', long: 'A node stores a key (the value) and, in a binary tree, links to at most two children.' },
  { term: 'Edge', short: 'A line connecting a parent node to a child node.', long: 'Edges show which node is the parent of which. A tree with n nodes has n − 1 edges.' },
  { term: 'Root', short: 'The top node of the tree - the only node with no parent.', long: 'Every search, insertion and deletion starts at the root.' },
  { term: 'Parent', short: 'The node directly above another node.', long: 'Every node except the root has exactly one parent.' },
  { term: 'Child', short: 'A node directly below another node.', long: 'In a binary tree each node has a left child and/or a right child.' },
  { term: 'Leaf', short: 'A node with no children.', long: 'Leaves are the bottom of the tree. In this site a leaf has height 1.' },
  { term: 'Subtree', short: 'A node together with all of its descendants.', long: 'Every node is the root of its own subtree. "Left subtree of X" means the subtree rooted at X\'s left child.' },
  { term: 'Depth', short: 'Number of edges from the root down to a node.', long: 'The root has depth 0. Depth grows as you go down.' },
  { term: 'Height', short: 'Number of nodes on the longest path from a node down to a leaf. Empty = 0, leaf = 1.', long: 'Textbooks differ: some count edges (leaf = 0, empty = −1). AVL LAB always counts nodes (leaf = 1, empty = 0). Mixing the two conventions gives wrong balance factors.' },
  { term: 'Balance factor', short: 'height(left subtree) − height(right subtree).', long: 'In an AVL tree every node must have a balance factor of −1, 0 or +1. Positive means left-heavy, negative means right-heavy.' },
  { term: 'BST', short: 'Binary Search Tree: smaller keys on the left, larger keys on the right.', long: 'The ordering lets us discard half of the remaining tree at each comparison - if the tree is reasonably balanced.' },
  { term: 'AVL tree', short: 'A self-balancing BST where every node has balance factor −1, 0 or +1.', long: 'Named after its inventors Adelson-Velsky and Landis (1962). It rotates nodes after insertions and deletions to stay balanced.' },
  { term: 'Rotation', short: 'A local rearrangement of a few nodes that lowers one side and raises the other while keeping BST order.', long: 'A rotation only changes a handful of pointers, so it takes O(1) time.' },
  { term: 'Skewed tree', short: 'A tree where every node has only one child, so it looks like a linked list.', long: 'Inserting already-sorted values into a plain BST produces a skewed tree of height n.' },
  { term: 'In-order successor', short: 'The next larger key: the smallest key in the right subtree.', long: 'Used in deletion of a node with two children.' },
  { term: 'Recursion', short: 'A function calling itself on a smaller part of the problem.', long: 'Tree algorithms are naturally recursive because each subtree is itself a tree. The call stack remembers where to resume.' },
  { term: 'Call stack', short: 'The list of function calls that are currently waiting to finish.', long: 'Insertion into a tree of height h uses at most h nested calls.' },
  { term: 'Traversal', short: 'Visiting every node exactly once in some order.', long: 'In-order, pre-order, post-order (depth-first) and level-order (breadth-first).' },
  { term: 'Invariant', short: 'A property that must be true after every operation.', long: 'For AVL trees: the BST ordering and |balance factor| ≤ 1 at every node.' },
  { term: 'LL / RR / LR / RL', short: 'The four imbalance cases, named by where the extra height is.', long: 'LL and RR need one rotation; LR and RL need two (a double rotation).' },
];

export const glossaryMap = new Map(GLOSSARY.map((g) => [g.term.toLowerCase(), g]));
