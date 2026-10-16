/**
 * Language-independent pseudocode reference.
 * A pseudocode line can carry a tag (written `@@tag` at the end of the line). The engine attaches the same
 * tags to recorded steps, so the visualizer highlights the line that the current step corresponds to.
 */

export interface PseudoLine {
  tag?: string;
  text: string;
}

export interface AlgorithmDoc {
  id: string;
  title: string;
  purpose: string;
  preconditions: string[];
  inputs: string[];
  outputs: string[];
  steps: string[];
  pseudocode: PseudoLine[];
  time: string;
  space: string;
  mistakes: string[];
}

/** Parse a block of text; `@@name` at the end of a line becomes `${id}.name`. */
function code(id: string, block: string): PseudoLine[] {
  return block
    .replace(/^\n/, '')
    .replace(/\s+$/, '')
    .split('\n')
    .map((raw) => {
      const m = /\s*@@([A-Za-z]+)\s*$/.exec(raw);
      return m ? { tag: `${id}.${m[1]}`, text: raw.slice(0, m.index) } : { text: raw };
    });
}

export const GLOSSARY_OF_NAMES: { name: string; meaning: string }[] = [
  { name: 'node', meaning: 'One box in the tree. It stores a key and links to a left and a right child. "empty" means there is no node there.' },
  { name: 'key', meaning: 'The number stored in a node (the value we insert, search or delete).' },
  { name: 'left / right', meaning: 'Links from a node to its left child and right child. Smaller keys live on the left, larger keys on the right.' },
  { name: 'height', meaning: 'Number of nodes on the longest downward path from a node to a leaf. Empty = 0, leaf = 1.' },
  { name: 'balanceFactor', meaning: 'height(left subtree) − height(right subtree). Allowed values in an AVL tree: −1, 0, +1.' },
  { name: 'successor', meaning: 'The in-order successor: the next larger key, i.e. the smallest key in the right subtree.' },
  { name: '←', meaning: 'Assignment ("store the value on the right into the thing on the left").' },
];

