/**
 * Deliberately imports nothing from `./guides`.
 *
 * It used to look up the full Guide object for each rule, which meant the home
 * screen — the one screen that has to open fastest — pulled all 111 guides and
 * their entire bodies into the first paint in order to display three titles.
 * The rules now carry the title themselves, and `validateContent()` fails the
 * build if one drifts from the guide it names, so duplicating the string costs
 * nothing in correctness and takes 54kB off every first load.
 */
export interface WeekRead {
  /** The guide this points at. Enough to link; not enough to render it. */
  id: string;
  title: string;
  /** Why this, now — the line that makes a card feel timed rather than random. */
  why: string;
}

interface ReadRule {
  guideId: string;
  /** Must match the guide's own title. Checked by validateContent(). */
  title: string;
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
    title: 'Folic acid — take this',
    why: 'The window for this is now — it matters most before 12 weeks.',
    from: 1,
    to: 12,
  },
  {
    guideId: 'eat-for-two',
    title: 'You don’t need to "eat for two"',
    why: 'Worth reading early, before anyone says it to you.',
    from: 1,
    to: 14,
  },
  {
    guideId: 'caffeine-and-rest',
    title: 'Caffeine, herbal tea & the rest',
    why: 'The list of things you actually have to change is shorter than you think.',
    from: 5,
    to: 13,
  },
  {
    guideId: 'stress-normal',
    title: 'Most pregnant women aren’t highly stressed',
    why: 'Early worry is very common. Here is what the numbers actually say.',
    from: 6,
    to: 16,
  },
  {
    guideId: 'dental',
    title: 'Dental care — and it’s free',
    why: 'Free NHS dental care starts now and runs to 12 months after birth.',
    from: 8,
    to: 20,
  },
  {
    guideId: 'telling-employer',
    title: 'When to tell your employer',
    why: 'The legal deadline is 15 weeks before your due date — worth knowing early.',
    from: 10,
    to: 24,
  },

  // ── Mid pregnancy ──────────────────────────────────────────────────
  {
    guideId: 'exercise-safe',
    title: 'Exercise is safe — the guidelines all agree',
    why: 'Often the most comfortable stretch to build a habit in.',
    from: 13,
    to: 26,
  },
  {
    guideId: 'four-rights',
    title: 'The four legal rights',
    why: 'A good point to know exactly where you stand at work.',
    from: 14,
    to: 26,
  },
  {
    guideId: 'iron-anaemia',
    title: 'Iron & anaemia',
    why: 'Iron needs rise sharply through the second half.',
    from: 14,
    to: 30,
  },
  {
    guideId: 'vaccines-recommended',
    title: 'The three recommended vaccines',
    why: 'Whooping cough is offered from 16 weeks.',
    from: 16,
    to: 24,
  },
  {
    guideId: 'workplace-risk',
    title: 'Health and safety at work — a legal duty, not a favour',
    why: 'If work is uncomfortable or unsafe, this is the duty your employer has.',
    from: 16,
    to: 32,
  },
  {
    guideId: 'oily-fish',
    title: 'Oily fish & omega-3',
    why: 'One of the widest gaps in the UK diet, and easy to close.',
    from: 18,
    to: 32,
  },
  {
    guideId: 'no-target-number',
    title: 'There’s no single "correct" number',
    why: 'Around the halfway point people start commenting on bumps.',
    from: 20,
    to: 30,
  },

  // ── The turn toward birth ──────────────────────────────────────────
  {
    guideId: 'where-to-give-birth',
    title: 'Where to give birth',
    why: 'Early enough to think it through without any pressure.',
    from: 24,
    to: 32,
  },
  {
    guideId: 'antenatal-classes',
    title: 'Antenatal classes & hypnobirthing',
    why: 'Most classes are booked around now, and they fill up.',
    from: 24,
    to: 30,
  },
  {
    guideId: 'sleep-position',
    title: 'Sleep position — from 28 weeks',
    why: 'From 28 weeks, side-sleeping matters — including naps.',
    from: 27,
    to: 34,
  },
  {
    guideId: 'delivery-types',
    title: 'Types of delivery',
    why: 'Useful before you are asked to make decisions about it.',
    from: 28,
    to: 36,
  },
  {
    guideId: 'feeding-nobody-figured-out',
    title: 'Nobody has it figured out from day one',
    why: 'Reading this now is far easier than reading it at 3am in week one.',
    from: 28,
    to: 38,
  },
  {
    guideId: 'pain-relief-options',
    title: 'Pain relief options',
    why: 'Knowing the trade-offs in advance is worth more than deciding on the day.',
    from: 30,
    to: 40,
  },
  {
    guideId: 'birth-plan',
    title: 'Your birth plan',
    why: 'A good time to write one down while you have the headspace.',
    from: 30,
    to: 38,
  },
  {
    guideId: 'pelvic-floor',
    title: 'Pelvic floor exercises',
    why: 'The single most useful habit for recovery afterwards.',
    from: 30,
    to: 40,
  },
  {
    guideId: 'feeding-all-paths-normal',
    title: 'Combination and formula feeding are mainstream',
    why: 'Worth settling in your head before anyone else has an opinion.',
    from: 30,
    to: 40,
  },

  // ── Close to the day ───────────────────────────────────────────────
  {
    guideId: 'hospital-bag',
    title: 'Hospital bag checklist',
    why: 'Packed from around 37 weeks — this week is a sensible time.',
    from: 33,
    to: 40,
  },
  {
    guideId: 'labour-signs',
    title: 'Signs labour has started',
    why: 'Knowing what it feels like takes a lot of the fear out of it.',
    from: 34,
    to: 42,
  },
  {
    guideId: 'birth-partner',
    title: 'For your birth partner',
    why: 'Worth showing to whoever is coming with you.',
    from: 34,
    to: 42,
  },
  {
    guideId: 'when-to-call-labour',
    title: 'When to call — don’t wait it out',
    why: 'The one to read now, so nobody is deciding under pressure.',
    from: 36,
    to: 42,
  },
  {
    guideId: 'early-labour-tips',
    title: 'Getting through early labour',
    why: 'Early labour can be long. These are the things that help.',
    from: 36,
    to: 42,
  },
  {
    guideId: 'feeding-what-helps',
    title: 'What actually helps — from mothers who’ve been there',
    why: 'Latch support is the most common fix. Knowing to ask early matters.',
    from: 36,
    to: 42,
  },
  {
    guideId: 'first-days',
    title: 'The first days',
    why: 'What actually happens in the hours after birth.',
    from: 37,
    to: 42,
  },
  {
    guideId: 'newborn-weeks',
    title: 'The early weeks with a newborn',
    why: 'Including safer sleep, which is easiest to set up before they arrive.',
    from: 37,
    to: 42,
  },
  {
    guideId: 'postnatal-bleeding',
    title: 'Postnatal bleeding — and when it’s not normal',
    why: 'Knowing the 999 threshold in advance is worth a few minutes now.',
    from: 38,
    to: 42,
  },
  {
    guideId: 'overdue',
    title: 'If you go past your due date',
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
    .map((r) => ({ id: r.guideId, title: r.title, why: r.why }));
}

/**
 * What became relevant between two weeks — the reads suggested now that were
 * not suggested then.
 *
 * This lives here rather than in a component because two parts of the daily
 * screen need to agree on it. "Since you were last here" surfaces these, and
 * the ordinary reading list below has to leave them out — otherwise the same
 * two guides appear twice within a screen's height, which makes both look
 * like padding. Computing it in one place is what keeps them in step.
 */
export function newReadsBetween(previousWeek: number | null, week: number): WeekRead[] {
  if (previousWeek === null || previousWeek >= week) return [];
  const before = new Set(readsForWeek(previousWeek).map((r) => r.id));
  return readsForWeek(week).filter((r) => !before.has(r.id));
}

/** Every guide id referenced above, for the content integrity check. */
export const weekReadGuideIds = RULES.map((r) => r.guideId);

/** id -> the title the rule claims, so validateContent can compare. */
export const weekReadTitles = RULES.map((r) => [r.guideId, r.title] as const);
