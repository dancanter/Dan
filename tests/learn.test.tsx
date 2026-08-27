import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FoodSortScreen } from '../src/screens/FoodSortScreen';
import { TermsScreen } from '../src/screens/TermsScreen';
import { MythsScreen } from '../src/screens/MythsScreen';
import { foodRules, glossary, guideById, validateContent } from '../src/content';

const DECKS: [string, () => React.ReactElement][] = [
  ['Myth or fact', () => <MythsScreen />],
  ['Can I eat it?', () => <FoodSortScreen />],
  ['What’s the word?', () => <TermsScreen />],
];

function show(Screen: () => React.ReactElement) {
  window.localStorage.clear();
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
  return render(<MemoryRouter>{Screen()}</MemoryRouter>);
}

describe('every learning deck', () => {
  beforeEach(() => window.localStorage.clear());

  // The rule that matters most, applied identically to all three. Being told
  // you are WRONG about pregnancy attaches a small humiliation to something
  // already anxious.
  it.each(DECKS)('%s never tells anyone they are wrong', async (_name, Screen) => {
    const user = userEvent.setup();
    const { container, unmount } = show(Screen);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);

    const text = container.textContent!.toLowerCase();
    for (const word of ['wrong', 'incorrect', 'nope', 'try again', 'you failed', '✗', '❌']) {
      expect(text.includes(word), `says "${word}"`).toBe(false);
    }
    expect(
      container.textContent!.includes('That’s right.') ||
        container.textContent!.includes('catches a lot of people'),
    ).toBe(true);
    unmount();
  });

  it.each(DECKS)('%s keeps no score and no completion count', async (_name, Screen) => {
    const user = userEvent.setup();
    const { container, unmount } = show(Screen);
    await user.click(screen.getAllByRole('button')[0]);
    await user.click(screen.getByRole('button', { name: /next one/i }));

    const text = container.textContent!.toLowerCase();
    for (const p of ['score', 'streak', 'correct so far', 'out of 1', ' of 16', ' of 18']) {
      expect(text.includes(p), `shows "${p}"`).toBe(false);
    }
    expect(text).toContain('nothing to finish');
    unmount();
  });

  it.each(DECKS)('%s asks before it tells', (_name, Screen) => {
    const { unmount } = show(Screen);
    expect(screen.queryByRole('button', { name: /next one/i })).toBeNull();
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
    unmount();
  });
});

describe('the food sort', () => {
  beforeEach(() => window.localStorage.clear());

  it('offers four answers, because that is the shape of the guidance', () => {
    show(() => <FoodSortScreen />);
    for (const label of ['Fine as it is', 'Cook it first', 'Limit it', 'Avoid']) {
      expect(screen.getByRole('button', { name: label })).toBeTruthy();
    }
  });

  // Collapsing "cook it first" into "avoid" is most of why people think the
  // banned list is far longer than it is.
  it('keeps cook-first separate from avoid in the data', () => {
    expect(foodRules.some((f) => f.verdict === 'cook-first')).toBe(true);
    expect(foodRules.find((f) => f.id === 'brie')?.verdict).toBe('cook-first');
    expect(foodRules.find((f) => f.id === 'liver')?.verdict).toBe('avoid');
  });

  it('states nothing the guidance does not already say', () => {
    // The build-time check, asserted here too so it cannot be quietly dropped.
    expect(validateContent().filter((i) => i.detail.includes('Food rule'))).toEqual([]);
    for (const f of foodRules) {
      const guide = guideById.get(f.guideId);
      expect(guide, f.id).toBeDefined();
      const haystack = [guide!.title, guide!.summary, ...guide!.body].join(' ').toLowerCase();
      expect(haystack.includes((f.mentions ?? f.name).toLowerCase()), f.id).toBe(true);
    }
  });

  it('links each answer back to the guidance it came from', async () => {
    const user = userEvent.setup();
    show(() => <FoodSortScreen />);
    await user.click(screen.getAllByRole('button')[0]);
    const link = screen.getByRole('link', { name: /read the full guidance/i });
    expect(link.getAttribute('href')).toMatch(/\/healthy\?open=/);
  });
});

describe('the terms deck', () => {
  beforeEach(() => window.localStorage.clear());

  it('asks which word a definition belongs to, not the reverse', () => {
    const { container } = show(() => <TermsScreen />);
    // The prompt is a definition from the glossary…
    const shown = glossary.find((g) => container.textContent!.includes(g.definition));
    expect(shown).toBeDefined();
    // …and the options are all real terms.
    const labels = screen.getAllByRole('button').map((b) => b.textContent!.trim());
    for (const label of labels) {
      expect(glossary.some((g) => g.term === label), `"${label}" is not a glossary term`).toBe(true);
    }
  });

  it('offers four options, all distinct', () => {
    show(() => <TermsScreen />);
    const labels = screen.getAllByRole('button').map((b) => b.textContent!.trim());
    expect(labels).toHaveLength(4);
    expect(new Set(labels).size).toBe(4);
  });

  it('writes nothing of its own — every definition comes from the glossary', () => {
    const { container } = show(() => <TermsScreen />);
    expect(glossary.some((g) => container.textContent!.includes(g.definition))).toBe(true);
  });
});
