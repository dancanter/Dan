import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HealthyScreen } from '../src/screens/HealthyScreen';
import { searchGuides, searchSymptoms, urgentMatchFor, urgentSymptoms } from '../src/content';

/**
 * Search, tested as a safety surface rather than a relevance one.
 *
 * The failure this guards against is not "the results are bad". It is someone
 * typing "difficulty breathing" and being handed a reading list — which is
 * exactly what happened before these tests existed, because the urgent word
 * list had "breathless" in it and not "breathing".
 *
 * The queries below are fixed on purpose. They are the phrases a person types
 * when something is happening, written the way they would type it, and each
 * one must reach the urgent route.
 */

/** Typed as someone would type them, mid-worry, with the apostrophes they use. */
const URGENT_QUERIES: [query: string, expected: string][] = [
  ['bleeding', 'bleeding'],
  ['heavy bleeding', 'bleeding'],
  ["baby isn't moving", 'movements'],
  ['reduced movement', 'movements'],
  ['severe headache', 'headache'],
  ['chest pain', 'chest'],
  ['difficulty breathing', 'chest'],
  ['waters broken', 'fluid'],
  ['contractions', 'contractions'],
  ['feeling very unwell', 'instinct'],
];

const NATURAL_QUERIES = [
  'can I eat brie',
  'why am I bleeding',
  "what should I do if my baby isn't moving",
  'what happens at 28 weeks',
  'can I take this medicine',
];

describe('a search that might be someone describing what is happening', () => {
  it.each(URGENT_QUERIES)('“%s” reaches the urgent route', (query, expected) => {
    const match = urgentMatchFor(query);
    expect(match, `“${query}” offered nothing`).toBeDefined();
    expect(match!.id).toBe(expected);
  });

  it('always points at an entry that exists and says what to do', () => {
    for (const [query] of URGENT_QUERIES) {
      const match = urgentMatchFor(query)!;
      expect(
        urgentSymptoms.map((s) => s.id),
        query,
      ).toContain(match.id);
      expect(match.now.length, query).toBeGreaterThan(0);
    }
  });

  // The distinction the phrase list exists to make. This app has a breathing
  // exercise in it; a red panel is the wrong answer to someone looking for it.
  it('does not fire on the calm uses of the same words', () => {
    for (const query of [
      'breathing exercises',
      'breathing techniques for labour',
      'antenatal classes',
      'maternity pay',
      'what can I eat',
      'birth plan',
    ]) {
      expect(urgentMatchFor(query), query).toBeUndefined();
    }
  });

  // The vague words are a floor, not a ceiling: they must never outrank a
  // specific one, or "I feel unwell and my baby is moving less" lands on the
  // catch-all instead of on movements.
  it('prefers the specific symptom over the vague one', () => {
    expect(urgentMatchFor('I feel unwell and my baby is moving less')?.id).toBe('movements');
    expect(urgentMatchFor('feel unwell, bleeding')?.id).toBe('bleeding');
    expect(urgentMatchFor('something feels wrong')?.id).toBe('instinct');
  });
});

describe('the urgent offer does not become a diagnosis', () => {
  // The line the brief draws. The app may say "this is one to get checked".
  // It may not say what is wrong, how likely it is, or that it is nothing.
  it('never tells someone what is causing their symptom', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HealthyScreen />
      </MemoryRouter>,
    );
    const box = screen.getByLabelText(/search the guidance/i);
    await user.type(box, 'bleeding');

    const panel = screen.getByText(/is this happening now/i).closest('div')!;
    const text = panel.textContent ?? '';
    for (const phrase of [
      'probably',
      'likely',
      'unlikely',
      'you have',
      'this is normal',
      'nothing to worry',
      'don’t worry',
      'sounds like',
      'may be caused by',
    ]) {
      expect(text.toLowerCase(), `urgent panel said “${phrase}”`).not.toContain(phrase);
    }
  });

  it('offers rather than diverts — the results are still there', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HealthyScreen />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText(/search the guidance/i), 'bleeding');
    expect(screen.getByText(/is this happening now/i)).toBeInTheDocument();
    // Someone reading ahead out of interest has not been locked out of the
    // library just because the word they typed is also an urgent one.
    expect(searchGuides('bleeding').length).toBeGreaterThan(0);
  });

  it('puts the urgent offer above the results, not somewhere in them', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <HealthyScreen />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText(/search the guidance/i), 'reduced movement');

    const text = container.textContent ?? '';
    const offer = text.indexOf('Is this happening now');
    const firstResult = text.indexOf(searchGuides('reduced movement')[0].guide.title);
    expect(offer).toBeGreaterThan(-1);
    expect(firstResult).toBeGreaterThan(-1);
    expect(offer, 'the urgent offer was below the reading list').toBeLessThan(firstResult);
  });

  // Found by reading the rendered string rather than the source: the title is
  // first-person, so folding it into a sentence produced "don't read up on it
  // — i'm bleeding is something to get checked".
  it('reads as English', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <HealthyScreen />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText(/search the guidance/i), 'bleeding');
    const text = (container.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).not.toMatch(/\bi’m bleeding is\b/i);
    expect(text).toContain('“I’m bleeding”');
  });

  it('announces the urgent offer to a screen reader, not just the result count', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <HealthyScreen />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText(/search the guidance/i), 'chest pain');
    const live = container.querySelector('[aria-live="polite"]')!;
    expect(live.textContent).toMatch(/happening now/i);
  });
});

describe('asking a question in a full sentence', () => {
  it.each(NATURAL_QUERIES)('“%s” finds something', (query) => {
    const answered =
      searchGuides(query).length > 0 ||
      searchSymptoms(query).length > 0 ||
      urgentMatchFor(query) !== undefined;
    expect(answered, `“${query}” returned nothing at all`).toBe(true);
  });

  it('leads with the entry that answers the question', () => {
    expect(searchGuides('can I eat brie')[0].guide.id).toBe(searchGuides('brie')[0].guide.id);
    expect(searchGuides('what happens at 28 weeks')[0].guide.title).toMatch(/28 weeks/);
  });

  // The check that keeps ranking honest: a question must not return a list so
  // long that the answer is hidden in it.
  it('does not bury the answer in the whole library', () => {
    for (const query of NATURAL_QUERIES) {
      expect(searchGuides(query).length, query).toBeLessThanOrEqual(15);
    }
  });
});

describe('the symptom suggestions', () => {
  // "chest pain" was offering Back pain and Pelvic pain, because "pain" is in
  // both names. Suggesting back pain to someone typing chest pain is worse
  // than suggesting nothing — it reads as the app having an opinion.
  it('does not suggest a different symptom that shares a common word', () => {
    expect(searchSymptoms('chest pain').map((s) => s.name)).not.toContain('Back pain');
    expect(searchSymptoms('chest pain').map((s) => s.name)).not.toContain('Pelvic pain (PGP)');
  });

  it('still suggests the symptom actually named', () => {
    expect(searchSymptoms('heartburn')[0].name).toBe('Heartburn');
    expect(searchSymptoms('swelling')[0].name).toBe('Swelling');
    expect(searchSymptoms('back pain')[0].name).toBe('Back pain');
  });
});
