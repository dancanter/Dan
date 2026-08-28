import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PregnancyChangedScreen } from '../src/screens/PregnancyChangedScreen';
import { wipeAllLocalData, localKeys } from '../src/lib/wipe';

/**
 * The bug this pins: "Delete everything permanently" reset three stores and
 * left behind the bump photos, the movement journal, the maternity unit's
 * phone number and the week reached. Someone who had just lost a pregnancy and
 * chose to delete everything would still have had a bump photo on their phone.
 */

/** Every store the app writes, seeded as the app would write it. */
function seedEverything() {
  window.localStorage.setItem(
    'fieldnotes:profile',
    JSON.stringify({ dueDate: '2027-01-01', babyName: 'Peanut', firstPregnancy: true }),
  );
  window.localStorage.setItem(
    'fieldnotes:journal',
    JSON.stringify([{ id: '1', kind: 'note', text: 'private', date: '2026-08-01', week: 20 }]),
  );
  window.localStorage.setItem(
    'fieldnotes:progress',
    JSON.stringify({
      engagedDates: ['2026-08-01'],
      ticked: ['20:x'],
      readGuideIds: ['cheese'],
      revealedMythIds: [],
      celebratedWeeks: [20],
    }),
  );
  window.localStorage.setItem('fieldnotes:status', JSON.stringify({ status: 'active' }));
  window.localStorage.setItem(
    'fieldnotes:movements',
    JSON.stringify([{ id: 'm1', at: Date.now(), kind: 'kick' }]),
  );
  window.localStorage.setItem('fieldnotes:lastSeenWeek', JSON.stringify({ week: 20 }));
  window.localStorage.setItem('fieldnotes:seenIntro', 'true');
  window.localStorage.setItem(
    'fieldnotes:maternity-unit',
    JSON.stringify({ name: 'St Marys', phone: '01234 567890' }),
  );
  window.localStorage.setItem('bump:accessibility', JSON.stringify({ reduceMotion: true }));
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
}

describe('deleting everything', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });

  it('leaves nothing behind under any of the app’s prefixes', async () => {
    seedEverything();
    expect(localKeys().length).toBeGreaterThanOrEqual(9);

    await wipeAllLocalData();

    // Enumerated, not listed — a store added next year is covered by this
    // assertion without anyone remembering to update it, which is precisely
    // the failure mode that produced the original bug.
    expect(localKeys()).toEqual([]);
  });

  it('removes the specific things that used to survive', async () => {
    seedEverything();
    await wipeAllLocalData();

    for (const key of [
      'fieldnotes:movements', // the record of the baby moving
      'fieldnotes:maternity-unit', // a phone number
      'fieldnotes:lastSeenWeek', // the week reached
      'fieldnotes:seenIntro',
      'fieldnotes:status',
      'bump:accessibility',
    ]) {
      expect(window.localStorage.getItem(key), key).toBeNull();
    }
  });

  it('does not touch storage belonging to anything else', async () => {
    seedEverything();
    window.localStorage.setItem('some-other-app', 'keep me');
    await wipeAllLocalData();
    expect(window.localStorage.getItem('some-other-app')).toBe('keep me');
  });

  it('survives a browser that will not open IndexedDB', async () => {
    seedEverything();
    // jsdom has no indexedDB at all, which is the same shape as a private
    // window refusing one. Deletion of everything else must still complete.
    await expect(wipeAllLocalData()).resolves.toBeUndefined();
    expect(localKeys()).toEqual([]);
  });
});

describe('the delete confirmation', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    seedEverything();
  });

  function show() {
    return render(
      <MemoryRouter>
        <PregnancyChangedScreen />
      </MemoryRouter>,
    );
  }

  it('names what will be deleted rather than promising "everything"', async () => {
    const user = userEvent.setup();
    show();
    await user.click(screen.getByRole('button', { name: /delete my pregnancy data/i }));
    await waitFor(() => screen.getByText(/before you delete/i));

    const text = document.body.textContent!.toLowerCase();
    for (const thing of ['notes', 'questions', 'mood', 'movement journal', 'maternity unit']) {
      expect(text.includes(thing), `does not mention ${thing}`).toBe(true);
    }
  });

  it('actually deletes when confirmed', async () => {
    const user = userEvent.setup();
    show();
    await user.click(screen.getByRole('button', { name: /delete my pregnancy data/i }));
    await user.click(screen.getByRole('button', { name: /delete everything permanently/i }));
    await waitFor(() => expect(localKeys()).toEqual([]));
  });

  it('never asks what happened', () => {
    const { container } = show();

    // The real assertion is structural: there is nowhere to type a cause, no
    // reason picker, nothing to record. Copy can be reworded; a missing input
    // cannot quietly come back.
    expect(container.querySelectorAll('input, textarea, select')).toHaveLength(0);

    // And no interrogative framing. "You don't have to record anything about
    // what happened" contains the words and is the opposite of asking, so this
    // looks for the question forms rather than the subject matter.
    const text = container.textContent!.toLowerCase();
    for (const phrase of [
      'what happened?',
      'tell us why',
      'tell us what',
      'how far along',
      'when did',
      'would you like to share',
    ]) {
      expect(text.includes(phrase), `asks "${phrase}"`).toBe(false);
    }
  });

  it('offers support and urgent help, not only state changes', () => {
    show();
    expect(screen.getByRole('link', { name: /support after loss/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /get help/i })).toBeTruthy();
  });

  it('promises no notifications, because the app cannot send any', () => {
    const { container } = show();
    expect(container.textContent).toMatch(/sends no notifications/i);
  });

  it('announces the confirmation, which appears below rather than over', async () => {
    const user = userEvent.setup();
    show();
    const trigger = screen.getByRole('button', { name: /delete my pregnancy data/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Focus moves to the terms, or a screen reader user hears nothing change.
    await waitFor(() => expect(document.activeElement?.textContent).toMatch(/before you delete/i));
  });
});

/**
 * The second half of the same bug. Settings has its own "Reset my data", and it
 * called three hooks by hand — the identical hard-coded list that left photos,
 * movements and a phone number behind. Every screen that offers to remove data
 * has to go through the one function that enumerates.
 */
describe('the reset in Settings', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });

  it('is not a second, weaker implementation of deletion', async () => {
    const source = (await import('../src/screens/SettingsScreen.tsx?raw')).default;
    expect(source).toContain('wipeAllLocalData');
    // The exact shape of the original bug: naming the stores to clear.
    expect(source).not.toMatch(/resetProfile\(\)|resetProgress\(\)|resetJournal\(\)/);
  });
});
