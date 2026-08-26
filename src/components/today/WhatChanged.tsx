import { Link } from 'react-router-dom';
import { newReadsBetween, trimesterForWeek } from '../../content';

interface Props {
  previousWeek: number | null;
  currentWeek: number;
  /**
   * The guide already promoted to its own card just below this. Listing it
   * here as well put the same title twice within a few centimetres, which
   * makes both look like filler.
   */
  excludeGuideId?: string;
}

/**
 * What is different since last time — and nothing else.
 *
 * The rules this follows are as much about what it never says:
 *
 *  - It never mentions how long it has been. An absence is not a lapse.
 *  - It never appears on a first visit, or when nothing has actually changed.
 *    A banner that shows every day saying "nothing new" is noise, and a reader
 *    learns to skip the whole region — including the days it matters.
 *  - It never counts anything the reader hasn't done.
 *
 * What's left is genuinely useful: you are in a new week, here is what became
 * relevant while you were away, and it's here when you want it.
 */
export function WhatChanged({ previousWeek, currentWeek, excludeGuideId }: Props) {
  if (previousWeek === null || previousWeek >= currentWeek) return null;

  // Shared with the reading list below, which drops whatever appears here.
  const fresh = newReadsBetween(previousWeek, currentWeek).filter(
    (r) => r.guide.id !== excludeGuideId,
  );
  const weeksOn = currentWeek - previousWeek;
  const newTrimester = trimesterForWeek(previousWeek) !== trimesterForWeek(currentWeek);

  return (
    <section
      aria-labelledby="what-changed"
      className="mb-6 rounded-xl border border-moss bg-mossp px-4 py-3.5"
    >
      <h2 id="what-changed" className="label-mono mb-1.5 text-mossd">
        Since you were last here
      </h2>
      <p className="m-0 text-[15.5px] leading-relaxed">
        {weeksOn === 1
          ? `You’ve moved into week ${currentWeek}.`
          : `You’re in week ${currentWeek} now — ${weeksOn} weeks on from last time.`}
        {newTrimester && ' That’s a new trimester.'}
      </p>

      {fresh.length > 0 && (
        <>
          <p className="mb-1.5 mt-2.5 text-[14.5px] text-mossd">
            {fresh.length === 1
              ? 'One thing became relevant while you were away:'
              : `${fresh.length} things became relevant while you were away:`}
          </p>
          <ul className="m-0 list-none p-0">
            {fresh.map(({ guide, why }) => (
              <li key={guide.id} className="mb-1">
                <Link
                  to={`/healthy?open=${guide.id}`}
                  className="text-[15px] font-semibold text-mossd underline"
                >
                  {guide.title}
                </Link>
                <span className="block text-[13.5px] italic text-soft">{why}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
