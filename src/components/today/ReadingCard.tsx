import { Link } from 'react-router-dom';
import type { WeekRead } from '../../content/weeklyReads';

interface Props {
  reads: WeekRead[];
  /** Ids already opened, so read items are marked without hiding them. */
  readGuideIds: string[];
}

/**
 * The bridge between the daily screen and the guidance library. Each item
 * leads with *why now* rather than the title, because "packed from around 37
 * weeks" is what makes someone tap — the title alone reads like a contents page.
 */
export function ReadingCard({ reads, readGuideIds }: Props) {
  if (reads.length === 0) return null;

  return (
    <ul className="m-0 list-none p-0">
      {reads.map(({ id, title, why }) => {
        const alreadyRead = readGuideIds.includes(id);
        return (
          <li key={id} className="mb-3">
            <Link
              to={`/healthy?open=${id}`}
              className="block rounded-xl border border-line bg-card px-4 py-3.5 no-underline transition-colors hover:border-moss"
            >
              <span className="label-mono mb-1 block text-clay">
                {alreadyRead ? 'Read again' : 'Why now'}
              </span>
              <span className="mb-1.5 block text-[0.90625rem] italic text-mossd">{why}</span>
              <span className="flex items-center justify-between gap-2 font-display text-[1rem] font-semibold text-ink">
                {title}
                <span className="font-mono text-moss" aria-hidden="true">
                  →
                </span>
              </span>
            </Link>
          </li>
        );
      })}
      <li>
        <Link to="/healthy" className="font-mono text-[0.6875rem] text-clay underline">
          Browse all guidance →
        </Link>
      </li>
    </ul>
  );
}
