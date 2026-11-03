import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatDay, startOfWeek, todayISO } from '@/lib/dates';
import { uid } from '@/lib/id';
import { useStore } from '@/store/store';
import type { GymExerciseLog, SplitId } from '@/store/types';
import { EXERCISE_BY_ID, EXERCISES, MUSCLE_LABEL, PRIORITY_MUSCLES, SPLITS, SPLIT_LABEL, type Muscle } from '@/data/exercises';
import { e1rmSeries, nextTarget, sessionVolumeLoad, stallAnalysis, volumeTargets, weeklyVolume } from '@/engine/gym';
import { ChartFrame, LinesChart } from '@/components/charts';
import { Badge, Button, Card, Disclosure, Empty, Field, Input, Note, Select, SourceRefs, cx } from '@/components/ui';

export function GymTab({ start }: { start: string | null }) {
  const data = useStore((s) => s.data);
  const [active, setActive] = useState<Exclude<SplitId, 'other'> | null>(start && start in SPLITS ? (start as Exclude<SplitId, 'other'>) : null);
  const vol = weeklyVolume(data, startOfWeek(todayISO()));
  const targets = volumeTargets(data);
  const sessions = [...data.gym].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      {active ? (
        <SessionLogger split={active} onClose={() => setActive(null)} />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Object.values(SPLITS).map((s) => {
            const last = sessions.find((g) => g.split === s.id);
            return (
              <Card key={s.id} className="flex flex-col p-4 sm:p-5">
                <div className="font-serif text-lg leading-tight sm:text-xl">{s.title}</div>
                <p className="mt-1 flex-1 text-xs text-ink-2">{s.focus}</p>
                <div className="mt-2 text-xs text-muted">{last ? `Last: ${formatDay(last.date)}` : 'Not logged yet'}</div>
                <Button variant="primary" size="sm" className="mt-3" onClick={() => setActive(s.id as Exclude<SplitId, 'other'>)}>Start session</Button>
              </Card>
            );
          })}
        </div>
      )}

      <Card eyebrow="This week" title="Hard sets per muscle" action={<span className="text-xs text-muted">direct = 1, indirect = ½</span>}>
        <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {(Object.keys(targets) as Muscle[]).map((m) => {
            const v = vol[m];
            const [lo, hi] = targets[m];
            const max = Math.max(hi * 1.3, v);
            return (
              <div key={m} className="grid grid-cols-[7rem_1fr_4.25rem] items-center gap-3 text-sm">
                <span className={cx(PRIORITY_MUSCLES.includes(m) && 'font-medium')}>{MUSCLE_LABEL[m]}{PRIORITY_MUSCLES.includes(m) ? ' ★' : ''}</span>
                <div className="relative h-2 rounded-full bg-surface-2">
                  <div className="absolute inset-y-0 rounded-full bg-good-soft" style={{ left: `${(lo / max) * 100}%`, width: `${((hi - lo) / max) * 100}%` }} />
                  <div className={cx('absolute inset-y-0 left-0 rounded-full', v < lo ? 'bg-warn' : v > hi ? 'bg-bronze' : 'bg-good')} style={{ width: `${Math.min(100, (v / max) * 100)}%` }} />
                </div>
                <span className="whitespace-nowrap text-right tabular text-[11px] text-muted">{v} / {lo}–{hi}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">Green band = target range. ★ = your priorities (shoulders, upper chest, back width, arms, abs). Legs sit lower deliberately: running already loads them, and heavy leg volume is what most often blunts run quality.</p>
      </Card>

      <ProgressCard />

      <Card eyebrow="History" title="Sessions">
        {sessions.length === 0 ? <Empty title="No gym sessions yet" body="Start a session above; targets are pre-filled from last time using double progression." /> : (
          <ul className="space-y-2">
            {sessions.slice(0, 12).map((s) => (
              <li key={s.id}>
                <Disclosure summary={<span className="flex flex-wrap gap-x-3"><span className="w-20 text-muted">{formatDay(s.date)}</span><span className="font-medium">{SPLIT_LABEL[s.split]}</span><span className="text-ink-2">{s.exercises.reduce((a, e) => a + e.sets.length, 0)} sets · {Math.round(sessionVolumeLoad(s))} kg·reps</span>{s.demo && <Badge tone="bronze">demo</Badge>}</span>}>
                  <ul className="space-y-1">
                    {s.exercises.map((e) => <li key={e.exerciseId} className="tabular"><span className="text-ink">{EXERCISE_BY_ID[e.exerciseId]?.name ?? e.exerciseId}</span>: {e.sets.map((x) => `${x.loadKg}×${x.reps}${x.rir != null ? ` @${x.rir}` : ''}`).join(', ')}</li>)}
                  </ul>
                  <DeleteSession id={s.id} />
                </Disclosure>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card tone="quiet" eyebrow="Evidence" title="How the programme is set">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">
          <li><strong>Volume:</strong> more weekly hard sets produce more growth with diminishing returns; ~10–20 per muscle is a sensible range, adjusted by how you respond.</li>
          <li><strong>Proximity to failure:</strong> sets ending 0–3 reps short of failure grow muscle about as well as failure, with less fatigue. Isolation work goes closer (0–1 RIR); heavy compounds and leg work stay 2–3 RIR so your running does not pay.</li>
          <li><strong>Frequency:</strong> with volume equal, frequency matters little; priority muscles get a second weekly hit through add-on sets.</li>
          <li><strong>Rest:</strong> rests over ~60–90 s support slightly more growth; compounds get 2–3 min.</li>
          <li><strong>Exercise selection:</strong> lengthened-position work (overhead triceps, seated curls, incline curls) has direct evidence behind it.</li>
          <li><strong>Concurrent training:</strong> running did not significantly blunt hypertrophy overall in the latest meta-analysis, but interference is real for explosive strength and when leg sessions crowd quality runs.</li>
          <li><strong>Plateaus:</strong> the app checks sleep, energy, running load and effort before ever suggesting more sets.</li>
        </ul>
        <SourceRefs ids={['schoenfeld2017', 'bazvalle2022', 'refalo2023', 'robinson2024', 'schoenfeld2016freq', 'singer2024', 'maeo2023', 'maeo2021', 'schumann2022', 'wilson2012']} />
      </Card>
    </div>
  );
}

function DeleteSession({ id }: { id: string }) {
  const remove = useStore((s) => s.remove);
  return <Button size="sm" variant="danger" className="mt-3" onClick={() => remove('gym', id)}><Trash2 size={13} /> Delete</Button>;
}

interface Draft {
  exerciseId: string;
  instruction: string;
  sets: { reps: string; load: string; rir: string; done: boolean }[];
}

function SessionLogger({ split, onClose }: { split: Exclude<SplitId, 'other'>; onClose: () => void }) {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const tmpl = SPLITS[split];
  const [date, setDate] = useState(todayISO());
  const [rpe, setRpe] = useState('7');
  const [duration, setDuration] = useState('60');
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    tmpl.items.map((it) => {
      const t = nextTarget(data, it.exerciseId, it.sets);
      return {
        exerciseId: it.exerciseId,
        instruction: t.instruction,
        sets: Array.from({ length: it.sets }, () => ({ reps: String(t.reps[0]), load: t.loadKg != null ? String(t.loadKg) : '', rir: String(t.rir[1]), done: false })),
      };
    }),
  );
  const update = (i: number, j: number, k: 'reps' | 'load' | 'rir' | 'done', v: string | boolean) =>
    setDrafts((ds) => ds.map((d, a) => (a !== i ? d : { ...d, sets: d.sets.map((s, b) => (b !== j ? s : { ...s, [k]: v })) })));
  const save = () => {
    const exercises: GymExerciseLog[] = drafts
      .map((d) => ({ exerciseId: d.exerciseId, sets: d.sets.filter((s) => s.done).map((s) => ({ reps: Number(s.reps), loadKg: Number(s.load) || 0, rir: s.rir === '' ? undefined : Number(s.rir) })) }))
      .filter((e) => e.sets.length);
    upsert('gym', { id: uid('gym-'), date, split, exercises, rpe: Number(rpe) || undefined, durationMin: Number(duration) || undefined });
    // A tick in the daily log is a placeholder until the sets arrive.
    useStore.getState().remove('gym', `gym-quick-${date}`);
    onClose();
  };
  const doneCount = drafts.reduce((a, d) => a + d.sets.filter((s) => s.done).length, 0);
  return (
    <Card eyebrow="Session in progress" title={tmpl.title} action={<Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>}>
      <Note>Targets come from last time (double progression). Tick each set as you finish it; adjust reps, load (kg; for pull-ups and press-ups, <em>added</em> load) and reps in reserve.</Note>
      <div className="mt-4 space-y-5">
        {drafts.map((d, i) => {
          const ex = EXERCISE_BY_ID[d.exerciseId];
          return (
            <div key={i} className="rounded-xl border border-line p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Select className="h-9 min-h-0 border-0 bg-transparent p-0 font-medium" value={d.exerciseId} onChange={(e) => setDrafts((ds) => ds.map((x, a) => (a === i ? { ...x, exerciseId: e.target.value, instruction: nextTarget(data, e.target.value, x.sets.length).instruction } : x)))}>
                    {EXERCISES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </Select>
                  <div className="text-xs text-muted">{ex?.repRange[0]}–{ex?.repRange[1]} reps · RIR {ex?.rir[0]}–{ex?.rir[1]} · rest {Math.round((ex?.restSec ?? 90) / 60 * 2) / 2} min</div>
                </div>
                <Badge tone="navy">{d.instruction.split('.')[0]}</Badge>
              </div>
              {ex?.cue && <p className="mt-1 text-xs text-ink-2">{ex.cue}</p>}
              <div className="mt-2 space-y-1.5">
                {d.sets.map((s, j) => (
                  <div key={j} className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2.5rem] items-center gap-2">
                    <span className="text-xs text-muted">{j + 1}</span>
                    <Input aria-label="Load kg" inputMode="decimal" value={s.load} placeholder="kg" onChange={(e) => update(i, j, 'load', e.target.value)} className="h-9 min-h-0 py-1" />
                    <Input aria-label="Reps" inputMode="numeric" value={s.reps} onChange={(e) => update(i, j, 'reps', e.target.value)} className="h-9 min-h-0 py-1" />
                    <Input aria-label="Reps in reserve" inputMode="numeric" value={s.rir} placeholder="RIR" onChange={(e) => update(i, j, 'rir', e.target.value)} className="h-9 min-h-0 py-1" />
                    <button type="button" aria-label={`Set ${j + 1} done`} aria-pressed={s.done} onClick={() => update(i, j, 'done', !s.done)} className={cx('h-9 rounded-lg border text-sm', s.done ? 'border-good bg-good-soft text-good' : 'border-line')}>{s.done ? '✓' : ''}</button>
                  </div>
                ))}
                <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2.5rem] text-[10px] text-muted"><span /><span>kg</span><span>reps</span><span>RIR</span><span /></div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setDrafts((ds) => ds.map((x, a) => (a === i ? { ...x, sets: [...x.sets, { ...x.sets[x.sets.length - 1], done: false }] } : x)))}><Plus size={13} /> Set</Button>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Session RPE"><Input inputMode="numeric" value={rpe} onChange={(e) => setRpe(e.target.value)} /></Field>
        <Field label="Minutes"><Input inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} /></Field>
      </div>
      <Button variant="primary" className="mt-4 w-full" disabled={!doneCount} onClick={save}>Finish — save {doneCount} sets</Button>
    </Card>
  );
}

function ProgressCard() {
  const data = useStore((s) => s.data);
  const logged = useMemo(() => [...new Set(data.gym.flatMap((g) => g.exercises.map((e) => e.exerciseId)))], [data.gym]);
  const [ex, setEx] = useState<string>(logged.includes('incline-db-press') ? 'incline-db-press' : logged[0] ?? '');
  const series = ex ? e1rmSeries(data, ex) : [];
  const stall = ex ? stallAnalysis(data, ex) : null;
  if (!logged.length) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <ChartFrame title="Strength progression" subtitle="Estimated 1-rep max (Epley, adjusted for reps in reserve)" table={{ columns: ['Date', 'e1RM (kg)'], rows: series.map((s) => [s.date, s.e1rm]) }}>
        <Select value={ex} onChange={(e) => setEx(e.target.value)} className="mb-3 max-w-xs">{logged.map((id) => <option key={id} value={id}>{EXERCISE_BY_ID[id]?.name ?? id}</option>)}</Select>
        {series.length >= 2 ? <LinesChart data={series} x="date" series={[{ key: 'e1rm', label: 'e1RM', colour: 's1' }]} format={(v) => `${Math.round(v)}`} xFormat={(v) => v.slice(5)} /> : <Empty title="Two sessions needed" body="Progression appears after this exercise has been logged twice." />}
      </ChartFrame>
      <Card eyebrow="Plateau check" title={stall ? 'Stalled — diagnosis first' : 'No plateau'}>
        {stall ? (
          <>
            <ul className="space-y-2 text-sm">
              {stall.checks.map((c) => (
                <li key={c.area} className="flex gap-2"><Badge tone={c.likely ? 'warn' : 'neutral'}>{c.area}</Badge><span className="text-ink-2">{c.finding}</span></li>
              ))}
            </ul>
            <Note tone="warn">{stall.recommendation}</Note>
          </>
        ) : (
          <p className="text-sm text-ink-2">A plateau is flagged after 5+ sessions when the last three fail to beat the previous best by more than 1%. When it happens, the app checks sleep, energy balance, running load, effort and technique before suggesting more volume.</p>
        )}
      </Card>
    </div>
  );
}
