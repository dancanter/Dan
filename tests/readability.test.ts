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

/** No single entry may be harder than this. Current worst is ~10.3. */
const MAX_GRADE = 11;
/** The body of content as a whole. Currently ~7.2. */
const MAX_MEAN_GRADE = 7.6;

describe('readability', () => {
  const scores = allScores();

  it('keeps the mean reading level within the ceiling', () => {
    const mean = scores.reduce((n, s) => n + s.grade, 0) / scores.length;
    expect(mean, `mean grade ${mean.toFixed(2)}`).toBeLessThanOrEqual(MAX_MEAN_GRADE);
  });

  it('has no single entry above the ceiling', () => {
    const worst = [...scores].sort((a, b) => b.grade - a.grade).slice(0, 5);
    for (const s of worst) {
      expect(s.grade, `${s.kind} "${s.id}" scores ${s.grade.toFixed(1)}`).toBeLessThanOrEqual(
        MAX_GRADE,
      );
    }
  });

  it('holds the urgent flow to a lower bar than everything else', () => {
    // Someone reading these is frightened, and possibly at 3am. They get the
    // strictest ceiling in the app.
    for (const s of scores.filter((s) => s.kind === 'urgent')) {
      expect(s.grade, `urgent "${s.id}" scores ${s.grade.toFixed(1)}`).toBeLessThanOrEqual(10);
    }
  });

  it('keeps sentences short enough to follow', () => {
    const rambling = scores.filter((s) => s.longestSentence.words > 45);
    expect(
      rambling.map((s) => `${s.id} (${s.longestSentence.words} words)`),
      'entries with a sentence over 45 words',
    ).toEqual([]);
  });
});
