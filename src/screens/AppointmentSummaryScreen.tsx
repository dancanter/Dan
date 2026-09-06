import { Link } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { useJournal } from '../hooks/useJournal';
import { useMovements } from '../hooks/useMovements';
import { usePersistedState } from '../hooks/usePersistedState';
import { appointments } from '../content/appointments';
import { formatDate } from '../lib/dates';

/**
 * One sheet to take into the appointment.
 *
 * The problem is real and small: you get ten or fifteen minutes with a
 * midwife, you had four things to ask, and in the room you remember one.
 * Everything needed to fix that is already on the device — saved questions,
 * logged symptoms, what you wrote about your baby's usual movements. It was
 * just spread across three screens and none of them fit on paper.
 *
 * **No PDF library.** The browser already has a PDF engine, `window.print()`
 * reaches it, and a print stylesheet costs nothing. Adding 400KB of jsPDF to
 * an offline-first app that has to open fast on a bad connection would be a
 * poor trade for a button most people press twice a month. On a phone this
 * lands as Share → Print → Save to Files, or as an actual sheet of paper,
 * which for an appointment is arguably the better artefact anyway.
 *
 * **It interprets nothing.** No scores, no trends, no "your mood has been
 * low", no flags. Every line on the sheet is something the person typed,
 * shown back in her own words. The app is not qualified to summarise her
 * health and does not pretend to be — the sheet says so, in the place a
 * clinician would look for provenance.
 */

/** Matches the key the movement journal's usual-pattern note writes to. */
const USUAL_PATTERN_KEY = 'fieldnotes:usual-movements';

/** How far back to include logged symptoms — roughly since the last visit. */
const SYMPTOM_WEEKS = 8;

