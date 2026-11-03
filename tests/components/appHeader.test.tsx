import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppHeader } from '../../src/components/nav/AppHeader';

/**
 * The tab bar scrolls sideways on a phone, so the order is not cosmetic: a
 * tab far enough along is simply not on screen until you know to scroll.
 *
 * Get Help was sixth inside the scroll and was measured 0% visible at 320px,
 * 29% at 375px and 50% at 390px. jsdom has no layout, so it cannot measure that
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

  it('follows the order Dan set: Home, Baby, Health, Appointments, Journal, then Get Help', () => {
    show();
    const labels = tabLabels();
    expect(labels.slice(0, 5)).toEqual(['Home', 'Baby', 'Health', 'Appointments', 'Journal']);
    expect(labels[labels.length - 1]).toBe('Get Help');
  });

  it('sits outside the part of the bar that scrolls, so it can never scroll out of sight', () => {
    // When Get Help was sixth *inside* the scroll it was measured 0% visible
    // at 320px. Being last is fine; being last inside the scroll is not.
    const { container } = show();
    const scroller = container.querySelector('[data-tab-scroll]')!;
    const help = screen.getByRole('link', { name: 'Get Help' });
    expect(scroller).not.toBeNull();
    expect(scroller.contains(help)).toBe(false);
  });

  it('is still there, and still pinned, after the baby arrives', () => {
    setProfile('2026-08-01');
    const { container } = show();
    const help = screen.getByRole('link', { name: 'Get Help' });
    expect(container.querySelector('[data-tab-scroll]')!.contains(help)).toBe(false);
  });

  it('points at the urgent screen', () => {
    show();
    expect(screen.getByRole('link', { name: 'Get Help' })).toHaveAttribute('href', '/help');
  });

  it('keeps My Body and Sources rather than dropping them', () => {
    show();
    expect(tabLabels()).toEqual(expect.arrayContaining(['My Body', 'Sources']));
  });
});

describe('the health library tab', () => {
  beforeEach(() => setProfile(null));

  it('is called Health, which is what people look for', () => {
    show();
    expect(screen.getByRole('link', { name: 'Health' })).toHaveAttribute('href', '/healthy');
  });
});
