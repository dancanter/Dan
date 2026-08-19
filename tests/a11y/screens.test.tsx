import { describe, expect, it, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
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
});
