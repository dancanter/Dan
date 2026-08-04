import { Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
import { SkipLink } from './components/a11y/SkipLink';
import { AppHeader } from './components/nav/AppHeader';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { TodayScreen } from './screens/TodayScreen';
import { BabyScreen } from './screens/BabyScreen';
import { BodyScreen } from './screens/BodyScreen';
import { HealthyScreen } from './screens/HealthyScreen';
import { AppointmentsScreen } from './screens/AppointmentsScreen';
import { GetHelpScreen } from './screens/GetHelpScreen';
import { JournalScreen } from './screens/JournalScreen';
import { SourcesScreen } from './screens/SourcesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { usePregnancyProfile } from './hooks/usePregnancyProfile';

function App() {
  const { isOnboarded } = usePregnancyProfile();
  const location = useLocation();
  const onOnboarding = location.pathname === '/';

  return (
    <div className="min-h-svh bg-paper">
      <SkipLink />
      {!onOnboarding && <AppHeader />}

      <Routes>
        <Route
          path="/"
          element={isOnboarded ? <Navigate to="/today" replace /> : <OnboardingScreen />}
        />
        <Route path="/today" element={<TodayScreen />} />
        <Route path="/baby" element={<BabyScreen />} />
        <Route path="/body" element={<BodyScreen />} />
        <Route path="/healthy" element={<HealthyScreen />} />
        <Route path="/appointments" element={<AppointmentsScreen />} />
        {/* Reachable with or without onboarding — someone worried should
            never hit a setup wall before the red-flag guidance. */}
        <Route path="/help" element={<GetHelpScreen />} />
        <Route path="/journal" element={<JournalScreen />} />
        <Route path="/sources" element={<SourcesScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!onOnboarding && (
        <footer className="mt-11 border-t-2 border-ink px-4 pb-10 pt-5">
          <div className="mx-auto max-w-[920px] font-mono text-[11px] leading-relaxed text-soft">
            <Link to="/settings" className="underline">
              Settings &amp; accessibility
            </Link>
            <p className="mt-3">
              © 2026 Dan Canter. Field Notes is an independent, evidence-based pregnancy guide — not
              a substitute for medical advice, and not clinically reviewed. Always speak to your
              midwife or GP about your own care.
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
