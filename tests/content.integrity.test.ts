import { describe, expect, it } from 'vitest';
import {
  validateContent,
  guides,
  symptoms,
  myths,
  babyWeekByNumber,
  focusForWeek,
  redFlags,
  appointments,
  lossSections,
  equitySections,
  GUIDE_PHASES,
  sectionsInPhase,
  guidesInSection,
  readsForWeek,
  postnatalFocus,
  postnatalReads,
  POSTNATAL_MAX_WEEK,
  MIN_WEEK,
  MAX_WEEK,
} from '../src/content';

describe('content integrity', () => {
  it('has no dangling citations, duplicate ids, or coverage gaps', () => {
    expect(validateContent()).toEqual([]);
  });

  it('cites at least one named source for every guide, symptom and myth', () => {
    for (const item of [...guides, ...symptoms, ...myths]) {
      expect(item.sourceIds.length).toBeGreaterThan(0);
    }
  });

  it('covers every browsable week with baby development and focus items', () => {
    for (let w = MIN_WEEK; w <= MAX_WEEK; w++) {
      expect(babyWeekByNumber.get(w), `week ${w} baby data`).toBeDefined();
      expect(focusForWeek(w).length, `week ${w} focus`).toBeGreaterThan(0);
    }
  });

  it('gives every symptom a non-empty "when to check" flag', () => {
    for (const s of symptoms) {
      expect(s.flag.trim().length, `symptom ${s.id}`).toBeGreaterThan(0);
    }
  });

  it('keeps both urgent escalation levels populated', () => {
    expect(redFlags.some((f) => f.level === 'maternity-unit')).toBe(true);
    expect(redFlags.some((f) => f.level === 'emergency')).toBe(true);
  });

  it('orders appointments by week', () => {
    const weeks = appointments.map((a) => a.week);
    expect([...weeks].sort((a, b) => a - b)).toEqual(weeks);
  });

  it('cites a source for every pregnancy loss section', () => {
    expect(lossSections.length).toBeGreaterThan(0);
    for (const s of lossSections) {
      expect(s.sourceIds.length, `loss section ${s.id}`).toBeGreaterThan(0);
    }
  });

  it('suggests reading for every browsable week', () => {
    for (let w = MIN_WEEK; w <= MAX_WEEK; w++) {
      expect(readsForWeek(w).length, `week ${w} reading`).toBeGreaterThan(0);
    }
  });

  it('surfaces birth and feeding guidance before the due date, not after it', () => {
    const lateReads = readsForWeek(38).map((r) => r.guide.section);
    expect(lateReads.some((s) => ['labour', 'birth-prep', 'first-days'].includes(s))).toBe(true);

    // …and does not lead with birth prep in the first trimester.
    const earlyPhases = readsForWeek(8).map((r) => r.guide.section);
    expect(earlyPhases.some((s) => ['labour', 'pain-relief', 'birth-prep'].includes(s))).toBe(
      false,
    );
  });

  it('covers a full year after birth with focus items and reading', () => {
    for (let w = 0; w <= POSTNATAL_MAX_WEEK; w++) {
      expect(postnatalFocus(w).length, `${w} weeks postnatal focus`).toBeGreaterThan(0);
      expect(postnatalReads(w).length, `${w} weeks postnatal reading`).toBeGreaterThan(0);
    }
  });

  it('never mixes pregnancy focus ids into the postnatal checklist', () => {
    const pregnancyIds = new Set(
      Array.from({ length: MAX_WEEK - MIN_WEEK + 1 }, (_, i) => focusForWeek(MIN_WEEK + i))
        .flat()
        .map((f) => f.id),
    );
    for (let w = 0; w <= POSTNATAL_MAX_WEEK; w++) {
      for (const item of postnatalFocus(w)) {
        expect(pregnancyIds.has(item.id), `postnatal item ${item.id}`).toBe(false);
      }
    }
  });

  it('pairs the inequalities figures with something a reader can act on', () => {
    expect(equitySections.length).toBeGreaterThan(0);
    for (const s of equitySections) {
      expect(s.sourceIds.length, `equity section ${s.id}`).toBeGreaterThan(0);
    }
    // The actions are the point of the module — a version of it that only
    // states disparities and stops would be worse than not shipping it.
    const actions = equitySections.filter((s) => s.tone === 'action');
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some((s) => s.body.some((p) => /self-refer/i.test(p)))).toBe(true);
    expect(actions.some((s) => s.body.some((p) => /interpreter/i.test(p)))).toBe(true);
    expect(actions.some((s) => s.body.some((p) => /second opinion/i.test(p)))).toBe(true);
  });

  it('covers every life phase with at least one populated section', () => {
    for (const phase of GUIDE_PHASES) {
      const sections = sectionsInPhase(phase.id);
      expect(sections.length, `phase ${phase.id}`).toBeGreaterThan(0);
      for (const section of sections) {
        expect(guidesInSection(section.id).length, `section ${section.id}`).toBeGreaterThan(0);
      }
    }
  });
});
