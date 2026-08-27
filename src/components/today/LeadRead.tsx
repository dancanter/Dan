import { Link } from 'react-router-dom';
import type { WeekRead } from '../../content/weeklyReads';

/**
 * The one thing on the daily screen that is allowed to be big.
 *
 * Today used to be six sections of identical visual weight — focus list,
 * reading, myth, midwife questions, a note, quick actions — so nothing told
 * you where to start. On a screen opened by someone exhausted or nauseous,
 * "everything is equally important" reads as "work out what matters yourself".
 *
 * So the most relevant read for this week is promoted, and it leads with *why
 * now* rather than its title: "packed from around 37 weeks" is what makes
 * someone tap. The rest drop to a quiet list underneath.
 *
 * It is a suggestion, never an instruction, and nothing tracks whether it was
 * followed.
 */
export function LeadRead({ read, alreadyRead }: { read: WeekRead; alreadyRead: boolean }) {
  return (
    <Link
      to={`/healthy?open=${read.id}`}
      className="mb-3 block rounded-xl border-[1.5px] border-clay bg-clayp px-4 py-4 no-underline"
    >
      <span className="label-mono mb-1.5 block text-clay">
        {alreadyRead ? 'Worth another look' : 'Worth knowing this week'}
      </span>
      <span className="mb-2 block font-display text-[20px] font-semibold leading-snug text-ink">
        {read.title}
      </span>
      <span className="block text-[15px] leading-relaxed text-soft">{read.why}</span>
      <span className="mt-2.5 block font-mono text-[11px] text-clay">Read this →</span>
    </Link>
  );
}
