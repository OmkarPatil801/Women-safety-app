import { Link } from 'react-router-dom';
import { Breadcrumbs, Callout, PageHeader, ScrollRegion } from '../components/common/ui';
import { FibonacciExplorer, HeightChart, HeightExplorer, MinNodesTable } from '../components/lessons/ComplexityVisuals';

export default function ComplexityPage() {
  return (
    <div className="space-y-10">
      <div>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Complexity Analysis' }]} />
        <PageHeader eyebrow="Analysis" title="Complexity Analysis">
          How much work do AVL operations need, and why is the answer logarithmic? Everything measured on this page comes from running the real algorithms.
        </PageHeader>
      </div>

      <section className="space-y-3">
        <h2>Time and space in one minute</h2>
        <div className="prose-lab">
          <p>
            <b>Time complexity</b> describes how the number of steps grows with the input size n. <b>Space complexity</b> describes how much extra memory is needed. For tree operations both are governed by the tree&apos;s <b>height</b> h: a search, insertion or deletion follows one root-to-leaf path, so it does O(h) work, and the recursive versions keep one stack frame per level, so they need O(h) extra space (the <b>recursive call stack</b>).
          </p>
          <p>
            Big-O is an upper bound on growth, not an exact count: two different insertions into the same tree can take a different number of comparisons. What matters is how the worst case grows.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2>AVL tree versus ordinary BST</h2>
        <ScrollRegion label="AVL versus BST complexity (table)" className="card">
          <table className="table-lab" aria-label="Complexity comparison of AVL tree and ordinary BST">
            <thead>
              <tr>
                <th>Operation</th>
                <th>AVL Tree</th>
                <th>Ordinary BST</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Search</td><td className="font-semibold">O(log n) worst case</td><td className="font-semibold">O(n) worst case</td></tr>
              <tr><td>Insertion</td><td className="font-semibold">O(log n) worst case</td><td className="font-semibold">O(n) worst case</td></tr>
              <tr><td>Deletion</td><td className="font-semibold">O(log n) worst case</td><td className="font-semibold">O(n) worst case</td></tr>
              <tr><td>Space (recursion stack)</td><td className="font-semibold">O(log n)</td><td className="font-semibold">O(n) worst case</td></tr>
            </tbody>
          </table>
        </ScrollRegion>
        <Callout kind="info" title="An ordinary BST can also be fast">
          <p>If its shape happens to be balanced (for example after random insertions) an ordinary BST also needs only O(log n) on average. The table compares the <b>worst case</b>: a plain BST gives no guarantee, an AVL tree does. The price is a little extra work per update: updating heights and occasionally rotating.</p>
        </Callout>
      </section>

      <section className="space-y-3">
        <h2>Best, average and worst case</h2>
        <ScrollRegion label="Best, average and worst case (table)" className="card">
          <table className="table-lab" aria-label="Best, average and worst case for AVL operations">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Best case</th>
                <th>Average</th>
                <th>Worst case</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Search</td><td className="font-semibold">O(1)</td><td className="font-semibold">O(log n)</td><td className="font-semibold">O(log n)</td><td className="text-sm text-muted">Best case: the key is in the root. A missing key needs a full path.</td></tr>
              <tr><td>Insertion</td><td className="font-semibold">O(log n)</td><td className="font-semibold">O(log n)</td><td className="font-semibold">O(log n)</td><td className="text-sm text-muted">Walk down to a leaf position and back up. At most one single or double rotation.</td></tr>
              <tr><td>Deletion</td><td className="font-semibold">O(log n)</td><td className="font-semibold">O(log n)</td><td className="font-semibold">O(log n)</td><td className="text-sm text-muted">Search, successor walk and the way back up are each ≤ height. Up to O(log n) rotations.</td></tr>
              <tr><td>Rotation</td><td className="font-semibold">O(1)</td><td className="font-semibold">O(1)</td><td className="font-semibold">O(1)</td><td className="text-sm text-muted">Only a few pointers and two heights change.</td></tr>
              <tr><td>Any traversal</td><td className="font-semibold">O(n)</td><td className="font-semibold">O(n)</td><td className="font-semibold">O(n)</td><td className="text-sm text-muted">Every node is visited once. Stack/queue space: O(h) / O(width).</td></tr>
            </tbody>
          </table>
        </ScrollRegion>
      </section>

      <section className="space-y-4">
        <h2>Balanced versus skewed: measured heights</h2>
        <p className="prose-lab text-[15.5px]">Drag the slider to compare the height of an AVL tree with plain BSTs built from the same n keys, once in sorted order (worst case) and once in random order.</p>
        <HeightExplorer />
        <HeightChart maxN={500} />
        <p className="text-sm text-muted">
          Want to see actual trees? Lesson 3 draws them side by side: <Link to="/learn/why-avl">Why do we need AVL trees?</Link>
        </p>
      </section>

      <section className="space-y-4">
        <h2>Why does an AVL tree stay logarithmic?</h2>
        <div className="prose-lab">
          <p>
            Ask the opposite question: what is the <i>fewest</i> nodes N(h) an AVL tree of height h can have? The root, plus one subtree of height h − 1 and - at best - one subtree that is allowed to be one shorter, h − 2:
          </p>
          <p className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-center font-mono">N(h) = N(h − 1) + N(h − 2) + 1</p>
          <p>
            This is a Fibonacci-like recurrence, so N(h) grows exponentially (roughly by the golden ratio φ ≈ 1.618 per level). Turning it around, the height can only grow logarithmically with n: an AVL tree with n nodes has height at most about <b>1.44·log₂(n + 2)</b>. Explore the sparsest trees:
          </p>
        </div>
        <FibonacciExplorer />
        <MinNodesTable />
      </section>

      <section className="space-y-3">
        <h2>Space and the recursive call stack</h2>
        <div className="prose-lab">
          <p>
            Recursive insertion and deletion call themselves once per level, so at most h + 1 calls are waiting on the stack at any time. For an AVL tree that is O(log n): about 10 frames for 1,000 keys and about 20 for 1,000,000. The same recursion on a skewed plain BST could need n frames - enough to overflow the stack for large inputs. The iterative search needs only O(1) extra space.
          </p>
          <p>The tree itself always uses O(n) memory: one node per key (a key, two pointers and a height).</p>
        </div>
        <Callout kind="warn" title="Be careful with statements like &quot;it takes exactly log n steps&quot;">
          <p>Big-O hides constants and says nothing about a single call. An AVL search can finish after one comparison (the root) or after about 1.44·log₂ n comparisons; the guarantee is only the upper bound.</p>
        </Callout>
      </section>
    </div>
  );
}
