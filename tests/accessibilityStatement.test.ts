import { describe, expect, it } from 'vitest';
import { accessibilitySections, accessibilityIntro } from '../src/content/accessibility';

/**
 * An accessibility statement is a public claim, and the way it goes wrong is
 * not by being badly written. It goes wrong by overstating — "fully
 * accessible", "fully compliant" — or by quietly dropping the things that
 * were never checked.
 *
 * These pin the honesty rather than the prose.
 */

const ALL = [accessibilityIntro, ...accessibilitySections.flatMap((s) => s.body)].join(' ');

describe('what the statement must not claim', () => {
  /**
   * The phrase alone is not the problem — the statement is allowed to say
   * "this is not the same as saying the app is fully accessible", and it
   * does. What it must never do is assert it. So each occurrence has to be
   * within reach of a negation.
   */
  function assertsWithoutDenying(phrase: RegExp): boolean {
    const re = new RegExp(phrase.source, 'gi');
    for (const match of ALL.matchAll(re)) {
      const before = ALL.slice(Math.max(0, match.index - 60), match.index);
      if (!/\b(not|never|isn’t|is not|cannot|no)\b/i.test(before)) return true;
    }
    return false;
  }

  it.each([
    ['fully accessible', /fully accessible/],
    ['fully compliant', /fully compliant/],
    ['meets all', /meets all (of )?the/],
    ['accessible to everyone', /accessible to everyone/],
  ])('never asserts "%s"', (_label, pattern) => {
    // Automated testing cannot support any of these. Passing every check a
    // machine can run is a smaller claim than it sounds, and the statement
    // has to keep saying so.
    expect(assertsWithoutDenying(pattern)).toBe(false);
  });
});

describe('what the statement must keep admitting', () => {
  it('says no screen reader user has tested it', () => {
    expect(ALL).toMatch(/not been tested by anyone who uses a screen reader/i);
    expect(ALL).toMatch(/No screen reader user has tested this app/i);
  });

  it('says no specialist has audited it', () => {
    expect(ALL).toMatch(/not been audited by an accessibility specialist/i);
  });

  it('says nobody has used it in a usability test', () => {
    expect(ALL).toMatch(/Nobody has used it in a usability test/i);
  });

  it('explains what automated tools cannot find', () => {
    // Without this, "no failures found" reads as "no failures exist".
    expect(ALL).toMatch(/Automated tools cannot tell/i);
  });

  it('keeps a section headed as what has not been checked', () => {
    const ids = accessibilitySections.map((s) => s.id);
    expect(ids).toContain('not-checked');
  });
});

describe('what the statement must offer', () => {
  it('gives a route to report a problem', () => {
    // A statement with no way to report anything is a notice, not a promise.
    expect(ALL).toMatch(/github\.com\/dancanter\/Dan/);
  });

  it('is clear it is not covered by the public sector regulations', () => {
    // Publishing in the required format without being required to must not
    // imply the app is a public body, or that an enforcement route exists.
    expect(ALL).toMatch(/not a public body/i);
    expect(ALL).toMatch(/no complaints body/i);
  });

  it('carries the date it was last measured', () => {
    // A statement that drifts is worse than none: it reads as a check that
    // was done. The date has to travel with the numbers.
    expect(ALL).toMatch(/Last measured on \d{1,2} \w+ \d{4}/);
  });
});
