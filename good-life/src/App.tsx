import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from '@/store/store';
import { useApplyTheme } from '@/hooks/useTheme';
import { Shell } from '@/components/Shell';
import { Onboarding } from '@/features/Onboarding';
import { mergeStartingProfile } from '@/lib/backup';
import { clearLinkImport, hasLinkImport, readLinkImport } from '@/lib/linkImport';

const Today = lazy(() => import('@/features/Today'));
const Performance = lazy(() => import('@/features/Performance'));
const Physique = lazy(() => import('@/features/Physique'));
const Nutrition = lazy(() => import('@/features/Nutrition'));
const Health = lazy(() => import('@/features/Health'));
const Recovery = lazy(() => import('@/features/Recovery'));
const University = lazy(() => import('@/features/University'));
const Style = lazy(() => import('@/features/Style'));
const Vinted = lazy(() => import('@/features/Vinted'));
const Culture = lazy(() => import('@/features/Culture'));
const Lifestyle = lazy(() => import('@/features/Lifestyle'));
const Analytics = lazy(() => import('@/features/Analytics'));
const Coach = lazy(() => import('@/features/Coach'));
const Settings = lazy(() => import('@/features/Settings'));

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-lg p-8">
        <h1 className="font-serif text-3xl">Something went wrong on this screen.</h1>
        <p className="mt-2 text-ink-2">Your data is safe — it is stored separately from this screen. Try reloading, or go back to Today.</p>
        <pre className="mt-4 overflow-auto rounded-xl bg-surface-2 p-3 text-xs">{this.state.error.message}</pre>
        <div className="mt-4 flex gap-2">
          <button className="rounded-full bg-navy px-4 py-2 text-sm text-navy-ink" onClick={() => location.reload()}>Reload</button>
          <a className="rounded-full border border-line-strong px-4 py-2 text-sm" href="#/" onClick={() => this.setState({ error: null })}>Today</a>
        </div>
      </div>
    );
  }
}

function Loading() {
  return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading…</div>;
}

/** Loads a starting profile carried in the link (see lib/linkImport). */
function useLinkImport(hydrated: boolean) {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>(() => (hasLinkImport() ? 'loading' : 'idle'));
  const [error, setError] = useState('');
  useEffect(() => {
    if (!hydrated || state !== 'loading') return;
    (async () => {
      try {
        const incoming = await readLinkImport();
        const { data, replaceAll } = useStore.getState();
        if (data.settings.onboarded && !confirm('Load the starting profile from this link into your data? Your logs are kept.')) {
          clearLinkImport();
          setState('idle');
          return;
        }
        replaceAll({ ...mergeStartingProfile(data, incoming), settings: { ...data.settings, ...(incoming.settings ?? {}), onboarded: true } });
        const runs = incoming.runs?.length ? `, with ${incoming.runs.length} runs from Strava` : '';
        useStore.getState().setNotice(`Your starting profile is loaded${runs}. What you log from here on is what makes the coaching personal.`);
        clearLinkImport();
        setState('idle');
      } catch (e) {
        setError((e as Error).message);
        clearLinkImport();
        setState('error');
      }
    })();
  }, [hydrated, state]);
  return { state, error, dismiss: () => setState('idle') };
}

export function App() {
  useApplyTheme();
  const hydrated = useStore((s) => s.hydrated);
  const onboarded = useStore((s) => s.data.settings.onboarded);
  const link = useLinkImport(hydrated);
  if (link.state === 'loading') return <div className="grid min-h-dvh place-items-center font-serif text-2xl italic text-muted">Loading your profile…</div>;
  if (link.state === 'error') {
    return (
      <div className="mx-auto max-w-lg p-8">
        <h1 className="font-serif text-3xl">That profile link didn’t work.</h1>
        <p className="mt-2 text-ink-2">{link.error} The link may have been cut short when copied — try opening it again from the original message.</p>
        <button className="mt-4 rounded-full bg-navy px-4 py-2 text-sm text-navy-ink" onClick={link.dismiss}>Continue without it</button>
      </div>
    );
  }
  if (!hydrated) return <div className="grid min-h-dvh place-items-center font-serif text-2xl italic text-muted">The Good Life</div>;
  if (!onboarded) return <Onboarding />;
  return (
    <HashRouter>
      <Shell>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Today />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/physique" element={<Physique />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/health" element={<Health />} />
              <Route path="/recovery" element={<Recovery />} />
              <Route path="/university" element={<University />} />
              <Route path="/style" element={<Style />} />
              <Route path="/vinted" element={<Vinted />} />
              <Route path="/culture" element={<Culture />} />
              <Route path="/lifestyle" element={<Lifestyle />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/coach" element={<Coach />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Shell>
    </HashRouter>
  );
}
