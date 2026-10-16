export interface FunctionDoc {
  title: string;
  summary: string;
  steps: string[];
  why?: string;
  mistakes?: string[];
  cppNote?: string;
}

/** Beginner-friendly explanations, keyed by FnEntry.id (shared by the C and C++ listings). */
export const FUNCTION_DOCS: Record<string, FunctionDoc> = {
  node: {
    title: 'The Node structure',
    summary: 'A node is a small record that stores one key plus links to its left child, right child and its own height.',
    steps: [
      '`key` is the number stored in the node.',
      '`left` and `right` are pointers. A pointer holds the memory address of another node, or NULL/nullptr when there is no child.',
      '`height` is stored inside the node so we never have to recount the whole subtree to learn its height. Empty = 0, leaf = 1.',
    ],
    cppNote: 'In C++ the constructor `Node(int k)` sets key, children and height in one place. `explicit` stops accidental implicit conversions from int.',
  },
  height: {
    title: 'height()',
    summary: 'Returns the stored height of a node, or 0 for an empty subtree.',
    steps: ['If the pointer is NULL there is no node, so the height is 0.', 'Otherwise return the `height` field that the node carries.'],
    why: 'Because empty = 0 and leaf = 1, `1 + max(left, right)` works for every node without special cases.',
    mistakes: ['Reading `node->height` when node is NULL crashes the program - always check first.'],
  },
  max: {
    title: 'max()',
    summary: 'Returns the larger of two integers.',
    steps: ['Used to compute a node\'s height as `1 + max(height(left), height(right))`.'],
    cppNote: 'C++ already has std::max in <algorithm>, so the C++ listing does not define its own.',
  },
  getBalance: {
    title: 'getBalance()',
    summary: 'Computes the balance factor: height(left subtree) − height(right subtree).',
    steps: ['An empty subtree is perfectly balanced, so return 0.', 'Otherwise subtract the right height from the left height.', 'Result > 0 means left-heavy, < 0 means right-heavy.'],
    mistakes: ['Swapping the order. All rotation conditions in this file assume LEFT − RIGHT.'],
  },
  updateHeight: {
    title: 'updateHeight()',
    summary: 'Recomputes one node\'s stored height from its children.',
    steps: ['Take the taller child\'s height and add 1 for the node itself.'],
    why: 'Call it whenever a child pointer changed - after an insertion below, a deletion below, or a rotation.',
  },
  createNode: {
    title: 'createNode()',
    summary: 'Allocates a new leaf on the heap.',
    steps: [
      '`malloc` reserves memory for one Node; if it returns NULL we report the error and stop.',
      'Store the key, set both children to NULL and the height to 1 (a leaf).',
      'Return the address so the caller can link it into the tree.',
    ],
    cppNote: 'C++ uses `new Node(key)`, which allocates memory and runs the constructor in one step. Every `new` must be matched by a `delete`.',
  },
  rightRotate: {
    title: 'rightRotate(z)',
    summary: 'Rotates the subtree rooted at z to the right. z\'s left child y becomes the new root of the subtree.',
    steps: [
      '**Which node is rotated?** `z`, the unbalanced node (its left side is too tall). The rotation is performed ON z.',
      '**Why does the left child move up?** y is on the heavy side. Lifting y makes the left side one level shorter and the right side one level taller, which evens things out.',
      '**What happens to the middle subtree?** y\'s right subtree (T2) holds keys between y and z. It is detached from y and becomes z\'s left subtree: `z->left = T2`.',
      '**Why is the BST property still valid?** Before: y < T2 < z. After: T2 is still greater than y (it is in y\'s right) and still smaller than z (it is z\'s left). In-order order never changes - rotations only reshape the tree.',
      '**Why update heights?** z moved down and y moved up, so their subtrees changed. Heights are stored, so they must be recalculated - z FIRST (it is now the lower node, y\'s height depends on it), then y.',
      '**Why return y?** The caller\'s pointer still points at z. Returning y lets the caller write `parent->child = rightRotate(z)` so the whole tree sees the new root.',
    ],
    mistakes: ['Updating y before z.', 'Overwriting `y->right` before saving T2 in a variable.', 'Ignoring the return value.'],
  },
  leftRotate: {
    title: 'leftRotate(z)',
    summary: 'The mirror image of rightRotate: z\'s right child y becomes the new subtree root.',
    steps: [
      'z is the unbalanced node (right side too tall); y = z->right moves up.',
      'y\'s left subtree T2 (keys between z and y) becomes z\'s right subtree.',
      'z becomes y\'s left child. Update z\'s height, then y\'s, and return y.',
      'The BST order stays correct: z < T2 < y before and after.',
    ],
  },
  rebalance: {
    title: 'rebalance()',
    summary: 'Updates a node\'s height, measures its balance factor and applies the right rotation if it is outside [−1, 1].',
    steps: [
      'Recompute the height of this node (children may have changed).',
      '`balance > 1` → left-heavy. If the left child\'s balance is `< 0` the extra height is on its right (LR): rotate that child left first. Then rotate the node right.',
      '`balance < -1` → right-heavy. If the right child\'s balance is `> 0` (RL): rotate that child right first. Then rotate the node left.',
      'Otherwise the node is fine - return it unchanged.',
    ],
    why: 'We test the CHILD\'s balance (not the inserted key) so the very same function works for deletion. A child balance of exactly 0 can only occur after a deletion and needs a single rotation, which is why the double-rotation tests use strict `< 0` and `> 0`.',
    mistakes: ['Using `<= 0` / `>= 0` in the wrong places turns valid single rotations into double ones.', 'Forgetting to store the result: `node->left = leftRotate(node->left)`.'],
  },
  insert: {
    title: 'insert()',
    summary: 'Recursively inserts a key like an ordinary BST insert, then rebalances every ancestor while returning.',
    steps: [
      '**Base case:** an empty spot means we found where the key belongs - create the node and return it.',
      '**Recursive case:** smaller keys go left, larger keys go right. The result of the recursive call is stored back in the child pointer because rotations below may have changed which node is the child.',
      '**Duplicates** are rejected: nothing changes and the caller is told via the flag.',
      '**On the way back up** every ancestor calls `rebalance()`. Each call returns the (possibly new) root of its subtree, so a rotation deep in the tree is automatically linked to its parent.',
    ],
    why: 'The recursion stack remembers the path from the root to the new node. Returning up that path is exactly the "check every ancestor" step of the algorithm.',
    cppNote: 'The public `insert(int)` is the friendly interface; it calls the recursive private function. Passing `bool &inserted` is a reference - the callee writes directly into the caller\'s variable.',
  },
  insertPublic: {
    title: 'insert(int key) - public',
    summary: 'The simple entry point users call. It hides the recursion and the root pointer.',
    steps: ['Starts the recursive insert at the root and stores the (possibly new) root.', 'Returns true if a node was added, false for a duplicate.'],
  },
  minValueNode: {
    title: 'minValueNode()',
    summary: 'Finds the smallest key in a subtree by walking left until there is no left child.',
    steps: ['Keep following `left` pointers.', 'In deletion, applied to the RIGHT subtree it finds the in-order successor (next larger key).'],
  },
  delete: {
    title: 'deleteNode() / remove()',
    summary: 'Recursively finds a key, removes it using one of three cases, then rebalances every ancestor.',
    steps: [
      '**Not found:** an empty spot means the key is absent; report it and change nothing.',
      '**Search:** smaller → left, larger → right, storing the returned subtree back into the pointer.',
      '**Leaf or one child:** save the child pointer first, free the node, return the child (NULL for a leaf). The parent now points past the removed node.',
      '**Two children:** copy the in-order successor\'s key into this node, then delete the successor from the right subtree. The successor has no left child, so that second delete is a leaf/one-child case.',
      '**Rebalance:** every ancestor on the way back up calls `rebalance()`. Unlike insertion, a deletion may need rotations at several levels.',
    ],
    mistakes: ['Reading `node->left` after `free(node)` (use-after-free).', 'Forgetting to delete the successor afterwards, leaving a duplicate key.'],
    cppNote: 'The method is called `remove` in C++ (`delete` is a reserved word). `delete node;` releases memory allocated by `new`.',
  },
  removePublic: {
    title: 'remove(int key) - public',
    summary: 'Entry point for deletion. Returns true if the key existed.',
    steps: ['Calls the recursive remove from the root and stores the new root (the root itself may be deleted or replaced).'],
  },
  search: {
    title: 'search()',
    summary: 'Walks down from the root using the BST rule until it finds the key or falls off the tree.',
    steps: ['Equal → found.', 'Smaller → go left. Larger → go right.', 'Reaching NULL means the key is not stored.'],
    why: 'Each comparison discards one whole subtree. Because the AVL height is O(log n), at most O(log n) comparisons are needed.',
  },
  inorder: {
    title: 'inorder()',
    summary: 'Left subtree, then the node, then the right subtree - prints keys in ascending order.',
    steps: ['The base case NULL returns immediately.', 'Recursion on `left`, print, recursion on `right`.'],
  },
  preorder: {
    title: 'preorder()',
    summary: 'Node first, then left subtree, then right subtree.',
    steps: ['Print before recursing - the root is printed first.'],
  },
  postorder: {
    title: 'postorder()',
    summary: 'Left subtree, right subtree, then the node.',
    steps: ['Children are fully processed before their parent - the same order `freeTree()` needs.'],
  },
  queue: {
    title: 'Queue helper (C only)',
    summary: 'C has no built-in queue, so a tiny array-based queue stores pointers to nodes for level-order traversal.',
    steps: ['`front` and `rear` are indexes; enqueue writes at `rear`, dequeue reads at `front`.', 'Capacity equals the number of nodes because each node is enqueued exactly once.'],
  },
  levelOrder: {
    title: 'levelOrder()',
    summary: 'Breadth-first traversal: visit the tree level by level using a queue.',
    steps: ['Enqueue the root.', 'Repeat: dequeue a node, print it, enqueue its left then right child.', 'Stop when the queue is empty.'],
    cppNote: 'C++ uses `std::queue<const Node *>` from <queue>: push(), front(), pop() and empty() replace the hand-written queue.',
  },
  freeTree: {
    title: 'Cleaning up memory',
    summary: 'Releases every node so the program does not leak memory.',
    steps: ['Post-order: free the left subtree, the right subtree, and only then the node itself.', 'Freeing the parent first would lose the pointers to its children.'],
    cppNote: 'The destructor `~AVLTree()` calls `destroy(root_)` automatically when the tree object goes out of scope - this is RAII. Copying is disabled (`= delete`) so two trees can never free the same nodes.',
  },
  main: {
    title: 'main() - the menu',
    summary: 'A loop that shows a menu, reads the user\'s choice and calls the matching function.',
    steps: [
      'Input is validated: a non-number is discarded instead of crashing the program.',
      'The root pointer is updated from every insert/delete because the root can change after a rotation.',
      'Option 0 frees all memory and exits. End-of-input (EOF) also exits cleanly.',
    ],
  },
};
