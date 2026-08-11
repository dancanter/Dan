import type { Badge } from './schema';

/**
 * Badges mark things that genuinely happened — weeks reached, curiosity
 * followed. Deliberately none of them require an unbroken streak, so a
 * missed day never takes anything away.
 */
export const badges: Badge[] = [
  { id: 'first-visit', title: 'First note', description: 'Opened Field Notes for the first time.' },
  { id: 'trimester-1', title: 'First trimester', description: 'Reached week 12.' },
  { id: 'halfway', title: 'Halfway', description: 'Reached week 20.' },
  { id: 'viable', title: 'Week 24', description: 'Reached the viability milestone.' },
  { id: 'trimester-3', title: 'Third trimester', description: 'Reached week 28.' },
  { id: 'full-term', title: 'Full term', description: 'Reached week 37.' },
  { id: 'curious', title: 'Curious mind', description: 'Read 10 entries.' },
  { id: 'week-of-checkins', title: 'A week of check-ins', description: 'Visited on 7 different days.' },
  { id: 'myth-buster', title: 'Myth buster', description: 'Revealed 10 myth cards.' },
  { id: 'journal-keeper', title: 'Journal keeper', description: 'Saved 5 journal entries.' },
  { id: 'question-ready', title: 'Question ready', description: 'Saved a question for your midwife.' },
  { id: 'baby-here', title: 'They’re here', description: 'Your baby arrived.' },
  { id: 'checked-in', title: 'Checked in on yourself', description: 'Logged how you were doing after birth.' },
];

export const badgeById = new Map(badges.map((b) => [b.id, b]));

/** Week-triggered badges, checked whenever the current week is known. */
export const WEEK_BADGES: { week: number; badgeId: string }[] = [
  { week: 12, badgeId: 'trimester-1' },
  { week: 20, badgeId: 'halfway' },
  { week: 24, badgeId: 'viable' },
  { week: 28, badgeId: 'trimester-3' },
  { week: 37, badgeId: 'full-term' },
];
