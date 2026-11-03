import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HealthyScreen } from '../../src/screens/HealthyScreen';
import { EntitlementsScreen } from '../../src/screens/EntitlementsScreen';
import { GUIDE_PHASES } from '../../src/content';
import { entitlementTimings } from '../../src/content/entitlements';

/**
 * What is open when you arrive.
 *
 * Measured on a 390px phone: Guidance ran 12.6 screens of scroll and the
 * pregnancy phase alone was 5,941px, all four phases expanded at once.
 * Money and deadlines ran 7.5 screens, with a screen and a half of gone
 * deadlines sitting above the things still ahead.
 *
 * The rule these tests hold is narrow and worth stating: folding is not
 * cutting. Every entry is still on the page, still findable by search, and
 * still one tap away. What changed is how much of it arrives at once.
 */

function seed(week: number | null, birthDate: string | null = null) {
  window.localStorage.clear();
  if (week !== null || birthDate) {
    const due = new Date();
    if (week !== null) due.setDate(due.getDate() + (40 - week) * 7);
    window.localStorage.setItem(
      'fieldnotes:profile',
      JSON.stringify({
        dueDate: week === null ? null : due.toISOString().slice(0, 10),
        birthDate,
        babyName: null,
        firstPregnancy: true,
      }),
    );
  }
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
}

const show = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

/** The <details> wrapping a group heading, whatever it is nested in. */
const groupFor = (heading: RegExp) => screen.getByText(heading).closest('details');

describe('the guidance library folds by phase', () => {
  it('opens the phase you are actually in, and no others', () => {
    seed(20);
    show(<HealthyScreen />);
    for (const phase of GUIDE_PHASES) {
      const group = groupFor(new RegExp(`^${phase.label}$`));
      expect(group, phase.label).not.toBeNull();
      expect(group!.open, phase.label).toBe(phase.id === 'pregnancy');
    }
  });

  it('moves to birth guidance once the birth plan conversation is due', () => {
    seed(37);
    show(<HealthyScreen />);
    expect(groupFor(/^Birth & labour$/)!.open).toBe(true);
    expect(groupFor(/^During pregnancy$/)!.open).toBe(false);
  });

  it('moves to recovery once the baby is here', () => {
    seed(null, '2026-08-01');
    show(<HealthyScreen />);
    expect(groupFor(/^After birth$/)!.open).toBe(true);
  });

  it('opens pregnancy for someone who never set a due date', () => {
    seed(null);
    show(<HealthyScreen />);
    expect(groupFor(/^During pregnancy$/)!.open).toBe(true);
  });

  it('keeps every entry on the page — folding is not cutting', () => {
    seed(20);
    const { container } = show(<HealthyScreen />);
    // The cards exist in the DOM whether or not their phase is open, so
    // search, deep links and Ctrl-F all still reach them.
    const cards = container.querySelectorAll('details[id^="guide-"]');
    expect(cards.length).toBeGreaterThan(100);
  });

  it('says how much is behind each fold, and counts nothing done', () => {
    seed(20);
    const { container } = show(<HealthyScreen />);
    expect(screen.getAllByText(/\d+ entries/).length).toBeGreaterThan(0);
    // No "3 of 12", no progress: this screen never scores anyone.
    expect(container.textContent).not.toMatch(/\b\d+\s*(of|\/)\s*\d+\s*(read|done|complete)/i);
  });
});

describe('money and deadlines puts what is gone last, and folded', () => {
  // A week where something has definitely passed, so the group exists.
  const week = 30;

  beforeEach(() => seed(week));

  it('has a gone-deadline group to test', () => {
    expect(entitlementTimings(week).some((t) => t.status === 'passed')).toBe(true);
  });

  it('arrives folded rather than expanded', () => {
    show(<EntitlementsScreen />);
    expect(groupFor(/The window has moved on/)!.open).toBe(false);
  });

  it('sits below what is still ahead', () => {
    show(<EntitlementsScreen />);
    const gone = screen.getByText(/The window has moved on/);
    for (const earlier of [/Open to you now/, /Any time in pregnancy/]) {
      const before = screen.queryByText(earlier);
      if (!before) continue;
      expect(before.compareDocumentPosition(gone), String(earlier)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    }
  });

  it('still shows the route that stays open after the date', () => {
    // The whole reason these cannot simply be dropped: a passed deadline
    // often still has a way through, and that line is on the card.
    const { container } = show(<EntitlementsScreen />);
    const gone = groupFor(/The window has moved on/)!;
    expect(gone.querySelectorAll('li').length).toBeGreaterThan(0);
    expect(container.textContent).toMatch(/A date passing does not always close a scheme/);
  });

  it('does not turn a missed deadline into a scolding', () => {
    const { container } = show(<EntitlementsScreen />);
    expect(container.textContent).not.toMatch(
      /\b(you (should have|failed|missed out)|too late|unfortunately|sadly)\b/i,
    );
  });
});
