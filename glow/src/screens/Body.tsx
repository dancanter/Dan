import { useMemo, useState } from 'react';
import { IllnessCard } from '@/components/Illness';
import { Trash2 } from 'lucide-react';
import { ageOn, bmi, energyAvailability, estimatedMaintenance, fatFreeMass, fromDisplay, prettyDate, rolling, sleepHours, sleepScore, sortByDate, todayISO, toDisplay, weeklyRate } from '@/engine/body';
import { actions, useStore } from '@/store';
import { rhrAnalysis } from '@/engine/vitals';
import { SeasonCard, TravelGuide } from '@/components/Season';
import { cleanWeights, noisyDates } from '@/engine/calls';
import { Bar, Button, Card, LineChart, Pill, Segmented } from '@/components/ui';
import { TrainingPanel } from '@/components/TrainingPanel';
import { HealthPanel } from '@/components/HealthPanel';

export function Body() {
  const [tab, setTab] = useState<'weight' | 'training' | 'health'>(() => (location.hash === '#training' ? 'training' : 'weight'));
  const s = useStore((x) => x);
  const unit = s.profile.unit;
  const allWeights = sortByDate(s.weights);
  const noisy = noisyDates(s);
  // Trends ignore the water-heavy mornings after a refeed; the history still shows them.
  const weights = cleanWeights(s);
  const roll = rolling(weights);
  const latest = roll[roll.length - 1];
  const rate = weeklyRate(weights);
  const age = ageOn(s.profile.dob, todayISO());
  const [wDate, setWDate] = useState(todayISO());
  const [w, setW] = useState('');

  const sleeps = sortByDate(s.sleeps);
  const [sl, setSl] = useState({ date: todayISO(), bed: sleeps.at(-1)?.bed ?? '23:00', wake: sleeps.at(-1)?.wake ?? '07:30', quality: 4, rested: 4 });
  const sleepRows = useMemo(() => sleeps.map((e, i) => ({ e, ...sleepScore(e, sleeps.slice(Math.max(0, i - 6), i + 1)) })), [sleeps]);
  const last7 = sleepRows.slice(-7);
  const avgHours = last7.length ? last7.reduce((a, b) => a + b.hours, 0) / last7.length : undefined;
  const avgScore = last7.length ? Math.round(last7.reduce((a, b) => a + b.score, 0) / last7.length) : undefined;

  const kg = latest?.avg;
  const maint = kg ? estimatedMaintenance(kg, s.profile, age) : undefined;
  const ea = kg ? energyAvailability(s.profile.kcalTarget, s.profile, kg) : undefined;
  const goal = s.profile.goalWeightKg;
  const d = (x: number) => toDisplay(x, unit).toFixed(1);

  const header = (
    <>
      <div>
        <h1 className="font-serif text-2xl">Body</h1>
        <p className="text-sm text-ink-2">Weight, sleep, training load and health markers, read as trends, never as single days.</p>
      </div>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'weight', label: 'Weight & sleep' }, { value: 'training', label: 'Training' }, { value: 'health', label: 'Health age' }]} />
    </>
  );
  if (tab === 'training') return <div className="space-y-4">{header}<TrainingPanel /></div>;
  if (tab === 'health') return <div className="space-y-4">{header}<HealthPanel /><IllnessCard /></div>;

  return (
    <div className="space-y-4">
      {header}

      <SeasonCard />
      <TravelGuide date={todayISO()} />

      <Card title="Weight" eyebrow={latest ? `7-day average ${d(latest.avg)} ${unit}` : 'No weigh-ins yet'}>
        <form className="mb-4 flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); const v = Number(w); if (v > 0) { actions.logWeight(wDate, fromDisplay(v, unit)); setW(''); } }}>
          <label className="text-xs text-muted">Date<input type="date" className="field mt-1" value={wDate} max={todayISO()} onChange={(e) => setWDate(e.target.value)} /></label>
          <label className="flex-1 text-xs text-muted">Weight ({unit})<input className="field num mt-1" inputMode="decimal" value={w} onChange={(e) => setW(e.target.value)} placeholder={latest ? d(latest.kg) : ''} /></label>
          <Button type="submit" disabled={!Number(w)}>Log</Button>
        </form>
        <LineChart points={roll.slice(-60).map((r) => ({ x: prettyDate(r.date), y: toDisplay(r.kg, unit) }))} secondary={roll.slice(-60).map((r) => ({ x: prettyDate(r.date), y: toDisplay(r.avg, unit) }))} unit={` ${unit}`} target={goal ? toDisplay(goal, unit) : undefined} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat label="Latest" value={latest ? `${d(latest.kg)}` : '–'} sub={unit} />
          <Stat label="Per week" value={rate !== undefined ? `${rate > 0 ? '+' : ''}${toDisplay(rate, unit).toFixed(2)}` : '–'} sub={rate !== undefined && kg ? `${((rate / kg) * 100).toFixed(2)}% of body weight` : 'needs 4+ weigh-ins'} />
          <Stat label="BMI" value={kg ? bmi(kg, s.profile.heightCm).toFixed(1) : '–'} sub="18.5–25 healthy" />
        </div>
        <p className="mt-3 text-xs text-muted">Weigh daily if you can, but judge only the 7-day average. Day-to-day swings of 1–2 lb are water, salt, carbohydrate and gut contents, not fat.</p>
      </Card>

      {kg && maint && ea !== undefined && (
        <Card title="Is your cut helping or hurting?" eyebrow="Honest energy check">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between gap-3"><span className="text-ink-2">Estimated maintenance (resting × 1.5 for steps, plus training)</span><b className="num">{maint.toLocaleString('en-GB')} kcal</b></li>
            <li className="flex justify-between gap-3"><span className="text-ink-2">Your intake target</span><b className="num">{s.profile.kcalTarget.toLocaleString('en-GB')} kcal</b></li>
            <li className="flex justify-between gap-3"><span className="text-ink-2">Implied daily deficit</span><b className="num">{(maint - s.profile.kcalTarget).toLocaleString('en-GB')} kcal</b></li>
            <li className="flex justify-between gap-3"><span className="text-ink-2">Fat-free mass (at {s.profile.bodyFatPct}% body fat)</span><b className="num">{fatFreeMass(kg, s.profile.bodyFatPct).toFixed(1)} kg</b></li>
            <li className="flex justify-between gap-3"><span className="text-ink-2">Energy availability on target days</span><b className="num" style={{ color: ea < 30 ? 'var(--bad)' : ea < 45 ? 'var(--warn)' : 'var(--good)' }}>{Math.round(ea)} kcal/kg FFM</b></li>
          </ul>
          <Bar value={ea} max={60} marker={30} colour={ea < 30 ? 'var(--bad)' : ea < 45 ? 'var(--warn)' : 'var(--good)'} />
          <div className={`mt-3 rounded-xl p-3 text-sm ${ea < 30 ? 'bg-bad-soft' : ea < 45 ? 'bg-warn-soft' : 'bg-good-soft'}`}>
            {ea < 30 ? (
              <>At these numbers you’re in <b>low energy availability</b>, the zone where testosterone, thyroid hormone, sleep quality, bone and skin all take a hit (IOC REDs consensus, 2023). That works directly against looking your best. Raising intake by 250–400 kcal, mostly as carbohydrate around runs and lifts, keeps fat loss going at a slower, safer rate. If you notice low libido, poor sleep, feeling cold, irritability or stalling performance, treat them as warning signs.</>
            ) : ea < 45 ? (
              <>Reduced but not low: a reasonable zone for a <b>short</b> cut (a few weeks). Keep protein high and carbohydrate around quality sessions, and stop the cut if your sleep or performance drop.</>
            ) : (
              <>Healthy energy availability. Good for hormones, recovery and skin.</>
            )}
          </div>
          {goal && (
            <p className="mt-3 text-sm text-ink-2">Goal {d(goal)} {unit} gives a BMI of <b>{bmi(goal, s.profile.heightCm).toFixed(1)}</b>{bmi(goal, s.profile.heightCm) < 19 ? '. That’s the edge of underweight for your height. Many lean athletes sit here, but the leaner you go the more it costs in hormones, sleep, facial fullness (a gaunt face reads older, not younger) and injury risk. The best-looking version of you is probably 1–3 lb heavier than the lightest you can reach.' : '.'}</p>
          )}
          <p className="mt-2 text-xs text-muted">Estimates only: maintenance uses Mifflin–St Jeor and your settings in Me (training energy {s.profile.exerciseKcal} kcal/day). Your real maintenance shows up after 2–3 weeks of logged intake against the weight trend.</p>
        </Card>
      )}

      {(() => {
        const vs = Object.entries(s.vitals ?? {}).sort(([a], [b]) => a.localeCompare(b));
        const hr = vs.filter(([, v]) => v.rhr).slice(-42);
        const st = vs.filter(([, v]) => v.steps !== undefined).slice(-30);
        const lastHr = hr.at(-1);
        const ana = lastHr ? rhrAnalysis(lastHr[0], s.vitals) : undefined;
        const avgSteps = st.slice(-7).reduce((a, [, v]) => a + (v.steps ?? 0), 0) / Math.max(1, st.slice(-7).length);
        return (
          <Card title="Heart & steps" eyebrow={ana?.baseline ? `Resting HR baseline ${ana.baseline} bpm` : 'Log morning HR on Today'}>
            <div className="mb-1 text-xs text-muted">Morning resting heart rate (gold line = your baseline)</div>
            <LineChart points={hr.map(([d, v]) => ({ x: prettyDate(d), y: v.rhr! }))} unit=" bpm" target={ana?.baseline} colour="var(--bad)" />
            <div className="mt-4 mb-1 text-xs text-muted">Daily steps, thousands (gold line = 10k)</div>
            <LineChart points={st.map(([d, v]) => ({ x: prettyDate(d), y: (v.steps ?? 0) / 1000 }))} unit="k" target={10} colour="var(--sea)" />
            {st.length > 0 && <p className="mt-2 text-xs text-ink-2">7-day average <b className="num">{Math.round(avgSteps).toLocaleString('en-GB')}</b> steps. {avgSteps > 16000 ? 'That’s above where extra health benefit stops. On a cut, consider 10–13k.' : avgSteps >= 8000 ? 'Right in the sweet spot.' : 'Some short post-meal walks would lift this into the sweet spot.'}</p>}
            <p className="mt-2 text-xs text-muted">A resting HR that falls slowly over months while you feel good means fitness. A sudden rise means you’re not recovering. Read it with sleep and how you feel, never on its own.</p>
          </Card>
        );
      })()}

      <Card title="Sleep" eyebrow={avgHours ? `7-night average ${avgHours.toFixed(1)} h · score ${avgScore}` : 'No nights logged yet'}>
        <form className="mb-4 space-y-2" onSubmit={(e) => { e.preventDefault(); actions.logSleep(sl); }}>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs text-muted">Woke on<input type="date" className="field mt-1" value={sl.date} max={todayISO()} onChange={(e) => setSl({ ...sl, date: e.target.value })} /></label>
            <label className="text-xs text-muted">Lights out<input type="time" className="field mt-1" value={sl.bed} onChange={(e) => setSl({ ...sl, bed: e.target.value })} /></label>
            <label className="text-xs text-muted">Woke<input type="time" className="field mt-1" value={sl.wake} onChange={(e) => setSl({ ...sl, wake: e.target.value })} /></label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs text-muted">Quality<select className="field mt-1" value={sl.quality} onChange={(e) => setSl({ ...sl, quality: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map((q) => <option key={q} value={q}>{'★'.repeat(q)}</option>)}</select></label>
            <label className="text-xs text-muted">Felt rested<select className="field mt-1" value={sl.rested} onChange={(e) => setSl({ ...sl, rested: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map((q) => <option key={q} value={q}>{'★'.repeat(q)}</option>)}</select></label>
            <div className="flex items-end"><Button type="submit" className="w-full">Log {sleepHours(sl).toFixed(1)} h</Button></div>
          </div>
        </form>
        <LineChart points={sleepRows.slice(-30).map((r) => ({ x: prettyDate(r.e.date), y: r.hours }))} unit=" h" target={8} colour="var(--navy)" />
        {last7.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {last7[last7.length - 1].parts.map((p) => (
              <div key={p.label} className="text-center"><div className="num font-serif text-lg">{p.value}</div><div className="text-[10px] text-muted uppercase">{p.label}</div></div>
            ))}
          </div>
        )}
        <div className="mt-3 space-y-1.5 text-xs text-ink-2">
          <p><b>Why sleep is the biggest lever you have:</b> deep sleep is when growth hormone peaks, when muscle and skin rebuild and when your brain clears waste. One week of 5-hour nights lowered testosterone by 10–15% in young men in a lab study. Short sleep also raises cortisol, which brings water retention and puffiness around the eyes.</p>
          <p>Target for your training load: <b>8–9.5 hours</b>, with wake time within 30 minutes every day, weekends included.</p>
        </div>
      </Card>

      <Card title="History">
        <div className="grid gap-4 sm:grid-cols-2">
          <ul className="space-y-1 text-sm">
            {[...allWeights].reverse().slice(0, 30).map((x) => (
              <li key={x.date} className="flex items-center justify-between"><span className="text-ink-2">{prettyDate(x.date)}</span><span className="num">{noisy.has(x.date) && <span className="mr-1 text-[10px] text-gold">refeed water</span>}{d(x.kg)} {unit}<button aria-label="Delete weight" className="ml-2 text-muted hover:text-bad" onClick={() => actions.removeWeight(x.date)}><Trash2 size={13} /></button></span></li>
            ))}
            {!weights.length && <li className="text-muted">No weigh-ins.</li>}
          </ul>
          <ul className="space-y-1 text-sm">
            {[...sleepRows].reverse().slice(0, 30).map((x) => (
              <li key={x.e.date} className="flex items-center justify-between"><span className="text-ink-2">{prettyDate(x.e.date)}</span><span className="num">{x.hours.toFixed(1)} h <Pill tone={x.score >= 80 ? 'good' : x.score >= 60 ? 'sea' : 'warn'}>{x.score}</Pill><button aria-label="Delete sleep" className="ml-2 text-muted hover:text-bad" onClick={() => actions.removeSleep(x.e.date)}><Trash2 size={13} /></button></span></li>
            ))}
            {!sleepRows.length && <li className="text-muted">No nights.</li>}
          </ul>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-2">
      <div className="text-[10px] text-muted uppercase">{label}</div>
      <div className="num font-serif text-lg">{value}</div>
      {sub && <div className="text-[10px] leading-tight text-muted">{sub}</div>}
    </div>
  );
}
