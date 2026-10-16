import { ArrowRight, CheckCircle2, Flag, Play, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Breadcrumbs, PageHeader, ProgressBar } from '../components/common/ui';
import { ProgressDashboard } from '../components/common/ProgressDashboard';
import { QuestionView, type AnswerValue } from '../components/quizzes/QuestionView';
import { isCorrect, LEVELS, QUESTIONS, questionsForLevel, type Level, type Question } from '../features/quiz/questions';
import { useProgress } from '../hooks/useProgress';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';
import { shuffle } from '../utils/random';

interface Session {
  level: Level | 'all';
  ids: string[];
  /** Display order of options per question id. */
  optionOrder: Record<string, number[]>;
  answers: Record<string, AnswerValue>;
  submitted: Record<string, boolean>;
  index: number;
  done: boolean;
}

const SESSION_KEY = 'avl-lab:quiz-session:v1';
const byId = new Map(QUESTIONS.map((q) => [q.id, q]));

function optionCount(q: Question): number {
  return q.type === 'mcq' ? q.options.length : q.type === 'match' ? q.right.length : 0;
}

function makeSession(level: Level | 'all', ids?: string[]): Session {
  const chosen = ids ?? shuffle(questionsForLevel(level).map((q) => q.id));
  const optionOrder: Record<string, number[]> = {};
  for (const id of chosen) {
    const q = byId.get(id)!;
    const n = optionCount(q);
    if (n) optionOrder[id] = shuffle(Array.from({ length: n }, (_, i) => i));
  }
  return { level, ids: chosen, optionOrder, answers: {}, submitted: {}, index: 0, done: false };
}

function loadSession(): Session | null {
  const s = readStorage<Session | null>(SESSION_KEY, null);
  if (!s || !Array.isArray(s.ids) || s.ids.some((id) => !byId.has(id)) || typeof s.index !== 'number') return null;
  return s;
}

