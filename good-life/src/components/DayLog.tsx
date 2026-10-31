import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { addDays, formatDay, todayISO, type ISODate } from '@/lib/dates';
import { formatDuration, formatPace, parseTime } from '@/lib/time';
import { parseWeight, weightValue } from '@/lib/units';
import { useStore } from '@/store/store';
import type { CheckIn, Habit, Illness, LegFeel, RunEvent, RunLog, RunType, SplitId } from '@/store/types';
import { SPLIT_LABEL } from '@/data/exercises';
import { dayPlan } from '@/engine/plan';
import { targets } from '@/engine/nutrition';
import { analyseRun, currentFitness, EVENT_LABEL, paceZones, RUN_TYPE_LABEL } from '@/engine/running';
import { FlagChips, RunForm } from './forms';
import { Card, Chip, Input, Segmented, Select, cx } from './ui';

// One card for the whole day, modelled on the tracker Dan already used:
// everything on one screen, saved as it is typed, no Save buttons. The
// detailed loggers (gym sets, food by item, study by topic) stay where they
// are for when the detail is worth it.

const HABITS: { key: Habit; label: string }[] = [
  { key: 'no-phone', label: '📵 No phone in bed' },
  { key: 'skin-am', label: 'Skin AM' },
  { key: 'skin-pm', label: 'Skin PM' },
  { key: 'teeth', label: 'Teeth + floss' },
];

const RUN_ORDER: RunType[] = ['easy', 'long', 'recovery', 'threshold', 'vo2', 'race-pace', 'speed', 'hills', 'tempo', 'time-trial', 'race'];
const REP_TYPES: RunType[] = ['threshold', 'vo2', 'race-pace', 'speed', 'hills'];

const RPE_LABEL: Record<number, string> = { 2: ' · barely noticed it', 4: ' · comfortable', 7: ' · genuinely hard work', 9: ' · hanging on', 10: ' · nothing left' };

/** Time in bed from "HH:MM" bedtime and wake time, to the nearest quarter hour. */
export function hoursInBed(bed?: string, wake?: string): number | undefined {
  if (!bed || !wake) return undefined;
  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  if ([bh, bm, wh, wm].some((n) => !Number.isFinite(n))) return undefined;
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return Math.round(mins / 15) / 4;
}

function hm(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function DayLog({ initialDate, compact }: { initialDate?: ISODate; compact?: boolean }) {
  const today = todayISO();
  const [date, setDate] = useState(initialDate ?? today);
  const label = date === today ? 'Today' : date === addDays(today, -1) ? 'Yesterday' : formatDay(date);
  const body = <DayLogBody key={date} date={date} />;
  const nav = (
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))} className="grid h-8 w-8 place-items-center rounded-full border border-line hover:bg-surface-2"><ChevronLeft size={16} /></button>
      <button type="button" aria-label="Next day" disabled={date >= today} onClick={() => setDate(addDays(date, 1))} className="grid h-8 w-8 place-items-center rounded-full border border-line hover:bg-surface-2 disabled:opacity-30"><ChevronRight size={16} /></button>
      {date !== today && <button type="button" onClick={() => setDate(today)} className="ml-1 text-sm font-medium underline underline-offset-2">Today</button>}
    </div>
  );
  if (compact) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="font-serif text-2xl">{label}</div>
          {nav}
        </div>
        {body}
      </div>
    );
  }
  return (
    <Card id="log" eyebrow="Daily log · saves as you type" title={label} action={nav}>
      {body}
    </Card>
  );
}

function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="border-t border-line pt-4 first:border-t-0 first:pt-0">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{title}</h3>
        {aside && <span className="text-xs text-muted">{aside}</span>}
      </div>
      {children}
    </div>
  );
}

/**
 * A number box that saves on every keystroke that reads as a sensible value.
 * It keeps its own text so "123." or a half-typed number is not clobbered.
 */
