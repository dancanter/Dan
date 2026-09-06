import { Link } from 'react-router-dom';
import { entitlementsWorthRaising } from '../../content/entitlements';

/**
 * The one or two money-or-paperwork deadlines that are actually live this
 * week, and nothing when there are none.
 *
 * Conditional on purpose. A permanent "your entitlements" tile is furniture —
 * you stop seeing it by week three. This appears when a window opens or a
 * deadline comes within about a month, says which, and goes away again. That
 * makes it information rather than navigation.
 *
 * It states the deadline and stops. No tick, no count, no "2 of 11
 * completed" — the app cannot see whether you have sent a form, and a
 * checklist that guesses would either nag someone who has already done it or
 * congratulate someone who hasn't.
 */
export function DeadlinesNote({ week }: { week: number }) {
  const raising = entitlementsWorthRaising(week);
  if (raising.length === 0) return null;

  return (
    <section
      aria-labelledby="deadlines-note"
      className="mb-6 rounded-xl border-2 border-clay bg-card px-4 py-4"
    >
      <h2 id="deadlines-note" className="font-display text-[1.0625rem] font-semibold">
        {raising.length === 1 ? 'One thing with a deadline' : 'Two things with deadlines'}
      </h2>
      <p className="mt-1 text-[0.875rem] text-soft">
        Paperwork rather than pregnancy — but these ones have money or legal rights attached.
      </p>

      <ul className="mt-3 flex list-none flex-col gap-3 p-0">
        {raising.map(({ entitlement, weeksToDeadline }) => (
          <li key={entitlement.id}>
            <p className="m-0 text-[0.9375rem] font-semibold leading-snug">{entitlement.title}</p>
            <p className="m-0 mt-0.5 text-[0.9375rem] leading-relaxed text-soft">
              {weeksToDeadline === null
                ? 'You can do this from now on.'
                : weeksToDeadline <= 0
                  ? 'The deadline is this week.'
                  : weeksToDeadline === 1
                    ? 'One week until the deadline.'
                    : `${weeksToDeadline} weeks until the deadline.`}{' '}
              {entitlement.action}
            </p>
          </li>
        ))}
      </ul>

      <Link
        to="/entitlements"
        className="mt-3 inline-flex min-h-11 items-center text-[0.9375rem] font-semibold underline"
      >
        All the dates, and what each one is for
      </Link>
    </section>
  );
}
