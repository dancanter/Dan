import { describe, expect, it } from 'vitest';
import { allScores } from '../scripts/readability';

/**
 * Readability, enforced rather than intended.
 *
 * NHS guidance targets a reading age of roughly 9–11 for public-facing health
 * information. Flesch–Kincaid grade + 5 ≈ reading age, so that is grade 4–6.
 *
 * The ceilings below are not that target — they are where the content
 * actually is, set just above the current worst case so it can only move in
 * one direction. Every time an entry gets simplified, these should be pulled
 * down. That is the point: a target nothing enforces drifts straight back the
 * moment someone writes a paragraph in a hurry.
 */

/** No single entry may be harder than this. Current worst is ~10.1. */
const MAX_GRADE = 10.5;
/** The body of content as a whole. Currently ~7.0. */
const MAX_MEAN_GRADE = 7.3;
/** The urgent flow, held to the strictest bar in the app. */
const MAX_URGENT_GRADE = 9.5;

describe('readability', () => {
  const scores = allScores();

  it('keeps the mean reading level within the ceiling', () => {
    const mean = scores.reduce((n, s) => n + s.grade, 0) / scores.length;
    expect(mean, `mean grade ${mean.toFixed(2)}`).toBeLessThanOrEqual(MAX_MEAN_GRADE);
  });

  it('has no single entry above the ceiling', () => {
    // Filters the whole set rather than sampling the worst few — checking a
    // slice would let a sixth regression through silently.
    const over = scores.filter((s) => s.grade > MAX_GRADE);
    expect(
      over.map((s) => `${s.kind}/${s.id} (${s.grade.toFixed(1)})`),
      `entries above grade ${MAX_GRADE}`,
    ).toEqual([]);
  });

  it('holds the urgent flow to a lower bar than everything else', () => {
    // Someone reading these is frightened, and possibly at 3am. They get the
    // strictest ceiling in the app.
    const over = scores.filter((s) => s.kind === 'urgent' && s.grade > MAX_URGENT_GRADE);
    expect(
      over.map((s) => `${s.id} (${s.grade.toFixed(1)})`),
      `urgent entries above grade ${MAX_URGENT_GRADE}`,
    ).toEqual([]);
  });

  it('keeps sentences short enough to follow', () => {
    const rambling = scores.filter((s) => s.longestSentence.words > 45);
    expect(
      rambling.map((s) => `${s.id} (${s.longestSentence.words} words)`),
      'entries with a sentence over 45 words',
    ).toEqual([]);
  });
});
