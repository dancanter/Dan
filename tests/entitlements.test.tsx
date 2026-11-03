import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  QUALIFYING_WEEK,
  entitlements,
  entitlementTimings,
  entitlementsWorthRaising,
} from '../src/content/entitlements';
import { sourceById } from '../src/content/sourceRegistry';
import { DeadlinesNote } from '../src/components/today/DeadlinesNote';
import { MAX_WEEK } from '../src/content/schema';

/**
 * The administrative half of a UK pregnancy: maternity pay, a legal notice
 * deadline, free prescriptions, a grant with a claim window. Real money, on
 * real dates, routinely missed.
 *
 * Which makes the tone the risk. Content about deadlines is one careless
 * sentence away from being the thing the brief rules out — a checklist that
 * makes someone feel behind. These hold that line.
 */

describe('what every entitlement has to carry', () => {
  it('says what it is, what it gets you, and what to do', () => {
    for (const e of entitlements) {
      expect(e.what.length, e.id).toBeGreaterThan(0);
      expect(e.why.length, e.id).toBeGreaterThan(0);
      expect(e.action.length, e.id).toBeGreaterThan(0);
    }
  });

  it('cites sources that exist in the registry', () => {
    for (const e of entitlements) {
      expect(e.sourceIds.length, e.id).toBeGreaterThan(0);
      for (const id of e.sourceIds) {
        expect(sourceById.get(id), `${e.id} cites ${id}`).toBeDefined();
      }
    }
  });

  it('links every source it cites', () => {
    // The rest of the registry is 91% unlinked and honest about it. This
    // section had no excuse: every one of these is a public GOV.UK or NHS
    // page, and a deadline you cannot go and read is not much use.
    for (const e of entitlements) {
      for (const id of e.sourceIds) {
        expect(sourceById.get(id)?.url, `${e.id} → ${id}`).toMatch(/^https:\/\//);
      }
    }
  });

  it('never prints an amount of money', () => {
    // Rates change every April. A figure sitting in an app is a figure going
    // quietly out of date, and being wrong about money is worse than being
    // silent about it.
    for (const e of entitlements) {
      const text = [e.title, e.what, e.why, e.action, e.ifLate ?? ''].join(' ');
      expect(text, e.id).not.toMatch(/£\s?\d/);
    }
  });

  it('names the nations it applies to', () => {
    // Sure Start Maternity Grant is England, Wales and NI; Scotland runs
    // Best Start Grant. An app that assumes England is wrong for millions.
    const ids = entitlements.map((e) => e.id);
    expect(ids).toContain('maternity-grant');
    expect(ids).toContain('best-start-grant');
    expect(entitlements.find((e) => e.id === 'maternity-grant')?.nations).toBe('england-wales-ni');
    expect(entitlements.find((e) => e.id === 'best-start-grant')?.nations).toBe('scotland');
  });

  it('offers a way forward wherever a deadline can be missed', () => {
    for (const e of entitlements) {
      if (e.deadlineWeek === null) continue;
      // Every in-pregnancy deadline here has a late route, and someone
      // reading at week 30 needs it rather than a reprimand.
      expect(e.ifLate, `${e.id} has a deadline but no route once it passes`).toBeTruthy();
    }
  });
});

describe('the tone rules', () => {
  const ALL = entitlements
    .flatMap((e) => [e.title, e.what, e.why, e.action, e.ifLate ?? ''])
    .join(' ');

  it.each([
    ['you missed', /you (have )?missed/i],
    ['too late', /too late/i],
    ['you should have', /you should have/i],
    ['you failed', /you failed/i],
    ['behind', /you.{0,6}\bbehind\b/i],
  ])('never says "%s"', (_label, pattern) => {
    expect(ALL).not.toMatch(pattern);
  });

  it('counts nothing', () => {
    // No ticks, no progress, no "2 of 11". The app cannot see whether a form
    // has been sent, and a checklist that guesses either nags someone who is
    // done or congratulates someone who isn't.
    for (const e of entitlements) {
      expect(e).not.toHaveProperty('done');
      expect(e).not.toHaveProperty('completed');
    }
  });
});

describe('timing against the week you are in', () => {
  it('puts the notice deadline at the qualifying week', () => {
    // Maternity leave notice and SMP both hinge on the 15th week before the
    // baby is due, which lands at week 25 of a 40-week pregnancy.
    expect(QUALIFYING_WEEK).toBe(25);
    for (const id of ['tell-employer', 'smp']) {
      expect(entitlements.find((e) => e.id === id)?.deadlineWeek, id).toBe(QUALIFYING_WEEK);
    }
  });

  it('holds back what cannot be done yet', () => {
    const early = entitlementTimings(8);
    const matb1 = early.find((t) => t.entitlement.id === 'matb1');
    // MatB1 cannot be issued before 20 weeks — the one thing here that
    // genuinely cannot be done early.
    expect(matb1?.status).toBe('later');
  });

  it('opens the grant window at the right week', () => {
    // Claimable from 11 weeks before the due date — week 29 of 40.
    expect(entitlementTimings(28).find((t) => t.entitlement.id === 'maternity-grant')?.status).toBe(
      'later',
    );
    expect(
      entitlementTimings(30).find((t) => t.entitlement.id === 'maternity-grant')?.status,
    ).not.toBe('later');
  });

  it('shows a passed deadline as passed rather than hiding it', () => {
    const late = entitlementTimings(34).find((t) => t.entitlement.id === 'tell-employer');
    expect(late?.status).toBe('passed');
    // Still visible. Someone at 34 weeks who has not given notice needs the
    // late route, not a screen that has quietly decided it is not her business.
    expect(late?.entitlement.ifLate).toBeTruthy();
  });

  it('never raises more than two things at once on a daily screen', () => {
    for (let week = 1; week <= MAX_WEEK; week++) {
      expect(entitlementsWorthRaising(week).length, `week ${week}`).toBeLessThanOrEqual(2);
    }
  });

  it('raises the notice deadline while it can still be met', () => {
    const raised = entitlementsWorthRaising(22).map((t) => t.entitlement.id);
    expect(raised).toContain('tell-employer');
  });
});

describe('the note on the daily screen', () => {
  function show(week: number) {
    return render(
      <MemoryRouter>
        <DeadlinesNote week={week} />
      </MemoryRouter>,
    );
  }

  it('says nothing in a week with nothing live', () => {
    // Furniture is what you stop seeing. This has to be able to disappear.
    const quiet = Array.from({ length: MAX_WEEK }, (_, i) => i + 1).find(
      (w) => entitlementsWorthRaising(w).length === 0,
    );
    expect(quiet, 'no week is quiet — the note would be permanent').toBeDefined();
    const { container } = show(quiet!);
    expect(container).toBeEmptyDOMElement();
  });

  it('names the deadline and what to do about it', () => {
    show(22);
    expect(screen.getByText(/Tell your employer/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /all the dates/i })).toHaveAttribute(
      'href',
      '/entitlements',
    );
  });

  it('offers no way to tick anything off', () => {
    const { container } = show(22);
    expect(container.querySelectorAll('input')).toHaveLength(0);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
