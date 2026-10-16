import type { ComponentType, ReactNode } from 'react';
import { AvlTree, buildBst } from '../../features/avl';
import { Callout, type QuickQuestion } from '../common/ui';
import { Term } from '../common/Term';
import { TreeFigure } from '../tree/TreeFigure';
import { StepPlayer } from '../visualizer/StepPlayer';
import { AvlChecker, BfExplorer, BstSearchDemo, SkewVsBalanced } from './interactive';
import { InsertionStepper, PropertyExplorer } from './visuals';

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  Content: ComponentType;
  takeaways: ReactNode[];
  check: QuickQuestion;
}

/** Real recorded steps: inserting 25 into 30(20(10),40) - used to show the call stack. */
const RECURSION_STEPS = AvlTree.fromKeys([30, 20, 40, 10]).insert(25).steps;

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl">{label}</h2>
      <div className="prose-lab">{children}</div>
    </section>
  );
}

/* ---------------------------------------------------------------- Lesson 1 */
function TreeLesson() {
  const root = buildBst([50, 30, 70, 20, 40, 60, 80, 10]);
  return (
    <>
      <Block label="1. What is a tree?">
        <p>
          A <Term>tree</Term>-shaped data structure stores items in boxes called <Term>nodes</Term>, connected by lines called <Term>edges</Term>. Unlike a list, it branches: one node can lead to several others. You already use trees every day - the folders on your computer, a family tree, or the chapters and sections of a book.
        </p>
        <Callout kind="tip">
          <p>Think of a company chart. The CEO is at the top (the <Term>root</Term>). Each manager is a <Term>parent</Term> of the people reporting to them (their <Term>children</Term>). People with nobody reporting to them are <Term>leaves</Term>.</p>
        </Callout>
      </Block>
      <Block label="2. Why do we need trees?">
        <p>
          A list must be searched item by item. A tree that is organised sensibly lets us skip whole branches, so finding, adding and removing items can be much faster. A <b>binary</b> tree (the kind in this course) allows at most <b>two</b> children per node: a left child and a right child.
        </p>
      </Block>
      <Block label="3. How does it work? The vocabulary">
        <table className="table-lab">
          <thead>
            <tr>
              <th>Term</th>
              <th>Meaning</th>
              <th>In the tree below</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><Term>Root</Term></td><td>Top node, no parent</td><td className="font-mono">50</td></tr>
            <tr><td><Term>Parent</Term> / <Term>Child</Term></td><td>Directly above / directly below</td><td>30 is the parent of 20 and 40</td></tr>
            <tr><td><Term>Leaf</Term></td><td>No children</td><td className="font-mono">10, 40, 60, 80</td></tr>
            <tr><td><Term>Subtree</Term></td><td>A node and everything below it</td><td>the subtree of 30 = {'{'}30, 20, 10, 40{'}'}</td></tr>
            <tr><td><Term>Depth</Term></td><td>Edges from the root down to the node</td><td>depth(10) = 3</td></tr>
            <tr><td><Term>Height</Term></td><td>Nodes on the longest path down to a leaf</td><td>height(30) = 3, height(10) = 1</td></tr>
          </tbody>
        </table>
        <Callout kind="warn" title="Terminology differs between books">
          <p>
            Some textbooks measure <Term>height</Term> in <i>edges</i> (a leaf has height 0, an empty tree −1). AVL LAB always counts <i>nodes</i>: <b>empty = 0, leaf = 1</b>. Either works as long as you never mix the two - mixing them produces wrong balance factors.
          </p>
        </Callout>
      </Block>
      <Block label="4. Example and visual explanation">
        <p>Hover over (or tap, or Tab to) any node to see its properties computed from the real tree.</p>
        <PropertyExplorer root={root} caption="A binary tree with 8 nodes." />
      </Block>
      <Block label="5. Common mistake">
        <p>Confusing <b>depth</b> and <b>height</b>. Depth is measured from the root <i>down to the node</i>; height is measured from the node <i>down to its deepest leaf</i>. The root has the smallest depth (0) but the largest height.</p>
      </Block>
    </>
  );
}

