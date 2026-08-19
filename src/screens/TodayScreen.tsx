import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { usePregnancyStatus } from '../hooks/usePregnancyStatus';
import { useProgress } from '../hooks/useProgress';
import { useJournal } from '../hooks/useJournal';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import {
  babyWeekByNumber,
  focusForWeek,
  milestones,
  myths,
  noteForWeek,
  readsForWeek,
  trimesterLabel,
} from '../content';
import { dayOfYear } from '../lib/dates';
import { WeekBar } from '../components/week/WeekBar';
import { MilestoneCelebration } from '../components/week/MilestoneCelebration';
import { FocusList } from '../components/today/FocusList';
import { MythCard } from '../components/today/MythCard';
import { MidwifeQuestionCard } from '../components/today/MidwifeQuestionCard';
import { ReadingCard } from '../components/today/ReadingCard';
import { BabyArrivedCard } from '../components/today/BabyArrivedCard';
import { AfterBirthScreen } from './AfterBirthScreen';
import { AfterLossHomeScreen } from './AfterLossHomeScreen';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Note } from '../components/ui/Note';

export function TodayScreen() {
  const { currentWeek, daysToGo, isOnboarded, hasBaby } = usePregnancyProfile();
  const { isAfterLoss, isPaused, setStatus } = usePregnancyStatus();
  const {
    isTicked,
    toggleTick,
    recordVisit,
    markMythRevealed,
    readGuideIds,
    celebratedWeeks,
    markCelebrated,
  } = useProgress();
  const { add: addJournal } = useJournal();
  const { reduceMotion } = useAccessibilitySettings();
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const [viewWeek, setViewWeek] = useState<number | null>(null);

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  const week = viewWeek ?? currentWeek ?? 12;

  // Support-after-loss takes precedence over everything, and is checked
  // before onboarding: it must hold even if the profile was cleared.
  if (isAfterLoss) return <AfterLossHomeScreen />;

  if (!isOnboarded || currentWeek === null) return <Navigate to="/" replace />;

  // Once the baby is here the daily screen is a different screen entirely —
  // same route, so nothing anyone has bookmarked or installed breaks.
  if (hasBaby) return <AfterBirthScreen />;

  if (isPaused) {
    return (
      <main id="main" className="mx-auto max-w-[620px] px-4 pt-10 pb-24">
        <h1 ref={headingRef} tabIndex={-1} className="mb-3 text-[24px] outline-none">
          Paused
        </h1>
        <p className="mb-6 text-[15.5px] leading-relaxed text-soft">
          Nothing is being tracked, and nothing has been deleted. Everything is exactly where you
          left it whenever you want it back.
        </p>
        <button
          type="button"
          onClick={() => setStatus('active')}
          className="min-h-11 w-full rounded-lg border border-line px-3 text-[15px] font-semibold"
        >
          Turn tracking back on
        </button>
        <p className="mt-8 border-t border-line pt-5 text-[14px] text-soft">
          <Link to="/help" className="underline">
            Get help
          </Link>
          {' · '}
          <Link to="/healthy" className="underline">
            Guidance
          </Link>
          {' · '}
          <Link to="/changed" className="underline">
            Change this
          </Link>
        </p>
      </main>
    );
  }

  const baby = babyWeekByNumber.get(week);
  const focus = focusForWeek(week);
  const note = noteForWeek(week);
  const myth = myths[dayOfYear() % myths.length];
  const reads = readsForWeek(week);

  // Only ever celebrate the *most recent* milestone reached. Someone who
  // installs the app at week 30 has already passed four of them — they
  // should get one warm moment, not a queue of pop-ups to dismiss.
  const reached = milestones.filter((m) => m.celebration && currentWeek >= m.week);
  const latestReached = reached[reached.length - 1];
  const pendingMilestone =
    latestReached && !celebratedWeeks.includes(latestReached.week) ? latestReached : undefined;

  return (
    <main id="main" className="mx-auto max-w-[780px] px-4 pt-5 pb-24">
      {pendingMilestone?.celebration && (
        <MilestoneCelebration
          title={`Week ${pendingMilestone.week}`}
          message={pendingMilestone.celebration}
          reduceMotionOverride={reduceMotion}
          onDismiss={() => markCelebrated(pendingMilestone.week)}
        />
      )}

      <WeekBar week={week} onChange={setViewWeek} daysToGo={viewWeek === null ? daysToGo : null} />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="relative flex h-[92px] w-[92px] flex-none -rotate-4 flex-col items-center justify-center rounded-full border-[1.5px] border-clay bg-clayp">
          <span
            className="absolute inset-[7px] rounded-full border border-clay opacity-40"
            aria-hidden="true"
          />
          <b className="font-display text-[30px] leading-none text-clay">{week}</b>
          <span className="label-mono font-normal text-clay">weeks</span>
        </div>
        <div className="min-w-[200px] flex-1">
          <p className="label-mono mb-1 text-mossd">{trimesterLabel(week)}</p>
          <h1 ref={headingRef} tabIndex={-1} className="mb-1 text-[25px] outline-none">
            Week {week}
          </h1>
          <p className="m-0 text-[14.5px] text-soft">
            {week <= 12
              ? 'Early, and a lot is happening quietly.'
              : week <= 27
                ? 'Often the most comfortable stretch.'
                : 'Getting close now.'}
          </p>
          {baby && (
            <Link
              to="/baby"
              className="mt-2 inline-block rounded-full border border-line bg-mossp px-3 py-1 text-[13.5px] text-mossd"
            >
              Roughly the size of {baby.size} →
            </Link>
          )}
        </div>
      </div>

      {viewWeek !== null && viewWeek !== currentWeek && (
        <button
          type="button"
          onClick={() => setViewWeek(null)}
          className="mb-2 font-mono text-[11px] text-clay underline"
        >
          ← Back to my week ({currentWeek})
        </button>
      )}

      <SectionHeading>This week’s focus</SectionHeading>
      <FocusList items={focus} week={week} isTicked={isTicked} onToggle={toggleTick} />

      {/* The library runs to birth, recovery and feeding. This is what pulls
          the right part of it onto the daily screen at the right week. */}
      <SectionHeading>Worth reading now</SectionHeading>
      <ReadingCard reads={reads} readGuideIds={readGuideIds} />

      <SectionHeading>Myth check</SectionHeading>
      <MythCard myth={myth} reduceMotionOverride={reduceMotion} onReveal={markMythRevealed} />

      <SectionHeading>Ask your midwife</SectionHeading>
      <MidwifeQuestionCard
        onSave={(q) => {
          addJournal('question', q, currentWeek);
        }}
      />

      <Note tone={note.tone} title={note.title}>
        {note.body}
      </Note>

      {/* Four fixed quick actions, always in the same place at the bottom. */}
      <SectionHeading>Quick actions</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        {[
          { to: '/journal', label: 'How I’m feeling' },
          { to: '/journal', label: 'Question for my midwife' },
          { to: '/body', label: 'Log a symptom' },
          { to: '/movements', label: 'Movement journal' },
        ].map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="flex min-h-[56px] items-center justify-center rounded-xl border border-line bg-card px-3 text-center text-[14.5px] font-medium text-ink no-underline"
          >
            {a.label}
          </Link>
        ))}
      </div>

      {currentWeek >= 34 && <BabyArrivedCard />}
    </main>
  );
}
