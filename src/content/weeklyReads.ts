import { guideById } from './guides';
import type { Guide } from './schema';

export interface WeekRead {
  guide: Guide;
  /** Why this, now — the line that makes a card feel timed rather than random. */
  why: string;
}

interface ReadRule {
  guideId: string;
  why: string;
  /** Inclusive week range this becomes relevant. */
  from: number;
  to: number;
}

/**
 * The guidance library now runs from conception through to bottle sterilising,
 * which is far more than anyone should have to go looking for. These rules
 * decide what surfaces on the home screen in a given week, so birth prep,
 * recovery and feeding arrive when they're actually useful rather than sitting
 * three taps away under a tab nobody opens until they need it.
 *
 * Windows are deliberately generous at the front and tight near the due date —
 * week 36 has a lot more that is suddenly relevant than week 16 does.
 */
const RULES: ReadRule[] = [
  // ── Early pregnancy ────────────────────────────────────────────────
  {
    guideId: 'folic-acid',
    why: 'The window for this is now — it matters most before 12 weeks.',
    from: 4,
    to: 12,
  },
  {
    guideId: 'eat-for-two',
    why: 'Worth reading early, before anyone says it to you.',
    from: 4,
    to: 14,
  },
  {
    guideId: 'caffeine-and-rest',
    why: 'The list of things you actually have to change is shorter than you think.',
    from: 5,
    to: 13,
  },
  {
    guideId: 'stress-normal',
    why: 'Early worry is very common. Here is what the numbers actually say.',
    from: 6,
    to: 16,
  },
  {
    guideId: 'dental',
    why: 'Free NHS dental care starts now and runs to 12 months after birth.',
    from: 8,
    to: 20,
  },
  {
    guideId: 'telling-employer',
    why: 'The legal deadline is 15 weeks before your due date — worth knowing early.',
    from: 10,
    to: 24,
  },

  // ── Mid pregnancy ──────────────────────────────────────────────────
  {
    guideId: 'exercise-safe',
    why: 'Often the most comfortable stretch to build a habit in.',
    from: 13,
    to: 26,
  },
  {
    guideId: 'four-rights',
    why: 'A good point to know exactly where you stand at work.',
    from: 14,
    to: 26,
  },
  {
    guideId: 'iron-anaemia',
    why: 'Iron needs rise sharply through the second half.',
    from: 14,
    to: 30,
  },
  {
    guideId: 'vaccines-recommended',
    why: 'Whooping cough is offered from 16 weeks.',
    from: 16,
    to: 24,
  },
  {
    guideId: 'workplace-risk',
    why: 'If work is uncomfortable or unsafe, this is the duty your employer has.',
    from: 16,
    to: 32,
  },
  {
    guideId: 'oily-fish',
    why: 'One of the widest gaps in the UK diet, and easy to close.',
    from: 18,
    to: 32,
  },
  {
    guideId: 'no-target-number',
    why: 'Around the halfway point people start commenting on bumps.',
    from: 20,
    to: 30,
  },

  // ── The turn toward birth ──────────────────────────────────────────
  {
    guideId: 'where-to-give-birth',
    why: 'Early enough to think it through without any pressure.',
    from: 24,
    to: 32,
  },
  {
    guideId: 'antenatal-classes',
    why: 'Most classes are booked around now, and they fill up.',
    from: 24,
    to: 30,
  },
  {
    guideId: 'sleep-position',
    why: 'From 28 weeks, side-sleeping matters — including naps.',
    from: 27,
    to: 34,
  },
  {
    guideId: 'delivery-types',
    why: 'Useful before you are asked to make decisions about it.',
    from: 28,
    to: 36,
  },
  {
    guideId: 'feeding-nobody-figured-out',
    why: 'Reading this now is far easier than reading it at 3am in week one.',
    from: 28,
    to: 38,
  },
  {
    guideId: 'pain-relief-options',
    why: 'Knowing the trade-offs in advance is worth more than deciding on the day.',
    from: 30,
    to: 40,
  },
  {
    guideId: 'birth-plan',
    why: 'A good time to write one down while you have the headspace.',
    from: 30,
    to: 38,
  },
  {
    guideId: 'pelvic-floor',
    why: 'The single most useful habit for recovery afterwards.',
    from: 30,
    to: 40,
  },
  {
    guideId: 'feeding-all-paths-normal',
    why: 'Worth settling in your head before anyone else has an opinion.',
    from: 30,
    to: 40,
  },

  // ── Close to the day ───────────────────────────────────────────────
  {
    guideId: 'hospital-bag',
    why: 'Packed from around 37 weeks — this week is a sensible time.',
    from: 33,
    to: 40,
  },
  {
    guideId: 'labour-signs',
    why: 'Knowing what it feels like takes a lot of the fear out of it.',
    from: 34,
    to: 42,
  },
  {
    guideId: 'birth-partner',
    why: 'Worth showing to whoever is coming with you.',
    from: 34,
    to: 42,
  },
  {
    guideId: 'when-to-call-labour',
    why: 'The one to read now, so nobody is deciding under pressure.',
    from: 36,
    to: 42,
  },
  {
    guideId: 'early-labour-tips',
    why: 'Early labour can be long. These are the things that help.',
    from: 36,
    to: 42,
  },
  {
    guideId: 'feeding-what-helps',
    why: 'Latch support is the most common fix. Knowing to ask early matters.',
    from: 36,
    to: 42,
  },
  {
    guideId: 'first-days',
    why: 'What actually happens in the hours after birth.',
    from: 37,
    to: 42,
  },
  {
    guideId: 'newborn-weeks',
    why: 'Including safer sleep, which is easiest to set up before they arrive.',
    from: 37,
    to: 42,
  },
  {
    guideId: 'postnatal-bleeding',
    why: 'Knowing the 999 threshold in advance is worth a few minutes now.',
    from: 38,
    to: 42,
  },
  {
    guideId: 'overdue',
    why: 'Most first babies arrive after their due date. This is normal.',
    from: 39,
    to: 42,
  },
];

const MAX_READS = 3;

/**
 * Newest-relevant first: a rule whose window opens later wins, so the moment
 * birth prep becomes relevant it leads the card rather than queueing behind
 * nutrition advice that has been sitting there for fifteen weeks.
 */
export function readsForWeek(week: number): WeekRead[] {
  return RULES.filter((r) => week >= r.from && week <= r.to)
    .sort((a, b) => b.from - a.from)
    .slice(0, MAX_READS)
    .map((r) => ({ guide: guideById.get(r.guideId)!, why: r.why }))
    .filter((r) => r.guide);
}

/** Every guide id referenced above, for the content integrity check. */
export const weekReadGuideIds = RULES.map((r) => r.guideId);
