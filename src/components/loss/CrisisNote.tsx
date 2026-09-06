import { Link } from 'react-router-dom';
import { LOSS_CRISIS_NOTE } from '../../content/loss';

/**
 * The one case a page about grief cannot answer, named before the page
 * starts.
 *
 * Neither loss screen had any route out of a crisis. Someone reading about
 * baby loss at 3am, unable to keep themselves safe, had a page of gentle
 * writing and nowhere to go. The calm page already solves this by naming the
 * harder case first and routing it off the page; this is the same move on
 * the two screens that needed it most and did not have it.
 *
 * Samaritans is written out rather than only linked. It is free, answered
 * day and night, and someone in that state should not have to tap twice.
 */
export function CrisisNote() {
  return (
    <div className="mb-6 rounded-xl border-2 border-alert bg-alertp px-4 py-3.5">
      <p className="m-0 text-[0.96875rem] font-semibold leading-relaxed">
        {LOSS_CRISIS_NOTE.heading}
      </p>
      <p className="mb-3 mt-1.5 text-[0.90625rem] leading-relaxed">{LOSS_CRISIS_NOTE.body}</p>
      <a
        href="tel:116123"
        className="flex min-h-11 w-full items-center justify-center rounded-lg border-2 border-alert bg-alert px-4 text-[0.96875rem] font-semibold text-white no-underline"
      >
        {LOSS_CRISIS_NOTE.samaritans}
      </a>
      <Link
        to="/help/mental-health"
        className="mt-2 flex min-h-11 items-center text-[0.90625rem] font-semibold underline"
      >
        Other ways to get help now
      </Link>
    </div>
  );
}