/* ---------------------------------------------------------------- Lesson 2 */
function BstLesson() {
  const keys = [30, 20, 40, 10, 25, 35, 50];
  return (
    <>
      <Block label="1. What is a Binary Search Tree?">
        <p>
          A <Term>BST</Term> is a binary tree with one extra rule, the <b>BST property</b>, that holds for <i>every</i> node:
        </p>
        <ul>
          <li>every key in the <b>left subtree</b> is <b>smaller</b> than the node&apos;s key;</li>
          <li>every key in the <b>right subtree</b> is <b>larger</b>.</li>
        </ul>
        <Callout kind="tip">
          <p>It works like a dictionary: open it in the middle - if your word comes earlier, you only look at the front half, otherwise only the back half. Each look discards a large part of the book.</p>
        </Callout>
      </Block>
      <Block label="2. Why do we need it?">
        <p>Because of the ordering rule, a search can ignore a whole subtree after a single comparison. And reading the keys in the order <i>left, node, right</i> (in-order) gives them sorted, for free.</p>
      </Block>
      <Block label="3. How does insertion work?">
        <ol>
          <li>Start at the root.</li>
          <li>If the new key is smaller than the current node, go left; if larger, go right.</li>
          <li>When you reach an empty spot, put the new node there.</li>
        </ol>
        <p>Step through the insertions 30, 20, 40, 10, 25, 35, 50:</p>
        <InsertionStepper keys={keys} mode="bst" caption="Plain BST: no rebalancing is done." />
      </Block>
      <Block label="4. How does searching work?">
        <p>Searching follows exactly the same path an insertion of that key would take. Try it - the explanation tells you why it goes left or right at every node.</p>
        <BstSearchDemo keys={keys} />
      </Block>
      <Block label="5. Recursion and the call stack">
        <p>
          Tree algorithms are usually written with <Term>recursion</Term>: <code>insert(node, key)</code> calls <code>insert(node.left, key)</code> or <code>insert(node.right, key)</code> on a smaller tree. The computer remembers the unfinished calls on the <Term>call stack</Term>. Watch the stack grow while a key is inserted and shrink as each call returns - the &quot;going back up&quot; part is where AVL trees will fix heights and balance later.
        </p>
        <StepPlayer steps={RECURSION_STEPS} resetKey="recursion" canvasHeight={290} />
      </Block>
      <Block label="6. Common mistake">
        <p>Only comparing a new key with its <i>parent</i>. The BST property is about <b>all</b> descendants: a key in the left subtree of 30 must be smaller than 30 even if it hangs deep below 20&apos;s right child.</p>
      </Block>
    </>
  );
}

/* ---------------------------------------------------------------- Lesson 3 */
function WhyAvlLesson() {
  return (
    <>
      <Block label="1. What is the problem?">
        <p>
          How fast a BST is depends on its <b>shape</b>. Insert the sorted values 10, 20, 30, 40, 50: each new value is larger than everything before it, so it always goes to the right. The tree becomes a <Term>skewed tree</Term> - a chain, just like a linked list.
        </p>
        <InsertionStepper keys={[10, 20, 30, 40, 50]} mode="bst" caption="A plain BST degenerates into a chain." />
      </Block>
      <Block label="2. Why does the shape matter?">
        <p>
          A search visits at most one node per level, so the cost is proportional to the tree&apos;s <b>height</b>. A balanced tree with n nodes has height about log₂(n); a skewed tree has height n.
        </p>
        <ul>
          <li>n = 1,000 → balanced: about 10 levels. Skewed: up to 1,000 levels.</li>
          <li>n = 1,000,000 → balanced: about 20 levels. Skewed: up to 1,000,000.</li>
        </ul>
        <Callout kind="info" title="Not every BST is slow">
          <p>A BST built from random insertions is usually reasonably balanced and works well. The problem is that nothing <i>prevents</i> a bad shape - sorted or nearly sorted input produces it. An AVL tree makes the good shape a guarantee instead of a hope.</p>
        </Callout>
      </Block>
      <Block label="3. Compare them yourself">
        <p>Move the slider: the same sorted values are inserted into a plain BST and into an AVL tree.</p>
        <SkewVsBalanced />
      </Block>
      <Block label="4. Common mistake">
        <p>Believing that AVL trees make every operation faster. They guarantee the <i>worst case</i>. Each insertion does a little extra work (updating heights, maybe a rotation), which pays off when the data arrives in an unfavourable order or when you need predictable performance.</p>
      </Block>
    </>
  );
}