export function AppointmentSummaryScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const { currentWeek, dueDate } = usePregnancyProfile();
  const { entries, questions } = useJournal();
  const { entries: movements } = useMovements();
  const [usualPattern] = usePersistedState<string>(USUAL_PATTERN_KEY, '');

  const week = currentWeek ?? null;
  const toAsk = questions.filter((q) => !q.asked);
  const asked = questions.filter((q) => q.asked);

  const since = week === null ? 0 : week - SYMPTOM_WEEKS;
  const symptoms = entries
    .filter((e) => e.kind === 'symptom' && (e.week === null || e.week >= since))
    .slice(0, 20);
  const notes = entries.filter((e) => e.kind === 'note').slice(0, 6);
  const moods = entries.filter((e) => e.kind === 'mood').slice(0, 10);

  const next = week === null ? undefined : appointments.find((a) => a.week >= week);
  const nothingSaved =
    toAsk.length === 0 && symptoms.length === 0 && notes.length === 0 && moods.length === 0;

  return (
    <main id="main" className="mx-auto max-w-[780px] px-4 pt-6 pb-24 print:max-w-none print:p-0">
      {/* Everything in this block is for the screen only. The sheet starts at
          the <article> below. */}
      <div className="print:hidden">
        <Link
          to="/appointments"
          className="mb-2 inline-flex min-h-11 items-center font-mono text-fine text-soft underline"
        >
          ← Appointments
        </Link>
        <h1 ref={headingRef} tabIndex={-1} className="mb-2 text-h1 outline-none">
          A sheet for your appointment
        </h1>
        <p className="mb-4 text-body leading-relaxed text-soft">
          Everything you have saved, on one page you can take in with you. Nothing is sent anywhere
          — this is printed by your phone or computer, from what is already on it.
        </p>

        {nothingSaved ? (
          <p className="mb-6 rounded-xl border border-line bg-card px-4 py-3 text-body leading-relaxed">
            There is nothing saved yet. Anything you tap{' '}
            <strong>“Save this to ask my midwife”</strong> on, or log in the{' '}
            <Link to="/journal" className="font-semibold underline">
              journal
            </Link>
            , will appear here.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => window.print()}
            className="mb-6 min-h-11 w-full rounded-lg border-2 border-ink bg-ink px-4 text-body font-semibold text-paper"
          >
            Print, or save as a PDF
          </button>
        )}
      </div>

      <article className="print:text-black">
        <header className="mb-5 border-b-2 border-ink pb-3">
          <h2 className="m-0 font-display text-h2">Notes for my appointment</h2>
          <p className="m-0 mt-1 font-mono text-meta text-soft print:text-black">
            {week !== null && `Week ${week}`}
            {dueDate && ` · due ${formatDate(dueDate)}`}
            {` · written ${formatDate(new Date().toISOString().slice(0, 10))}`}
          </p>
          {next && (
            <p className="m-0 mt-1 text-small text-soft print:text-black">
              Next expected: {next.title}, around week {next.week}
            </p>
          )}
        </header>

        {toAsk.length > 0 && (
          <Block title="Questions I want to ask">
            <ul className="m-0 list-none p-0">
              {toAsk.map((q) => (
                <li key={q.id} className="mb-2 flex gap-2.5 break-inside-avoid">
                  <span aria-hidden="true" className="font-mono text-soft print:text-black">
                    ☐
                  </span>
                  <span className="text-body leading-relaxed">{q.text}</span>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {symptoms.length > 0 && (
          <Block
            title={`Symptoms I logged${week !== null ? `, since week ${Math.max(1, since)}` : ''}`}
          >
            <ul className="m-0 list-none p-0">
              {symptoms.map((s) => (
                <li key={s.id} className="mb-1.5 break-inside-avoid text-body leading-relaxed">
                  <span className="font-mono text-meta text-soft print:text-black">
                    {s.week !== null ? `wk ${s.week}` : formatDate(s.date)}
                  </span>{' '}
                  {s.text}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {usualPattern.trim().length > 0 && (
          <Block title="What is usual for my baby's movements">
            <p className="m-0 whitespace-pre-wrap text-body leading-relaxed">{usualPattern}</p>
            {movements.length > 0 && (
              <p className="m-0 mt-1.5 font-mono text-meta text-soft print:text-black">
                {movements.length} movement{movements.length === 1 ? '' : 's'} logged in the app.
              </p>
            )}
          </Block>
        )}

        {moods.length > 0 && (
          <Block title="How I have been feeling">
            <p className="m-0 text-body leading-relaxed">{moods.map((m) => m.text).join(' · ')}</p>
            <p className="m-0 mt-1 font-mono text-meta text-soft print:text-black">
              Most recent first. These are the words I chose, not an assessment.
            </p>
          </Block>
        )}

        {notes.length > 0 && (
          <Block title="Other things I wrote down">
            <ul className="m-0 list-none p-0">
              {notes.map((n) => (
                <li key={n.id} className="mb-1.5 break-inside-avoid text-body leading-relaxed">
                  <span className="font-mono text-meta text-soft print:text-black">
                    {formatDate(n.date)}
                  </span>{' '}
                  {n.text}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {asked.length > 0 && (
          <Block title="Already asked at a previous appointment">
            <p className="m-0 text-small leading-relaxed text-soft print:text-black">
              {asked.map((q) => q.text).join(' · ')}
            </p>
          </Block>
        )}

        {/* Provenance, in the place a clinician looks for it. */}
        <footer className="mt-6 border-t border-line pt-3">
          <p className="m-0 text-small leading-relaxed text-soft print:text-black">
            Written by me in Field Notes, an app with no account and no server. Everything above is
            something I typed.{' '}
            <strong>Nothing here has been assessed, scored or checked by the app</strong>, and none
            of it is a clinical record. The tick boxes are the things I did not want to forget to
            ask.
          </p>
        </footer>
      </article>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 break-inside-avoid">
      <h3 className="label-mono mb-1.5 text-mossd print:text-black">{title}</h3>
      {children}
    </section>
  );
}
