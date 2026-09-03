import { Link, Navigate } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { useJournal } from '../hooks/useJournal';
import { appointments, helpTopics, readsForWeek } from '../content';
import { Screen } from '../components/ui/Screen';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Note } from '../components/ui/Note';
import { MidwifeQuestionCard } from '../components/today/MidwifeQuestionCard';
import { QuestionList } from '../components/appointments/QuestionList';
import { EvidenceNote } from '../components/ui/EvidenceNote';
import { RichText } from '../components/ui/RichText';

export function AppointmentsScreen() {
  const { currentWeek, isOnboarded, firstPregnancy, setFirstPregnancy } = usePregnancyProfile();
  const { add: addJournal, questions } = useJournal();

  if (!isOnboarded || currentWeek === null) return <Navigate to="/" replace />;

  const visible = appointments.filter((a) => firstPregnancy || !a.firstPregnancyOnly);
  const next = visible.find((a) => a.week >= currentWeek);
  const whereToGo = helpTopics.find((t) => t.id === 'where-to-go');
  const toAsk = questions.filter((q) => !q.asked);
  // Reads relevant to the week the appointment falls in, not to today — the
  // point is to arrive prepared for that conversation.
  const prepReads = next ? readsForWeek(next.week).slice(0, 2) : [];

  return (
    <Screen title="Appointments" lede="What’s coming up, and how to get the most from it.">
      <Note tone="calm" title="Starting your care">
        You don’t need a GP referral — self-refer for NHS pregnancy care as soon as you know you’re
        pregnant. Search “self-refer maternity” plus your area, or ask your GP surgery.
        <br />
        <br />
        {firstPregnancy
          ? 'First pregnancy: around 10 appointments plus 2 scans.'
          : 'If you’ve given birth before: usually around 7 appointments plus 2 scans.'}
      </Note>

      {/* Asked here rather than in onboarding: this is the first and only
        place it changes what anyone sees. */}
      <fieldset className="mb-5 rounded-xl border border-line bg-card px-4 py-3.5">
        <legend className="px-1 text-sm font-semibold">Is this your first pregnancy?</legend>
        <p className="mb-2.5 text-[0.84375rem] text-soft">
          First pregnancies are offered a couple of extra appointments. This only tailors the
          timeline below.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFirstPregnancy(true)}
            aria-pressed={firstPregnancy}
            className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-medium ${
              firstPregnancy ? 'border-moss bg-mossp text-mossd' : 'border-line text-soft'
            }`}
          >
            Yes, my first
          </button>
          <button
            type="button"
            onClick={() => setFirstPregnancy(false)}
            aria-pressed={!firstPregnancy}
            className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-medium ${
              !firstPregnancy ? 'border-moss bg-mossp text-mossd' : 'border-line text-soft'
            }`}
          >
            I’ve given birth before
          </button>
        </div>
      </fieldset>

      {next && (
        <>
          {/* Not a calendar entry — a preparation panel. The valuable question
              this screen answers is "what should I remember before I walk in",
              so what you saved and what is worth reading sit here, together,
              above the timeline rather than scattered below it. */}
          <section
            aria-labelledby="prep-heading"
            className="my-4 rounded-xl border border-clay/40 bg-clayp p-4"
          >
            <span className="label-mono text-clay">Before your appointment</span>
            <h2 id="prep-heading" className="mt-1 text-[1.1875rem]">
              {next.title}
            </h2>
            <p className="m-0 text-[0.90625rem] text-soft">
              Around week {next.week}
              {next.week > currentWeek
                ? ` — about ${next.week - currentWeek} week${next.week - currentWeek === 1 ? '' : 's'} away`
                : ' — around now'}
            </p>

            {toAsk.length > 0 && (
              <div className="mt-3.5 border-t border-clay/25 pt-3">
                <p className="label-mono mb-1.5 text-clay">Things you saved to ask</p>
                <ul className="m-0 list-none p-0">
                  {toAsk.slice(0, 4).map((q) => (
                    <li key={q.id} className="mb-1 flex gap-2 text-[0.90625rem] leading-relaxed">
                      <span aria-hidden="true" className="text-clay">
                        ·
                      </span>
                      <span>{q.text}</span>
                    </li>
                  ))}
                </ul>
                {toAsk.length > 4 && (
                  <p className="mt-1.5 text-[0.84375rem] italic text-soft">
                    and more, further down this screen.
                  </p>
                )}
              </div>
            )}

            {prepReads.length > 0 && (
              <div className="mt-3.5 border-t border-clay/25 pt-3">
                <p className="label-mono mb-1.5 text-clay">Worth reading first</p>
                <ul className="m-0 list-none p-0">
                  {prepReads.map((r) => (
                    <li key={r.id} className="mb-1.5">
                      {/* The underline sits on the title, not the link.
                          text-decoration propagates to descendants and cannot
                          be removed by them, so underlining the whole link
                          underlined the explanation too — which made a plain
                          sentence look tappable. */}
                      <Link
                        to={`/healthy?open=${r.id}`}
                        className="flex min-h-11 flex-col justify-center gap-0.5 py-1 no-underline"
                      >
                        <span className="text-[0.90625rem] font-semibold leading-snug text-mossd underline">
                          {r.title}
                        </span>
                        <span className="text-[0.84375rem] leading-snug text-soft">{r.why}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </>
      )}

      <SectionHeading>Your timeline</SectionHeading>
      <ol className="relative m-0 list-none p-0">
        <span className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-sand" aria-hidden="true" />
        {visible.map((a, i) => {
          const past = a.week < currentWeek;
          const now = Math.abs(a.week - currentWeek) <= 1;
          return (
            <li key={`${a.week}-${i}`} className="relative pb-5 pl-[34px]">
              <span
                aria-hidden="true"
                className={`absolute left-1 top-1 h-4 w-4 rounded-full border-[2.5px] ${
                  now
                    ? 'border-clay bg-clay ring-4 ring-clayp'
                    : past
                      ? 'border-moss bg-moss'
                      : 'border-sand bg-paper'
                }`}
              />
              <span className="label-mono block font-normal text-mossd">Week {a.week}</span>
              <span className="font-display text-[1rem] font-semibold">{a.title}</span>
              <p className="m-0 text-sm text-soft">{a.detail}</p>
            </li>
          );
        })}
      </ol>

      <Note title="The standing rule">
        You can contact maternity services any time, about anything. You never have to wait for your
        next scheduled appointment, and you’re never bothering them.
      </Note>

      {/* The list first, then the prompt that feeds it. Someone opening this
          screen the morning of an appointment wants what they already saved,
          not a suggestion for something else to ask. */}
      <QuestionList />

      <SectionHeading>Not sure what to ask?</SectionHeading>
      <MidwifeQuestionCard
        onSave={(q) => {
          addJournal('question', q, currentWeek);
        }}
      />

      <details className="mt-4 mb-3 rounded-xl border border-line bg-card">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2.5 px-4 py-3.5 font-display text-[1rem] font-semibold [&::-webkit-details-marker]:hidden">
          What the booking appointment actually involves
          <span className="font-mono text-moss" aria-hidden="true">
            ›
          </span>
        </summary>
        <div className="px-4 pb-3.5">
          <RichText
            paragraphs={[
              'It’s the longest one — around an hour. Your midwife takes a full history: your health, mental health, home situation, work, and lifestyle. Blood pressure, urine test, and a blood test for your blood group and iron.',
              'You’ll also be asked routine questions about domestic abuse and FGM. These are asked of *everyone*, not because anything is suspected — it’s how support gets offered to people who need it.',
              'You’ll be given your maternity notes (app, book, or folder). Keep them with you at all times — if you need urgent care anywhere, staff can read your full pregnancy history.',
            ]}
          />
          <EvidenceNote sourceIds={['nhs-antenatal-care']} />
        </div>
      </details>

      {whereToGo && (
        <details className="mb-3 rounded-xl border border-line bg-card">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2.5 px-4 py-3.5 font-display text-[1rem] font-semibold [&::-webkit-details-marker]:hidden">
            {whereToGo.title}
            <span className="font-mono text-moss" aria-hidden="true">
              ›
            </span>
          </summary>
          <div className="px-4 pb-3.5">
            <RichText paragraphs={whereToGo.body} />
            <EvidenceNote sourceIds={whereToGo.sourceIds} />
          </div>
        </details>
      )}
    </Screen>
  );
}
