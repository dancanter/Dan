import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WhatChanged } from '../../src/components/today/WhatChanged';
import { readsForWeek } from '../../src/content';

function show(previousWeek: number | null, currentWeek: number, excludeGuideId?: string) {
  return render(
    <MemoryRouter>
      <WhatChanged
        previousWeek={previousWeek}
        currentWeek={currentWeek}
        excludeGuideId={excludeGuideId}
      />
    </MemoryRouter>,
  );
}

describe('what changed since last time', () => {
  it('says nothing at all on a first visit', () => {
    const { container } = show(null, 12);
    expect(container.textContent).toBe('');
  });

  it('says nothing when the week has not moved', () => {
    const { container } = show(12, 12);
    expect(container.textContent).toBe('');
  });

  it('never appears when browsing backwards', () => {
    const { container } = show(20, 14);
    expect(container.textContent).toBe('');
  });

  it('names the new week when one week has passed', () => {
    show(12, 13);
    expect(screen.getByText(/moved into week 13/i)).toBeTruthy();
  });

  it('counts weeks, and flags a new trimester', () => {
    show(11, 14);
    expect(screen.getByText(/week 14 now — 3 weeks on/i)).toBeTruthy();
    expect(screen.getByText(/new trimester/i)).toBeTruthy();
  });

  // The whole point of tracking a week rather than a date. "You haven't been
  // here in 9 days" is a streak wearing a different hat, and this audience is
  // exactly the wrong one to aim it at.
  it('never frames the gap as an absence, however long it is', () => {
    show(8, 28);
    // Only the banner's own wording — a linked guide may legitimately be
    // called "Your baby's first days", and that is not this component talking.
    const banner = screen.getByRole('region', { name: /since you were last here/i });
    const own = [...banner.querySelectorAll('p')]
      .map((p) => p.textContent ?? '')
      .join(' ')
      .toLowerCase();

    for (const phrase of [
      'day',
      'missed',
      'behind',
      'streak',
      'haven’t',
      "haven't",
      'while you were gone',
      'welcome back',
    ]) {
      expect(own.includes(phrase), `the banner says "${phrase}"`).toBe(false);
    }
    // …and it does say the one thing it is for.
    expect(own).toContain('week 28');
  });

  it('surfaces guidance that became relevant in the gap', () => {
    // Week 24 opens birth prep, which is not suggested at week 10.
    show(10, 26);
    expect(screen.getByText(/became relevant while you were away/i)).toBeTruthy();
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });

  it('does not relist the guide already promoted on the screen below', () => {
    const all = screen;
    show(10, 26);
    const shown = all.getAllByRole('link').map((a) => a.textContent);
    cleanup();

    show(10, 26, readsForWeek(26)[0].id);
    const trimmed = screen.getAllByRole('link').map((a) => a.textContent);

    expect(trimmed).not.toContain(readsForWeek(26)[0].title);
    expect(trimmed.length).toBe(shown.length - 1);
  });
});