/* ---------------------------------------------------------------- Lesson 4 */
function WhatIsAvlLesson() {
  return (
    <>
      <Block label="1. What is an AVL tree?">
        <p>
          An <Term>AVL tree</Term> is a self-balancing <Term>BST</Term>. It has the usual BST ordering <i>plus</i> one balance rule that must hold at <b>every</b> node:
        </p>
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-center font-mono text-lg">−1 ≤ Balance Factor ≤ 1</p>
        <p>
          In words: for every node, the heights of its left and right subtrees may differ by at most one. It is named after its inventors, Adelson-Velsky and Landis (1962).
        </p>
      </Block>
      <Block label="2. Why this rule?">
        <p>If the two sides of <i>every</i> node are nearly equal in height, the whole tree cannot grow tall and thin. It can be proven that an AVL tree with n nodes has height at most about 1.44·log₂(n + 2), so searching, inserting and deleting take O(log n) time even in the worst case.</p>
      </Block>
      <Block label="3. How does it stay balanced?">
        <p>
          After every insertion or deletion, we walk back up the path to the root. At each node we update its height and compute its <Term>balance factor</Term>. If a node reaches ±2, we apply a <Term>rotation</Term> - a small local rearrangement that restores balance <b>without breaking the BST ordering</b>. The next lessons explain these ideas in detail.
        </p>
      </Block>
      <Block label="4. Example: check a tree yourself">
        <p>Pick a tree and see why it is, or is not, an AVL tree. The validator reports every violation it finds.</p>
        <AvlChecker />
      </Block>
      <Block label="5. Common mistake">
        <p>Thinking a tree is an AVL tree because it <i>looks</i> roughly balanced overall. The rule applies at <b>every node</b>, not just the root. Also remember that a balanced shape is useless if the BST ordering is broken - both must hold.</p>
      </Block>
    </>
  );
}

/* ---------------------------------------------------------------- Lesson 5 */
function BalanceFactorLesson() {
  return (
    <>
      <Block label="1. What are height and balance factor?">
        <p>
          The <Term>height</Term> of a node is the number of nodes on the longest path from it down to a leaf. In AVL LAB: an <b>empty subtree has height 0</b> and a <b>leaf has height 1</b>.
        </p>
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-center font-mono text-base sm:text-lg">BF(node) = height(left subtree) − height(right subtree)</p>
        <ul>
          <li><b>BF &gt; 0</b>: left-heavy (↙). <b>BF &lt; 0</b>: right-heavy (↘). <b>BF = 0</b>: balanced.</li>
          <li>Allowed in an AVL tree: <b>−1, 0, +1</b>. Anything else (±2) means the node must be rebalanced.</li>
        </ul>
      </Block>
      <Block label="2. Why do we need it?">
        <p>The balance factor is the AVL tree&apos;s alarm. It is cheap to compute (two stored heights and a subtraction) and it tells us not only <i>that</i> a node is unbalanced but also <i>which side</i> is too heavy, which decides the rotation.</p>
        <Callout kind="warn" title="Do not mix height conventions">
          <p>Other books say a leaf has height 0 and an empty tree −1. Both conventions give the <i>same</i> balance factors, because every height is shifted by exactly 1 and the shift cancels in the subtraction. The bugs come from <b>mixing</b> them, for example treating a leaf as height 1 but an empty subtree as −1. This site uses empty = 0, leaf = 1 everywhere.</p>
        </Callout>
      </Block>
      <Block label="3. How does it work? Explore all five values">
        <p>Choose a balance factor. Then click any node to inspect its subtree heights and balance factor. Nodes with |BF| &gt; 1 are ringed and marked with <b>!</b> - the label is text, not just colour.</p>
        <BfExplorer />
      </Block>
      <Block label="4. Worked example">
        <p>Take the tree 30 → 20 → 10 (a left chain):</p>
        <ul>
          <li>Node 10: no children → height 1, BF = 0 − 0 = 0.</li>
          <li>Node 20: left height 1, right height 0 → height 2, BF = 1 − 0 = +1 (allowed).</li>
          <li>Node 30: left height 2, right height 0 → height 3, BF = 2 − 0 = <b>+2</b>. Violation!</li>
        </ul>
        <TreeFigure root={buildBst([30, 20, 10])} flagUnbalanced caption="Heights and balance factors are drawn beside each node." minHeight={240} />
      </Block>
      <Block label="5. Common mistake">
        <p>Computing the balance factor from the <i>number of nodes</i> in each subtree instead of from <i>heights</i>. A left subtree with 3 nodes can have the same height as a right subtree with 1 node, if its nodes are spread out.</p>
      </Block>
    </>
  );
}

