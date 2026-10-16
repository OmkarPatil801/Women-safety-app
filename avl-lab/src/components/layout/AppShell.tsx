import { Menu, Moon, Sparkles, Sun, X, Zap, ZapOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useProgress } from '../../hooks/useProgress';
import { useSettings } from '../../hooks/useSettings';
import { NAV_ITEMS, type NavItem } from './nav';
import { Logo } from './Logo';

const TITLES: Record<string, string> = Object.fromEntries(NAV_ITEMS.map((n) => [n.to, n.label]));

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item: NavItem, i) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-accent/15 text-accent' : 'text-ink/80 hover:bg-raised hover:text-ink'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              <span className="flex-1">{item.label}</span>
              <span className={`text-[10px] tabular-nums ${isActive ? 'text-accent' : 'text-muted'}`} aria-hidden>
                {i + 1}
              </span>
              {isActive && <span className="sr-only">(current section)</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SettingsRow() {
  const { theme, toggleTheme, animations, setAnimations } = useSettings();
  return (
    <div className="flex gap-2">
      <button className="btn btn-sm flex-1" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
      <button className="btn btn-sm flex-1" onClick={() => setAnimations(!animations)} aria-pressed={!animations} aria-label={animations ? 'Reduce animations' : 'Enable animations'}>
        {animations ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
        {animations ? 'Reduce motion' : 'Animations off'}
      </button>
    </div>
  );
}

function MiniProgress() {
  const { stats } = useProgress();
  return (
    <div className="rounded-xl border border-line bg-bg p-3 text-xs text-muted" aria-label="Your progress">
      <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-ink">
        <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden /> Your progress
      </div>
      <div className="grid grid-cols-3 gap-1 text-center">
        <div><div className="text-base font-semibold text-ink">{stats.lessonsDone}</div>lessons</div>
        <div><div className="text-base font-semibold text-ink">{stats.rotationsDone}/4</div>rotations</div>
        <div><div className="text-base font-semibold text-ink">{stats.accuracy === null ? '–' : `${stats.accuracy}%`}</div>quiz</div>
      </div>
    </div>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
    const base = '/' + (pathname.split('/')[1] ?? '');
    const t = TITLES[base] ?? 'AVL LAB';
    document.title = base === '/' ? 'AVL LAB — Understand the balance. Master the rotations.' : `${t} · AVL LAB`;
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-[rgb(var(--c-on-accent))]">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside aria-label="Sidebar" className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-5 overflow-y-auto border-r border-line bg-surface p-4 lg:flex scroll-thin">
        <Logo />
        <NavList />
        <div className="mt-auto space-y-3">
          <MiniProgress />
          <SettingsRow />
        </div>
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <Logo compact />
        <button className="btn btn-icon" onClick={() => setOpen(true)} aria-label="Open navigation menu" aria-expanded={open}>
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col gap-5 overflow-y-auto bg-surface p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button className="btn btn-ghost btn-icon" onClick={() => setOpen(false)} aria-label="Close navigation menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <div className="mt-auto space-y-3">
              <MiniProgress />
              <SettingsRow />
            </div>
          </div>
        </div>
      )}

      <main id="main" className="lg:pl-64" tabIndex={-1}>
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
