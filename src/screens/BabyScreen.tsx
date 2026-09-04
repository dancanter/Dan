import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { babyWeekByNumber, milestones, trimesterLabel } from '../content';
import { WeekBar } from '../components/week/WeekBar';
import { Screen } from '../components/ui/Screen';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Note } from '../components/ui/Note';
import { Button } from '../components/ui/Button';

export function BabyScreen() {
  const { currentWeek, isOnboarded, babyName, setBabyName } = usePregnancyProfile();
  const [viewWeek, setViewWeek] = useState<number | null>(null);
  const [nameDraft, setNameDraft] = useState(babyName ?? '');

  if (!isOnboarded || currentWeek === null) return <Navigate to="/" replace />;

  const week = viewWeek ?? currentWeek;
  const baby = babyWeekByNumber.get(week);
  const who = babyName ? babyName : 'your baby';

  return (
    <Screen
      title={babyName ? babyName : 'Your Baby'}
      lede="What’s developing, week by week."
      aside={<WeekBar week={week} onChange={setViewWeek} daysToGo={null} />}
    >
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="relative flex h-[92px] w-[92px] flex-none -rotate-4 flex-col items-center justify-center rounded-full border-[1.5px] border-clay bg-clayp">
          <span
            className="absolute inset-[7px] rounded-full border border-clay opacity-40"
            aria-hidden="true"
          />
          <b className="font-display text-[1.875rem] leading-none text-clay">{week}</b>
          <span className="label-mono font-normal text-clay">weeks</span>
        </div>
        <div className="min-w-[min(12.5rem,100%)] flex-1">
          <p className="label-mono mb-1 text-mossd">{trimesterLabel(week)}</p>
          <h2 className="mb-1 text-[1.25rem]">
            {baby?.sizeLabel ?? `Roughly the size of ${baby?.size}`}
          </h2>
          <p className="m-0 text-[0.90625rem] text-soft">Week {week} of 40</p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-gradient-to-br from-card to-mossp p-4.5 px-4 py-4">
        <h3 className="mb-2 text-[1.0625rem]">What’s developing this week</h3>
        <p className="m-0 text-[0.9375rem]">{baby?.development}</p>
      </div>

      <SectionHeading>Milestones ahead</SectionHeading>
      <ol className="relative m-0 list-none p-0">
        <span className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-sand" aria-hidden="true" />
        {milestones.map((m) => {
          const past = m.week < week;
          const now = Math.abs(m.week - week) <= 1;
          return (
            <li key={m.week} className="relative pb-5 pl-[34px]">
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
              <span className="label-mono block font-normal text-mossd">Week {m.week}</span>
              <span className="font-display text-[1rem] font-semibold">{m.title}</span>
              {now && <span className="sr-only"> — around now</span>}
            </li>
          );
        })}
      </ol>

      <SectionHeading>Give them a name</SectionHeading>
      <div className="rounded-xl border border-line bg-card p-4">
        <label htmlFor="baby-name" className="mb-2 block text-[0.9375rem]">
          Lots of people use a nickname before the real one is decided. Entirely optional — it just
          makes this page a little warmer.
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="baby-name"
            type="text"
            value={nameDraft}
            placeholder="e.g. Peanut"
            onChange={(e) => setNameDraft(e.target.value)}
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-base"
          />
          <Button intent="primary" onClick={() => setBabyName(nameDraft)}>
            Save
          </Button>
        </div>
      </div>

      <Note tone="calm" title="A note on sizes">
        The fruit-and-veg comparisons are a rough, friendly guide — babies vary enormously and {who}{' '}
        being bigger or smaller than “a mango” this week means nothing on its own. Your midwife
        measuring your bump is the measurement that matters.
      </Note>
    </Screen>
  );
}
