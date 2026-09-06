import { Link } from 'react-router-dom';
import { entitlementsWorthRaising } from '../../content/entitlements';

/**
 * A permanent way into the money-and-deadlines screen.
 *
 * The card on Home only appears when something is genuinely live, which is
 * right — a standing tile is furniture you stop seeing. But that left it
 * showing in 18 weeks out of 42, and for the other 24 the only routes were
 * the footer and the Explore list. For a screen about maternity pay, a legal
 * notice period and a grant window that closes, "it's in the footer" is not
 * good enough.
 *
 * Appointments is where it belongs: this is already the tab for dates and
 * admin — your timeline, your saved questions, what to remember before you
 * walk in. Paperwork with deadlines is the same kind of thing.
 *
 * It names what is behind the link rather than just pointing at it, and where
 * a deadline is close it says so — using the same rule Home uses, so the two
 * cannot disagree about what is urgent.
 */
export function PaperworkLink({ week }: { week: number }) {
  const live = entitlementsWorthRaising(week);

  return (
    <Link
      to="/entitlements"
      className="mb-6 block rounded-xl border border-line bg-card px-4 py-3.5 no-underline"
    >
      <span className="label-mono text-mossd">Money, forms and deadlines</span>
      <p className="mt-1 mb-0 text-body font-semibold leading-snug text-ink underline">
        {live.length > 0
          ? `${live[0].entitlement.title} — and the rest of the dates`
          : 'Maternity pay, free prescriptions, the grants'}
      </p>
      <p className="m-0 mt-1 text-small leading-relaxed text-soft">
        {live.length > 0
          ? 'Something here has a deadline coming up.'
          : 'What you can claim, when each one opens, and the ones with a deadline.'}
      </p>
    </Link>
  );
}
