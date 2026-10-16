import { MotionConfig } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProgressProvider } from './hooks/useProgress';
import { SettingsProvider, useSettings } from './hooks/useSettings';
import { ToastProvider } from './hooks/useToast';
import { HomePage } from './pages/HomePage';

// Heavier pages are code-split so the first load stays small.
const LearnPage = lazy(() => import('./pages/LearnPage'));
const VisualizerPage = lazy(() => import('./pages/VisualizerPage'));
const RotationsPage = lazy(() => import('./pages/RotationsPage'));
const AlgorithmsPage = lazy(() => import('./pages/AlgorithmsPage'));
const CImplementationPage = lazy(() => import('./pages/CImplementationPage'));
const CppImplementationPage = lazy(() => import('./pages/CppImplementationPage'));
const ComplexityPage = lazy(() => import('./pages/ComplexityPage'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function Loading() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-muted" role="status">
      Loading…
    </div>
  );
}

function Motion({ children }: { children: React.ReactNode }) {
  const { animations } = useSettings();
  return <MotionConfig reducedMotion={animations ? 'user' : 'always'}>{children}</MotionConfig>;
}

export function App() {
  return (
    <SettingsProvider>
      <Motion>
        <ToastProvider>
          <ProgressProvider>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route element={<AppShell />}>
                  <Route index element={<HomePage />} />
                  <Route path="learn" element={<LearnPage />} />
                  <Route path="learn/:lessonId" element={<LearnPage />} />
                  <Route path="visualizer" element={<VisualizerPage />} />
                  <Route path="rotations" element={<RotationsPage />} />
                  <Route path="algorithms" element={<AlgorithmsPage />} />
                  <Route path="c" element={<CImplementationPage />} />
                  <Route path="cpp" element={<CppImplementationPage />} />
                  <Route path="complexity" element={<ComplexityPage />} />
                  <Route path="practice" element={<PracticePage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </ProgressProvider>
        </ToastProvider>
      </Motion>
    </SettingsProvider>
  );
}
