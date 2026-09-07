import { Link } from 'react-router-dom';
import { Screen } from '../components/ui/Screen';
import { SectionHeading } from '../components/ui/SectionHeading';
import { SourceList } from '../components/ui/SourceList';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { NATION_LABEL, entitlementTimings, type EntitlementTiming } from '../content/entitlements';

/**
 * Money, forms and legal deadlines, ordered by where you are rather than
 * alphabetically.
 *
 * The reason this screen exists is that the rest of the app was strong on
 * what is happening to your body and nearly silent on the part that costs
 * money to get wrong. These are not obscure schemes: they are maternity pay,
 * free prescriptions, a grant, and a legal notice with a hard deadline. They
 * are missed constantly because the information is spread across GOV.UK and
 * NHS pages with no timing attached to any of it.
 *
 * The design rule here is the same one that governs the rest of the app:
 * nothing counts what you have not done. There are no ticks, no progress,
 * and no total. A window that has closed shows the route that is still open,
 * because almost all of them have one.
 */

const STATUS_LABEL: Record<EntitlementTiming['status'], string> = {
  'closing-soon': 'Deadline coming up',
  'open-now': 'You can do this now',
  anytime: 'Any time',
  later: 'Not yet',
  passed: 'Deadline has gone',
};

function deadlineLine(t: EntitlementTiming): string | null {
  const { weeksToDeadline, entitlement } = t;
  if (weeksToDeadline === null) {
    return entitlement.opensWeek === null ? null : `Opens at week ${entitlement.opensWeek}`;
  }
  if (weeksToDeadline < 0) return `Was week ${entitlement.deadlineWeek}`;
  if (weeksToDeadline === 0) return `This week — week ${entitlement.deadlineWeek}`;
  if (weeksToDeadline === 1) return '1 week away';
  return `${weeksToDeadline} weeks away`;
}

function EntitlementCard({ timing }: { timing: EntitlementTiming }) {
  const { entitlement: e, status } = timing;
  const urgent = status === 'closing-soon';
  const line = deadlineLine(timing);

  return (
    <li
      className={`rounded-xl border bg-card px-4 py-4 ${
        urgent ? 'border-clay border-2' : 'border-line'
      }`}
    >
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="label-mono text-mossd">{STATUS_LABEL[status]}</span>
        {line && <span className="font-mono text-meta text-soft">{line}</span>}
        {/* Named on every card, not only the two that differ. An app that
            quietly assumes England is wrong for eight million people. */}
        <span className="font-mono text-meta text-soft">{NATION_LABEL[e.nations]}</span>
      </div>

      <h3 className="font-display text-lead font-semibold">{e.title}</h3>
      <p className="mt-1 text-body leading-relaxed">{e.what}</p>
      <p className="mt-2 text-body leading-relaxed text-soft">{e.why}</p>

      <p className="mt-3 border-l-2 border-moss pl-3 text-body font-semibold leading-relaxed">
        {e.action}
      </p>

      {status === 'passed' && e.ifLate && (
        <p className="mt-3 rounded-lg bg-mossp px-3 py-2 text-body leading-relaxed text-mossd">
          <strong>Still open to you:</strong> {e.ifLate}
        </p>
      )}

      <SourceList sourceIds={e.sourceIds} />
    </li>
  );
}

/**
 * `passed` sits last, and it is folded.
 *
 * Measured at week 26: this screen ran 7.5 phone screens and 1,275 words,
 * and "The window has moved on" was 1,293px of it — a screen and a half of
 * deadlines already gone, fully expanded, sitting *above* the things she
 * could still act on. On a screen about money, while pregnant.
 *
 * The wording of those cards was already careful. The layout was not: the
 * least actionable thing on the page had the most of it. Nothing is removed
 * — several of these keep a route open after the date passes, which is
 * exactly why they must stay reachable — but they open on a tap now, and
 * they come after what is still ahead.
 */
const ORDER: EntitlementTiming['status'][] = [
  'closing-soon',
  'open-now',
  'anytime',
  'later',
  'passed',
];

/** Folded rather than dropped: gone deadlines are reference, not an agenda. */
const FOLDED: EntitlementTiming['status'][] = ['passed'];

const GROUP_HEADING: Record<EntitlementTiming['status'], string> = {
  'closing-soon': 'Worth doing soon',
  'open-now': 'Open to you now',
  anytime: 'Any time in pregnancy',
  passed: 'The window has moved on',
  later: 'Later in pregnancy',
};

export function EntitlementsScreen() {
  const { currentWeek } = usePregnancyProfile();
  // Someone can reach this without ever setting a due date. Week 12 is a
  // reasonable neutral position: far enough in that most windows are still
  // ahead, so nothing important is hidden behind a setup step.
  const week = currentWeek ?? 12;
  const timings = entitlementTimings(week);

  return (
    <Screen
      title="Money, forms and deadlines"
      lede={
        currentWeek
          ? `Where each of these stands at week ${currentWeek}. Nothing here is tracked or ticked off — it reads off the week you are in.`
          : 'Ordered as they come up in a pregnancy. Set a due date and this reorders around the week you are in.'
      }
      width="default"
    >
      <p className="mb-6 rounded-xl border border-line bg-card px-4 py-3 text-body leading-relaxed">
        No amounts are printed here. Payment rates change every April, and a figure sitting in an
        app is a figure going quietly out of date — so each of these links to the body that
        publishes the current one.
      </p>

      {ORDER.map((status) => {
        const group = timings.filter((t) => t.status === status);
        if (group.length === 0) return null;
        const list = (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {group.map((t) => (
              <EntitlementCard key={t.entitlement.id} timing={t} />
            ))}
          </ul>
        );

        if (!FOLDED.includes(status)) {
          return (
            <section key={status} className="mb-8">
              <SectionHeading>{GROUP_HEADING[status]}</SectionHeading>
              {list}
            </section>
          );
        }

        return (
          <details key={status} className="mb-8">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 border-t border-line pt-3 [&::-webkit-details-marker]:hidden">
              <span className="label-mono text-soft">{GROUP_HEADING[status]}</span>
              {/* Says what is inside without making it a thing to feel behind
                  on — a count of schemes, not a count of things not done. */}
              <span className="font-mono text-meta text-soft underline">
                {group.length} to look at
              </span>
            </summary>
            <p className="mb-3 mt-3 text-small leading-relaxed text-soft">
              A date passing does not always close a scheme. Where there is still a way through, it
              is on the card.
            </p>
            {list}
          </details>
        );
      })}

      <p className="mt-8 text-body leading-relaxed text-soft">
        This covers the schemes with a timing attached. Your rights at work — appointments, health
        and safety, and redundancy protection — are in{' '}
        <Link to="/healthy?q=work" className="font-semibold underline">
          the guidance library
        </Link>
        . If money is tight now rather than later, a midwife can refer you to a hospital social
        worker, and Citizens Advice will check what you are entitled to for free.
      </p>
    </Screen>
  );
}
