import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppHeader } from '../../src/components/nav/AppHeader';

/**
 * The tab bar scrolls sideways on a phone, so the order is not cosmetic: a
 * tab far enough along is simply not on screen until you know to scroll.
 *
 * Get Help was sixth and was measured 0% visible on arrival at 320px, 29% at
 * 375px and 50% at 390px. jsdom has no layout, so it cannot measure that
 * directly — what it can hold is the order that makes it impossible.
 */

function show() {
  return render(
    <MemoryRouter>
      <AppHeader />
    </MemoryRouter>,
  );
}

function setProfile(birthDate: string | null) {
  window.localStorage.clear();
  window.localStorage.setItem(
    'fieldnotes:profile',
    JSON.stringify({ dueDate: '2027-01-01', birthDate, babyName: null, firstPregnancy: true }),
  );
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
}

const tabLabels = () =>
  within(screen.getByRole('navigation', { name: 'Sections' }))
    .getAllByRole('link')
    .map((a) => a.textContent);

describe('Get Help in the tab bar', () => {
  beforeEach(() => setProfile(null));

  it('comes straight after Home, so it is on screen without scrolling', () => {
    show();
    expect(tabLabels().slice(0, 2)).toEqual(['Home', 'Get Help']);
  });

  it('stays second after the baby arrives, when other tabs drop out', () => {
    setProfile('2026-08-01');
    show();
    expect(tabLabels()[1]).toBe('Get Help');
  });

  it('points at the urgent screen', () => {
    show();
    expect(screen.getByRole('link', { name: 'Get Help' })).toHaveAttribute('href', '/help');
  });
});

describe('the health library tab', () => {
  beforeEach(() => setProfile(null));

  it('is called Health, which is what people look for', () => {
    show();
    expect(screen.getByRole('link', { name: 'Health' })).toHaveAttribute('href', '/healthy');
  });
});