export const LESSONS: Lesson[] = [
  {
    id: 'what-is-a-tree',
    title: 'What is a Tree?',
    summary: 'Nodes, edges, root, parent, child, leaf, subtree, depth and height.',
    minutes: 8,
    Content: TreeLesson,
    takeaways: ['A tree is made of nodes connected by edges; the root is the only node with no parent.', 'A leaf has no children; a subtree is a node plus everything below it.', 'Depth counts down from the root; height counts down to the deepest leaf. AVL LAB uses empty = 0, leaf = 1.'],
    check: {
      question: 'In the tree shown in this lesson, which node has height 1?',
      options: ['The root, 50', 'Any leaf, e.g. 10', 'The node 30', 'No node - heights start at 0'],
      answer: 1,
      explanation: 'With the convention used here (empty = 0, leaf = 1), every leaf has height 1. The root has the largest height.',
    },
  },
  {
    id: 'binary-search-tree',
    title: 'What is a Binary Search Tree?',
    summary: 'The ordering rule, insertion, searching and recursion.',
    minutes: 12,
    Content: BstLesson,
    takeaways: ['BST property: left subtree keys < node < right subtree keys, at every node.', 'Insertion and search follow one root-to-leaf path: smaller → left, larger → right.', 'Recursive tree code keeps unfinished calls on the call stack.'],
    check: {
      question: 'Which key can NOT be placed in the right subtree of the node 30 in a valid BST?',
      options: ['31', '45', '30 (a duplicate)', '1000'],
      answer: 2,
      explanation: 'Right-subtree keys must be larger than 30. A duplicate is not larger (this site rejects duplicates).',
    },
  },
  {
    id: 'why-avl',
    title: 'Why Do We Need AVL Trees?',
    summary: 'Sorted input makes a BST a chain. Height decides search cost.',
    minutes: 8,
    Content: WhyAvlLesson,
    takeaways: ['Search, insert and delete cost O(height).', 'A BST can degenerate into a chain (height n) when keys arrive sorted.', 'An AVL tree guarantees height O(log n) by rebalancing.'],
    check: {
      question: 'You insert 1, 2, 3, 4, 5, 6, 7 in this order into a plain BST. What is the height of the resulting tree?',
      options: ['3', '4', '7', '2'],
      answer: 2,
      explanation: 'Every new key is the largest so far and goes to the right: the tree is a chain of 7 nodes, so its height is 7 (an AVL tree would have height 3).',
    },
  },
  {
    id: 'what-is-avl',
    title: 'What is an AVL Tree?',
    summary: 'A BST that keeps |balance factor| ≤ 1 everywhere.',
    minutes: 8,
    Content: WhatIsAvlLesson,
    takeaways: ['An AVL tree is a BST in which every node has balance factor −1, 0 or +1.', 'Rotations restore balance after updates and never break the BST ordering.', 'The rule applies at every node, not just at the root.'],
    check: {
      question: 'Which statement about an AVL tree is true?',
      options: ['Both subtrees of the root must have exactly the same height', 'Every node has subtree heights that differ by at most 1', 'It never needs rotations', 'It stores keys in arbitrary order'],
      answer: 1,
      explanation: 'The AVL condition is |height(left) − height(right)| ≤ 1 at every node. Rotations are how the condition is kept, and the BST ordering still applies.',
    },
  },
  {
    id: 'height-balance-factor',
    title: 'Height and Balance Factor',
    summary: 'BF = height(left) − height(right), with empty = 0 and leaf = 1.',
    minutes: 10,
    Content: BalanceFactorLesson,
    takeaways: ['BF(node) = height(left) − height(right); empty = 0, leaf = 1.', 'Positive = left-heavy, negative = right-heavy; valid values are −1, 0, +1.', 'A balance factor of ±2 means the AVL property is violated and a rotation is needed.'],
    check: {
      question: 'A node has a left subtree of height 1 and a right subtree of height 3. What is its balance factor and is it allowed?',
      options: ['+2, allowed', '−2, NOT allowed', '−2, allowed', '+4, NOT allowed'],
      answer: 1,
      explanation: 'BF = left − right = 1 − 3 = −2. The allowed range is −1 to +1, so the node is right-heavy and must be rebalanced.',
    },
  },
];
