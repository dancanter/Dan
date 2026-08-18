import { Link } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { redFlags, helpTopics } from '../content';
import { SourceList } from '../components/ui/SourceList';
import { RichText } from '../components/ui/RichText';
import { Note } from '../components/ui/Note';

/**
 * Deliberately does NOT require onboarding — someone worried at 3am should
 * never hit a "set your due date first" wall.
 */
export function GetHelpScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const urgent = redFlags.filter((f) => f.level === 'maternity-unit');
  const emergency = redFlags.filter((f) => f.level === 'emergency');

  return (
    <main id="main" className="mx-auto max-w-[780px] px-4 pt-5 pb-24">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mb-2 border-b-2 border-alert pb-2 text-[25px] text-alert outline-none"
      >
        Get Help
      </h1>
      <p className="mb-5 text-[15px] italic text-mossd">
        If something feels wrong, this page is why this app exists.
      </p>

      <section
        aria-labelledby="urgent-heading"
        className="rounded-r-lg border-l-[3px] border-l-alert bg-alertp px-4 py-4"
      >
        <h2 id="urgent-heading" className="text-[17px] text-alert">
          Contact your maternity unit straight away — any hour, day or night
        </h2>
        <ul className="m-0 mt-3 list-none space-y-3 p-0">
          {urgent.map((f) => (
            <li key={f.id} className="text-[14.5px] leading-relaxed">
              <strong>{f.title}</strong> — {f.detail}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="emergency-heading"
        className="mt-4 rounded-r-lg border-l-[3px] border-l-alert bg-alertp px-4 py-4"
      >
        <h2 id="emergency-heading" className="text-[17px] text-alert">
          Call 999 or go to A&amp;E
        </h2>
        <ul className="m-0 mt-3 list-none space-y-2 p-0">
          {emergency.map((f) => (
            <li key={f.id} className="text-[14.5px] leading-relaxed">
              <strong>{f.title}</strong> — {f.detail}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6">
        {helpTopics
          .filter((t) => t.id !== 'where-to-go')
          .map((topic) => (
            <details key={topic.id} className="mb-3 rounded-xl border border-line bg-card px-4 py-3.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2.5 font-display text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
                {topic.title}
                <span className="font-mono text-moss" aria-hidden="true">
                  ›
                </span>
              </summary>
              <div className="mt-3">
                <RichText paragraphs={topic.body} />
                <SourceList sourceIds={topic.sourceIds} />
              </div>
            </details>
          ))}
      </div>

      <Note title="If you’ve experienced loss">
        Tommy’s midwives: <strong>0800 0147 800</strong> (free, Mon–Fri 9am–5pm) or
        midwife@tommys.org. Tommy’s also run a dedicated line for Black and Black Mixed-Heritage
        women and birthing people, in partnership with Five X More. Sands supports anyone affected
        by the death of a baby.
        <br />
        <br />
        <Link to="/loss" className="font-semibold text-mossd underline">
          Read more about pregnancy and baby loss →
        </Link>
      </Note>

      {/* Belongs on this screen specifically: the people most likely to have
        been dismissed are the people most likely to be reading it. */}
      <Note tone="calm" title="If you don’t feel you’re being listened to">
        You can ask to speak to a senior midwife, ask for a second opinion, or contact the
        hospital’s PALS team. If you feel dismissed and still think something is wrong, going back
        and asking again is always allowed — and there is documented evidence behind that concern,
        particularly for Black and Asian women.
        <br />
        <br />
        <Link to="/inequalities" className="font-semibold text-mossd underline">
          Inequalities in maternity care, and what you can do →
        </Link>
      </Note>
    </main>
  );
}