function NumField({ label, value, onCommit, min, max, decimals, hint, unit }: {
  label: string | { aria: string }; value: number | undefined; onCommit: (n: number | undefined) => void;
  min: number; max: number; decimals?: boolean; hint?: ReactNode; unit?: string;
}) {
  const [text, setText] = useState(value != null ? String(value) : '');
  const n = text.trim() === '' ? undefined : Number(text.replace(',', '.'));
  const bad = n != null && (!Number.isFinite(n) || n < min || n > max);
  return (
    <label className="block min-w-0">
      {typeof label === 'string' && <span className="mb-1 block text-xs font-medium text-ink-2">{label}</span>}
      <div className="relative">
        <Input
          aria-label={typeof label === 'string' ? undefined : label.aria}
          inputMode={decimals ? 'decimal' : 'numeric'}
          value={text}
          placeholder="—"
          aria-invalid={bad || undefined}
          className={cx(unit && 'pr-10', bad && 'border-bad')}
          onChange={(e) => {
            const t = e.target.value;
            setText(t);
            const v = t.trim() === '' ? undefined : Number(t.replace(',', '.'));
            if (v == null) onCommit(undefined);
            else if (Number.isFinite(v) && v >= min && v <= max) onCommit(decimals ? Math.round(v * 10) / 10 : Math.round(v));
          }}
        />
        {unit && <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-xs text-muted">{unit}</span>}
      </div>
      {hint && <span className="mt-1 block text-[11px] leading-snug text-muted">{hint}</span>}
    </label>
  );
}

function Taps({ label, value, onChange, low, high, invert }: { label: string; value?: number; onChange: (v: number | undefined) => void; low: string; high: string; invert?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 text-sm leading-tight">
        <div className="font-medium">{label}</div>
        <div className="text-[11px] text-muted">{low} → {high}</div>
      </div>
      <div role="radiogroup" aria-label={label} className="flex shrink-0 gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const good = invert ? n <= 2 : n >= 4;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              onClick={() => onChange(value === n ? undefined : n)}
              className={cx('h-9 w-9 rounded-lg border text-sm tabular transition-colors', value === n ? (good ? 'border-good bg-good text-white' : 'border-navy bg-navy text-navy-ink') : 'border-line bg-surface hover:bg-surface-2')}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayLogBody({ date }: { date: ISODate }) {
  const data = useStore((s) => s.data);
  const setCheckIn = useStore((s) => s.setCheckIn);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const c: Partial<CheckIn> = data.checkIns[date] ?? {};
  const set = (patch: Partial<CheckIn>) => setCheckIn(date, patch);
  const profile = data.profile;

  // ── Weight ──
  const unit = profile.weightUnit === 'kg' ? 'kg' : 'lb';
  const wEntry = data.weights.find((w) => w.date === date && !w.demo);
  const commitWeight = (n: number | undefined) => {
    if (n == null) {
      if (wEntry) remove('weights', wEntry.id);
      return;
    }
    upsert('weights', { ...(wEntry ?? { id: `w-${date}`, date, conditions: 'morning-fasted' as const }), kg: parseWeight(n, unit) });
  };

  // ── Sleep ──
  const setTimes = (bedTime: string | undefined, wakeTime: string | undefined) => set({ bedTime, wakeTime, sleepHours: hoursInBed(bedTime, wakeTime) });
  const inBed = hoursInBed(c.bedTime, c.wakeTime);

  // ── Food ──
  const hasFoodLog = data.food.some((f) => f.date === date);
  const energy = targets(data, date).energy;

  // ── Habits / flags ──
  const habits = c.habits ?? [];
  const toggleHabit = (h: Habit) => set({ habits: habits.includes(h) ? habits.filter((x) => x !== h) : [...habits, h] });
  const [hurtOpen, setHurtOpen] = useState(c.niggle != null);
  const ill = c.illness && c.illness !== 'none';
  const [illOpen, setIllOpen] = useState(!!ill);

  return (
    <div className="space-y-5">
      <Section title="Morning" aside={inBed != null ? `${hm(inBed)} in bed` : undefined}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumField label="Weight" unit={unit} decimals value={wEntry ? Number(weightValue(wEntry.kg, unit).toFixed(1)) : undefined} min={unit === 'kg' ? 30 : 70} max={unit === 'kg' ? 200 : 440} onCommit={commitWeight} hint="On waking, after the loo" />
          <NumField label="Resting HR, on waking" unit="bpm" value={c.restingHr} min={25} max={120} onCommit={(restingHr) => set({ restingHr })} />
          <label className="block min-w-0">
            <span className="mb-1 block text-xs font-medium text-ink-2">😴 Bed last night</span>
            <Input type="time" value={c.bedTime ?? ''} onChange={(e) => setTimes(e.target.value || undefined, c.wakeTime)} />
          </label>
          <label className="block min-w-0">
            <span className="mb-1 block text-xs font-medium text-ink-2">☀️ Woke up</span>
            <Input type="time" value={c.wakeTime ?? ''} onChange={(e) => setTimes(c.bedTime, e.target.value || undefined)} />
          </label>
        </div>
        {inBed != null && <p className="mt-2 text-[11px] text-muted">Time in bed runs a little above actual sleep; it is what the readiness score uses.</p>}
      </Section>

      <Section title="How you feel" aside="tap again to clear">
        <div className="space-y-2.5">
          <Taps label="Energy" low="flat" high="brilliant" value={c.energy} onChange={(energy) => set({ energy })} />
          <Taps label="Sleep quality" low="poor" high="great" value={c.sleepQuality} onChange={(sleepQuality) => set({ sleepQuality })} />
          <Taps label="Stress" low="calm" high="very" invert value={c.stress} onChange={(stress) => set({ stress })} />
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="text-sm font-medium">Legs</span>
            <Segmented<LegFeel> size="sm" label="Legs" value={c.legs} onChange={(legs) => set({ legs })} options={[{ value: 'fresh', label: 'Fresh' }, { value: 'normal', label: 'Normal' }, { value: 'heavy', label: 'Heavy' }, { value: 'sore', label: 'Sore' }]} />
          </div>
        </div>
      </Section>

      <Section title="Through the day">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumField label="Steps" value={c.steps} min={0} max={100000} onCommit={(steps) => set({ steps })} hint={`Target ${profile.stepsTarget.toLocaleString('en-GB')}`} />
          <NumField
            label="kcal eaten"
            value={c.kcalEaten}
            min={0}
            max={8000}
            onCommit={(kcalEaten) => set({ kcalEaten })}
            hint={hasFoodLog ? 'Your food log for this day is used instead' : `Aim ≈ ${energy.lo.toLocaleString('en-GB')}–${energy.hi.toLocaleString('en-GB')}`}
          />
        </div>
        <StudyRows date={date} />
      </Section>

      <Section title="Training">
        <GymRow date={date} />
        <RunsOnDay date={date} />
      </Section>

      <Section title="Today">
        <FlagChips date={date} />
        <div className="mt-2 flex flex-wrap gap-2">
          {HABITS.map((h) => (
            <Chip key={h.key} active={habits.includes(h.key)} onClick={() => toggleHabit(h.key)}>
              {habits.includes(h.key) && <Check size={14} />}{h.label}
            </Chip>
          ))}
          <Chip active={(c.meditationMin ?? 0) > 0} onClick={() => set({ meditationMin: (c.meditationMin ?? 0) > 0 ? undefined : 10 })}>
            {(c.meditationMin ?? 0) > 0 && <Check size={14} />}Meditated
          </Chip>
          <Chip active={hurtOpen} onClick={() => { if (hurtOpen) set({ niggle: undefined }); setHurtOpen(!hurtOpen); }}>
            {hurtOpen && <Check size={14} />}Something hurts
          </Chip>
          <Chip active={illOpen} onClick={() => { if (illOpen) set({ illness: 'none' }); setIllOpen(!illOpen); }}>
            {illOpen && <Check size={14} />}Feeling ill
          </Chip>
        </div>
        {(hurtOpen || illOpen) && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {hurtOpen && (
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink-2">Where / what</span>
                <Input autoFocus defaultValue={c.niggle ?? ''} placeholder="left achilles, tight" onChange={(e) => set({ niggle: e.target.value.trim() || undefined })} />
              </label>
            )}
            {illOpen && (
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink-2">What kind</span>
                <Select value={c.illness ?? 'none'} onChange={(e) => set({ illness: e.target.value as Illness })}>
                  <option value="none">Choose…</option>
                  <option value="above-neck">Head cold only (above the neck)</option>
                  <option value="below-neck">Chest, stomach or aches (below the neck)</option>
                  <option value="fever">Temperature / fever</option>
                </Select>
              </label>
            )}
          </div>
        )}
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-medium text-ink-2">Note</span>
          <Input defaultValue={c.notes ?? ''} placeholder="Anything worth remembering" onChange={(e) => set({ notes: e.target.value || undefined })} />
        </label>
      </Section>
    </div>
  );
}

function StudyRows({ date }: { date: ISODate }) {
  const modules = useStore((s) => s.data.modules);
  const study = useStore((s) => s.data.study);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const codes = modules.length ? modules.map((m) => m.code) : ['Study'];
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {codes.map((code) => {
        const id = `study-${date}-${code}`;
        const entry = study.find((s) => s.id === id);
        const elsewhere = study.filter((s) => s.date === date && s.moduleCode === code && s.id !== id).reduce((a, s) => a + s.minutes, 0);
        const total = entry?.minutes ?? 0;
        const commit = (mins: number) => (mins > 0 ? upsert('study', { id, date, moduleCode: code, minutes: mins, activity: 'daily' }) : remove('study', id));
        return (
          <div key={code} className="min-w-0">
            <div className="mb-1 text-xs font-medium text-ink-2">📚 {code} study</div>
            <div className="grid grid-cols-2 gap-2">
              <NumField label={{ aria: `${code} study hours` }} unit="h" value={total ? Math.floor(total / 60) : undefined} min={0} max={16} onCommit={(h) => commit((h ?? 0) * 60 + (useStore.getState().data.study.find((s) => s.id === id)?.minutes ?? 0) % 60)} />
              <NumField label={{ aria: `${code} study minutes` }} unit="min" value={total ? total % 60 : undefined} min={0} max={59} onCommit={(m) => commit(Math.floor((useStore.getState().data.study.find((s) => s.id === id)?.minutes ?? 0) / 60) * 60 + (m ?? 0))} />
            </div>
            {elsewhere > 0 && <div className="mt-1 text-[11px] text-muted">Plus {elsewhere} min logged in University</div>}
          </div>
        );
      })}
    </div>
  );
}

function GymRow({ date }: { date: ISODate }) {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const sessions = data.gym.filter((g) => g.date === date && !g.demo);
  const detailed = sessions.find((g) => g.exercises.length > 0);
  const quickId = `gym-quick-${date}`;
  const quick = sessions.find((g) => g.id === quickId);
  const planned = dayPlan(data, date).gym;

  if (detailed) {
    const sets = detailed.exercises.reduce((a, e) => a + e.sets.length, 0);
    return (
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <Chip active><Check size={14} />Gym</Chip>
        <span>{SPLIT_LABEL[detailed.split]} · {sets} sets logged</span>
        <Link to="/performance?tab=gym" className="text-muted underline underline-offset-2">Open</Link>
      </div>
    );
  }
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={!!quick} onClick={() => (quick ? remove('gym', quickId) : upsert('gym', { id: quickId, date, split: planned ?? 'chest-triceps', exercises: [], notes: 'Ticked in the daily log; no sets recorded.' }))}>
          {quick && <Check size={14} />}Gym{!quick && planned ? ` · ${SPLIT_LABEL[planned]}` : ''}
        </Chip>
        {quick && (
          <>
            <Select aria-label="Which session" className="h-8 w-auto py-0 text-sm" value={quick.split} onChange={(e) => upsert('gym', { ...quick, split: e.target.value as SplitId })}>
              {(Object.keys(SPLIT_LABEL) as SplitId[]).map((s) => <option key={s} value={s}>{SPLIT_LABEL[s]}</option>)}
            </Select>
            <Select aria-label="Gym: how hard it felt" className="h-8 w-auto py-0 text-sm" value={quick.rpe ?? ''} onChange={(e) => upsert('gym', { ...quick, rpe: Number(e.target.value) || undefined })}>
              <option value="">How hard it felt</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}{RPE_LABEL[n] ?? ''}</option>)}
            </Select>
          </>
        )}
        <Link to={`/performance?tab=gym&start=${quick?.split ?? planned ?? 'chest-triceps'}`} className="text-sm text-muted underline underline-offset-2">Log sets</Link>
      </div>
      {quick && <p className="mt-1.5 text-[11px] text-muted">Counted as a session. The programme only progresses weights from sets you log, so log them when you can.</p>}
    </div>
  );
}

