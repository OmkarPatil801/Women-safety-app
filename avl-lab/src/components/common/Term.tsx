import { useId, useState, type ReactNode } from 'react';
import { glossaryMap } from '../../features/lessons/glossary';

/** Inline technical term with an accessible tooltip (hover, focus or tap). */
export function Term({ children, term }: { children: ReactNode; term?: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const label = term ?? (typeof children === 'string' ? children : '');
  const entry = glossaryMap.get(label.toLowerCase());
  if (!entry) return <>{children}</>;
  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="cursor-help border-b border-dotted border-accent text-inherit"
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        {children}
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="card absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 p-3 text-left text-xs font-normal leading-5 text-ink shadow-xl"
        >
          <strong className="block text-accent">{entry.term}</strong>
          {entry.short}
        </span>
      )}
    </span>
  );
}
