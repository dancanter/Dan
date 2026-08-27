/**
 * Does an edit change what a sentence claims, or only how it reads?
 *
 * This is the mechanical half of the content safety rule in
 * docs/content-safety.md. It cannot decide whether a change is *correct* —
 * only a clinician can — and it does not try to. What it can do is notice
 * when an edit has crossed one of the lines where meaning lives, and refuse
 * to let that pass as a readability tweak.
 *
 * The failure it is built against is specific and easy to commit while trying
 * to be helpful: rewriting "may be associated with" as "causes" to shorten a
 * sentence, or "this can happen" as "this is normal" to sound reassuring.
 * Both read better. Both are different claims.
 *
 * Everything here errs towards flagging. A false flag costs a reviewer thirty
 * seconds; a missed one puts a stronger claim in front of a pregnant woman
 * than the evidence supports.
 */

export type Band = 'hedged' | 'neutral' | 'asserted';
export type Force = 'permissive' | 'neutral' | 'directive';

const HEDGES = [
  /\bmay\b/i,
  /\bmight\b/i,
  /\bcan be\b/i,
  /\bcould\b/i,
  /\bassociated with\b/i,
  /\blinked (to|with)\b/i,
  /\bsuggests?\b/i,
  /\bsome evidence\b/i,
  /\bthought to\b/i,
  /\bappears? to\b/i,
  /\btends? to\b/i,
  /\bin some (people|cases|women)\b/i,
  /\bnot everyone\b/i,
  /\bunclear\b/i,
  /\bwe don’t know\b/i,
];

const ASSERTIONS = [
  /\bcauses?\b/i,
  /\bleads? to\b/i,
  /\bresults? in\b/i,
  /\bproven\b/i,
  /\balways\b/i,
  /\bnever\b/i,
  /\bwill\b/i,
  /\bdoes\b/i,
  /\bis normal\b/i,
  /\bmeans that\b/i,
  /\bguarantees?\b/i,
  /\bdefinitely\b/i,
];

const DIRECTIVES = [
  /\bmust\b/i,
  /\bshould\b/i,
  /\bavoid\b/i,
  /\bdon’t\b/i,
  /\bdo not\b/i,
  /\bnever\b/i,
  /\bstop\b/i,
  /\bcall\b/i,
  /\bgo to\b/i,
  /\bimmediately\b/i,
  /\bstraight away\b/i,
  /\bright now\b/i,
  /\burgent/i,
  /\bemergency\b/i,
  /\bdon’t wait\b/i,
];

const PERMISSIVES = [
  /\bfine\b/i,
  /\bsafe\b/i,
  /\bno need\b/i,
  /\bdon’t have to\b/i,
  /\boptional\b/i,
  /\bup to you\b/i,
  /\bperfectly\b/i,
  /\bno evidence\b/i,
  /\bnothing to\b/i,
];

/** How common something is said to be — its own axis, and easy to slide. */
const RARE = [/\brare\b/i, /\buncommon\b/i, /\bunlikely\b/i, /\bunusual\b/i, /\bseldom\b/i];
const COMMON = [/\bcommon\b/i, /\boften\b/i, /\busual(ly)?\b/i, /\bfrequently\b/i, /\bmost\b/i];

const hits = (text: string, patterns: RegExp[]) => patterns.filter((p) => p.test(text)).length;

export function certainty(text: string): Band {
  const h = hits(text, HEDGES);
  const a = hits(text, ASSERTIONS);
  if (h > a) return 'hedged';
  if (a > h) return 'asserted';
  return 'neutral';
}

export function force(text: string): Force {
  const d = hits(text, DIRECTIVES);
  const p = hits(text, PERMISSIVES);
  if (d > p) return 'directive';
  if (p > d) return 'permissive';
  return 'neutral';
}

export function frequency(text: string): 'rare' | 'neutral' | 'common' {
  const r = hits(text, RARE);
  const c = hits(text, COMMON);
  if (r > c) return 'rare';
  if (c > r) return 'common';
  return 'neutral';
}

/**
 * Numbers carry meaning that no amount of rewording should touch: weeks,
 * doses, portions, phone numbers, thresholds. A changed one is always a
 * content change, never a style change.
 */
export function numbers(text: string): string[] {
  return (
    text.match(/\b\d+(?:[.,]\d+)?\s*(?:%|mg|mcg|µg|g|ml|weeks?|days?|hours?|minutes?)?/gi) ?? []
  )
    .map((n) => n.replace(/\s+/g, '').toLowerCase())
    .sort();
}

export interface Shift {
  /** Short label for the report. */
  kind: string;
  from: string;
  to: string;
  /** True where the change cannot be a wording-only edit. */
  reviewRequired: boolean;
}

export function meaningShifts(before: string, after: string): Shift[] {
  const shifts: Shift[] = [];

  const cb = certainty(before);
  const ca = certainty(after);
  if (cb !== ca) {
    shifts.push({
      kind: 'certainty',
      from: cb,
      to: ca,
      // Hedged→asserted is the one the rule names explicitly: "may be
      // associated with" must never casually become "causes".
      reviewRequired: true,
    });
  }

  const fb = force(before);
  const fa = force(after);
  if (fb !== fa) {
    shifts.push({ kind: 'advice strength', from: fb, to: fa, reviewRequired: true });
  }

  const qb = frequency(before);
  const qa = frequency(after);
  if (qb !== qa) {
    shifts.push({ kind: 'how common', from: qb, to: qa, reviewRequired: true });
  }

  const nb = numbers(before).join(' ');
  const na = numbers(after).join(' ');
  if (nb !== na) {
    shifts.push({
      kind: 'numbers',
      from: nb || '(none)',
      to: na || '(none)',
      reviewRequired: true,
    });
  }

  // A flipped negation reverses a sentence while leaving most of its words in
  // place, which is exactly the edit a line-based diff makes look small.
  const negs = (t: string) =>
    (t.match(/\b(not|no|never|don’t|doesn’t|isn’t|aren’t|won’t)\b/gi) ?? []).length;
  if (negs(before) !== negs(after)) {
    shifts.push({
      kind: 'negation',
      from: `${negs(before)}`,
      to: `${negs(after)}`,
      reviewRequired: true,
    });
  }

  return shifts;
}
