/**
 * What has not happened yet, and is not supposed to have.
 *
 * The idea Dan asked for was "most people at this stage haven't…" — a way of
 * measuring yourself against a timeline rather than against whoever posted
 * this morning. It is a good idea with one trap in it: most versions of the
 * sentence have no prevalence data behind them. Nobody knows what proportion
 * of people have told work by week 14, or bought a pram by week 30, and an
 * invented statistic is worse than no statistic because it sounds checkable.
 *
 * So the entries here come from one of two places and nowhere else:
 *
 *   `schedule` — the NHS antenatal timetable the app already holds. "You have
 *   not had the anomaly scan yet" is not a claim about other people at all.
 *   It is a fact about when the scan is.
 *
 *   `sourced` — a real published range, cited.
 *
 * Anything that would have needed a number nobody has is written as plain
 * permission instead, with no "most people" framing, and is marked `noClaim`.
 *
 * **The movement entry has a hard upper bound and it is the reason this file
 * is written carefully.** Not having felt movement is unremarkable at 17
 * weeks and is a reason to ring your midwife at 25. The window closes at 23
 * and the entry carries the boundary with it, because a reassurance that
 * outlives its evidence is the most dangerous thing this app could ship.
 */

export interface NotYetNote {
  id: string;
  /** Inclusive week range this is true for. */
  from: number;
  to: number;
  text: string;
  /** Where the confidence comes from — see the file comment. */
  basis: 'schedule' | 'sourced' | 'noClaim';
  sourceIds: string[];
}

export const notYetNotes: NotYetNote[] = [
  {
    id: 'no-scan-yet',
    from: 5,
    to: 11,
    text: 'You almost certainly have not seen your baby yet. The booking appointment is usually around week 8 and the dating scan around week 12, so a stretch of knowing without seeing is the normal shape of this, not a delay.',
    basis: 'schedule',
    sourceIds: ['nhs-antenatal-care'],
  },
  {
    id: 'no-anomaly-scan-yet',
    from: 12,
    to: 19,
    text: 'You have not had the anomaly scan yet, and are not meant to have. It is the one at around 20 weeks. Between the dating scan and that one there is usually nothing to look at, which is quiet rather than wrong.',
    basis: 'schedule',
    sourceIds: ['nhs-antenatal-care'],
  },
  {
    id: 'no-movement-yet',
    from: 16,
    to: 23,
    text: 'You may not have felt the baby move yet. Most people first feel movements somewhere between 16 and 24 weeks, and often after 20 in a first pregnancy — so not yet, at this point, is ordinary. If you reach 24 weeks without having felt anything, tell your midwife. And once you have felt movements, a change in them is a different matter entirely: that is always a reason to ring, whatever week you are.',
    basis: 'sourced',
    sourceIds: ['nhs-baby-movements', 'tommys-movements'],
  },
  {
    id: 'no-glucose-test-yet',
    from: 20,
    to: 27,
    text: 'If a glucose test has been mentioned and not arranged, it is usually done between 24 and 28 weeks. Not having had it yet at this point is the schedule working, not you being forgotten.',
    basis: 'schedule',
    sourceIds: ['nhs-antenatal-care'],
  },
  {
    id: 'nothing-bought',
    from: 12,
    to: 34,
    text: 'You do not have to have bought anything, decided anything, or announced anything by now. There is no number here because nobody knows what everyone else has done — only that the pace you are going at is allowed to be yours.',
    basis: 'noClaim',
    sourceIds: [],
  },
  {
    id: 'no-bag-packed',
    from: 30,
    to: 36,
    text: 'The bag does not need to be packed yet. Plenty of people do it at 36 weeks, and plenty never quite finish it. Both are fine.',
    basis: 'noClaim',
    sourceIds: [],
  },
];

/** Every note true for this week. */
export function notYetForWeek(week: number): NotYetNote[] {
  return notYetNotes.filter((n) => week >= n.from && week <= n.to);
}
