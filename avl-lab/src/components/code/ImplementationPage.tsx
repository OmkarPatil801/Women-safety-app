import { Terminal } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOURCES, type Lang } from '../../features/codeExamples/sources';
import { Breadcrumbs, Callout, PageHeader, Tabs } from '../common/ui';
import { CodeBlock } from './CodeBlock';
import { CodeViewer } from './CodeViewer';

const SAMPLE = `===== AVL TREE MENU =====          (menu is printed before every choice)
Enter your choice: 1
Value to insert: 10
Inserted 10.
... (the same for 20, 30, 40, 50 and 25) ...
Enter your choice: 8
            50(h=1,bf=0)
      40(h=2,bf=-1)
30(h=3,bf=0)
            25(h=1,bf=0)
      20(h=2,bf=0)
            10(h=1,bf=0)
Enter your choice: 4
In-order: 10 20 25 30 40 50
Enter your choice: 7
Level-order: 30 20 40 10 25 50
Enter your choice: 1
Value to insert: 30
30 already exists - duplicates are not allowed.
Enter your choice: 2
Value to delete: 20
Deleted 20.
Enter your choice: 3
Value to search: 25
25 found.
Enter your choice: 3
Value to search: 99
99 not found.
Enter your choice: 9
Tree height: 3
Enter your choice: 0
Memory released. Goodbye!`;

const POINTERS = [
  ['Pointer manipulation in rotations', 'Save the middle subtree (T2) in a variable BEFORE overwriting pointers, then re-link in a fixed order: y->right = z; z->left = T2. Draw boxes and arrows - it is the best way to see what each pointer references before and after.'],
  ['Updating node heights', 'Heights are stored, so call updateHeight() whenever children changed. After a rotation update the node that moved DOWN first, then the new subtree root.'],
  ['Returning the new subtree root', 'Every function that may rotate returns the root of the subtree. The caller stores it: node->left = insert(node->left, key). Forgetting the assignment silently loses nodes.'],
  ['Deleting nodes safely', 'Save the child pointer, then free the node, and never touch the node again. For two children, copy the successor key and delete the successor instead.'],
  ['Avoiding memory leaks', 'Every allocation (malloc / new) must have exactly one matching free / delete. The programs free the whole tree in post-order on exit. The test suite runs both with AddressSanitizer, which also reports leaks.'],
  ['Handling missing values', 'insert reports duplicates and deleteNode reports "not found" through a flag instead of silently doing nothing, so the menu can tell the user.'],
  ['Balance-factor conditions', 'LL/LR is decided by getBalance(node->left) < 0 (strict), RR/RL by getBalance(node->right) > 0 (strict). The equal case (0) after a deletion needs the single rotation.'],
];

