import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { addDays, formatDay, startOfWeek, todayISO } from '@/lib/dates';
import { formatDuration, formatPace, parseTime, repTime } from '@/lib/time';
import { uid } from '@/lib/id';
import { useStore } from '@/store/store';
import type { Performance, RunEvent, RunLog } from '@/store/types';
import {
  analyseRun, assessGoal, currentFitness, distanceByIntensity, EVENT_LABEL, eventBalance, fitnessProposal, LADDERS, ladderLevels, paceZones,
  RUN_TYPE_LABEL, ZONE_LABEL, type QualityKind, type Zone,
} from '@/engine/running';
import { prescribe } from '@/engine/plan';
import { RunForm } from '@/components/forms';
import { BarsChart, ChartFrame } from '@/components/charts';
import { Badge, Button, Card, Disclosure, Empty, Field, Input, Note, Provenance, Select, Sheet, SourceRefs, Stat } from '@/components/ui';

const HORIZON_LABEL = { achieved: 'Achieved', near: 'Near-term', season: 'This season', 'multi-season': '1–2 years', 'long-term': 'Long-term', unknown: 'Unknown' } as const;
const HORIZON_TONE = { achieved: 'good', near: 'good', season: 'navy', 'multi-season': 'bronze', 'long-term': 'warn', unknown: 'neutral' } as const;

