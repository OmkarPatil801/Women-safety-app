import { Check, Copy } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { copyText } from '../../utils/download';
import { tokenizeSource } from './highlight';

interface CodeBlockProps {
  code: string;
  lang?: 'c' | 'cpp' | 'text';
  title?: string;
  /** 0-based line indexes to emphasise. */
  highlightLines?: number[];
  showLineNumbers?: boolean;
  startLine?: number;
  maxHeight?: string;
  className?: string;
}

export const CodeBlock = memo(function CodeBlock({ code, lang = 'c', title, highlightLines, showLineNumbers = true, startLine = 1, maxHeight, className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const lines = useMemo(() => (lang === 'text' ? code.split('\n').map((l) => [{ text: l }]) : tokenizeSource(code)), [code, lang]);
  const hl = new Set(highlightLines);

  return (
    <figure className={`overflow-hidden rounded-xl border border-line bg-bg ${className}`}>
      <figcaption className="flex items-center justify-between border-b border-line bg-surface px-3 py-1.5 text-xs text-muted">
        <span className="font-mono">{title ?? (lang === 'text' ? 'text' : lang === 'c' ? 'C' : 'C++')}</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={async () => {
            const ok = await copyText(code);
            setCopied(ok);
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setCopied(false), 1600);
          }}
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-good" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre className="scroll-thin overflow-auto py-3 text-[13px] leading-[1.65]" style={{ maxHeight }} tabIndex={0} aria-label={title ? `${title} source code` : 'Code'}>
        <code>
          {lines.map((tokens, i) => (
            <span key={i} className={`code-line ${hl.has(i) ? 'bg-accent/15' : ''}`}>
              {showLineNumbers && <span className="inline-block w-10 select-none pr-3 text-right text-muted">{startLine + i}</span>}
              {tokens.map((t, j) => (
                <span key={j} className={'cls' in t && t.cls ? `tok-${t.cls}` : undefined}>
                  {t.text}
                </span>
              ))}
              {tokens.length === 0 && ' '}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
});