function RunsOnDay({ date }: { date: ISODate }) {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const runs = data.runs.filter((r) => r.date === date);
  const [type, setType] = useState<RunType>(() => {
    const p = dayPlan(data, date).run;
    return p === 'threshold' ? 'threshold' : p === 'speed' ? 'speed' : p === 'q2' ? 'vo2' : p === 'easy-long' ? 'long' : p === 'recovery' ? 'recovery' : 'easy';
  });
  const [km, setKm] = useState('');
  const [time, setTime] = useState('');
  const [rpe, setRpe] = useState('');
  const [event, setEvent] = useState<RunEvent | ''>('');
  const [note, setNote] = useState('');
  const [read, setRead] = useState<string | null>(null);
  const [detailed, setDetailed] = useState(false);
  const distanceKm = Number(km.replace(',', '.'));
  const durationSec = parseTime(time) ?? 0;
  const valid = distanceKm > 0 && distanceKm < 100 && durationSec > 0;
  const add = () => {
    const run: RunLog = { id: `run-${date}-${Date.now().toString(36)}`, date, type, distanceKm, durationSec, rpe: Number(rpe) || undefined, event: event || undefined, notes: note.trim() || undefined };
    upsert('runs', run);
    const all = { ...data, runs: [...data.runs, run] };
    const fit = currentFitness(all);
    setRead(analyseRun(run, fit.vdot ? paceZones(fit.vdot) : null).headline);
    setKm(''); setTime(''); setRpe(''); setEvent(''); setNote('');
  };

  return (
    <div>
      <div className="mb-2 text-xs font-medium text-ink-2">Runs on this day</div>
      {runs.length > 0 && (
        <ul className="mb-3 divide-y divide-line rounded-xl border border-line">
          {runs.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <div className="min-w-0">
                <div className="truncate"><span className="font-medium">{RUN_TYPE_LABEL[r.type]}</span>{r.title ? <span className="text-muted"> · {r.title}</span> : null}</div>
                <div className="text-xs tabular text-muted">
                  {r.distanceKm.toFixed(2)} km · {formatDuration(r.durationSec)} · {formatPace(r.durationSec / r.distanceKm)}{r.rpe ? ` · felt ${r.rpe}/10` : ''}{r.id.startsWith('strava-') ? ' · from Strava' : ''}
                </div>
              </div>
              <button type="button" aria-label="Delete run" onClick={() => { if (confirm('Delete this run?')) remove('runs', r.id); }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2"><X size={15} /></button>
            </li>
          ))}
        </ul>
      )}
      {detailed ? (
        <div className="rounded-xl border border-line p-3">
          <RunForm onDone={() => setDetailed(false)} />
          <button type="button" onClick={() => setDetailed(false)} className="mt-3 text-sm text-muted underline underline-offset-2">Back to quick add</button>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1.4fr_0.8fr_0.8fr_1.3fr]">
        <label className="block min-w-0">
          <span className="mb-1 block text-xs text-muted">Session</span>
          <Select value={type} onChange={(e) => setType(e.target.value as RunType)}>
            {RUN_ORDER.map((t) => <option key={t} value={t}>{RUN_TYPE_LABEL[t]}</option>)}
          </Select>
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-xs text-muted">Distance</span>
          <div className="relative"><Input inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value)} placeholder="8.0" className="pr-9" /><span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-xs text-muted">km</span></div>
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-xs text-muted">Time</span>
          <Input inputMode="numeric" value={time} onChange={(e) => setTime(e.target.value)} placeholder="40:30" />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-xs text-muted">How hard it <i>felt</i></span>
          <Select value={rpe} onChange={(e) => setRpe(e.target.value)}>
            <option value="">—</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}{RPE_LABEL[n] ?? ''}</option>)}
          </Select>
        </label>
        {(type === 'time-trial' || type === 'race') && (
          <label className="col-span-2 block min-w-0 sm:col-span-1">
            <span className="mb-1 block text-xs text-muted">Event</span>
            <Select value={event} onChange={(e) => setEvent(e.target.value as RunEvent)}>
              <option value="">Choose…</option>
              {(Object.keys(EVENT_LABEL) as RunEvent[]).map((ev) => <option key={ev} value={ev}>{EVENT_LABEL[ev]}</option>)}
            </Select>
          </label>
        )}
        <label className={cx('col-span-2 block min-w-0', type === 'time-trial' || type === 'race' ? 'sm:col-span-3' : 'sm:col-span-4')}>
          <span className="mb-1 block text-xs text-muted">Note</span>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="6 × 800, 90 s jog, windy" />
        </label>
      </div>
      {REP_TYPES.includes(type) && <p className="mt-1.5 text-[11px] text-muted">For reps, the reps’ total distance and time is enough. Use “each rep” to record every rep’s time.</p>}
      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        <button type="button" disabled={!valid} onClick={add} className="inline-flex h-9 items-center rounded-full bg-navy px-4 text-sm font-medium text-navy-ink disabled:opacity-40">Add run</button>
        <button type="button" onClick={() => setDetailed(true)} className="text-sm text-muted underline underline-offset-2">Each rep, splits, HR</button>
      </div>
      {read && <p className="mt-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">{read}</p>}
      </>
      )}
    </div>
  );
}
