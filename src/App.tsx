import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
import { SkipLink } from './components/a11y/SkipLink';
import { AppHeader } from './components/nav/AppHeader';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { TodayScreen } from './screens/TodayScreen';
import { GetHelpScreen, UrgentDetailScreen, MaternityNumberScreen } from './screens/GetHelpScreen';
import { usePregnancyProfile } from './hooks/usePregnancyProfile';

// Onboarding, Today and Get Help load eagerly — the daily entry point and
// the screen someone might need urgently should never wait on a chunk.
// The reference-heavy screens are split out so the initial download stays
// small on a phone with a poor connection.
const BabyScreen = lazy(() =>
  import('./screens/BabyScreen').then((m) => ({ default: m.BabyScreen })),
);
const BodyScreen = lazy(() =>
  import('./screens/BodyScreen').then((m) => ({ default: m.BodyScreen })),
);
const HealthyScreen = lazy(() =>
  import('./screens/HealthyScreen').then((m) => ({ default: m.HealthyScreen })),
);
const AppointmentsScreen = lazy(() =>
  import('./screens/AppointmentsScreen').then((m) => ({
    default: m.AppointmentsScreen,
  })),
);
const JournalScreen = lazy(() =>
  import('./screens/JournalScreen').then((m) => ({ default: m.JournalScreen })),
);
const SourcesScreen = lazy(() =>
  import('./screens/SourcesScreen').then((m) => ({ default: m.SourcesScreen })),
);
const LossSupportScreen = lazy(() =>
  import('./screens/LossSupportScreen').then((m) => ({
    default: m.LossSupportScreen,
  })),
);
const PregnancyChangedScreen = lazy(() =>
  import('./screens/PregnancyChangedScreen').then((m) => ({
    default: m.PregnancyChangedScreen,
  })),
);
const ExploreScreen = lazy(() =>
  import('./screens/ExploreScreen').then((m) => ({ default: m.ExploreScreen })),
);
const GalleryScreen = lazy(() =>
  import('./screens/GalleryScreen').then((m) => ({ default: m.GalleryScreen })),
);
const PrivacyScreen = lazy(() =>
  import('./screens/PrivacyScreen').then((m) => ({ default: m.PrivacyScreen })),
);
const MovementsScreen = lazy(() =>
  import('./screens/MovementsScreen').then((m) => ({ default: m.MovementsScreen })),
);
const EquityScreen = lazy(() =>
  import('./screens/EquityScreen').then((m) => ({ default: m.EquityScreen })),
);
const MethodologyScreen = lazy(() =>
  import('./screens/MethodologyScreen').then((m) => ({
    default: m.MethodologyScreen,
  })),
);
const SettingsScreen = lazy(() =>
  import('./screens/SettingsScreen').then((m) => ({
    default: m.SettingsScreen,
  })),
);

function ScreenLoading() {
  return (
    <p role="status" className="mx-auto max-w-[780px] px-4 py-10 text-[15px] italic text-soft">
      Loading…
    </p>
  );
}

function App() {
  const { isOnboarded } = usePregnancyProfile();
  const location = useLocation();
  const onOnboarding = location.pathname === '/';

  return (
    <div className="min-h-svh bg-paper">
      <SkipLink />
      {!onOnboarding && <AppHeader />}

      <Suspense fallback={<ScreenLoading />}>
        <Routes>
          <Route
            path="/"
            element={isOnboarded ? <Navigate to="/today" replace /> : <OnboardingScreen />}
          />
          <Route path="/today" element={<TodayScreen />} />
          <Route path="/explore" element={<ExploreScreen />} />
          <Route path="/baby" element={<BabyScreen />} />
          <Route path="/body" element={<BodyScreen />} />
          <Route path="/healthy" element={<HealthyScreen />} />
          <Route path="/appointments" element={<AppointmentsScreen />} />
          {/* Reachable with or without onboarding — someone worried should
            never hit a setup wall before the red-flag guidance. */}
          <Route path="/help" element={<GetHelpScreen />} />
          {/* Eager, like /help itself — an urgent detail screen must never
            wait on a network fetch for its chunk. */}
          <Route path="/help/number" element={<MaternityNumberScreen />} />
          <Route path="/help/:symptomId" element={<UrgentDetailScreen />} />
          {/* Also ungated, and kept off every daily surface — see LossSupportScreen. */}
          <Route path="/loss" element={<LossSupportScreen />} />
          {/* Ungated too — half of it is what to do when you aren't listened to. */}
          <Route path="/inequalities" element={<EquityScreen />} />
          {/* Ungated: someone may reach this before ever completing setup. */}
          <Route path="/changed" element={<PregnancyChangedScreen />} />
          <Route path="/movements" element={<MovementsScreen />} />
          <Route path="/gallery" element={<GalleryScreen />} />
          <Route path="/privacy" element={<PrivacyScreen />} />
          <Route path="/journal" element={<JournalScreen />} />
          <Route path="/sources" element={<SourcesScreen />} />
          <Route path="/methodology" element={<MethodologyScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {!onOnboarding && (
        <footer className="mt-11 border-t-2 border-ink px-4 pb-10 pt-5">
          <div className="mx-auto max-w-[920px] font-mono text-[11px] leading-relaxed text-soft">
            <Link to="/methodology" className="underline">
              How this is built
            </Link>
            {' · '}
            <Link to="/inequalities" className="underline">
              Inequalities in maternity care
            </Link>
            {' · '}
            <Link to="/settings" className="underline">
              Settings &amp; accessibility
            </Link>
            {' · '}
            <Link to="/privacy" className="underline">
              Privacy
            </Link>
            <p className="mt-3">
              © 2026 Dan Canter. Field Notes is an independent, evidence-based pregnancy guide — not
              a substitute for medical advice, and not clinically reviewed.{' '}
              <strong>It cannot check whether you or your baby are well.</strong> Always contact
              your maternity unit if something feels wrong.
            </p>
            <p className="mt-2">
              Sourced from NHS, NICE, RCOG and SACN guidance plus named peer-reviewed research. Full
              references in{' '}
              <Link to="/sources" className="underline">
                Sources
              </Link>
              .
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
