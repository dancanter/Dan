import { computeDueDateFromCurrentWeek, toISODate } from './dates';
import { localKeys, wipeAllLocalData } from './wipe';
import type { JournalEntry } from '../hooks/useJournal';
import type { MovementEntry } from '../hooks/useMovements';

/**
 * A pregnancy already in progress, so the app can be looked at rather than
 * set up.
 *
 * The problem this solves is not a user's problem — it is a reviewer's. The
 * first screen asks for a due date, and anyone who is not pregnant has to
 * invent one. What they then land on is a correct but empty app: no journal,
 * no saved questions, no movements, nothing ticked, no "since you were last
 * here". Every screen built to hold something is holding nothing, so the work
 * worth looking at is the work that cannot be seen.
 *
 * So this seeds one plausible week-28 pregnancy and says plainly, on every
 * screen, that it is made up.
 *
 * Two rules, both load-bearing:
 *
 * 1. **It never writes over real data.** Seeding refuses if the device
 *    already holds anything, so nobody's actual pregnancy is replaced by an
 *    example of one.
 *
 * 2. **No maternity number is seeded.** Every other field here is harmless if
 *    someone forgets it is fake. A phone number is not: the button someone
 *    presses at 3am would dial an invention. Left unset, Get Help falls back
 *    to 111 — which is true, works, and happens to be the part of that screen
 *    most worth showing anyway.
 */
export const DEMO_KEY = 'fieldnotes:demo';

/** The week the example sits at: third trimester, enough behind and ahead to show. */
const DEMO_WEEK = 28;

/** Where the example had got to last time, so "since you were last here" appears. */
const DEMO_LAST_SEEN_WEEK = 26;

function daysAgo(n: number): string {
  return toISODate(new Date(Date.now() - n * 864e5));
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 36e5).toISOString();
}

/**
 * Written as one person's, not as a showcase: two moods rather than five, a
 * question already asked alongside two still waiting, and a note that is
 * mundane. A journal full of tidy, complete entries reads as a mock-up.
 */
function demoJournal(): JournalEntry[] {
  return [
    {
      id: 'demo-j1',
      kind: 'mood',
      text: 'Tired',
      date: daysAgo(9),
      week: DEMO_WEEK - 1,
    },
    {
      id: 'demo-j2',
      kind: 'question',
      text: 'Is it normal to feel breathless going upstairs?',
      date: daysAgo(8),
      week: DEMO_WEEK - 1,
      asked: true,
    },
    {
      id: 'demo-j3',
      kind: 'symptom',
      text: 'Heartburn again, worse lying down',
      date: daysAgo(5),
      week: DEMO_WEEK,
    },
    {
      id: 'demo-j4',
      kind: 'question',
      text: 'Which hospital do I go to if it starts at night?',
      date: daysAgo(3),
      week: DEMO_WEEK,
    },
    {
      id: 'demo-j5',
      kind: 'note',
      text: 'Told work today. Went better than I expected.',
      date: daysAgo(2),
      week: DEMO_WEEK,
    },
    {
      id: 'demo-j6',
      kind: 'question',
      text: 'Can I still travel at 34 weeks?',
      date: daysAgo(1),
      week: DEMO_WEEK,
    },
    {
      id: 'demo-j7',
      kind: 'mood',
      text: 'OK',
      date: daysAgo(0),
      week: DEMO_WEEK,
    },
  ];
}

/**
 * Times and kinds only — the movement journal stores nothing that could be
 * read as a count, and an example of it must not be the place that starts.
 */
function demoMovements(): MovementEntry[] {
  return [
    { id: 'demo-m1', at: hoursAgo(30), kind: 'roll', strength: 'usual' },
    { id: 'demo-m2', at: hoursAgo(26), kind: 'kick', strength: 'strong', note: 'After lunch' },
    { id: 'demo-m3', at: hoursAgo(21), kind: 'hiccup', strength: 'usual' },
    { id: 'demo-m4', at: hoursAgo(6), kind: 'kick', strength: 'usual' },
    { id: 'demo-m5', at: hoursAgo(2), kind: 'stretch', strength: 'strong', note: 'Woke me up' },
  ];
}

/**
 * Ids here are checked against the real content by a test rather than trusted.
 * A demo that silently references a guide someone renamed is a demo that
 * quietly stops demonstrating anything.
 */
export const DEMO_READ_GUIDE_IDS = [
  'hospital-bag',
  'labour-signs',
  'iron-anaemia',
  'stress-normal',
];
export const DEMO_REVEALED_MYTH_IDS = ['eat-for-two', 'all-cheese', 'liver-iron'];

/** True if this device is showing the example rather than someone's pregnancy. */
export function isDemo(): boolean {
  try {
    return window.localStorage.getItem(DEMO_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Anything at all stored by the app, ignoring the accessibility preferences. */
function hasExistingData(): boolean {
  return localKeys().some((k) => k !== DEMO_KEY);
}

/**
 * Seed the example. Returns false and changes nothing if the device already
 * holds data — a real pregnancy is never replaced by an example of one.
 */
export function seedDemo(): boolean {
  if (hasExistingData()) return false;

  const write = (key: string, value: unknown) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  try {
    write('fieldnotes:profile', {
      dueDate: computeDueDateFromCurrentWeek(DEMO_WEEK),
      birthDate: null,
      babyName: null,
      firstPregnancy: true,
    });
    // Someone 28 weeks in has been here before, so the first-visit note is
    // already read. Leaving it unset made the example open on an
    // introduction, which both contradicted the state and pushed the week's
    // actual content — the thing worth looking at — below the fold.
    write('fieldnotes:seenIntro', true);
    write('fieldnotes:journal', demoJournal());
    write('fieldnotes:movements', demoMovements());
    write('fieldnotes:lastSeenWeek', { week: DEMO_LAST_SEEN_WEEK });
    write('fieldnotes:progress', {
      engagedDates: [daysAgo(2), daysAgo(1), daysAgo(0)],
      ticked: [`${DEMO_WEEK}:antenatal-classes`],
      readGuideIds: DEMO_READ_GUIDE_IDS,
      revealedMythIds: DEMO_REVEALED_MYTH_IDS,
      // Marked as already celebrated rather than left empty: a milestone
      // overlay is the wrong thing to meet on the first screen of a
      // look-around, and week 28 is one of the weeks that triggers it.
      celebratedWeeks: [DEMO_WEEK],
    });
    window.localStorage.setItem(DEMO_KEY, 'true');
  } catch {
    // Storage disabled. Nothing was seeded and nothing claims otherwise.
    return false;
  }

  // Mounted hooks cache their reads; without this the seed lands on disk and
  // the screen keeps rendering the empty state it already had.
  try {
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  } catch {
    // Older browsers construct StorageEvent differently. The caller navigates
    // either way, and a reload picks it up.
  }
  return true;
}

/**
 * Remove the example. Deliberately the same wipe the delete-everything flow
 * uses rather than a second implementation that removes the keys someone
 * remembered — the last time this app kept two ways of deleting things, one
 * of them left bump photos behind.
 */
export async function clearDemo(): Promise<void> {
  await wipeAllLocalData();
}
