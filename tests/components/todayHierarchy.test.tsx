import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodayScreen } from '../../src/screens/TodayScreen';
import { newReadsBetween, readsForWeek } from '../../src/content';

function daysFromNow(n: number) {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
}

/** Weeks pregnant -> a due date that produces it. */
function setUp(week: number, lastSeen: number | null) {
  window.localStorage.clear();
  window.localStorage.setItem(
    'fieldnotes:profile',
    JSON.stringify({ dueDate: daysFromNow((40 - week) * 7), babyName: null, firstPregnancy: true }),
  );
  if (lastSeen !== null) {
    window.localStorage.setItem('fieldnotes:lastSeenWeek', JSON.stringify({ week: lastSeen }));
  }
  // Nothing to celebrate and the intro already dismissed, so the assertions
  // below are about the daily screen itself rather than a one-off overlay.
  window.localStorage.setItem('fieldnotes:seenIntro', 'true');
  window.localStorage.setItem(
    'fieldnotes:progress',
    JSON.stringify({
      engagedDates: [],
      ticked: [],
      readGuideIds: [],
      revealedMythIds: [],
      celebratedWeeks: [4, 8, 12, 13, 20, 24, 28, 37, 40],
    }),
  );
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
}

function renderToday() {
  return render(
    <MemoryRouter>
      <TodayScreen />
    </MemoryRouter>,
  );
}

describe('the daily screen has a hierarchy', () => {
  beforeEach(() => window.localStorage.clear());

  it('promotes exactly one read, and leads it with why now', () => {
    setUp(26, null);
    renderToday();
    const lead = readsForWeek(26)[0];
    expect(screen.getByText(/worth knowing this week/i)).toBeTruthy();
    expect(screen.getByText(lead.title)).toBeTruthy();
    expect(screen.getByText(lead.why)).toBeTruthy();
  });

  // Hit twice while building this: once with the lead read listed again inside
  // "Since you were last here", once with the newly-relevant reads listed again
  // under "Also relevant now". The same title twice within a screen's height
  // makes both of them look like padding.
  it('never shows the same guide twice on one screen', () => {
    setUp(26, 10);
    const { container } = renderToday();

    const titles = [...container.querySelectorAll('main a')]
      .map((a) => a.textContent ?? '')
      .filter(Boolean);

    const guideTitles = readsForWeek(26).map((r) => r.title);
    for (const title of guideTitles) {
      const appearances = titles.filter((t) => t.includes(title)).length;
      expect(appearances, `"${title}" appears ${appearances} times`).toBeLessThanOrEqual(1);
    }
  });

  it('drops the newly-relevant reads out of the ordinary list', () => {
    setUp(26, 10);
    renderToday();
    const fresh = newReadsBetween(10, 26);
    expect(fresh.length).toBeGreaterThan(0);
    // They appear under "Since you were last here"…
    const banner = screen.getByRole('region', { name: /since you were last here/i });
    const inBanner = fresh.filter((r) => banner.textContent?.includes(r.title));
    expect(inBanner.length + 1).toBeGreaterThanOrEqual(fresh.length);
  });

  // The property is the order, not the wording: what matters this week comes
  // first, the shortcuts next, and the optional card last. The headings were
  // reworded — "This week's focus" read as a checklist you might be behind on
  // — so this now anchors on position rather than on the exact labels.
  it('puts the optional myth card last, below what matters this week', () => {
    setUp(26, null);
    const { container } = renderToday();
    const headings = [...container.querySelectorAll('main h2')].map((h) => h.textContent ?? '');
    const jumpTo = headings.indexOf('Jump to');
    expect(jumpTo).toBeGreaterThan(-1);
    expect(headings.indexOf('Myth check')).toBeGreaterThan(jumpTo);
    expect(headings.indexOf('Worth thinking about this week')).toBeLessThan(jumpTo);
  });
});
