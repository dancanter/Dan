import { hosted } from '@/host';
import { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Footprints, RefreshCw, Trash2 } from 'lucide-react';
import { addDays, prettyDate, sleepHours, sortByDate, todayISO } from '@/engine/body';
import { assessLoad, sessionKcal, type Intensity, type Session, type SessionKind } from '@/engine/training';
import { dayResult, weightOn } from '@/engine/game';
import { stravaAvailable, syncStrava } from '@/strava';
import { actions, useStore } from '@/store';
import { Bar, Button, Card, Pill, Segmented } from './ui';
import { KeepMuscleGuide, SetsEditor, WeeklySetsCard } from './Muscle';
import { RecoveryClock } from './RecoveryClock';

const KIND_LABEL: Record<SessionKind, string> = { run: 'Run', lift: 'Weights', walk: 'Walk', ride: 'Ride', other: 'Other' };
const LEVEL_TONE = { fresh: 'neutral', balanced: 'good', pushing: 'warn', 'too-much': 'bad' } as const;

export function TrainingPanel() {
  const s = useStore((x) => x);
  const today = todayISO();
  const kg = weightOn(s, today) ?? 57;
  const [canSync, setCanSync] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { void stravaAvailable().then(setCanSync); }, []);

  const assessment = useMemo(() => {
    const sleeps = sortByDate(s.sleeps).filter((e) => e.date > addDays(today, -7)).map(sleepHours);
    const ea = dayResult(s, addDays(today, -1)).ea;
    return assessLoad(today, s.training ?? {}, { kg, vitals: s.vitals ?? {}, sleepHours: sleeps, ea, inDeficit: true });
  }, [s, today, kg]);

  const days = Array.from({ length: 14 }, (_, i) => addDays(today, -i)).filter((d) => (s.training?.[d] ?? []).length);

  return (
    <div className="space-y-4">
      <RecoveryClock date={today} />
      <WeeklySetsCard date={today} />
      <Card eyebrow="Training load" title={assessment.headline} action={<Pill tone={LEVEL_TONE[assessment.level]}>{assessment.level.replace('-', ' ')}</Pill>}>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <Stat v={assessment.week.runs} l="runs" />
          <Stat v={assessment.week.runKm} l="run km" />
          <Stat v={assessment.week.hard} l="hard runs" />
          <Stat v={assessment.week.lifts} l="lifts" />
        </div>
        <p className="mt-2 text-xs text-muted">Last 7 days · {Math.round(assessment.week.minutes / 60 * 10) / 10} h of training · about {assessment.week.kcal.toLocaleString('en-GB')} kcal{assessment.acwr !== undefined ? ` · load ${assessment.acwr}× your 4-week average` : ''}</p>
        {assessment.acwr !== undefined && <div className="mt-2"><Bar value={assessment.acwr} max={2} marker={1.3} colour={assessment.acwr > 1.5 ? 'var(--bad)' : assessment.acwr > 1.3 ? 'var(--warn)' : 'var(--good)'} /></div>}
        {assessment.reasons.length > 0 && <ul className="mt-3 space-y-1.5 text-sm">{assessment.reasons.map((r) => <li key={r}>• {r}</li>)}</ul>}
        {assessment.actions.length > 0 && <div className="mt-3 rounded-xl bg-gold-soft p-3 text-sm"><b>Do this:</b> {assessment.actions.join(' ')}</div>}
        <details className="mt-3 text-xs text-ink-2">
          <summary className="cursor-pointer text-sea">How Glow judges “too much”</summary>
          <p className="mt-2 leading-relaxed">Adaptation, both fitness and cellular repair, happens when you <i>recover</i> from training, not during it. Glow compares this week’s load with your 4-week average (sudden spikes above about 1.5× are when injuries and illness cluster). It counts hard running sessions (2–3 a week is the evidence-backed ceiling, with the rest easy) and checks for back-to-back hard days. Then it reads your body’s own signals: morning heart rate against your baseline, sleep, and energy availability. On a cut, the margin for error is smaller, because the energy for repair is already reduced.</p>
        </details>
      </Card>

      <Card eyebrow="Your sessions" title="Runs, lifts and walks" action={canSync && !hosted() ? (
        <Button tone="ghost" disabled={syncing} onClick={async () => { setSyncing(true); const r = await syncStrava(); setSyncing(false); setMsg(r.ok ? `Synced ${r.count} activities from the last 6 weeks.` : r.message); }}>
          <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />{syncing ? 'Syncing…' : 'Sync Strava'}
        </Button>
      ) : undefined}>
        {msg && <p className="mb-3 text-sm text-sea">{msg}</p>}
        {hosted() && <p className="mb-3 text-xs text-muted">Runs, gym and Strava are logged in your tracker (Training and Today). They show here for recovery and load.</p>}
        {!canSync && !hosted() && <p className="mb-3 text-xs text-muted">Strava sync works when Glow is opened inside Claude. Here, add sessions by hand.</p>}
        {s.stravaSyncedAt && <p className="mb-3 text-xs text-muted">Last synced {new Date(s.stravaSyncedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}. Weight sessions sync too if you record them in Strava.</p>}
        {!hosted() && <AddSession />}
        <div className="mt-4 space-y-3">
          {days.map((d) => (
            <div key={d}>
              <div className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">{prettyDate(d)}</div>
              <ul className="space-y-1.5">
                {(s.training[d] ?? []).map((x) => (
                  <li key={x.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-2 p-2.5 text-sm">
                    {x.kind === 'lift' ? <Dumbbell size={16} className="text-gold" /> : <Footprints size={16} className="text-sea" />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{x.name}</div>
                      <div className="num text-xs text-muted">{x.minutes} min{x.km ? ` · ${x.km} km` : ''} · ~{sessionKcal(x, kg)} kcal{x.source === 'strava' ? ' · Strava' : ''}</div>
                    </div>
                    <select aria-label="Intensity" className="rounded-lg bg-surface px-1.5 py-1 text-xs" value={x.intensity} onChange={(e) => actions.setSessionIntensity(d, x.id, e.target.value as Intensity)}>
                      <option value="easy">easy</option><option value="moderate">moderate</option><option value="hard">hard</option>
                    </select>
                    <button aria-label="Remove session" className="p-1 text-muted hover:text-bad" onClick={() => actions.removeSession(d, x.id)}><Trash2 size={14} /></button>
                    {x.kind === 'lift' && <div className="w-full pl-6"><SetsEditor date={d} session={x} /></div>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!days.length && <p className="text-sm text-muted">Nothing logged in the last 2 weeks yet.</p>}
        </div>
        <p className="mt-3 text-xs text-muted">Glow guesses intensity from the session name (“intervals”, “threshold”, “trial” = hard; “easy”, “zone 2” = easy). Correct it with the dropdown and a re-sync won’t overwrite your choice. Training calories feed your daily energy availability automatically.</p>
      </Card>
      <KeepMuscleGuide />
    </div>
  );
}

function Stat({ v, l }: { v: number; l: string }) {
  return <div className="rounded-xl bg-surface-2 p-2"><div className="num font-serif text-lg">{v}</div><div className="text-muted">{l}</div></div>;
}

function AddSession() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [kind, setKind] = useState<SessionKind>('lift');
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [km, setKm] = useState('');
  const [intensity, setIntensity] = useState<Intensity>('moderate');
  if (!open) return <Button tone="ghost" onClick={() => setOpen(true)}>+ Add a session by hand</Button>;
  return (
    <div className="space-y-2 rounded-xl bg-surface-2 p-3">
      <Segmented value={kind} onChange={setKind} options={(['run', 'lift', 'walk', 'other'] as SessionKind[]).map((k) => ({ value: k, label: KIND_LABEL[k] }))} />
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-muted">Date<input type="date" className="field mt-1" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="text-xs text-muted">Name<input className="field mt-1" value={name} placeholder={kind === 'lift' ? 'Upper body' : 'Easy 5 miles'} onChange={(e) => setName(e.target.value)} /></label>
        <label className="text-xs text-muted">Minutes<input className="field num mt-1" inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label>
        {kind === 'run' || kind === 'walk' ? <label className="text-xs text-muted">Distance (km)<input className="field num mt-1" inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value)} /></label> : <span />}
      </div>
      <Segmented value={intensity} onChange={setIntensity} options={[{ value: 'easy', label: 'Easy' }, { value: 'moderate', label: 'Moderate' }, { value: 'hard', label: 'Hard' }]} />
      <div className="flex gap-2">
        <Button disabled={!Number(minutes)} onClick={() => {
          const session: Session = { id: `m-${Date.now().toString(36)}`, source: 'manual', kind, name: name.trim() || KIND_LABEL[kind], minutes: Number(minutes), km: Number(km) || undefined, intensity };
          actions.addSession(date, session);
          setOpen(false); setName('');
        }}>Save session</Button>
        <Button tone="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}