export const ALGORITHMS: AlgorithmDoc[] = [
  {
    id: 'createNode',
    title: 'Create a node',
    purpose: 'Make a brand-new leaf holding one key.',
    preconditions: ['Memory/space for one node is available.'],
    inputs: ['key - the value to store'],
    outputs: ['A new node with no children and height 1'],
    steps: [
      'Allocate a new node.',
      'Store the key in it.',
      'Set both child links to empty because a new node has no children yet.',
      'Set its height to 1 - a lone node is a leaf, and a leaf has height 1 in our convention.',
    ],
    pseudocode: code('createNode', `
function createNode(key):                @@start
    node ← new Node
    node.key ← key
    node.left ← empty
    node.right ← empty
    node.height ← 1                      // a leaf
    return node
`),
    time: 'O(1)',
    space: 'O(1)',
    mistakes: ['Starting the height at 0 and then mixing conventions elsewhere.', 'Forgetting to set child links to empty (in C, malloc does not clear memory).'],
  },
  {
    id: 'height',
    title: 'Node height',
    purpose: 'Report the height of a subtree safely, even when the subtree is empty.',
    preconditions: ['Heights stored in the nodes are up to date.'],
    inputs: ['node - the root of a subtree (possibly empty)'],
    outputs: ['0 for an empty subtree, otherwise the stored height'],
    steps: [
      'If there is no node, return 0.',
      'Otherwise return the height stored in the node (we store it so we do not recount the whole subtree).',
      'To recompute a node\'s own height: 1 + the larger of its two children\'s heights.',
    ],
    pseudocode: code('height', `
function height(node):                   @@start
    if node is empty:
        return 0
    return node.height

function updateHeight(node):
    node.height ← 1 + max(height(node.left), height(node.right))
`),
    time: 'O(1) (the stored height is read, nothing is counted)',
    space: 'O(1)',
    mistakes: ['Dereferencing an empty child without checking.', 'Forgetting to call updateHeight after changing a child.'],
  },
  {
    id: 'balanceFactor',
    title: 'Balance factor',
    purpose: 'Measure how lopsided a node is.',
    preconditions: ['Children have correct heights.'],
    inputs: ['node'],
    outputs: ['An integer: height(left) − height(right)'],
    steps: [
      'If the node is empty, return 0.',
      'Subtract the right subtree\'s height from the left subtree\'s height.',
      'Positive = left-heavy, negative = right-heavy, 0 = even. AVL requires −1, 0 or +1.',
    ],
    pseudocode: code('balanceFactor', `
function balanceFactor(node):            @@start
    if node is empty:
        return 0
    return height(node.left) − height(node.right)
`),
    time: 'O(1)',
    space: 'O(1)',
    mistakes: ['Subtracting in the wrong order (right − left) while the rotation conditions assume left − right.'],
  },
  {
    id: 'rightRotate',
    title: 'Right rotation',
    purpose: 'Lift the left child above its parent to reduce the height of a left-heavy side.',
    preconditions: ['node has a left child.'],
    inputs: ['z - the unbalanced node the rotation is performed on'],
    outputs: ['The new root of the rotated subtree (the old left child)'],
    steps: [
      'Name the left child y and y\'s right subtree T2.',
      'Make z the right child of y (z moves down).',
      'Give T2 to z as its new left subtree - it was between y and z in sorted order, so it still fits.',
      'Recalculate z\'s height first (it is now lower), then y\'s.',
      'Return y; the caller stores it where z used to be.',
    ],
    pseudocode: code('rightRotate', `
function rightRotate(z):                 @@start
    y ← z.left
    T2 ← y.right
    y.right ← z                          // z moves down
    z.left ← T2                          // middle subtree changes parent
    updateHeight(z)                      // z first - it is lower now
    updateHeight(y)
    return y                             // new subtree root
`),
    time: 'O(1)',
    space: 'O(1)',
    mistakes: ['Updating y\'s height before z\'s.', 'Not returning the new root, so the parent still points at z.', 'Losing T2 by overwriting a pointer before saving it.'],
  },
  {
    id: 'leftRotate',
    title: 'Left rotation',
    purpose: 'Lift the right child above its parent to reduce the height of a right-heavy side.',
    preconditions: ['node has a right child.'],
    inputs: ['z - the unbalanced node the rotation is performed on'],
    outputs: ['The new root of the rotated subtree (the old right child)'],
    steps: [
      'Name the right child y and y\'s left subtree T2.',
      'Make z the left child of y (z moves down).',
      'Give T2 to z as its new right subtree.',
      'Recalculate z\'s height, then y\'s.',
      'Return y.',
    ],
    pseudocode: code('leftRotate', `
function leftRotate(z):                  @@start
    y ← z.right
    T2 ← y.left
    y.left ← z                           // z moves down
    z.right ← T2                         // middle subtree changes parent
    updateHeight(z)
    updateHeight(y)
    return y
`),
    time: 'O(1)',
    space: 'O(1)',
    mistakes: ['Mirroring only half the pointer changes.', 'Forgetting that the rotation result must be re-attached to the parent.'],
  },
  {
    id: 'rebalance',
    title: 'Rebalancing a node',
    purpose: 'Restore the AVL property at one node after an insertion or deletion below it.',
    preconditions: ['Both subtrees of node are already valid AVL trees.', 'node\'s balance factor is at most ±2.'],
    inputs: ['node'],
    outputs: ['The root of the balanced subtree (node itself, or the node that replaced it after rotating)'],
    steps: [
      'Recompute the node\'s height from its children.',
      'Compute the balance factor.',
      'If BF > 1 the node is left-heavy. Look at the left child: if its BF is ≥ 0 do one right rotation (LL); if it is < 0 rotate the left child left first, then rotate the node right (LR).',
      'If BF < −1 the node is right-heavy. If the right child\'s BF is ≤ 0 do one left rotation (RR); if it is > 0 rotate the right child right first, then rotate the node left (RL).',
      'Otherwise the node is balanced - return it unchanged.',
    ],
    pseudocode: code('rebalance', `
function rebalance(node):
    updateHeight(node)
    balanceFactor ← getBalance(node)         @@bf
    if balanceFactor > 1:                    @@leftHeavy
        if getBalance(node.left) < 0:        // Left-Right case
            node.left ← leftRotate(node.left)    @@lrFirst
        return rightRotate(node)             @@right
    if balanceFactor < −1:                   @@rightHeavy
        if getBalance(node.right) > 0:       // Right-Left case
            node.right ← rightRotate(node.right) @@rlFirst
        return leftRotate(node)              @@left
    return node                              @@done
`),
    time: 'O(1) - at most two rotations',
    space: 'O(1)',
    mistakes: [
      'Using `> 0` instead of `>= 0` for the left child: after a deletion the child can have BF = 0, which needs a single rotation.',
      'Checking the inserted key instead of the child\'s balance factor (works for insertion only, breaks for deletion).',
      'Forgetting to attach the returned root to the parent.',
    ],
  },
  {
    id: 'insert',
    title: 'Insert a value',
    purpose: 'Add a key and keep the tree a valid AVL tree.',
    preconditions: ['The tree is a valid AVL tree (possibly empty).'],
    inputs: ['node - root of the (sub)tree', 'key - the value to insert'],
    outputs: ['The root of the updated subtree'],
    steps: [
      'If the current spot is empty, create the new node here (this is the base case of the recursion).',
      'Otherwise compare key with node.key: smaller → insert into the left subtree, larger → into the right subtree. Equal → duplicate, reject.',
      'The recursive call returns the (possibly new) root of that subtree; store it back in node.left / node.right.',
      'While the recursion unwinds, call rebalance on every ancestor: update its height, check its balance factor and rotate if needed.',
      'Return the subtree root to the caller.',
    ],
    pseudocode: code('insert', `
function insert(node, key):                  @@start
    if node is empty:
        return createNode(key)               @@create
    if key < node.key:
        node.left ← insert(node.left, key)   @@goLeft
    else if key > node.key:
        node.right ← insert(node.right, key) @@goRight
    else:
        return node                          // duplicate: reject   @@duplicate
    return rebalance(node)                   // fix heights and balance   @@return
`),
    time: 'O(log n) worst case - one root-to-leaf walk down and the same path back up; at most one rotation (single or double) is needed',
    space: 'O(log n) for the recursion stack (the tree height)',
    mistakes: [
      'Not updating heights on the way back up.',
      'Only checking balance at the root instead of at every ancestor.',
      'Forgetting to assign the result of the recursive call (node.left ← insert(...)).',
    ],
  },
  {
    id: 'delete',
    title: 'Delete a value',
    purpose: 'Remove a key and keep the tree a valid AVL tree.',
    preconditions: ['The tree is a valid AVL tree.'],
    inputs: ['node - root of the (sub)tree', 'key - the value to delete'],
    outputs: ['The root of the updated subtree (empty if the subtree vanished)'],
    steps: [
      'If the spot is empty the key does not exist - nothing to do.',
      'Walk left or right exactly as in search until the key is found.',
      'Leaf or one child: replace the node by its child (or by empty).',
      'Two children: find the in-order successor (smallest key in the right subtree), copy its key into this node, then delete the successor from the right subtree. The successor has no left child, so that deletion is easy.',
      'On the way back up, rebalance every ancestor. Unlike insertion, a deletion can trigger rotations at SEVERAL levels because shortening a subtree can make the parent\'s parent unbalanced too.',
    ],
    pseudocode: code('delete', `
function delete(node, key):                  @@start
    if node is empty:
        return empty                         // key not found   @@empty
    if key < node.key:
        node.left ← delete(node.left, key)   @@goLeft
    else if key > node.key:
        node.right ← delete(node.right, key) @@goRight
    else:                                    // this is the node to remove   @@match
        if node.left is empty or node.right is empty:
            return node's only child (or empty if leaf)   @@oneChild
        successor ← smallest node in node.right   @@twoChildren
        node.key ← successor.key             // copy it up   @@copySuccessor
        node.right ← delete(node.right, successor.key)
    return rebalance(node)                   @@return
`),
    time: 'O(log n) worst case - the search path, the successor walk and the path back up are each at most the tree height; up to O(log n) rotations',
    space: 'O(log n) recursion stack',
    mistakes: [
      'Stopping rebalancing after the first rotation (insertion may stop; deletion must continue).',
      'Using a strict comparison for the child\'s balance factor (see rebalance).',
      'Freeing a node and then reading its pointers (in C/C++ save the child first).',
      'Forgetting that the successor still has to be removed from the right subtree.',
    ],
  },
  {
    id: 'search',
    title: 'Search for a value',
    purpose: 'Decide whether a key is in the tree, using the BST ordering to skip half of the remaining tree at each step.',
    preconditions: ['The tree satisfies the BST property.'],
    inputs: ['root', 'key'],
    outputs: ['The node holding the key, or empty if absent'],
    steps: [
      'Start at the root.',
      'If the key equals the current node\'s key, you found it.',
      'If it is smaller, continue in the left subtree; if larger, continue in the right subtree.',
      'If you reach an empty spot, the key is not in the tree.',
    ],
    pseudocode: code('search', `
function search(root, key):                  @@start
    node ← root
    while node is not empty:
        if key = node.key:
            return node                      @@found
        else if key < node.key:
            node ← node.left                 @@goLeft
        else:
            node ← node.right                @@goRight
    return empty                             @@notFound
`),
    time: 'O(log n) worst case in an AVL tree (O(n) in an unbalanced BST)',
    space: 'O(1) as written (iterative); a recursive version uses O(log n) stack',
    mistakes: ['Comparing with the wrong child (a mirrored comparison).', 'Not handling the empty tree.'],
  },
  {
    id: 'inorder',
    title: 'In-order traversal',
    purpose: 'Visit every node in sorted order (for a BST).',
    preconditions: ['None.'],
    inputs: ['node - root of the (sub)tree'],
    outputs: ['Keys printed/collected in ascending order'],
    steps: ['Recursively traverse the left subtree.', 'Visit the node.', 'Recursively traverse the right subtree.'],
    pseudocode: code('inorder', `
function inorder(node):                      @@start
    if node is empty:
        return
    inorder(node.left)
    visit(node)                              @@visit
    inorder(node.right)
`),
    time: 'O(n) - every node is visited once',
    space: 'O(h) recursion stack, h = height = O(log n) for an AVL tree',
    mistakes: ['Visiting the node before the left subtree (that is pre-order).'],
  },
  {
    id: 'preorder',
    title: 'Pre-order traversal',
    purpose: 'Visit a parent before its children - handy for copying or serializing a tree.',
    preconditions: ['None.'],
    inputs: ['node'],
    outputs: ['Keys in root-first order'],
    steps: ['Visit the node.', 'Traverse the left subtree.', 'Traverse the right subtree.'],
    pseudocode: code('preorder', `
function preorder(node):                     @@start
    if node is empty:
        return
    visit(node)                              @@visit
    preorder(node.left)
    preorder(node.right)
`),
    time: 'O(n)',
    space: 'O(h)',
    mistakes: ['Swapping the left/right order.'],
  },
  {
    id: 'postorder',
    title: 'Post-order traversal',
    purpose: 'Visit children before their parent - required when freeing a tree.',
    preconditions: ['None.'],
    inputs: ['node'],
    outputs: ['Keys in children-first order'],
    steps: ['Traverse the left subtree.', 'Traverse the right subtree.', 'Visit the node.'],
    pseudocode: code('postorder', `
function postorder(node):                    @@start
    if node is empty:
        return
    postorder(node.left)
    postorder(node.right)
    visit(node)                              @@visit
`),
    time: 'O(n)',
    space: 'O(h)',
    mistakes: ['Freeing a node before its children have been processed.'],
  },
  {
    id: 'levelorder',
    title: 'Level-order traversal',
    purpose: 'Visit the tree one level at a time (breadth-first).',
    preconditions: ['A queue data structure is available.'],
    inputs: ['root'],
    outputs: ['Keys level by level, left to right'],
    steps: [
      'Put the root in a queue.',
      'While the queue is not empty: remove the front node and visit it.',
      'Add its left child, then its right child, to the back of the queue (if they exist).',
    ],
    pseudocode: code('levelorder', `
function levelOrder(root):                   @@start
    if root is empty:
        return
    queue ← new Queue containing root
    while queue is not empty:
        node ← queue.dequeue()               @@dequeue
        visit(node)
        if node.left is not empty:
            queue.enqueue(node.left)
        if node.right is not empty:
            queue.enqueue(node.right)
`),
    time: 'O(n)',
    space: 'O(w) for the queue, w = the widest level (at most n)',
    mistakes: ['Using a stack instead of a queue (that gives a depth-first order).', 'Enqueuing empty children.'],
  },
];

/** All pseudocode tags, e.g. `insert.goLeft`. */
export const ALL_TAGS: Set<string> = new Set(ALGORITHMS.flatMap((a) => a.pseudocode.map((l) => l.tag).filter((t): t is string => !!t)));

export const algorithmById = (id: string): AlgorithmDoc | undefined => ALGORITHMS.find((a) => a.id === id);

/** `insert.goLeft` → { algorithm: insert doc, index of the highlighted line } */
export function resolveTag(tag: string | undefined): { algo: AlgorithmDoc; lineIndex: number } | null {
  if (!tag) return null;
  const algo = algorithmById(tag.split('.')[0]);
  if (!algo) return null;
  const lineIndex = algo.pseudocode.findIndex((l) => l.tag === tag);
  return lineIndex >= 0 ? { algo, lineIndex } : null;
}
