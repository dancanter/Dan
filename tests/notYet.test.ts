import { describe, expect, it } from 'vitest';
import { notYetNotes, notYetForWeek } from '../src/content/notYet';
import { MAX_WEEK } from '../src/content/schema';
import { sourceById } from '../src/content';

/**
 * "Not yet, and that is fine."
 *
 * Reassurance is the easiest thing in this app to get wrong, because it
 * fails silently and in the direction of someone not calling. These tests
 * exist for one reason: to stop a comforting sentence outliving the evidence
 * that made it true.
 */

describe('what it is allowed to claim', () => {
  it('never says "most people" without a source', () => {
    for (const n of notYetNotes) {
      if (/\bmost (people|women)\b|\b\d+ in \d+\b|\d+%/i.test(n.text)) {
        expect(n.sourceIds.length, `${n.id} makes a prevalence claim`).toBeGreaterThan(0);
        expect(n.basis, n.id).toBe('sourced');
      }
    }
  });

  it('gives every sourced note a real source', () => {
    for (const n of notYetNotes) {
      for (const id of n.sourceIds) {
        expect(sourceById.get(id), `${n.id} cites ${id}`).toBeDefined();
      }
    }
  });

  it('keeps unsourced notes free of statistics entirely', () => {
    for (const n of notYetNotes.filter((x) => x.basis === 'noClaim')) {
      expect(n.sourceIds, n.id).toEqual([]);
      expect(n.text, n.id).not.toMatch(/\bmost\b|\bmajority\b|\d+%|\b\d+ in \d+\b/i);
    }
  });
});

describe('the movement window closes before it becomes dangerous', () => {
  const movement = notYetNotes.find((n) => n.id === 'no-movement-yet')!;

  it('stops before 24 weeks', () => {
    // NHS: if you have not felt movement by 24 weeks, tell your midwife. A
    // note saying "not yet is ordinary" must not still be on screen then.
    expect(movement.to).toBeLessThan(24);
  });

  it('names the 24-week boundary rather than leaving it implied', () => {
    expect(movement.text).toMatch(/24 weeks/);
    expect(movement.text).toMatch(/tell your midwife/i);
  });

  it('says a change in movements is always a reason to call', () => {
    // The dangerous misreading is "movements vary, so wait and see". Every
    // other movement surface in the app refuses that, and so does this.
    expect(movement.text).toMatch(/change/i);
    expect(movement.text).toMatch(/ring|call|midwife/i);
  });

  it('is gone from week 24 onwards', () => {
    for (let week = 24; week <= MAX_WEEK; week++) {
      expect(
        notYetForWeek(week).map((n) => n.id),
        `week ${week}`,
      ).not.toContain('no-movement-yet');
    }
  });
});

describe('what shows, and when', () => {
  it('never reassures about something that has already happened', () => {
    for (const n of notYetNotes) {
      expect(n.from, n.id).toBeLessThanOrEqual(n.to);
      expect(n.from, n.id).toBeGreaterThan(0);
      expect(n.to, n.id).toBeLessThanOrEqual(MAX_WEEK);
    }
  });

  it('counts nothing and ranks nobody', () => {
    for (const n of notYetNotes) {
      expect(n.text, n.id).not.toMatch(/\b(behind|ahead of|should have|failed|on track)\b/i);
    }
  });

  it('has something to say across most of a pregnancy, and is quiet at the end', () => {
    const covered = [];
    for (let week = 1; week <= MAX_WEEK; week++) {
      if (notYetForWeek(week).length > 0) covered.push(week);
    }
    expect(covered.length).toBeGreaterThan(20);
    // Nothing reassuring is owed to someone at 40 weeks about what has not
    // happened yet — by then the honest answer is that the baby is late.
    expect(notYetForWeek(40)).toEqual([]);
  });
});
