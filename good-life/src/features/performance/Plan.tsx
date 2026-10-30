import { addDays, formatDay, todayISO, weekday, WEEKDAYS } from '@/lib/dates';
import { useStore } from '@/store/store';
import type { DayPlan, PlannedRun, RunFocus, SplitId } from '@/store/types';
import { SPLIT_LABEL } from '@/data/exercises';
import { defaultPlanTemplate } from '@/store/defaults';
import { dayPlan, PLANNED_RUN_LABEL, validateWeek, weekDates } from '@/engine/plan';
import { Button, Card, Note, Segmented, Select, cx } from '@/components/ui';

const RUN_OPTIONS: (PlannedRun | '')[] = ['', 'easy', 'easy-long', 'threshold', 'q2', 'speed', 'recovery'];
const GYM_OPTIONS: (SplitId | '')[] = ['', 'chest-triceps', 'back-biceps', 'legs', 'shoulders-forearms'];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

function DayEditor({ plan, onChange }: { plan: DayPlan; onChange: (p: DayPlan) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Select aria-label="Run" value={plan.run ?? ''} onChange={(e) => onChange({ ...plan, run: (e.target.value || null) as PlannedRun | null })}>
        {RUN_OPTIONS.map((r) => <option key={r} value={r}>{r ? PLANNED_RUN_LABEL[r] : 'No run'}</option>)}
      </Select>
      <Select aria-label="Gym" value={plan.gym ?? ''} onChange={(e) => onChange({ ...plan, gym: (e.target.value || null) as SplitId | null })}>
        {GYM_OPTIONS.map((g) => <option key={g} value={g}>{g ? SPLIT_LABEL[g] : 'No gym'}</option>)}
      </Select>
    </div>
  );
}

export function PlanTab() {
  const data = useStore((s) => s.data);
  const setTemplate = useStore((s) => s.setPlanTemplate);
  const setOverride = useStore((s) => s.setOverride);
  const patch = useStore((s) => s.patch);
  const today = todayISO();
  const dates = weekDates(today);
  const warnings = validateWeek(data, today);
  const swap = (d: string) => {
    const next = addDays(d, 1);
    const a = dayPlan(data, d);
    const b = dayPlan(data, next);
    setOverride(d, b);
    setOverride(next, a);
  };

  return (
    <div className="space-y-6">
      <Card eyebrow="This week" title="Move sessions, don’t drop them">
        {warnings.length > 0 && <div className="mb-4 space-y-2">{warnings.map((w, i) => <Note key={i} tone="warn">{w.message}</Note>)}</div>}
        <ul className="divide-y divide-line">
          {dates.map((d) => {
            const p = dayPlan(data, d);
            const overridden = !!data.planOverrides[d];
            return (
              <li key={d} className={cx('grid items-center gap-3 py-3 sm:grid-cols-[8rem_1fr_auto]', d === today && 'font-medium')}>
                <div className="text-sm">{formatDay(d)}{overridden && <span className="ml-2 text-xs text-bronze">moved</span>}</div>
                <DayEditor plan={p} onChange={(np) => setOverride(d, np)} />
                <div className="flex gap-1">
                  {d < dates[6] && <Button size="sm" variant="ghost" onClick={() => swap(d)}>Swap ↓</Button>}
                  {overridden && <Button size="sm" variant="ghost" onClick={() => setOverride(d, null)}>Reset</Button>}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted">Changes here affect this week only. The warnings flag back-to-back hard days, quality runs the day after legs, and weeks with no rest day.</p>
      </Card>

      <Card eyebrow="Template" title="Your usual week" action={<Button size="sm" variant="ghost" onClick={() => ORDER.forEach((i) => setTemplate(i, defaultPlanTemplate[i]))}>Restore default</Button>}>
        <ul className="divide-y divide-line">
          {ORDER.map((i) => (
            <li key={i} className="grid items-center gap-3 py-3 sm:grid-cols-[8rem_1fr]">
              <div className="text-sm">{WEEKDAYS[i]}{i === data.profile.restDay && <span className="ml-2 text-xs text-muted">rest day</span>}</div>
              <DayEditor plan={data.planTemplate[i]} onChange={(p) => setTemplate(i, p)} />
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl bg-surface-2 p-4 text-sm text-ink-2">
          <strong>Why the default looks like this.</strong> Saturday is full rest, so Sunday’s threshold session is run fresh. Legs go on Thursday after the second quality run — “hard days hard” — so the soreness falls on an upper-body day and the rest day, and is gone by Sunday. Speed sits on Tuesday with upper-body work, and easy days stay easy.
        </div>
      </Card>

      <Card eyebrow="Focus" title="What the second quality day trains">
        <Segmented<RunFocus>
          value={data.settings.runFocus}
          onChange={(v) => patch('settings', { runFocus: v })}
          options={[{ value: 'balanced', label: 'Balanced' }, { value: '5k', label: '5 km' }, { value: 'mile', label: 'Mile / 1 km' }, { value: 'short', label: '800 / 400' }]}
        />
        <p className="mt-3 text-sm text-ink-2">Balanced alternates VO₂max intervals and mile-pace reps each week. 5 km focus uses VO₂max every week; mile and short focus lean on race-pace reps with VO₂max every third time. Pursuing every distance at once is possible, but each block progresses fastest with one priority — choose it by season.</p>
      </Card>
      <p className="text-xs text-muted">Today is {WEEKDAYS[weekday(today)]}.</p>
    </div>
  );
}
