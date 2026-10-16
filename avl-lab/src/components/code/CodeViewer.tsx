import { ArrowDown, ArrowUp, Check, ChevronDown, Copy, Download, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FUNCTION_DOCS } from '../../features/codeExamples/functionDocs';
import { findRange, FUNCTIONS, GROUPS, type GroupId, type LineRange } from '../../features/codeExamples/functionIndex';
import { SOURCES, type Lang } from '../../features/codeExamples/sources';
import { useToast } from '../../hooks/useToast';
import { copyText, downloadTextFile } from '../../utils/download';
import { revealInContainer } from '../../utils/scroll';
import { Inline } from '../common/Inline';
import { Tabs } from '../common/ui';
import { tokenizeSource } from './highlight';

type Selection = { kind: 'all' } | { kind: 'group'; id: GroupId } | { kind: 'fn'; id: string };

interface Segment {
  range: LineRange;
}

export function CodeViewer({ initialLang }: { initialLang: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [sel, setSel] = useState<Selection>({ kind: 'all' });
  const [query, setQuery] = useState('');
  const [matchIdx, setMatchIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const timer = useRef<number | undefined>(undefined);
  const lineRefs = useRef(new Map<number, HTMLSpanElement>());
  const preRef = useRef<HTMLPreElement>(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => setLang(initialLang), [initialLang]);

  const src = SOURCES[lang];
  const lines = useMemo(() => src.text.split('\n'), [src.text]);
  const tokens = useMemo(() => tokenizeSource(src.text), [src.text]);
  const entries = useMemo(() => FUNCTIONS[lang].map((f) => ({ ...f, range: findRange(lines, f.match) })), [lang, lines]);

  // When switching language keep the selection if it still exists.
  useEffect(() => {
    if (sel.kind === 'fn' && !entries.some((e) => e.id === sel.id)) setSel({ kind: 'all' });
  }, [entries, sel]);

  const segments: Segment[] = useMemo(() => {
    if (sel.kind === 'all') return [{ range: { start: 0, end: lines.length - 1 } }];
    if (sel.kind === 'fn') {
      const e = entries.find((x) => x.id === sel.id);
      return e?.range ? [{ range: e.range }] : [{ range: { start: 0, end: lines.length - 1 } }];
    }
    return entries
      .filter((e) => e.group === sel.id && e.range)
      .map((e) => ({ range: e.range as LineRange }))
      .sort((a, b) => a.range.start - b.range.start);
  }, [sel, entries, lines.length]);

  const visibleLineIdx = useMemo(() => segments.flatMap((s) => Array.from({ length: s.range.end - s.range.start + 1 }, (_, i) => s.range.start + i)), [segments]);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => (q ? visibleLineIdx.filter((i) => lines[i].toLowerCase().includes(q)) : []), [q, visibleLineIdx, lines]);
  useEffect(() => setMatchIdx(0), [q, sel, lang]);
  const currentMatchLine = matches.length ? matches[matchIdx % matches.length] : -1;
  useEffect(() => {
    if (currentMatchLine >= 0) revealInContainer(preRef.current, lineRefs.current.get(currentMatchLine) ?? null, true);
  }, [currentMatchLine]);

  const shownText = visibleLineIdx.map((i) => lines[i]).join('\n');
  const selectedFn = sel.kind === 'fn' ? sel.id : null;
  const doc = selectedFn ? FUNCTION_DOCS[selectedFn] : null;

  const renderLine = (i: number) => {
    const toks = tokens[i];
    const isMatch = q && lines[i].toLowerCase().includes(q);
    let content;
    if (isMatch) {
      // Highlight the matching substring on top of syntax colours by splitting tokens.
      let pos = 0;
      content = toks.map((t, j) => {
        const start = pos;
        pos += t.text.length;
        const lower = t.text.toLowerCase();
        const parts: React.ReactNode[] = [];
        let from = 0;
        let at = lower.indexOf(q, from);
        if (at === -1) return <span key={j} className={t.cls ? `tok-${t.cls}` : undefined}>{t.text}</span>;
        while (at !== -1) {
          if (at > from) parts.push(t.text.slice(from, at));
          parts.push(<mark key={`${j}-${at}`} className="rounded bg-warn/50 text-inherit">{t.text.slice(at, at + q.length)}</mark>);
          from = at + q.length;
          at = lower.indexOf(q, from);
        }
        if (from < t.text.length) parts.push(t.text.slice(from));
        void start;
        return <span key={j} className={t.cls ? `tok-${t.cls}` : undefined}>{parts}</span>;
      });
    } else {
      content = toks.map((t, j) => (
        <span key={j} className={t.cls ? `tok-${t.cls}` : undefined}>
          {t.text}
        </span>
      ));
    }
    return (
      <span
        key={i}
        ref={(el) => {
          if (el) lineRefs.current.set(i, el);
          else lineRefs.current.delete(i);
        }}
        className={`code-line ${i === currentMatchLine ? 'bg-warn/15' : ''}`}
      >
        <span className="inline-block w-12 select-none pr-3 text-right text-muted/60">{i + 1}</span>
        {content}
        {toks.length === 0 && ' '}
      </span>
    );
  };

  const doCopy = async (text: string, what: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
      toast(`${what} copied to the clipboard.`, 'success');
    } else toast('Could not access the clipboard. Select the code and press Ctrl+C instead.', 'error');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Language"
          value={lang}
          onChange={setLang}
          tabs={[
            { id: 'c', label: 'C' },
            { id: 'cpp', label: 'C++' },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={() => doCopy(shownText, sel.kind === 'all' ? 'Full source' : 'Selected code')} aria-label="Copy the code that is currently shown">
            {copied ? <Check className="h-4 w-4 text-good" /> : <Copy className="h-4 w-4" />}
            {sel.kind === 'all' ? 'Copy code' : 'Copy shown code'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              downloadTextFile(src.filename, src.text, src.mime);
              toast(`Downloaded ${src.filename}`, 'success');
            }}
          >
            <Download className="h-4 w-4" />
            Download {src.filename}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
        <nav aria-label="Code navigation" className="card card-pad !p-3 lg:max-h-[640px] lg:overflow-auto scroll-thin">
          <p className="panel-title mb-2 px-2">View</p>
          <button className={navCls(sel.kind === 'all')} onClick={() => setSel({ kind: 'all' })}>
            Complete implementation
          </button>
          {GROUPS.map((g) => {
            const fns = entries.filter((e) => e.group === g.id);
            if (!fns.length) return null;
            return (
              <div key={g.id} className="mt-3">
                <button className={`${navCls(sel.kind === 'group' && sel.id === g.id)} font-semibold`} onClick={() => setSel({ kind: 'group', id: g.id })}>
                  {g.label}
                </button>
                <div className="ml-3 border-l border-line pl-2">
                  {fns.map((f) => (
                    <button key={f.id} className={`${navCls(sel.kind === 'fn' && sel.id === f.id)} font-mono text-xs`} onClick={() => setSel({ kind: 'fn', id: f.id })}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-xl border border-line bg-bg">
            <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2">
              <span className="font-mono text-xs text-muted">{src.filename}</span>
              <span className="chip">{visibleLineIdx.length} lines shown</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden />
                  <input
                    className="input !min-h-[32px] !w-44 !py-1 !pl-8 text-xs"
                    placeholder="Search in code"
                    aria-label="Search in code"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && matches.length) setMatchIdx((i) => (e.shiftKey ? i - 1 + matches.length : i + 1) % matches.length);
                      if (e.key === 'Escape') setQuery('');
                    }}
                  />
                </div>
                {q && (
                  <>
                    <span className="text-xs text-muted" aria-live="polite">
                      {matches.length ? `${(matchIdx % matches.length) + 1}/${matches.length}` : 'No matches'}
                    </span>
                    <button className="btn btn-ghost btn-sm btn-icon" aria-label="Previous match" disabled={!matches.length} onClick={() => setMatchIdx((i) => (i - 1 + matches.length) % matches.length)}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon" aria-label="Next match" disabled={!matches.length} onClick={() => setMatchIdx((i) => (i + 1) % matches.length)}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon" aria-label="Clear search" onClick={() => setQuery('')}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <pre ref={preRef} className="scroll-thin max-h-[560px] overflow-auto py-3 text-[13px] leading-[1.65]" tabIndex={0} aria-label={`${src.label} source code`}>
              <code>
                {segments.map((seg, si) => (
                  <span key={si} className="block">
                    {si > 0 && <span className="code-line select-none text-muted/60">{'      ⋯'}</span>}
                    {Array.from({ length: seg.range.end - seg.range.start + 1 }, (_, k) => renderLine(seg.range.start + k))}
                  </span>
                ))}
              </code>
            </pre>
          </div>

          {doc && (
            <div className="card card-pad">
              <p className="panel-title mb-1">Explained for beginners</p>
              <h3 className="font-mono">{doc.title}</h3>
              <p className="mt-2 text-[15px] leading-7">
                <Inline text={doc.summary} />
              </p>
              <ol className="prose-lab !mt-2">
                {doc.steps.map((s, i) => (
                  <li key={i}>
                    <Inline text={s} />
                  </li>
                ))}
              </ol>
              {doc.why && (
                <p className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm">
                  <strong>Why it works: </strong>
                  <Inline text={doc.why} />
                </p>
              )}
              {lang === 'cpp' && doc.cppNote && (
                <p className="mt-3 rounded-lg border border-info/30 bg-info/10 p-3 text-sm">
                  <strong>In C++: </strong>
                  <Inline text={doc.cppNote} />
                </p>
              )}
              {doc.mistakes && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                  {doc.mistakes.map((m, i) => (
                    <li key={i}>
                      <span className="font-medium text-warn">Common mistake: </span>
                      <Inline text={m} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {!doc && (
            <div className="card card-pad">
              <p className="panel-title mb-2">Function-by-function explanation</p>
              <p className="mb-3 text-sm text-muted">Open any function for a beginner-friendly walkthrough, or select it in the list on the left to view just that code.</p>
              <div className="space-y-2">
                {entries.map((e) => {
                  const d = FUNCTION_DOCS[e.id];
                  if (!d) return null;
                  return (
                    <details key={e.id} className="group rounded-xl border border-line bg-bg px-3 py-2">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium">
                        <span className="font-mono">{e.label}</span>
                        <span className="hidden flex-1 truncate text-xs font-normal text-muted sm:block">{d.summary.replace(/[*`]/g, '')}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                      </summary>
                      <div className="pb-2 pt-2">
                        <p className="text-sm">
                          <Inline text={d.summary} />
                        </p>
                        <ul className="prose-lab !my-2 !text-sm">
                          {d.steps.map((s, i) => (
                            <li key={i}>
                              <Inline text={s} />
                            </li>
                          ))}
                        </ul>
                        {lang === 'cpp' && d.cppNote && (
                          <p className="text-sm text-muted">
                            <strong className="text-info">In C++: </strong>
                            <Inline text={d.cppNote} />
                          </p>
                        )}
                        <button className="btn btn-sm mt-1" onClick={() => setSel({ kind: 'fn', id: e.id })}>
                          View this function
                        </button>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function navCls(active: boolean) {
  return `block w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${active ? 'bg-accent/15 text-accent' : 'text-ink/80 hover:bg-raised'}`;
}