export function RunningTab() {
  const data = useStore((s) => s.data);
  const patch = useStore((s) => s.patch);
  const remove = useStore((s) => s.remove);
  const fit = currentFitness(data);
  const zones = fit.vdot ? paceZones(fit.vdot) : null;
  const levels = ladderLevels(data, zones);
  const proposal = fitnessProposal(data, zones);
  const balance = eventBalance(data);
  const unit = data.profile.distanceUnit;
  const [logOpen, setLogOpen] = useState(false);
  const [editRun, setEditRun] = useState<RunLog | undefined>();
  const [perfOpen, setPerfOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const runs = [...data.runs].sort((a, b) => b.date.localeCompare(a.date));

  const weekly = useMemo(() => {
    const today = todayISO();
    return Array.from({ length: 12 }, (_, i) => {
      const ws = startOfWeek(addDays(today, -7 * (11 - i)));
      const we = addDays(ws, 6);
      const wr = data.runs.filter((r) => r.date >= ws && r.date <= we);
      const by = (b: 'easy' | 'moderate' | 'hard') => Math.round(wr.reduce((s, r) => s + distanceByIntensity(r)[b], 0) * 10) / 10;
      return { week: ws.slice(5), easy: by('easy'), moderate: by('moderate'), hard: by('hard') };
    });
  }, [data.runs]);
  const last4 = weekly.slice(-4);
  const avgKm = last4.reduce((s, w) => s + w.easy + w.moderate + w.hard, 0) / 4;
  const easyShare = (() => {
    const tot = last4.reduce((s, w) => s + w.easy + w.moderate + w.hard, 0);
    return tot ? (last4.reduce((s, w) => s + w.easy, 0) / tot) * 100 : null;
  })();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card eyebrow="Current fitness" title={fit.vdot ? `VDOT ${fit.vdot.toFixed(1)}` : 'Not yet calibrated'} action={<Provenance kind="estimated" />}>
          <p className="text-sm text-ink-2">{fit.note}</p>
          {fit.confidence === 'stale' && <Note tone="warn">Paces may be too fast for your current fitness. A 3 km or 5 km time trial on a flat route recalibrates everything.</Note>}
          {zones && (
            <table className="mt-4 w-full text-sm tabular">
              <thead className="text-left text-xs text-muted"><tr><th className="pb-1 font-medium">Zone</th><th className="pb-1 font-medium">Pace /{unit}</th><th className="pb-1 font-medium">Per 400 m</th></tr></thead>
              <tbody>
                {(['E', 'SubT', 'T', 'I', 'R'] as Zone[]).map((z) => (
                  <tr key={z} className="border-t border-line">
                    <td className="py-1.5">{ZONE_LABEL[z]}</td>
                    <td>{formatPace(zones[z][0], unit).replace(/\/(km|mi)$/, '')}–{formatPace(zones[z][1], unit)}</td>
                    <td className="text-muted">{z === 'E' ? '—' : `${Math.round(repTime(zones[z][0], 400))}–${Math.round(repTime(zones[z][1], 400))} s`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {proposal && (
            <div className="mt-4 rounded-xl bg-good-soft p-3 text-sm">
              <strong>Evidence of improvement.</strong> {proposal.reason} Update paces by +{proposal.delta} VDOT?
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="primary" onClick={() => patch('settings', { vdotAdjustments: [...data.settings.vdotAdjustments, { date: todayISO(), delta: proposal.delta, reason: proposal.reason }] })}>Accept</Button>
                <span className="self-center text-xs text-muted">Or confirm with a time trial.</span>
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-muted">Paces use Daniels & Gilbert’s VDOT equations — a coaching model fitted to race results, reliable from ~1500 m to the half marathon. 800 m and shorter are speed markers and never set paces.</p>
        </Card>

        <Card eyebrow="Goals" title="How far, honestly" action={<Button size="sm" variant="ghost" onClick={() => setPerfOpen(true)}><Plus size={14} /> Result</Button>}>
          <ul className="space-y-3">
            {data.runGoals.map((g) => {
              const a = assessGoal(data, g.event, g.targetSec);
              return (
                <li key={g.event + g.targetSec}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{EVENT_LABEL[g.event]} {formatDuration(g.targetSec, { tenths: g.targetSec < 120 })}</span>
                    <Badge tone={HORIZON_TONE[a.horizon]}>{HORIZON_LABEL[a.horizon]}</Badge>
                  </div>
                  <div className="text-xs text-muted">
                    {a.currentSec ? `Now ≈ ${formatDuration(a.currentSec, { tenths: a.currentSec < 120 })} (${a.basisNote})${a.gapPct && a.gapPct > 0 ? ` · gap ${a.gapPct.toFixed(1)}%` : ''}` : 'No data'}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-2">{a.comment}</p>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-muted">Edit goals in Settings. These are ambitions, not promises; the horizons come from the size of the gap, not from wishful thinking.</p>
        </Card>
      </div>

      {balance.length > 1 && (
        <Card eyebrow="Event balance" title="Which of your times are soft?">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {balance.map((b) => (
              <Stat key={b.event} label={EVENT_LABEL[b.event]} value={formatDuration(b.actual)} sub={`model ${formatDuration(b.predicted)} · ${b.diffPct > 0 ? '+' : ''}${b.diffPct.toFixed(1)}%`} tone={b.diffPct > 3 ? 'warn' : b.diffPct < -3 ? 'good' : undefined} small />
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-2">Positive = slower than your current fitness predicts. A time well above the prediction usually means the event has not been raced properly — the fastest PB to take. Times well below it mean that is your natural strength (short times beating an aerobic model point to speed being your edge, and aerobic volume being the lever for 5 km).</p>
        </Card>
      )}

      <Card eyebrow="Session ladders" title="What comes next">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(['threshold', 'vo2', 'race-pace', 'speed'] as QualityKind[]).map((k) => {
            const rx = prescribe(data, k === 'threshold' ? 'threshold' : k === 'speed' ? 'speed' : 'q2');
            const t = LADDERS[k][levels[k] - 1];
            return (
              <div key={k} className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between text-xs text-muted"><span className="uppercase tracking-[0.12em]">{k === 'race-pace' ? 'Mile pace' : k === 'vo2' ? 'VO₂max' : k}</span><span>rung {levels[k]}/{LADDERS[k].length}</span></div>
                <div className="mt-1 font-medium">{t.title}</div>
                {k !== 'speed' && zones && t.distanceM && <div className="text-sm text-ink-2 tabular">{rx.kind === k ? rx.targetRep : `${formatDuration(repTime(zones[t.zone!][0], t.distanceM))}–${formatDuration(repTime(zones[t.zone!][1], t.distanceM))} per rep`}</div>}
                <div className="text-xs text-muted">Recovery {t.recovery}</div>
                <p className="mt-2 text-xs text-ink-2">{t.purpose}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">Each logged session moves its ladder: on target at the expected effort → up a rung; on target but costly, or slower → repeat; slow and hard → down a rung. Faster than prescribed is not rewarded. Second-quality-day type follows your focus ({data.settings.runFocus}).</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <ChartFrame title="Weekly running volume" subtitle="km by intensity, last 12 weeks" table={{ columns: ['Week', 'Easy', 'Moderate', 'Hard'], rows: weekly.map((w) => [w.week, w.easy, w.moderate, w.hard]) }}>
          <BarsChart data={weekly} x="week" stacked series={[{ key: 'easy', label: 'Easy', colour: 's1' }, { key: 'moderate', label: 'Threshold / moderate', colour: 's3' }, { key: 'hard', label: 'Hard', colour: 's2' }]} format={(v) => `${v}`} />
        </ChartFrame>
        <Card eyebrow="Last 4 weeks" title="Load and distribution">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Average weekly volume" value={`${avgKm.toFixed(1)} km`} />
            <Stat label="Easy share" value={easyShare != null ? `${Math.round(easyShare)}%` : '—'} tone={easyShare != null && easyShare < 70 ? 'warn' : undefined} sub="of distance" />
          </div>
          <p className="mt-3 text-sm text-ink-2">Successful distance runners do roughly 75–80% of their running at low intensity. Too little easy volume and too much moderate running is the commonest pattern in amateurs — it feels productive and limits progress.</p>
          <p className="mt-2 text-sm text-ink-2">For 5 km, the biggest long-term lever is aerobic volume, built gradually (roughly ≤10% a week, with easier weeks every 3–4). For a sub-16 or 15-minute 5 km, most runners need far more weekly volume than two easy runs provide — the plan lets you lengthen easy runs when you are ready.</p>
          <SourceRefs ids={['seiler2010', 'haugen2022', 'rosenblat2019']} />
        </Card>
      </div>

      <Card eyebrow="Log" title="Your runs" action={<Button variant="primary" size="sm" onClick={() => { setEditRun(undefined); setLogOpen(true); }}><Plus size={14} /> Log run</Button>}>
        {runs.length === 0 ? <Empty title="No runs yet" body="Log a run and the coach analyses it straight away — pace against target, effort against expectation, and what it means for the next session." /> : (
          <ul className="space-y-2">
            {runs.slice(0, showAll ? 200 : 12).map((r) => {
              const a = analyseRun(r, zones);
              return (
                <li key={r.id}>
                  <Disclosure
                    summary={
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="w-20 text-muted">{formatDay(r.date)}</span>
                        <span className="font-medium">{RUN_TYPE_LABEL[r.type]}</span>
                        <span className="tabular text-ink-2">{r.distanceKm.toFixed(1)} km · {formatDuration(r.durationSec)}</span>
                        {r.reps?.length ? <span className="tabular text-xs text-muted">{r.reps.length} × {r.reps[0].distanceM} m</span> : null}
                        <Badge tone={a.verdict === 'progress' || a.verdict === 'easy-ok' ? 'good' : ['regress', 'too-fast', 'easy-too-fast'].includes(a.verdict) ? 'warn' : 'neutral'}>{a.verdict.replace(/-/g, ' ')}</Badge>
                        {r.demo && <Badge tone="bronze">demo</Badge>}
                      </span>
                    }
                  >
                    <div className="font-medium text-ink">{a.headline}</div>
                    {a.actualPace && <div className="mt-1 text-xs tabular">Pace {formatPace(a.actualPace, unit)}{a.target ? ` · target ${formatPace(a.target[0], unit)}–${formatPace(a.target[1], unit)}` : ''}{a.fadePct != null ? ` · fade ${a.fadePct.toFixed(1)}%` : ''}{r.rpe ? ` · RPE ${r.rpe}` : ''}{r.legs ? ` · legs ${r.legs}` : ''}</div>}
                    {r.reps?.length ? <div className="mt-1 text-xs tabular text-muted">Reps: {r.reps.map((x) => formatDuration(x.timeSec, { tenths: x.timeSec < 120 })).join(', ')}</div> : null}
                    <ul className="mt-2 list-disc space-y-1 pl-5">{a.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                    {a.next && <p className="mt-2 font-medium text-ink">Next: {a.next}</p>}
                    {r.notes && <p className="mt-2 italic">“{r.notes}”</p>}
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => { setEditRun(r); setLogOpen(true); }}><Pencil size={13} /> Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => remove('runs', r.id)}><Trash2 size={13} /> Delete</Button>
                    </div>
                  </Disclosure>
                </li>
              );
            })}
          </ul>
        )}
        {runs.length > 12 && <Button size="sm" variant="ghost" className="mt-3" onClick={() => setShowAll((v) => !v)}>{showAll ? 'Show fewer' : `Show all ${runs.length}`}</Button>}
      </Card>

      <PerformancesCard onAdd={() => setPerfOpen(true)} />

      <Card tone="quiet" eyebrow="Evidence" title="How the running programme is built">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">
          <li>Two quality sessions (threshold + VO₂max or mile-pace) and one short speed session, around easy running — your preferred structure, with hard days separated by easy ones.</li>
          <li>Threshold running is controlled: ~83–89% of VO₂max, “comfortably hard”. VO₂max reps of 2–5 minutes; mile-pace reps short with long recoveries; sprints at full recovery.</li>
          <li>Strength training improves running economy and does not need to compromise endurance if heavy legs are kept away from quality days.</li>
          <li>Subjective wellbeing is used alongside performance to detect fatigue; load ratios are treated as rough flags because their predictive value is disputed.</li>
        </ul>
        <SourceRefs ids={['midgley2007', 'saunders2004', 'blagrove2018', 'haugen2019', 'saw2016', 'impellizzeri2020', 'foster2001']} />
      </Card>

      <Sheet open={logOpen} onClose={() => setLogOpen(false)} title={editRun ? 'Edit run' : 'Log run'}><RunForm initial={editRun} onDone={() => setLogOpen(false)} /></Sheet>
      <Sheet open={perfOpen} onClose={() => setPerfOpen(false)} title="Add a result"><PerformanceForm onDone={() => setPerfOpen(false)} /></Sheet>
    </div>
  );
}

function PerformancesCard({ onAdd }: { onAdd: () => void }) {
  const perfs = useStore((s) => s.data.performances);
  const remove = useStore((s) => s.remove);
  return (
    <Card eyebrow="Results" title="Bests, races and time trials" action={<Button size="sm" onClick={onAdd}><Plus size={14} /> Add</Button>}>
      {perfs.length === 0 ? <Empty title="No results yet" body="Add PBs, races or time trials — with dates. Recent results set training paces." /> : (
        <table className="w-full text-sm tabular">
          <thead className="text-left text-xs text-muted"><tr><th className="font-medium">Event</th><th className="font-medium">Time</th><th className="font-medium">Date</th><th className="font-medium">Kind</th><th /></tr></thead>
          <tbody>
            {[...perfs].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="py-1.5">{EVENT_LABEL[p.event]}</td>
                <td>{formatDuration(p.timeSec, { tenths: p.timeSec < 120 })}</td>
                <td className="text-muted">{p.date ?? '—'}</td>
                <td className="text-xs text-muted">{p.kind.replace(/-/g, ' ')}{p.demo ? ' · demo' : ''}</td>
                <td className="text-right"><button type="button" aria-label="Delete" onClick={() => remove('performances', p.id)} className="text-muted hover:text-bad"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="mt-3 text-xs text-muted">GPS “best efforts” inside training runs are useful but can be off by 1–2% (and short ones by more). Races and track time trials carry the most weight.</p>
    </Card>
  );
}

function PerformanceForm({ onDone }: { onDone: () => void }) {
  const upsert = useStore((s) => s.upsert);
  const [event, setEvent] = useState<RunEvent>('5k');
  const [time, setTime] = useState('');
  const [date, setDate] = useState(todayISO());
  const [kind, setKind] = useState<Performance['kind']>('time-trial');
  const t = parseTime(time);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Event"><Select value={event} onChange={(e) => setEvent(e.target.value as RunEvent)}>{(Object.keys(EVENT_LABEL) as RunEvent[]).map((ev) => <option key={ev} value={ev}>{EVENT_LABEL[ev]}</option>)}</Select></Field>
        <Field label="Time"><Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="17:52 or 57.4" /></Field>
        <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Kind">
          <Select value={kind} onChange={(e) => setKind(e.target.value as Performance['kind'])}>
            <option value="race">Race</option>
            <option value="time-trial">Time trial</option>
            <option value="gps-best-effort">GPS best effort (e.g. Strava)</option>
            <option value="reported-pb">PB from memory</option>
          </Select>
        </Field>
      </div>
      <Button variant="primary" className="w-full" disabled={!t} onClick={() => { upsert('performances', { id: uid('pb-'), event, timeSec: t!, date: date || null, kind }); onDone(); }}>Save {t ? formatDuration(t, { tenths: t < 120 }) : ''}</Button>
    </div>
  );
}
