import { Link } from 'react-router-dom';
import { Breadcrumbs, Callout, PageHeader, ScrollRegion } from '../components/common/ui';

const TECH = [
  ['React 18 + TypeScript', 'UI components and strictly typed engine'],
  ['Vite', 'Development server and production build'],
  ['Tailwind CSS', 'Design tokens and styling (dark and light themes)'],
  ['Framer Motion', 'Smooth node movement (respects the reduced-motion setting)'],
  ['React Router', 'Navigation between sections'],
  ['Lucide React', 'Icons'],
  ['SVG', 'The tree renderer: positions are computed from the real tree data'],
  ['Vitest', 'Unit and randomized tests for the AVL engine and C/C++ cross-checks'],
  ['localStorage', 'Preferences and learning progress (stored only in your browser)'],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
        <PageHeader eyebrow="About" title="About AVL LAB">
          Understand the balance. Master the rotations.
        </PageHeader>
      </div>

      <section className="space-y-2">
        <h2>What are AVL trees?</h2>
        <div className="prose-lab">
          <p>An AVL tree is a self-balancing binary search tree: for every node the heights of the left and right subtrees differ by at most one. After each insertion or deletion, small local rotations restore that rule. As a result, searching, inserting and deleting take O(log n) time even in the worst case.</p>
        </div>
      </section>

      <section className="space-y-2">
        <h2>Why this platform exists</h2>
        <div className="prose-lab">
          <p>Rotations are easy to memorise and hard to understand. AVL LAB shows <i>why</i> every step happens: each animation is replayed from steps recorded by a real AVL implementation, each explanation is generated from the actual node heights and balance factors, and the C and C++ programs are the same algorithm that the visualizer runs.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2>What you can learn here</h2>
        <ul className="prose-lab !mt-0">
          <li>Trees, binary search trees, height and balance factor - from the basics (<Link to="/learn">lessons</Link>).</li>
          <li>All four rotation cases with before/after pictures (<Link to="/rotations">Rotations Lab</Link>).</li>
          <li>Insertion, deletion, search and traversals, step by step (<Link to="/visualizer">Visualizer</Link>).</li>
          <li>Language-independent pseudocode (<Link to="/algorithms">Algorithms</Link>) and complete programs in <Link to="/c">C</Link> and <Link to="/cpp">C++</Link>.</li>
          <li>Why the height is logarithmic (<Link to="/complexity">Complexity</Link>) and how to test yourself (<Link to="/practice">Practice</Link>).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>Technologies used</h2>
        <ScrollRegion label="Technologies used (table)" className="card">
          <table className="table-lab">
            <tbody>
              {TECH.map(([n, d]) => (
                <tr key={n}>
                  <td className="font-semibold">{n}</td>
                  <td className="text-muted">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
        <p className="text-sm text-muted">There is no backend, database, account system or external service: everything runs in your browser.</p>
      </section>

      <Callout kind="info" title="An educational implementation">
        <p>AVL LAB is a teaching tool. The engine favours clarity and recorded explanations over raw speed, the visualizer is limited to 127 nodes so the picture stays readable, and keys are whole numbers between −9999 and 9999. Duplicate keys are rejected. For production work, prefer your language&apos;s well-tested standard containers.</p>
      </Callout>

      <section className="space-y-2">
        <h2>Privacy</h2>
        <p className="prose-lab text-[15.5px]">Your theme, animation preference, lesson progress and quiz answers are stored in your browser&apos;s localStorage on this device. Nothing is sent anywhere. You can erase it at any time with &quot;Reset progress&quot; on the home page or the practice page.</p>
      </section>
    </div>
  );
}
