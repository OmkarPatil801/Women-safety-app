import { Link } from 'react-router-dom';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 !text-ink no-underline" aria-label="AVL LAB home">
      <svg width="36" height="36" viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <rect width="32" height="32" rx="9" fill="rgb(var(--c-raised))" />
        <path d="M16 9 9 21M16 9l7 12" stroke="rgb(var(--c-accent))" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="16" cy="9" r="4.2" fill="rgb(var(--c-accent))" />
        <circle cx="9" cy="22" r="3.6" fill="rgb(var(--c-info))" />
        <circle cx="23" cy="22" r="3.6" fill="rgb(var(--c-info))" />
      </svg>
      <span className="leading-tight">
        <span className="block text-base font-bold tracking-wide">AVL LAB</span>
        {!compact && <span className="block text-[11px] text-muted">Understand the balance.<br />Master the rotations.</span>}
      </span>
    </Link>
  );
}
