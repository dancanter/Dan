import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PaperworkLink } from '../../src/components/appointments/PaperworkLink';
import { AppointmentsScreen } from '../../src/screens/AppointmentsScreen';
import { entitlementsWorthRaising } from '../../src/content/entitlements';
import { MAX_WEEK } from '../../src/content/schema';

/**
 * The money screen is about maternity pay, a legal notice period and a grant
 * window that closes for good. The Home card only fires when something is
 * live — 18 weeks out of 42 — which is right for Home and left the other 24
 * weeks reachable only from the footer.
 */

function show(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('a permanent way in', () => {
  it('is there in every week of a pregnancy', () => {
    for (let week = 1; week <= MAX_WEEK; week++) {
      const { unmount } = show(<PaperworkLink week={week} />);
      expect(
        screen.getByRole('link', { name: /money, forms and deadlines/i }),
        `week ${week}`,
      ).toHaveAttribute('href', '/entitlements');
      unmount();
    }
  });

  it('names what is behind it rather than only pointing at it', () => {
    // A quiet week: it should still say what it is for.
    const quiet = Array.from({ length: MAX_WEEK }, (_, i) => i + 1).find(
      (w) => entitlementsWorthRaising(w).length === 0,
    )!;
    show(<PaperworkLink week={quiet} />);
    expect(screen.getByText(/Maternity pay, free prescriptions, the grants/i)).toBeInTheDocument();
  });

  it('says so when something has a deadline coming up', () => {
    const busy = Array.from({ length: MAX_WEEK }, (_, i) => i + 1).find(
      (w) => entitlementsWorthRaising(w).length > 0,
    )!;
    show(<PaperworkLink week={busy} />);
    expect(screen.getByText(/deadline coming up/i)).toBeInTheDocument();
  });

  it('counts nothing and ticks nothing', () => {
    const { container } = show(<PaperworkLink week={22} />);
    // Same rule as the screen it links to: no totals, no progress, nothing
    // that makes not-having-done-it visible.
    expect(container.textContent).not.toMatch(/\b\d+\s*(of|\/)\s*\d+\b/);
    expect(container.querySelector('input')).toBeNull();
  });
});

describe('on the appointments screen', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'fieldnotes:profile',
      JSON.stringify({
        dueDate: '2027-03-01',
        birthDate: null,
        babyName: null,
        firstPregnancy: true,
      }),
    );
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });

  it('appears on the tab that is already about dates and admin', () => {
    show(<AppointmentsScreen />);
    expect(screen.getByRole('link', { name: /money, forms and deadlines/i })).toHaveAttribute(
      'href',
      '/entitlements',
    );
  });
});
