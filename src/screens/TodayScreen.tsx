import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
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
  trimesterLabel,
  WEEK_BADGES,
} from '../content';
import { dayOfYear } from '../lib/dates';
import { WeekBar } from '../components/week/WeekBar';
import { MilestoneCelebration } from '../components/week/MilestoneCelebration';
import { FocusList } from '../components/today/FocusList';
import { MythCard } from '../components/today/MythCard';
import { MidwifeQuestionCard } from '../components/today/MidwifeQuestionCard';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Note } from '../components/ui/Note';

export function TodayScreen() {
  const { currentWeek, daysToGo, isOnboarded } = usePregnancyProfile();
  const {
    isTicked,
    toggleTick,
    recordVisit,
    markMythRevealed,
    awardBadge,
    celebratedWeeks,
    markCelebrated,
    currentStreak,
    daysVisited,
  } = useProgress();
  const { add: addJournal } = useJournal();
  const { reduceMotion } = useAccessibilitySettings();
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const [viewWeek, setViewWeek] = useState<number | null>(null);

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  const week = viewWeek ?? currentWeek ?? 12;

  // Badges are awarded for the week you've actually reached, never for a
  // week you've merely browsed to.
  useEffect(() => {
    if (currentWeek === null) return;
    for (const wb of WEEK_BADGES) {
      if (currentWeek >= wb.week) awardBadge(wb.badgeId);
    }
  }, [currentWeek, awardBadge]);

  if (!isOnboarded || currentWeek === null) return <Navigate to="/" replace />;

  const baby = babyWeekByNumber.get(week);
  const focus = focusForWeek(week);
  const note = noteForWeek(week);
  const myth = myths[dayOfYear() % myths.length];

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
          <span className="absolute inset-[7px] rounded-full border border-clay opacity-40" aria-hidden="true" />
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

      <div className="flex gap-3 rounded-xl border border-line bg-card px-4 py-3">
        <div className="flex-1 text-center">
          <div className="font-display text-[24px] font-bold text-clay">{currentStreak}</div>
          <div className="font-mono text-[10px] text-soft">day streak</div>
        </div>
        <div className="w-px bg-line" aria-hidden="true" />
        <div className="flex-1 text-center">
          <div className="font-display text-[24px] font-bold text-mossd">{daysVisited}</div>
          <div className="font-mono text-[10px] text-soft">days visited</div>
        </div>
        <p className="sr-only">
          {currentStreak === 0
            ? 'No pressure — pick up whenever suits you.'
            : `Current streak ${currentStreak} days.`}{' '}
          You have visited on {daysVisited} days in total.
        </p>
      </div>

      <SectionHeading>This week’s focus</SectionHeading>
      <FocusList items={focus} week={week} isTicked={isTicked} onToggle={toggleTick} />

      <SectionHeading>Myth check</SectionHeading>
      <MythCard myth={myth} reduceMotionOverride={reduceMotion} onReveal={markMythRevealed} />

      <SectionHeading>Ask your midwife</SectionHeading>
      <MidwifeQuestionCard
        onSave={(q) => {
          addJournal('question', q, currentWeek);
          awardBadge('question-ready');
        }}
      />

      <Note tone={note.tone} title={note.title}>
        {note.body}
      </Note>
    </main>
  );
}
