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
import { MethodologyScreen } from '../../src/screens/MethodologyScreen';
import { SettingsScreen } from '../../src/screens/SettingsScreen';

function setOnboarded() {
  window.localStorage.setItem(
    'fieldnotes:profile',
    JSON.stringify({ dueDate: '2027-01-01', babyName: null, firstPregnancy: true }),
  );
}

const SCREENS: [string, () => React.ReactElement][] = [
  ['Onboarding', () => <OnboardingScreen />],
  ['Today', () => <TodayScreen />],
  ['Baby', () => <BabyScreen />],
  ['My Body', () => <BodyScreen />],
  ['Healthy Pregnancy', () => <HealthyScreen />],
  ['Appointments', () => <AppointmentsScreen />],
  ['Get Help', () => <GetHelpScreen />],
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
