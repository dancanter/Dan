import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { UrgentDetailScreen } from '../../src/screens/GetHelpScreen';
import { OnboardingScreen } from '../../src/screens/OnboardingScreen';
import { TodayScreen } from '../../src/screens/TodayScreen';
import { BabyScreen } from '../../src/screens/BabyScreen';
import { BodyScreen } from '../../src/screens/BodyScreen';
import { HealthyScreen } from '../../src/screens/HealthyScreen';
import { AppointmentsScreen } from '../../src/screens/AppointmentsScreen';
import { GetHelpScreen } from '../../src/screens/GetHelpScreen';
import { JournalScreen } from '../../src/screens/JournalScreen';
import { SourcesScreen } from '../../src/screens/SourcesScreen';
import { LossSupportScreen } from '../../src/screens/LossSupportScreen';
import { MethodologyScreen } from '../../src/screens/MethodologyScreen';
import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { AfterBirthScreen } from '../../src/screens/AfterBirthScreen';
import { EquityScreen } from '../../src/screens/EquityScreen';
import { MovementsScreen } from '../../src/screens/MovementsScreen';
import { PregnancyChangedScreen } from '../../src/screens/PregnancyChangedScreen';
import { AfterLossHomeScreen } from '../../src/screens/AfterLossHomeScreen';
import { MaternityNumberScreen } from '../../src/screens/GetHelpScreen';
import { PrivacyScreen } from '../../src/screens/PrivacyScreen';
import { GalleryScreen } from '../../src/screens/GalleryScreen';
import { ExploreScreen } from '../../src/screens/ExploreScreen';

function setOnboarded() {
  window.localStorage.setItem(
    'fieldnotes:profile',
    JSON.stringify({
      dueDate: '2027-01-01',
      babyName: null,
      firstPregnancy: true,
    }),
  );
  // usePersistedState keeps a module-level cache, and jsdom fires no
  // StorageEvent for same-window writes — so without this the cache from the
  // first test survives every clear() and later tests silently read stale
  // state. It passes today only because every test writes the same profile.
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
}

const SCREENS: [string, () => React.ReactElement][] = [
  ['Onboarding', () => <OnboardingScreen />],
  ['Today', () => <TodayScreen />],
  ['Explore', () => <ExploreScreen />],
  ['After birth', () => <AfterBirthScreen />],
  ['Baby', () => <BabyScreen />],
  ['My Body', () => <BodyScreen />],
  ['Healthy Pregnancy', () => <HealthyScreen />],
  ['Appointments', () => <AppointmentsScreen />],
  ['Get Help', () => <GetHelpScreen />],
  ['Maternity number', () => <MaternityNumberScreen />],
  ['Movement journal', () => <MovementsScreen />],
  ['Bump gallery', () => <GalleryScreen />],
  ['Privacy', () => <PrivacyScreen />],
  ['Pregnancy changed', () => <PregnancyChangedScreen />],
  ['Support after loss', () => <AfterLossHomeScreen />],
  ['Loss support', () => <LossSupportScreen />],
  ['Inequalities', () => <EquityScreen />],
  ['Journal', () => <JournalScreen />],
  ['Sources', () => <SourcesScreen />],
  ['Methodology', () => <MethodologyScreen />],
  ['Settings', () => <SettingsScreen />],
];

describe('accessibility', () => {
  beforeEach(() => {
    window.localStorage.clear();
    setOnboarded();
  });

  it.each(SCREENS)('%s has no axe violations', async (_name, Screen) => {
    const { container } = render(<MemoryRouter>{Screen()}</MemoryRouter>);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  // The screen someone reaches while frightened was the one screen missing
  // from the list above — and it is the only one carrying the glossary
  // buttons and the read-aloud control.
  it('the urgent detail screen has no axe violations', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/help/bleeding']}>
        <Routes>
          <Route path="/help/:symptomId" element={<UrgentDetailScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});

describe('focus on arrival', () => {
  beforeEach(() => {
    window.localStorage.clear();
    setOnboarded();
  });

  // Eight screens used to call useAutoFocusHeading and drop the returned ref,
  // so the effect ran and focused nothing — a keyboard user landed on the new
  // screen still focused wherever they had been on the old one. ScreenTitle
  // owns this now, so the failure mode of "forgot to attach the ref" cannot
  // come back. These are the screens that used to be broken.
  const TITLED: [string, () => React.ReactElement][] = SCREENS.filter(([name]) =>
    ['Explore', 'Healthy Pregnancy', 'Appointments', 'Journal', 'Sources', 'Settings'].includes(
      name,
    ),
  );

  it.each(TITLED)('%s moves focus to its heading', (_name, Screen) => {
    render(<MemoryRouter>{Screen()}</MemoryRouter>);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(document.activeElement).toBe(heading);
  });
});