export function ImplementationPage({ lang }: { lang: Lang }) {
  const src = SOURCES[lang];
  const isC = lang === 'c';
  const [os, setOs] = useState<'linux' | 'windows'>('linux');
  const exe = os === 'linux' ? src.run : src.runWin;
  const compileTool = isC ? 'gcc' : 'g++';
  const lines = src.text.split('\n').length;

  return (
    <div className="space-y-10">
      <div>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: isC ? 'C Implementation' : 'C++ Implementation' }]} />
        <PageHeader eyebrow={isC ? 'Implementation in C' : 'Implementation in C++'} title={isC ? 'Complete AVL Tree in C' : 'Complete AVL Tree in C++'}>
          {isC
            ? `A complete, menu-driven AVL tree in standard C (${lines} lines): node structure, rotations, insertion, deletion with the in-order successor, search, four traversals (with an array-based queue), cleanup and a pretty printer.`
            : `A complete, menu-driven AVL tree in standard C++ (${lines} lines): a Node struct and an AVLTree class with a destructor, rotations, insertion, deletion, search, four traversals using std::queue.`}
        </PageHeader>
        <p className="text-sm text-muted">
          Verified by compiling with <code className="text-accent">{isC ? 'gcc -std=c99' : 'g++ -std=c++11'} -Wall -Wextra -pedantic -Werror</code> and running under AddressSanitizer/UBSan against randomized operations compared with the TypeScript engine. Concepts: <Link to="/algorithms">pseudocode</Link> · <Link to="/rotations">Rotations Lab</Link>.
        </p>
      </div>

      <section className="space-y-4" aria-labelledby="build">
        <h2 id="build" className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-accent" aria-hidden /> Compile and run
        </h2>
        <Tabs
          label="Operating system"
          value={os}
          onChange={setOs}
          tabs={[
            { id: 'linux', label: 'Linux / macOS' },
            { id: 'windows', label: 'Windows' },
          ]}
        />
        {os === 'linux' ? (
          <CodeBlock lang="text" showLineNumbers={false} title="terminal" code={`${src.compile}\n${exe}\n\n# stricter build while learning:\n${src.compileStrict}`} />
        ) : (
          <>
            <CodeBlock
              lang="text"
              showLineNumbers={false}
              title={`PowerShell / Command Prompt (MinGW-w64 or MSYS2 provides ${compileTool})`}
              code={`${compileTool} ${src.filename} -o avl_tree.exe\n.\\avl_tree.exe`}
            />
            <ul className="prose-lab text-sm">
              <li>Install a compiler first, for example <b>MSYS2 / MinGW-w64</b> (gives you <code>gcc</code> and <code>g++</code>), or use <b>WSL</b> and follow the Linux instructions.</li>
              <li>The compiler writes <code>avl_tree.exe</code> next to the source file. Run it from the same folder with <code>.\avl_tree.exe</code> (PowerShell) or <code>avl_tree.exe</code> (Command Prompt). Double-clicking also works, but the window closes when the program exits, so run it from a terminal.</li>
              <li>The code uses only standard {isC ? 'C99' : 'C++11'} features. It was tested here with GCC on Linux; Visual Studio&apos;s compiler (<code>{isC ? 'cl avl_tree.c' : 'cl /EHsc avl_tree.cpp'}</code>) should also work but was not tested.</li>
            </ul>
          </>
        )}
        <h3>Sample session</h3>
        <p className="text-sm text-muted">Real output of the program (the menu text is shortened here). Typed input appears after each prompt.</p>
        <CodeBlock lang="text" showLineNumbers={false} title="sample input / output" code={SAMPLE} />
      </section>

      <section aria-labelledby="code">
        <h2 id="code" className="mb-4">
          Source code
        </h2>
        <CodeViewer initialLang={lang} />
      </section>

      <section className="space-y-4" aria-labelledby="concepts">
        <h2 id="concepts">Pointers and memory: what to watch for</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {POINTERS.map(([title, text]) => (
            <div key={title} className="card card-pad !p-4">
              <h3 className="mb-1 text-base">{title}</h3>
              <p className="text-sm leading-6 text-ink/90">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="diff">
        <h2 id="diff">C versus C++ in this project</h2>
        <div className="card overflow-x-auto">
          <table className="table-lab" aria-label="Differences between the C and C++ programs">
            <thead>
              <tr>
                <th>Topic</th>
                <th>C version</th>
                <th>C++ version</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Structure</td><td>Free functions that take and return <code>Node *</code>; the root pointer lives in <code>main</code>.</td><td>The same algorithm, wrapped in an <code>AVLTree</code> class that owns the root pointer.</td></tr>
              <tr><td>Creating a node</td><td><code>malloc</code> + manual field setup.</td><td><code>new Node(key)</code> with a constructor.</td></tr>
              <tr><td>Freeing memory</td><td>Call <code>freeTree(root)</code> yourself.</td><td>The destructor frees the nodes automatically when the object is destroyed.</td></tr>
              <tr><td>Level-order queue</td><td>Hand-written array queue.</td><td><code>std::queue</code> from the standard library.</td></tr>
              <tr><td>Reporting results</td><td>Output parameters (<code>int *inserted</code>).</td><td>References (<code>bool &amp;inserted</code>) and <code>bool</code> return values.</td></tr>
              <tr><td>Input / output</td><td><code>printf</code>, <code>scanf</code>.</td><td><code>std::cout</code>, <code>std::cin</code>.</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="info" title="C++ does not make an AVL tree object-oriented by itself">
          <p>The balancing algorithm is identical in both languages - the recursion, the rotations and the balance-factor checks are the same. Using a class here only bundles the root pointer with the operations and lets the destructor handle cleanup; it does not change how the tree works. Both programs share the same shape on purpose so you can read them side by side.</p>
        </Callout>
        <p className="text-sm text-muted">
          Other language: <Link to={isC ? '/cpp' : '/c'}>{isC ? 'C++ implementation' : 'C implementation'}</Link>.
        </p>
      </section>
    </div>
  );
}
