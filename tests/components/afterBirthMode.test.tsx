import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodayScreen } from '../../src/screens/TodayScreen';
import { toISODate } from '../../src/lib/dates';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

const PROFILE_KEY = 'fieldnotes:profile';

function setProfile(profile: Record<string, unknown>) {
  window.localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      dueDate: null,
      birthDate: null,
      babyName: null,
      firstPregnancy: true,
      ...profile,
    }),
  );
  // usePersistedState keeps a module-level cache shared across the whole app,
  // so nudge it the same way a second window would.
  window.dispatchEvent(new StorageEvent('storage', { key: PROFILE_KEY }));
}

/** Writes a profile verbatim, without filling in any missing fields. */
function setRawProfile(profile: Record<string, unknown>) {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new StorageEvent('storage', { key: PROFILE_KEY }));
}

describe('onboarding asks for as little as possible', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });

  it('asks only for a due date, and never gates Get Help behind it', async () => {
    const { OnboardingScreen } = await import('../../src/screens/OnboardingScreen');
    const { container } = render(
      <MemoryRouter>
        <OnboardingScreen />
      </MemoryRouter>,
    );
    const text = container.textContent ?? '';
    // The first-pregnancy question moved to Appointments, where it is the
    // first thing that actually changes what someone sees.
    expect(text).not.toContain('Is this your first pregnancy?');
    expect(screen.getByRole('link', { name: /get help/i })).toBeDefined();
  });
});

describe('the daily screen through the phases', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });

  // This shipped broken: a profile saved before `birthDate` existed read back
  // as `undefined`, `undefined !== null` was true, and every existing user was
  // thrown into after-birth mode being told their baby was 0 days old.
  it('leaves a profile saved before birthDate existed in pregnancy mode', () => {
    setRawProfile({ dueDate: daysFromNow(60), babyName: null, firstPregnancy: true });
    render(
      <MemoryRouter>
        <TodayScreen />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Week');
    expect(screen.queryByText(/days old/)).toBeNull();
  });

  it('surfaces birth prep as the due date approaches', () => {
    // ~38 weeks: due in a fortnight.
    setProfile({ dueDate: daysFromNow(14) });
    render(
      <MemoryRouter>
        <TodayScreen />
      </MemoryRouter>,
    );
    expect(screen.getByText('Worth reading now')).toBeDefined();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Week 38');
    expect(screen.getByRole('button', { name: /Baby arrived/i })).toBeDefined();
  });

  it('does not offer after-birth mode in early pregnancy', () => {
    setProfile({ dueDate: daysFromNow(200) });
    render(
      <MemoryRouter>
        <TodayScreen />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button', { name: /Baby arrived/i })).toBeNull();
  });

  it('switches the same route over to after-birth mode once a birth date is set', () => {
    setProfile({
      dueDate: daysFromNow(-7),
      birthDate: daysFromNow(-10),
      babyName: 'Robin',
    });
    render(
      <MemoryRouter>
        <TodayScreen />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Robin is 10 days old');
    // Pregnancy furniture is gone…
    expect(screen.queryByText('This week’s focus')).toBeNull();
    // …and the postnatal surfaces are there instead.
    expect(screen.getByText('How are you doing?')).toBeDefined();
    expect(screen.getByText(/If something feels wrong/)).toBeDefined();
  });

  it('counts in weeks rather than days once a baby is over a fortnight old', () => {
    setProfile({ dueDate: daysFromNow(-30), birthDate: daysFromNow(-30) });
    render(
      <MemoryRouter>
        <TodayScreen />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Your baby is 4 weeks old');
  });
});
