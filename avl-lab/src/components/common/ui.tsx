import { AlertTriangle, CheckCircle2, ChevronRight, Info, Lightbulb, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';

export function PageHeader({ eyebrow, title, children, actions }: { eyebrow?: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">{eyebrow}</p>}
        <h1>{title}</h1>
        {children && <p className="mt-3 text-base leading-7 text-muted">{children}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

type CalloutKind = 'info' | 'tip' | 'warn' | 'good' | 'bad';
const CALLOUT = {
  info: { icon: Info, cls: 'border-accent/40 bg-accent/10', ic: 'text-accent', label: 'Note' },
  tip: { icon: Lightbulb, cls: 'border-info/40 bg-info/10', ic: 'text-info', label: 'Analogy' },
  warn: { icon: AlertTriangle, cls: 'border-warn/50 bg-warn/10', ic: 'text-warn', label: 'Common mistake' },
  good: { icon: CheckCircle2, cls: 'border-good/40 bg-good/10', ic: 'text-good', label: 'Key idea' },
  bad: { icon: XCircle, cls: 'border-bad/40 bg-bad/10', ic: 'text-bad', label: 'Problem' },
} as const;

export function Callout({ kind = 'info', title, children }: { kind?: CalloutKind; title?: string; children: ReactNode }) {
  const c = CALLOUT[kind];
  const Icon = c.icon;
  return (
    <aside className={`my-4 flex gap-3 rounded-xl border p-4 ${c.cls}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${c.ic}`} aria-hidden />
      <div className="min-w-0 text-[15px] leading-7">
        <p className={`text-xs font-semibold uppercase tracking-wider ${c.ic}`}>{title ?? c.label}</p>
        <div className="prose-lab [&>p]:my-1">{children}</div>
      </div>
    </aside>
  );
}

export function Section({ id, title, step, children }: { id?: string; title: string; step?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 flex items-center gap-3 text-xl">
        {step && <span className="chip chip-accent">{step}</span>}
        {title}
      </h2>
      <div className="prose-lab">{children}</div>
    </section>
  );
}

export function KeyTakeaways({ items }: { items: ReactNode[] }) {
  return (
    <div className="card card-pad border-good/40">
      <p className="panel-title mb-2 text-good">Key takeaways</p>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-[15px] leading-6">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-good" aria-hidden />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface QuickQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

/** Single multiple-choice check. Feedback appears only after the user submits. */
export function KnowledgeCheck({ q, onResult }: { q: QuickQuestion; onResult?: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = picked === q.answer;
  return (
    <div className="card card-pad">
      <p className="panel-title mb-2">Quick question</p>
      <p className="mb-3 font-medium">{q.question}</p>
      <div role="radiogroup" aria-label={q.question} className="space-y-2">
        {q.options.map((o, i) => {
          const showRight = submitted && i === q.answer;
          const showWrong = submitted && picked === i && !correct;
          return (
            <label
              key={i}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                showRight ? 'border-good bg-good/10' : showWrong ? 'border-bad bg-bad/10' : picked === i ? 'border-accent bg-accent/10' : 'border-line hover:border-accent/50'
              }`}
            >
              <input
                type="radio"
                name={q.question}
                className="mt-1 accent-[rgb(var(--c-accent))]"
                checked={picked === i}
                disabled={submitted}
                onChange={() => setPicked(i)}
              />
              <span className="flex-1">{o}</span>
              {showRight && <span className="chip chip-good">Correct</span>}
              {showWrong && <span className="chip chip-bad">Your answer</span>}
            </label>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!submitted ? (
          <button
            className="btn btn-primary"
            disabled={picked === null}
            onClick={() => {
              setSubmitted(true);
              onResult?.(picked === q.answer);
            }}
          >
            Check answer
          </button>
        ) : (
          <button
            className="btn"
            onClick={() => {
              setPicked(null);
              setSubmitted(false);
            }}
          >
            Try again
          </button>
        )}
      </div>
      {submitted && (
        <p className={`mt-3 rounded-lg border p-3 text-sm ${correct ? 'border-good/40 bg-good/10' : 'border-bad/40 bg-bad/10'}`} role="status">
          <strong>{correct ? 'Correct. ' : 'Not quite. '}</strong>
          {q.explanation}
        </p>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
            {it.to ? (
              <Link to={it.to} className="text-muted hover:text-accent">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1 rounded-xl border border-line bg-bg p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            value === t.id ? 'bg-accent text-[rgb(9_14_27)]' : 'text-muted hover:bg-raised hover:text-ink'
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-raised" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
        <motion.div className="h-full rounded-full bg-accent" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={title} onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="card card-pad w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2">{title}</h3>
        {children}
      </div>
    </div>
  );
}
