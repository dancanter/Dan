import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { useProgress } from '../hooks/useProgress';
import { useJournal, MOODS } from '../hooks/useJournal';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { postnatalFocus, postnatalNote, postnatalReads, postnatalStageLabel } from '../content';
import { FocusList } from '../components/today/FocusList';
import { ReadingCard } from '../components/today/ReadingCard';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Note } from '../components/ui/Note';

/**
 * The home screen once the baby has arrived. Same shape as Today so nothing
 * has to be relearned at the worst possible moment for learning things, but
 * every piece of content is keyed on weeks since birth rather than pregnancy
 * weeks. No streak numbers here — a newborn is not a reason to be shown a
 * counter you might break.
 */
export function AfterBirthScreen() {
  const { babyName, babyAgeDays, babyAgeWeeks } = usePregnancyProfile();
  const { isTicked, toggleTick, recordVisit, readGuideIds } = useProgress();
  const { add: addJournal } = useJournal();
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const [mood, setMood] = useState<string | null>(null);
  const lowMood = mood === 'Low' || mood === 'Anxious';

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  const days = babyAgeDays ?? 0;
  const weeks = babyAgeWeeks ?? 0;
  const focus = postnatalFocus(weeks);
  const reads = postnatalReads(weeks);
  const note = postnatalNote(weeks);
  const who = babyName ?? 'your baby';

  // Under a fortnight, days are how everyone actually counts. After that,
  // nobody says "my 43-day-old".
  const age =
    days < 14
      ? `${days} day${days === 1 ? '' : 's'} old`
      : `${weeks} week${weeks === 1 ? '' : 's'} old`;

  return (
    <main id="main" className="mx-auto max-w-[780px] px-4 pt-5 pb-24">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="relative flex h-[92px] w-[92px] flex-none -rotate-4 flex-col items-center justify-center rounded-full border-[1.5px] border-clay bg-clayp">
          <span
            className="absolute inset-[7px] rounded-full border border-clay opacity-40"
            aria-hidden="true"
          />
          <b className="font-display text-[30px] leading-none text-clay">
            {days < 14 ? days : weeks}
          </b>
          <span className="label-mono font-normal text-clay">
            {days < 14 ? (days === 1 ? 'day' : 'days') : weeks === 1 ? 'week' : 'weeks'}
          </span>
        </div>
        <div className="min-w-[200px] flex-1">
          <p className="label-mono mb-1 text-mossd">{postnatalStageLabel(weeks)}</p>
          <h1 ref={headingRef} tabIndex={-1} className="mb-1 text-[25px] outline-none">
            {babyName ? `${babyName} is ${age}` : `Your baby is ${age}`}
          </h1>
          <p className="m-0 text-[14.5px] text-soft">
            {weeks < 1
              ? 'Nobody expects you to have this figured out.'
              : weeks < 6
                ? 'Still very early. Short stretches of sleep are normal.'
                : weeks < 12
                  ? 'Things usually start to find a shape around now.'
                  : 'You are further through this than it probably feels.'}
          </p>
        </div>
      </div>

      <Note tone="warn" title="If something feels wrong" urgent>
        Heavy bleeding, a severe headache, chest pain, breathlessness or a temperature — for you or{' '}
        {who} — needs checking now, not tomorrow.{' '}
        <Link to="/help" className="underline">
          When to get help →
        </Link>
      </Note>

      {/* Postnatal focus ids are `pn-` prefixed, so passing weeks-since-birth
          here can never collide with a pregnancy week's ticks. */}
      <SectionHeading>Today</SectionHeading>
      <FocusList items={focus} week={weeks} isTicked={isTicked} onToggle={toggleTick} />

      <SectionHeading>Worth reading now</SectionHeading>
      <ReadingCard reads={reads} readGuideIds={readGuideIds} />

      <SectionHeading>How are you doing?</SectionHeading>
      <div className="rounded-xl border border-dashed border-moss bg-card p-4">
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => {
                addJournal('mood', m.value, null);
                setMood(m.value);
              }}
              aria-pressed={mood === m.value}
              className={`min-h-11 rounded-lg border px-3.5 text-[13.5px] font-semibold ${
                mood === m.value ? 'border-moss bg-mossp text-mossd' : 'border-line text-soft'
              }`}
            >
              <span aria-hidden="true">{m.emoji}</span> {m.value}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="mt-3 mb-0 text-[14px] text-mossd">
          {lowMood
            ? 'Worth knowing: more than 1 in 10 women get postnatal depression, and it responds well to treatment. If this has been most days for two weeks, tell your health visitor or GP.'
            : mood
              ? MOODS.find((m) => m.value === mood)?.message
              : 'Logged to your journal — useful to look back on at your 6-week check.'}
        </p>
        {lowMood && (
          <Link
            to="/healthy?open=postnatal-depression"
            className="mt-2 inline-block font-mono text-[11px] text-clay underline"
          >
            Read about postnatal depression →
          </Link>
        )}
      </div>

      <Note tone={note.tone} title={note.title}>
        {note.body}
      </Note>
    </main>
  );
}
