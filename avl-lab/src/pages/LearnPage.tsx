import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { LESSONS } from '../components/lessons/lessons';
import { Breadcrumbs, KeyTakeaways, KnowledgeCheck, PageHeader, ProgressBar } from '../components/common/ui';
import { GLOSSARY } from '../features/lessons/glossary';
import { useProgress } from '../hooks/useProgress';

function LessonIndex() {
  const { data, stats } = useProgress();
  return (
    <div className="space-y-10">
      <div>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Learn AVL Trees' }]} />
        <PageHeader eyebrow="Beginner course" title="Learn AVL Trees from scratch">
          Five short lessons take you from &quot;what is a tree?&quot; to balance factors. Every lesson has an interactive visual and a quick question. After that, continue with rotations, the visualizer and the code.
        </PageHeader>
        <div className="card card-pad max-w-md">
          <ProgressBar value={stats.lessonsDone} max={LESSONS.length} label="Lessons completed" />
        </div>
      </div>

      <ol className="grid gap-4 md:grid-cols-2" aria-label="Lessons">
        {LESSONS.map((l, i) => {
          const done = data.lessons.includes(l.id);
          return (
            <li key={l.id}>
              <Link to={`/learn/${l.id}`} className="card card-pad !text-ink block h-full no-underline transition-colors hover:border-accent/60">
                <div className="mb-2 flex items-center justify-between">
                  <span className="chip chip-accent">Lesson {i + 1}</span>
                  {done ? (
                    <span className="chip chip-good">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Completed
                    </span>
                  ) : (
                    <span className="chip">
                      <Clock className="h-3.5 w-3.5" aria-hidden /> ~{l.minutes} min
                    </span>
                  )}
                </div>
                <h3>{l.title}</h3>
                <p className="mt-1 text-sm text-muted">{l.summary}</p>
              </Link>
            </li>
          );
        })}
        <li>
          <Link to="/rotations" className="card card-pad !text-ink block h-full border-dashed no-underline transition-colors hover:border-accent/60">
            <span className="chip chip-info mb-2">Next up</span>
            <h3>Rotations Lab</h3>
            <p className="mt-1 text-sm text-muted">See how LL, RR, LR and RL imbalances are repaired, step by step.</p>
          </Link>
        </li>
      </ol>

      <section aria-labelledby="glossary">
        <h2 id="glossary" className="mb-4">
          Glossary
        </h2>
        <dl className="grid gap-3 md:grid-cols-2">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="card card-pad !p-4">
              <dt className="font-semibold text-accent">{g.term}</dt>
              <dd className="mt-1 text-sm text-ink/90">
                {g.short} <span className="text-muted">{g.long}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

function LessonView({ id }: { id: string }) {
  const index = LESSONS.findIndex((l) => l.id === id);
  const { data, completeLesson } = useProgress();
  if (index < 0) return <Navigate to="/learn" replace />;
  const lesson = LESSONS[index];
  const prev = LESSONS[index - 1];
  const next = LESSONS[index + 1];
  const done = data.lessons.includes(lesson.id);
  const Content = lesson.Content;

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <div>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Learn AVL Trees', to: '/learn' }, { label: lesson.title }]} />
        <PageHeader eyebrow={`Lesson ${index + 1} of ${LESSONS.length}`} title={lesson.title}>
          {lesson.summary}
        </PageHeader>
        <ol className="flex gap-1.5" aria-label="Lesson progress">
          {LESSONS.map((l, i) => (
            <li key={l.id} className="flex-1">
              <Link to={`/learn/${l.id}`} aria-label={`Lesson ${i + 1}: ${l.title}`} aria-current={i === index ? 'page' : undefined} className={`block h-1.5 rounded-full ${i === index ? 'bg-accent' : data.lessons.includes(l.id) ? 'bg-good' : 'bg-raised'}`} />
            </li>
          ))}
        </ol>
      </div>

      <Content />

      <KeyTakeaways items={lesson.takeaways} />
      <KnowledgeCheck
        key={lesson.id}
        q={lesson.check}
        onResult={(correct) => {
          if (correct) completeLesson(lesson.id);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        {prev ? (
          <Link to={`/learn/${prev.id}`} className="btn">
            <ArrowLeft className="h-4 w-4" /> {prev.title}
          </Link>
        ) : (
          <Link to="/learn" className="btn">
            <ArrowLeft className="h-4 w-4" /> All lessons
          </Link>
        )}
        <button className={`btn ${done ? 'border-good/50 text-good' : ''}`} onClick={() => completeLesson(lesson.id)} disabled={done} aria-live="polite">
          {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
          {done ? 'Lesson completed' : 'Mark as complete'}
        </button>
        {next ? (
          <Link to={`/learn/${next.id}`} className="btn btn-primary">
            {next.title} <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link to="/rotations" className="btn btn-primary">
            Continue to the Rotations Lab <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </article>
  );
}

export default function LearnPage() {
  const { lessonId } = useParams();
  return lessonId ? <LessonView id={lessonId} /> : <LessonIndex />;
}
