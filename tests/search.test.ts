import { describe, expect, it } from 'vitest';
import { searchGuides, searchSymptoms, urgentMatchFor } from '../src/content';

const titles = (q: string) => searchGuides(q).map((r) => r.guide.title);
const top = (q: string) => searchGuides(q)[0]?.guide;

describe('asking the guidance a question', () => {
  // The exact failure this replaces: "brie" worked, "can I eat brie" returned
  // nothing — and the second is how people type when they are worried.
  it('answers a question as well as a keyword', () => {
    const keyword = searchGuides('brie');
    const question = searchGuides('can I eat brie?');
    expect(keyword.length).toBeGreaterThan(0);
    expect(question.length).toBeGreaterThan(0);
    expect(top('can I eat brie?')?.id).toBe(top('brie')?.id);
  });

  it('is not thrown by punctuation or capitals', () => {
    expect(searchGuides('Is CAFFEINE ok??').length).toBeGreaterThan(0);
  });

  it('matches word stems, so plurals and tenses still find things', () => {
    expect(searchGuides('medicines').length).toBeGreaterThan(0);
    expect(searchGuides('exercising').length).toBeGreaterThan(0);
  });

  it('translates the words people use into the words the content uses', () => {
    // None of these appear as such in the guidance.
    expect(titles('is booze ok').length).toBeGreaterThan(0);
    expect(titles('coffee').length).toBeGreaterThan(0);
    expect(titles('cat litter').length).toBeGreaterThan(0);
  });

  it('ranks an entry that answers the whole question above one catching a word', () => {
    const results = searchGuides('what can I eat');
    // "eat" alone is weak; it should not return the entire library ranked flat.
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(results[results.length - 1].score);
  });

  it('returns nothing for a query that is only filler words', () => {
    expect(searchGuides('can I')).toEqual([]);
    expect(searchGuides('   ')).toEqual([]);
    expect(searchGuides('is it ok to')).toEqual([]);
  });

  it('returns nothing rather than everything for a genuine miss', () => {
    expect(searchGuides('zzzzqqq')).toEqual([]);
  });
});

describe('searching the symptom explorer too', () => {
  // The gap this closes: the app had a good entry on heartburn and searching
  // for it returned nothing at all, because symptoms live outside the library.
  it('finds a symptom the guidance library does not cover', () => {
    expect(searchGuides('heartburn')).toEqual([]);
    expect(searchSymptoms('heartburn').map((s) => s.name)).toContain('Heartburn');
  });

  it('leads with the symptom named, not one that merely mentions it', () => {
    expect(searchSymptoms('swelling')[0].name).toBe('Swelling');
    expect(searchSymptoms('constipated')[0].name).toBe('Constipation');
  });

  it('stays quiet when the query is not about a symptom', () => {
    expect(searchSymptoms('maternity pay')).toEqual([]);
    expect(searchSymptoms('antenatal classes')).toEqual([]);
  });
});

describe('the stemmer', () => {
  // The bug this pins: stripping "ed" off "bleed" left "bl", while "bleeding"
  // became "bleed" — so the two forms of the same word stopped matching each
  // other, which is the exact opposite of what stemming is for. Refusing to
  // strip below four characters fixes it and makes the function idempotent.
  it('keeps different forms of a word matching each other', () => {
    for (const [a, b] of [
      ['bleed', 'bleeding'],
      ['move', 'moving'],
      ['leak', 'leaking'],
      ['swell', 'swelling'],
    ]) {
      expect(Boolean(urgentMatchFor(a)), a).toBe(true);
      expect(urgentMatchFor(a)?.id, `${a} vs ${b}`).toBe(urgentMatchFor(b)?.id);
    }
  });
});

describe('when a search sounds like something happening now', () => {
  // A reading list is a bad answer to "bleeding".
  it('offers the urgent route for a symptom being described', () => {
    expect(urgentMatchFor('bleeding')?.id).toBe('bleeding');
    expect(urgentMatchFor('baby not moving')?.id).toBe('movements');
    expect(urgentMatchFor('itchy hands at night')?.id).toBe('itching');
    expect(urgentMatchFor('my waters might have broken')?.id).toBe('fluid');
  });

  it('stays out of the way for ordinary reading', () => {
    expect(urgentMatchFor('what can I eat')).toBeUndefined();
    expect(urgentMatchFor('maternity pay')).toBeUndefined();
    expect(urgentMatchFor('antenatal classes')).toBeUndefined();
  });

  it('points at an urgent entry that actually exists', () => {
    for (const q of ['bleeding', 'headache', 'swollen', 'fever', 'contractions', 'calf pain']) {
      const match = urgentMatchFor(q);
      expect(match, q).toBeDefined();
      expect(match!.now.length, q).toBeGreaterThan(0);
    }
  });
});
