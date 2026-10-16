import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

export type Theme = 'dark' | 'light';
interface Settings {
  theme: Theme;
  /** false = animations disabled/reduced everywhere. */
  animations: boolean;
  showMetrics: boolean;
}
interface SettingsApi extends Settings {
  toggleTheme: () => void;
  setAnimations: (v: boolean) => void;
  setShowMetrics: (v: boolean) => void;
}

const KEY = 'avl-lab:settings:v1';
const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const defaults = (): Settings => ({ theme: 'dark', animations: !prefersReduced(), showMetrics: true });

const Ctx = createContext<SettingsApi | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(() => ({ ...defaults(), ...readStorage<Partial<Settings>>(KEY, {}) }));

  useEffect(() => {
    document.documentElement.dataset.theme = s.theme;
    document.documentElement.dataset.motion = s.animations ? 'on' : 'off';
    writeStorage(KEY, s);
  }, [s]);

  const toggleTheme = useCallback(() => setS((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' })), []);
  const setAnimations = useCallback((animations: boolean) => setS((p) => ({ ...p, animations })), []);
  const setShowMetrics = useCallback((showMetrics: boolean) => setS((p) => ({ ...p, showMetrics })), []);
  const value = useMemo(() => ({ ...s, toggleTheme, setAnimations, setShowMetrics }), [s, toggleTheme, setAnimations, setShowMetrics]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSettings must be used inside SettingsProvider');
  return v;
}
