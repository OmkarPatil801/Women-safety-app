import { Activity, ArrowRight, BookOpen, Braces, CheckCircle2, GraduationCap, ListTree, Network, RefreshCcw, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProgressDashboard } from '../components/common/ProgressDashboard';
import { HeroPreview } from '../components/lessons/HeroPreview';
import { useProgress } from '../hooks/useProgress';

const FEATURES = [
  { icon: Network, title: 'Interactive Tree Visualizer', text: 'Insert, delete and search on a real AVL tree. Step forwards and backwards through every decision.', to: '/visualizer' },
  { icon: RefreshCcw, title: 'Step-by-Step Rotations', text: 'LL, RR, LR and RL explained with balance-factor tables and pointer changes.', to: '/rotations' },
  { icon: ListTree, title: 'AVL Algorithms', text: 'Thirteen algorithms in beginner-friendly pseudocode with complexity and common mistakes.', to: '/algorithms' },
  { icon: Braces, title: 'C and C++ Code', text: 'Complete, compiled and tested implementations with function-by-function explanations.', to: '/c' },
  { icon: Activity, title: 'Complexity Explorer', text: 'Measured heights of balanced versus skewed trees, and why AVL height is logarithmic.', to: '/complexity' },
  { icon: Target, title: 'Practice Challenges', text: `Quizzes in three levels: predict rotations, calculate balance factors, find bugs.`, to: '/practice' },
];

const AUDIENCE = [
  ['Beginners learning data structures', 'Start from "what is a tree?" - no prior knowledge of balancing needed.'],
  ['College students preparing for practical examinations', 'Study complete C and C++ programs and the algorithms behind them.'],
  ['Students preparing for coding interviews', 'Practise predicting rotations and spotting bugs in tree code.'],
  ['Developers revising tree algorithms', 'Jump straight to the pseudocode, the rotation rules and the complexity analysis.'],
];

export function HomePage() {
  const { data, stats } = useProgress();
  const roadmap = [
    { label: 'BST Basics', to: '/learn/binary-search-tree', done: data.lessons.includes('binary-search-tree') },
    { label: 'AVL Properties', to: '/learn/what-is-avl', done: data.lessons.includes('what-is-avl') },
    { label: 'Balance Factor', to: '/learn/height-balance-factor', done: data.lessons.includes('height-balance-factor') },
    { label: 'Rotations', to: '/rotations', done: stats.rotationsDone === 4 },
    { label: 'Insertion', to: '/visualizer', done: data.ops.includes('insert') },
    { label: 'Deletion', to: '/visualizer', done: data.ops.includes('delete') },
    { label: 'Implementation', to: '/c', done: false },
    { label: 'Practice', to: '/practice', done: stats.answered > 0 },
  ];

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr]" aria-labelledby="hero-title">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">AVL LAB · Understand the balance. Master the rotations.</p>
          <h1 id="hero-title" className="!text-4xl sm:!text-5xl !leading-[1.1]">
            Master AVL Trees. One Rotation at a Time.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Explore self-balancing binary search trees through interactive visualizations, step-by-step algorithms, and complete C and C++ implementations.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/visualizer" className="btn btn-primary !px-5 !py-3 !text-base">
              Start Visualizing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/learn" className="btn !px-5 !py-3 !text-base">
              <BookOpen className="h-4 w-4" /> Learn the Basics
            </Link>
          </div>
        </div>
        <HeroPreview />
      </section>

      <section aria-labelledby="features">
        <h2 id="features" className="mb-6">
          Everything you need to understand AVL trees
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <Link to={f.to} className="card card-pad group block h-full !text-ink no-underline transition-colors hover:border-accent/60">
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3>{f.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{f.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="roadmap">
        <h2 id="roadmap" className="mb-2">
          Your learning roadmap
        </h2>
        <p className="mb-6 text-sm text-muted">Follow the path from left to right. Checkmarks appear when you actually complete a step - they are never pre-filled.</p>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roadmap.map((r, i) => (
            <li key={r.label}>
              <Link to={r.to} className={`card flex items-center gap-3 !p-4 !text-ink no-underline transition-colors hover:border-accent/60 ${r.done ? 'border-good/50' : ''}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${r.done ? 'bg-good/20 text-good' : 'bg-raised text-muted'}`}>
                  {r.done ? <CheckCircle2 className="h-4 w-4" aria-label="completed" /> : i + 1}
                </span>
                <span className="font-medium">{r.label}</span>
                {i < roadmap.length - 1 && <ArrowRight className="ml-auto hidden h-4 w-4 text-muted xl:block" aria-hidden />}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <ProgressDashboard />

      <section aria-labelledby="audience">
        <h2 id="audience" className="mb-6 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-accent" aria-hidden /> Who is this for?
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {AUDIENCE.map(([t, d]) => (
            <li key={t} className="card card-pad !p-5">
              <h3 className="text-base">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card card-pad flex flex-wrap items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h2 className="text-xl">Ready to see a rotation happen?</h2>
          <p className="text-sm text-muted">Insert 10, 20, 30 and watch the tree repair itself.</p>
        </div>
        <Link to="/visualizer" className="btn btn-primary mx-auto sm:mx-0">
          Open the visualizer <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
