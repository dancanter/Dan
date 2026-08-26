import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { usePregnancyStatus } from '../hooks/usePregnancyStatus';
import { useProgress } from '../hooks/useProgress';
import { useJournal } from '../hooks/useJournal';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useLastSeenWeek } from '../hooks/useLastSeenWeek';
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
import { FocusList } from '../components/today/FocusList';
import { LeadRead } from '../components/today/LeadRead';
import { WhatChanged } from '../components/today/WhatChanged';
import { MythCard } from '../components/today/MythCard';
import { MidwifeQuestionCard } from '../components/today/MidwifeQuestionCard';
import { ReadingCard } from '../components/today/ReadingCard';
import { BabyArrivedCard } from '../components/today/BabyArrivedCard';
import { AfterBirthScreen } from './AfterBirthScreen';
import { AfterLossHomeScreen } from './AfterLossHomeScreen';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Note } from '../components/ui/Note';

/**
 * The only thing in the app still using Framer Motion, and on most days it
 * does not mount at all — a milestone is reached seven times across a whole
 * pregnancy, and each one shows once. Loading an animation library eagerly for
 * that put it in front of every first paint, on the screen that has to open
 * fastest. Lazy, so the cost is paid on the seven days it is actually used.
 */
const MilestoneCelebration = lazy(() =>
  import('../components/week/MilestoneCelebration').then((m) => ({
    default: m.MilestoneCelebration,
  })),
);

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
  const previousWeek = useLastSeenWeek(currentWeek);
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
  // The most-relevant read is promoted to the top of the screen; the rest stay
  // as a quiet list further down. One thing to read beats five to choose from.
  const [lead, ...rest] = readsForWeek(week);

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
        // No fallback: a celebration that arrives a moment late is fine, and
        // a "Loading…" placeholder over the home screen would not be.
        <Suspense fallback={null}>
          <MilestoneCelebration
            title={`Week ${pendingMilestone.week}`}
            message={pendingMilestone.celebration}
            reduceMotionOverride={reduceMotion}
            onDismiss={() => markCelebrated(pendingMilestone.week)}
          />
        </Suspense>
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

      {/* Only on the reader's actual week. Browsing ahead to week 34 should
          not claim anything has changed. */}
      {viewWeek === null && (
        <WhatChanged
          previousWeek={previousWeek}
          currentWeek={currentWeek}
          excludeGuideId={lead?.guide.id}
        />
      )}

      {/* ── Tier one: the single thing worth knowing this week ───────────
          Everything below this is deliberately quieter. */}
      {lead && <LeadRead read={lead} alreadyRead={readGuideIds.includes(lead.guide.id)} />}

      {/* ── Tier two: this week's focus, and the rest of the reading ───── */}
      <SectionHeading>This week’s focus</SectionHeading>
      <FocusList items={focus} week={week} isTicked={isTicked} onToggle={toggleTick} />

      {rest.length > 0 && (
        <>
          <SectionHeading>Also relevant now</SectionHeading>
          <ReadingCard reads={rest} readGuideIds={readGuideIds} />
        </>
      )}

      <Note tone={note.tone} title={note.title}>
        {note.body}
      </Note>

      {/* ── Tier three: things to do, rather than things to read ────────── */}
      <SectionHeading>Quick actions</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        {[
          { to: '/journal', label: 'How I’m feeling' },
          { to: '/movements', label: 'Movement journal' },
          { to: '/body', label: 'Log a symptom' },
          { to: '/gallery', label: 'Bump gallery' },
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

      {/* Moved below the quick actions: a myth card and a question prompt are
          the least urgent things here, and they were competing with the week's
          guidance for attention purely by being the same size. */}
      <SectionHeading>Myth check</SectionHeading>
      <MythCard myth={myth} reduceMotionOverride={reduceMotion} onReveal={markMythRevealed} />

      <SectionHeading>Ask your midwife</SectionHeading>
      <MidwifeQuestionCard
        onSave={(q) => {
          addJournal('question', q, currentWeek);
        }}
      />

      {currentWeek >= 34 && <BabyArrivedCard />}
    </main>
  );
}
