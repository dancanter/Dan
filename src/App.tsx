import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SkipLink } from './components/a11y/SkipLink';
import { BottomTabBar } from './components/nav/BottomTabBar';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { TodayScreen } from './screens/TodayScreen';
import { WeekTimelineScreen } from './screens/WeekTimelineScreen';
import { WeekDetailScreen } from './screens/WeekDetailScreen';
import { ArticleScreen } from './screens/ArticleScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { JournalScreen } from './screens/JournalScreen';
import { AppointmentsScreen } from './screens/AppointmentsScreen';
import { SavedScreen } from './screens/SavedScreen';
import { usePregnancyProfile } from './hooks/usePregnancyProfile';

function App() {
  const { isOnboarded } = usePregnancyProfile();
  const location = useLocation();
  const showTabBar = isOnboarded && location.pathname !== '/';

  return (
    <div className="min-h-svh bg-bump-bg dark:bg-bump-bg-dark">
      <SkipLink />
      <Routes>
        <Route
          path="/"
          element={isOnboarded ? <Navigate to="/today" replace /> : <OnboardingScreen />}
        />
        <Route path="/today" element={<TodayScreen />} />
        <Route path="/weeks" element={<WeekTimelineScreen />} />
        <Route path="/weeks/:weekNumber" element={<WeekDetailScreen />} />
        <Route path="/article/:articleId" element={<ArticleScreen />} />
        <Route path="/journal" element={<JournalScreen />} />
        <Route path="/appointments" element={<AppointmentsScreen />} />
        <Route path="/saved" element={<SavedScreen />} />
        <Route path="/progress" element={<ProgressScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showTabBar && <BottomTabBar />}
    </div>
  );
}

export default App;
