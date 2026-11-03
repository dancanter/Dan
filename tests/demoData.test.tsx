import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import {
  DEMO_READ_GUIDE_IDS,
  DEMO_REVEALED_MYTH_IDS,
  isDemo,
  seedDemo,
  clearDemo,
} from '../src/lib/demoData';
import { localKeys } from '../src/lib/wipe';
import { DemoBanner } from '../src/components/ui/DemoBanner';
import { guides, myths } from '../src/content';

/**
 * The example pregnancy exists so the app can be looked at without inventing
 * a due date. That convenience is only acceptable while three things hold:
 * it never overwrites real data, it never stops saying it is fake, and
 * clearing it clears it.
 */

describe('seeding the example', () => {
  beforeEach(() => window.localStorage.clear());

  it('fills the screens that are empty on a fresh install', () => {
    expect(seedDemo()).toBe(true);
    // Each of these is a screen a reviewer would otherwise find blank.
    for (const key of [
      'fieldnotes:profile',
      'fieldnotes:journal',
      'fieldnotes:movements',
      'fieldnotes:progress',
      'fieldnotes:lastSeenWeek',
    ]) {
      expect(window.localStorage.getItem(key), key).not.toBeNull();
    }
  });

  it('refuses when the device already holds a real pregnancy', () => {
    window.localStorage.setItem('fieldnotes:profile', JSON.stringify({ dueDate: '2026-12-01' }));
    expect(seedDemo()).toBe(false);
    // Untouched — not merged, not replaced.
    expect(window.localStorage.getItem('fieldnotes:profile')).toContain('2026-12-01');
    expect(isDemo()).toBe(false);
  });

  it('never seeds a maternity unit number', () => {
    seedDemo();
    // Every other invented field is harmless if someone forgets it is fake.
    // A phone number is not: the button pressed at 3am would dial it. Left
    // unset, Get Help falls back to 111, which is true and works.
    expect(window.localStorage.getItem('fieldnotes:maternity-unit')).toBeNull();
  });

  it('sits at a week the app has content for, behind where it was last seen', () => {
    seedDemo();
    const profile = JSON.parse(window.localStorage.getItem('fieldnotes:profile')!);
    const lastSeen = JSON.parse(window.localStorage.getItem('fieldnotes:lastSeenWeek')!);
    expect(profile.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Behind the current week on purpose, so "since you were last here" — one
    // of the few bits of the app a fresh install can never show — appears.
    expect(lastSeen.week).toBeLessThan(28);
  });

  it('references guides and myths that actually exist', () => {
    // A demo pointing at a guide someone renamed is a demo that quietly
    // stops demonstrating anything. Checked against the content, not trusted.
    const guideIds = new Set(guides.map((g) => g.id));
    for (const id of DEMO_READ_GUIDE_IDS) expect(guideIds, id).toContain(id);
    const mythIds = new Set(myths.map((m) => m.id));
    for (const id of DEMO_REVEALED_MYTH_IDS) expect(mythIds, id).toContain(id);
  });

  it('logs movements without anything resembling a count', () => {
    seedDemo();
    const movements = JSON.parse(window.localStorage.getItem('fieldnotes:movements')!);
    expect(movements.length).toBeGreaterThan(0);
    for (const m of movements) {
      expect(Object.keys(m).sort()).toEqual(
        expect.arrayContaining(['at', 'id', 'kind', 'strength']),
      );
      expect(m).not.toHaveProperty('count');
      expect(m).not.toHaveProperty('total');
    }
  });
});

describe('clearing the example', () => {
  beforeEach(() => window.localStorage.clear());

  it('leaves nothing behind', async () => {
    seedDemo();
    expect(localKeys().length).toBeGreaterThan(0);
    await clearDemo();
    // The same wipe the delete-everything flow uses. If the UI says it is
    // gone, it is gone — checked rather than assumed.
    expect(localKeys()).toEqual([]);
    expect(isDemo()).toBe(false);
  });
});

describe('the banner', () => {
  beforeEach(() => window.localStorage.clear());

  function show() {
    return render(
      <MemoryRouter>
        <DemoBanner />
      </MemoryRouter>,
    );
  }

  it('says nothing at all on a real install', () => {
    const { container } = show();
    expect(container).toBeEmptyDOMElement();
  });

  it('says the data is made up, once the example is loaded', () => {
    seedDemo();
    show();
    expect(screen.getByText(/Example data/i)).toBeInTheDocument();
    expect(screen.getByText(/made up/i)).toBeInTheDocument();
  });

  it('cannot be dismissed, only cleared', () => {
    // A banner someone can close stops being true the moment they close it.
    seedDemo();
    show();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAccessibleName(/clear/i);
  });

  it('actually wipes when asked to', async () => {
    seedDemo();
    show();
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    await waitFor(() => expect(localKeys()).toEqual([]));
  });
});