export default function PracticePage() {
  const { recordAnswer, saveResult, data } = useProgress();
  const [session, setSession] = useState<Session | null>(() => loadSession());
  /** false = show the menu even when a saved session exists (the learner can resume it). */
  const [inQuiz, setInQuiz] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (session) writeStorage(SESSION_KEY, session);
    else removeStorage(SESSION_KEY);
  }, [session]);

  const start = (level: Level | 'all', ids?: string[]) => {
    setDrafts({});
    setSession(makeSession(level, ids));
    setInQuiz(true);
  };

  if (!session || !inQuiz) {
    return <Menu onStart={start} resume={session && !session.done ? { answered: Object.keys(session.submitted).length, total: session.ids.length, level: session.level } : null} onResume={() => setInQuiz(true)} onDiscard={() => setSession(null)} />;
  }
  if (session.done) {
    return (
      <Results
        session={session}
        onStart={start}
        onMenu={() => {
          setSession(null);
          setInQuiz(false);
        }}
      />
    );
  }

  const q = byId.get(session.ids[session.index])!;
  const submitted = !!session.submitted[q.id];
  const answer = session.answers[q.id];
  const correct = isCorrect(q, answer);
  const total = session.ids.length;
  const scoreSoFar = session.ids.filter((id) => session.submitted[id] && isCorrect(byId.get(id)!, session.answers[id])).length;
  const answered = q.type === 'match' ? Array.isArray(answer) && answer.length === q.left.length && answer.every((v) => v >= 0) : answer !== undefined;

  const submit = () => {
    recordAnswer(q.id, correct, q.topic);
    setSession({ ...session, submitted: { ...session.submitted, [q.id]: true } });
  };
  const next = () => {
    if (session.index + 1 >= total) {
      const score = session.ids.filter((id) => isCorrect(byId.get(id)!, session.answers[id])).length;
      saveResult({ score, total, level: session.level, date: new Date().toISOString() });
      setSession({ ...session, done: true });
    } else setSession({ ...session, index: session.index + 1 });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Practice & Quiz', to: '/practice' }, { label: `Question ${session.index + 1}` }]} />
      <div className="card card-pad space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="chip chip-accent">{q.level}</span>
            <span className="chip">{q.topic}</span>
          </div>
          <span className="text-muted" aria-live="polite">
            Score so far: <b className="text-ink">{scoreSoFar}</b> / {Object.keys(session.submitted).length}
          </span>
        </div>
        <ProgressBar value={session.index + (submitted ? 1 : 0)} max={total} label={`Question ${session.index + 1} of ${total}`} />
      </div>

      <div className="card card-pad space-y-5">
        <QuestionView
          key={q.id}
          q={q}
          order={session.optionOrder[q.id] ?? []}
          answer={answer}
          draft={drafts[q.id] ?? ''}
          submitted={submitted}
          correct={correct}
          onAnswer={(a) => setSession((s) => (s ? { ...s, answers: { ...s.answers, [q.id]: a } } : s))}
          onDraft={(d) => setDrafts((x) => ({ ...x, [q.id]: d }))}
        />

        {submitted && (
          <div role="status" className={`rounded-xl border p-4 ${correct ? 'border-good/50 bg-good/10' : 'border-bad/50 bg-bad/10'}`}>
            <p className="mb-1 flex items-center gap-2 font-semibold">
              {correct ? <CheckCircle2 className="h-5 w-5 text-good" aria-hidden /> : <XCircle className="h-5 w-5 text-bad" aria-hidden />}
              {correct ? 'Correct!' : 'Not quite.'}
            </p>
            <p className="text-[15px] leading-7">{q.explanation}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-2">
          <button className="btn" onClick={() => setInQuiz(false)}>
            Save &amp; exit
          </button>
          {!submitted ? (
            <button className="btn btn-primary" onClick={submit} disabled={!answered}>
              Submit answer
            </button>
          ) : (
            <button className="btn btn-primary" onClick={next}>
              {session.index + 1 >= total ? (
                <>
                  <Flag className="h-4 w-4" /> See results
                </>
              ) : (
                <>
                  Next question <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-muted">Answers are only checked when you press Submit. You answered {Object.keys(data.quiz).length} distinct questions so far across all sessions.</p>
    </div>
  );
}

function Menu({
  onStart,
  resume,
  onResume,
  onDiscard,
}: {
  onStart: (l: Level | 'all') => void;
  resume: { answered: number; total: number; level: Level | 'all' } | null;
  onResume: () => void;
  onDiscard: () => void;
}) {
  const { data } = useProgress();
  return (
    <div className="space-y-8">
      <div>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Practice & Quiz' }]} />
        <PageHeader eyebrow="Practice" title="Test what you have learned">
          {QUESTIONS.length} questions in three levels: multiple choice, predicting rotations and trees, calculating balance factors, spotting invalid trees, matching pseudocode and finding bugs. Questions and options are shuffled each time, and answers stay hidden until you submit.
        </PageHeader>
      </div>
      {resume && (
        <div className="card card-pad flex flex-wrap items-center justify-between gap-3 border-accent/50">
          <p className="text-sm">
            <b>Quiz in progress</b> ({resume.level}): {resume.answered} of {resume.total} answered.
          </p>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={onResume}>
              <Play className="h-4 w-4" /> Resume
            </button>
            <button className="btn" onClick={onDiscard}>
              Discard
            </button>
          </div>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {LEVELS.map((l) => {
          const qs = questionsForLevel(l.id);
          const tried = qs.filter((q) => data.quiz[q.id]).length;
          const right = qs.filter((q) => data.quiz[q.id]?.correct).length;
          return (
            <div key={l.id} className="card card-pad flex flex-col">
              <h3>{l.label}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{l.blurb}</p>
              <p className="my-3 text-xs text-muted">
                {qs.length} questions · {tried} tried · {right} correct
              </p>
              <button className="btn btn-primary" onClick={() => onStart(l.id)}>
                <Play className="h-4 w-4" /> Start {l.label}
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center">
        <button className="btn" onClick={() => onStart('all')}>
          <Trophy className="h-4 w-4" /> Mixed challenge: all {QUESTIONS.length} questions
        </button>
      </div>
      <ProgressDashboard />
    </div>
  );
}

function Results({ session, onStart, onMenu }: { session: Session; onStart: (l: Level | 'all', ids?: string[]) => void; onMenu: () => void }) {
  const items = session.ids.map((id) => {
    const q = byId.get(id)!;
    return { q, ok: isCorrect(q, session.answers[id]) };
  });
  const score = items.filter((i) => i.ok).length;
  const pct = Math.round((score / items.length) * 100);
  const missed = items.filter((i) => !i.ok).map((i) => i.q);
  const topics = [...new Set(missed.map((q) => q.topic))];
  const message = pct === 100 ? 'Perfect score.' : pct >= 80 ? 'Strong result.' : pct >= 50 ? 'A good start - review the explanations below.' : 'Keep going - revisit the lessons and the Rotations Lab, then try again.';
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Practice & Quiz', to: '/practice' }, { label: 'Results' }]} />
      <div className="card card-pad text-center">
        <Trophy className="mx-auto mb-2 h-8 w-8 text-accent" aria-hidden />
        <h1 className="!text-3xl">
          {score} / {items.length} <span className="text-muted">({pct}%)</span>
        </h1>
        <p className="mt-2 text-muted">{message}</p>
        {topics.length > 0 && (
          <p className="mt-3 text-sm">
            Revise: {topics.map((t) => <span key={t} className="chip chip-warn mx-1">{t}</span>)}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button className="btn btn-primary" onClick={() => onStart(session.level)}>
            <RotateCcw className="h-4 w-4" /> Retry (reshuffled)
          </button>
          {missed.length > 0 && (
            <button className="btn" onClick={() => onStart(session.level, missed.map((q) => q.id))}>
              Retry only the {missed.length} missed
            </button>
          )}
          <button className="btn" onClick={onMenu}>
            Back to menu
          </button>
        </div>
      </div>
      <section aria-label="Review of your answers" className="space-y-3">
        <h2>Review</h2>
        {items.map(({ q, ok }, i) => (
          <details key={q.id} className={`card card-pad !p-4 ${ok ? '' : 'border-bad/40'}`}>
            <summary className="flex cursor-pointer items-start gap-3">
              {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-good" aria-label="Correct" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-bad" aria-label="Incorrect" />}
              <span className="flex-1 text-sm">
                <span className="text-muted">{i + 1}. </span>
                {q.prompt}
              </span>
            </summary>
            <p className="mt-3 border-t border-line pt-3 text-sm leading-6">{q.explanation}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
