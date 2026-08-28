import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
import { SkipLink } from './components/a11y/SkipLink';
import { ErrorBoundary } from './components/a11y/ErrorBoundary';
import { AppHeader } from './components/nav/AppHeader';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { TodayScreen } from './screens/TodayScreen';
import { GetHelpScreen, UrgentDetailScreen, MaternityNumberScreen } from './screens/GetHelpScreen';
import { usePregnancyProfile } from './hooks/usePregnancyProfile';
import { lazyRoute } from './lib/lazyRoute';
import { useAccessibilitySettings } from './hooks/useAccessibilitySettings';

// Onboarding, Today and Get Help load eagerly — the daily entry point and
// the screen someone might need urgently should never wait on a chunk.
// The reference-heavy screens are split out so the initial download stays
// small on a phone with a poor connection.
const BabyScreen = lazyRoute('BabyScreen', () =>
  import('./screens/BabyScreen').then((m) => ({ default: m.BabyScreen })),
);
const BodyScreen = lazyRoute('BodyScreen', () =>
  import('./screens/BodyScreen').then((m) => ({ default: m.BodyScreen })),
);
const HealthyScreen = lazyRoute('HealthyScreen', () =>
  import('./screens/HealthyScreen').then((m) => ({ default: m.HealthyScreen })),
);
const AppointmentsScreen = lazyRoute('AppointmentsScreen', () =>
  import('./screens/AppointmentsScreen').then((m) => ({ default: m.AppointmentsScreen })),
);
const JournalScreen = lazyRoute('JournalScreen', () =>
  import('./screens/JournalScreen').then((m) => ({ default: m.JournalScreen })),
);
const SourcesScreen = lazyRoute('SourcesScreen', () =>
  import('./screens/SourcesScreen').then((m) => ({ default: m.SourcesScreen })),
);
const LossSupportScreen = lazyRoute('LossSupportScreen', () =>
  import('./screens/LossSupportScreen').then((m) => ({ default: m.LossSupportScreen })),
);
const PregnancyChangedScreen = lazyRoute('PregnancyChangedScreen', () =>
  import('./screens/PregnancyChangedScreen').then((m) => ({ default: m.PregnancyChangedScreen })),
);
const ExploreScreen = lazyRoute('ExploreScreen', () =>
  import('./screens/ExploreScreen').then((m) => ({ default: m.ExploreScreen })),
);
const GalleryScreen = lazyRoute('GalleryScreen', () =>
  import('./screens/GalleryScreen').then((m) => ({ default: m.GalleryScreen })),
);
const PrivacyScreen = lazyRoute('PrivacyScreen', () =>
  import('./screens/PrivacyScreen').then((m) => ({ default: m.PrivacyScreen })),
);
const MovementsScreen = lazyRoute('MovementsScreen', () =>
  import('./screens/MovementsScreen').then((m) => ({ default: m.MovementsScreen })),
);
const MythsScreen = lazyRoute('MythsScreen', () =>
  import('./screens/MythsScreen').then((m) => ({ default: m.MythsScreen })),
);
const FoodSortScreen = lazyRoute('FoodSortScreen', () =>
  import('./screens/FoodSortScreen').then((m) => ({ default: m.FoodSortScreen })),
);
const TermsScreen = lazyRoute('TermsScreen', () =>
  import('./screens/TermsScreen').then((m) => ({ default: m.TermsScreen })),
);
const CalmScreen = lazyRoute('CalmScreen', () =>
  import('./screens/CalmScreen').then((m) => ({ default: m.CalmScreen })),
);
const EquityScreen = lazyRoute('EquityScreen', () =>
  import('./screens/EquityScreen').then((m) => ({ default: m.EquityScreen })),
);
const MethodologyScreen = lazyRoute('MethodologyScreen', () =>
  import('./screens/MethodologyScreen').then((m) => ({ default: m.MethodologyScreen })),
);
const SettingsScreen = lazyRoute('SettingsScreen', () =>
  import('./screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen })),
);

function ScreenLoading() {
  return (
    <p role="status" className="mx-auto max-w-[780px] px-4 py-10 text-[0.9375rem] italic text-soft">
      Loading…
    </p>
  );
}

function App() {
  const { isOnboarded } = usePregnancyProfile();
  const location = useLocation();
  const onOnboarding = location.pathname === '/';

  // Called here so the text size and contrast settings apply everywhere.
  // Before this, the hook that writes them ran only on the four screens that
  // happened to need one of its other values — so someone who turned the text
  // up got larger text on Settings and Today, and default text on Get help.
  useAccessibilitySettings();

  return (
    <div className="min-h-svh bg-paper">
      <SkipLink />
      {!onOnboarding && <AppHeader />}

      {/* Keyed on the path so navigating away from a screen that threw clears
          the failure, rather than pinning the whole app to one broken route. */}
      <ErrorBoundary key={location.pathname}>
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
            {/* Ungated too. Someone can arrive here having never set a due
              date, and the page routes a crisis away from itself first. */}
            <Route path="/minute" element={<CalmScreen />} />
            <Route path="/myths" element={<MythsScreen />} />
            <Route path="/food-sort" element={<FoodSortScreen />} />
            <Route path="/terms" element={<TermsScreen />} />
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
      </ErrorBoundary>

      {!onOnboarding && (
        <footer className="mt-11 border-t-2 border-ink px-4 pb-10 pt-5">
          <div className="mx-auto max-w-[920px] font-mono text-[0.6875rem] leading-relaxed text-soft">
            {/* Laid out as a list of 44px rows rather than a run of inline
                links separated by dots. Measured at 13px tall before this —
                a target you have to aim at, on the screen someone reaches for
                one-handed and tired. */}
            <ul className="m-0 flex list-none flex-wrap gap-x-4 p-0">
              {[
                ['/explore', 'Everything in the app'],
                ['/methodology', 'How this is built'],
                ['/inequalities', 'Inequalities in maternity care'],
                ['/settings', 'Settings & accessibility'],
                ['/privacy', 'Privacy'],
              ].map(([to, label]) => (
                <li key={to} className="min-w-0">
                  <Link to={to} className="flex min-h-11 items-center underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
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
