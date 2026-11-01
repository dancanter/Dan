import { useMemo, useState } from 'react';
import { Activity, HeartPulse, TestTube } from 'lucide-react';
import { addDays, ageOn, bmi, prettyDate, sleepHours, sortByDate, todayISO } from '@/engine/body';
import { LAB_MARKERS, POPULATION, RACE_DISTANCES, bpCategory, fitnessAge, glowAge, healthRank, vo2Band, vo2FromRaces } from '@/engine/health';
import { allDates, dayResult } from '@/engine/game';
import { actions, resolveItems, useStore, EMPTY_ARR } from '@/store';
import { Button, Card, LineChart, Pill } from './ui';

export function HealthPanel() {
  const s = useStore((x) => x);
  const today = todayISO();
  const age = ageOn(s.profile.dob, today);
  const races = s.profile.races ?? {};
  const fromRaces = vo2FromRaces(races);
  const vo2 = s.profile.vo2Measured ?? fromRaces?.vo2;
  const bps = sortByDate(s.bp ?? []);
  const lastBp = bps.at(-1);
  const recentRhr = Array.from({ length: 7 }, (_, i) => s.vitals?.[addDays(today, -i)]?.rhr).filter((x): x is number => !!x);
  const rhr = recentRhr.length ? Math.round(recentRhr.reduce((a, b) => a + b, 0) / recentRhr.length) : undefined;
  const sleeps = sortByDate(s.sleeps).slice(-14).map(sleepHours);
  const sleepAvg = sleeps.length ? sleeps.reduce((a, b) => a + b, 0) / sleeps.length : undefined;
  const nutritionAvg = useMemo(() => {
    const ds = allDates(s).filter((d) => d > addDays(today, -14) && resolveItems(s.days[d], s).length >= 3);
    return ds.length ? ds.reduce((a, d) => a + dayResult(s, d).analysis.nutritionScore, 0) / ds.length : undefined;
  }, [s, today]);
  const alcoholDays = Array.from({ length: 14 }, (_, i) => resolveItems(s.days[addDays(today, -i)], s).some((it) => it.food.tags.includes('alc'))).filter(Boolean).length;
  const kg = sortByDate(s.weights).at(-1)?.kg;
  const ga = glowAge(age, { vo2, rhr, bp: lastBp, sleepAvg, nutritionAvg, bmi: kg ? bmi(kg, s.profile.heightCm) : undefined, alcoholDays: Object.keys(s.days).length >= 7 ? alcoholDays : undefined, dailySpf: s.profile.dailySpf });
  const trainMin = Array.from({ length: 7 }, (_, i) => (s.training?.[addDays(today, -i)] ?? []).reduce((a, x) => a + x.minutes, 0)).reduce((a, b) => a + b, 0);
  const bmiNow = kg ? bmi(kg, s.profile.heightCm) : undefined;
  const rank = healthRank({ vo2, rhr, habits: { nonSmoker: true, activeEnough: trainMin >= 150 || !Object.keys(s.training ?? {}).length, dietGood: (nutritionAvg ?? 0) >= 60, leanHealthy: bmiNow === undefined || (bmiNow >= 18.5 && bmiNow < 25), sleepGood: (sleepAvg ?? 0) >= 7.5, lowAlcohol: alcoholDays <= 1, dailySpf: !!s.profile.dailySpf } });

  return (
    <div className="space-y-4">
      <Card eyebrow="Glow age" title={<span>Your body is running like a <span className="num font-serif text-3xl text-gold">{ga.age}</span>-year-old’s</span>}>
        <p className="mb-3 text-sm text-ink-2">You’re {age}. Each marker below adds or takes off years in the direction the evidence points. It’s a motivational scorecard built from your own numbers, <b>not</b> a validated biological-age test (those use blood panels or DNA methylation).</p>
        <ul className="space-y-1.5 text-sm">
          {ga.lines.map((l) => (
            <li key={l.label} className="flex items-baseline justify-between gap-3">
              <span>{l.label}<span className="block text-xs text-muted">{l.why}</span></span>
              <b className="num shrink-0" style={{ color: l.years < 0 ? 'var(--good)' : l.years > 0 ? 'var(--bad)' : 'var(--muted)' }}>{l.years > 0 ? '+' : ''}{l.years} y</b>
            </li>
          ))}
        </ul>
        {ga.lines.length < 5 && <p className="mt-3 text-xs text-muted">Log blood pressure, morning heart rate, sleep and a week of food to fill in the rest.</p>}
      </Card>

      <Card eyebrow="Your health rank" title={rank.rarest !== undefined ? <span>Roughly the <span className="num font-serif text-3xl text-gold">top {rank.rarest < 1 ? rank.rarest.toFixed(1) : Math.round(rank.rarest)}%</span> of men your age</span> : 'Log a few markers to see your rank'}>
        {rank.rarest !== undefined && (
          <p className="mb-3 text-sm text-ink-2">That’s about <b>1 in {Math.round(100 / rank.rarest).toLocaleString('en-GB')}</b>: roughly {Math.round((POPULATION.ukMen20s * rank.rarest) / 100).toLocaleString('en-GB')} UK men in their 20s and {(Math.round((POPULATION.worldMen20s * rank.rarest) / 100 / 100_000) / 10).toLocaleString('en-GB')} million worldwide are as fit or fitter. Being rare on several markers at once is rarer still, so this is a floor, not a ceiling.</p>
        )}
        <ul className="space-y-2 text-sm">
          {rank.lines.map((l) => (
            <li key={l.label} className="flex items-baseline justify-between gap-3">
              <span>{l.label}<span className="block text-xs text-muted">{l.note}</span></span>
              <b className="num shrink-0 text-good">top {l.topPct < 1 ? l.topPct.toFixed(1) : Math.round(l.topPct)}%</b>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          <Pill tone={s.profile.dailySpf ? 'good' : 'neutral'}>{s.profile.dailySpf ? '✓' : '○'} Daily SPF50</Pill>
          <Pill tone={(sleepAvg ?? 0) >= 7.5 ? 'good' : 'neutral'}>{(sleepAvg ?? 0) >= 7.5 ? '✓' : '○'} 7.5 h+ sleep</Pill>
          <Pill tone={alcoholDays <= 1 ? 'good' : 'neutral'}>{alcoholDays <= 1 ? '✓' : '○'} Little or no alcohol</Pill>
          <Pill tone={(nutritionAvg ?? 0) >= 60 ? 'good' : 'neutral'}>{(nutritionAvg ?? 0) >= 60 ? '✓' : '○'} Nutrition score 60+</Pill>
        </div>
        <details className="mt-3 text-xs text-ink-2">
          <summary className="cursor-pointer text-sea">Could I be top 10,000 in the world?</summary>
          <p className="mt-2 leading-relaxed">Honestly, no ranking can measure that. There’s no global database of everyone’s health, and “healthiest” mixes things that can’t be fairly combined. Top 10,000 out of 8 billion would be 0.0001%, a level held by Olympic endurance athletes with lab-tested VO2 maxes in the 80s. What the data <i>can</i> say: your fitness, resting heart rate and habits each put you in roughly the top few percent of men your age, and combining them makes you rarer still. Bloodwork, body composition and a lab VO2 test would sharpen this.</p>
        </details>
        <p className="mt-2 text-[11px] text-muted">Percentiles use approximate population curves for men in their 20s. Your Strava and logged data feed them, and they update as you log more.</p>
      </Card>

      <Card eyebrow="Engine" title={<span className="flex items-center gap-2"><Activity size={18} className="text-sea" />VO2 max</span>} action={vo2 ? <span className="num font-serif text-3xl">{vo2}</span> : undefined}>
        {vo2 && (
          <>
            <div className="flex flex-wrap gap-2"><Pill tone={vo2Band(vo2).tone}>{vo2Band(vo2).label}</Pill><Pill tone="gold">Fitness age {fitnessAge(vo2) <= 18 ? '18 or younger' : fitnessAge(vo2)}</Pill></div>
            <p className="mt-3 text-sm text-ink-2">VO2 max is the most oxygen your body can use per kilo per minute: how big your engine is. It’s one of the strongest single predictors of long-term health. Each step up in fitness category is linked with meaningfully lower mortality in large cohort studies, and it naturally falls about 10% a decade unless you train it. Yours is estimated from your race times with Jack Daniels’ VDOT equations{fromRaces ? `: ${fromRaces.from.map((f) => `${f.label} → ${f.vdot}`).join(', ')}` : ''}.</p>
          </>
        )}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {RACE_DISTANCES.map((r) => (
            <label key={r.key} className="text-xs text-muted">{r.label} PB
              <input className="field num mt-1" defaultValue={races[r.key as keyof typeof races] ?? ''} placeholder="m:ss" onBlur={(e) => actions.setProfile({ races: { ...races, [r.key]: e.target.value.trim() || undefined } })} />
            </label>
          ))}
        </div>
        <label className="mt-2 block text-xs text-muted">Or a measured VO2 max (watch or lab), which overrides the estimate
          <input className="field num mt-1" inputMode="decimal" defaultValue={s.profile.vo2Measured ?? ''} placeholder="e.g. 58" onBlur={(e) => actions.setProfile({ vo2Measured: Number(e.target.value) || undefined })} />
        </label>
        <p className="mt-2 text-xs text-muted">Watch estimates are typically within about 5 points of a lab test. Race-based VDOT is usually as good for a trained runner. Update a PB when you set a new one and the estimate moves with it.</p>
      </Card>

      <BloodPressure />
      <Labs />
      {rhr && <p className="px-1 text-xs text-muted">7-day average morning heart rate: {rhr} bpm (from Vitals on Today).</p>}
    </div>
  );
}

function BloodPressure() {
  const bps = sortByDate(useStore((x) => x.bp ?? EMPTY_ARR));
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const last = bps.at(-1);
  const cat = last ? bpCategory(last.sys, last.dia) : undefined;
  const week = bps.slice(-7);
  const avg = week.length ? { sys: Math.round(week.reduce((a, b) => a + b.sys, 0) / week.length), dia: Math.round(week.reduce((a, b) => a + b.dia, 0) / week.length) } : undefined;
  return (
    <Card eyebrow="Arteries" title={<span className="flex items-center gap-2"><HeartPulse size={18} className="text-bad" />Blood pressure</span>} action={last && cat ? <Pill tone={cat.tone}>{last.sys}/{last.dia} · {cat.label}</Pill> : undefined}>
      <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (Number(sys) && Number(dia)) { actions.logBP({ date: todayISO(), sys: Number(sys), dia: Number(dia) }); setSys(''); setDia(''); } }}>
        <label className="flex-1 text-xs text-muted">Systolic (top)<input className="field num mt-1" inputMode="numeric" value={sys} placeholder="118" onChange={(e) => setSys(e.target.value)} /></label>
        <label className="flex-1 text-xs text-muted">Diastolic (bottom)<input className="field num mt-1" inputMode="numeric" value={dia} placeholder="72" onChange={(e) => setDia(e.target.value)} /></label>
        <Button type="submit" disabled={!Number(sys) || !Number(dia)}>Log</Button>
      </form>
      {cat && <p className="mt-3 text-sm text-ink-2">{cat.text}</p>}
      {avg && week.length >= 3 && <p className="mt-2 text-sm">Average of your last {week.length} readings: <b className="num">{avg.sys}/{avg.dia}</b> ({bpCategory(avg.sys, avg.dia).label}).</p>}
      {bps.length >= 2 && <div className="mt-3"><LineChart points={bps.slice(-30).map((b) => ({ x: prettyDate(b.date), y: b.sys }))} unit=" mmHg" target={120} colour="var(--bad)" /></div>}
      <details className="mt-3 text-xs text-ink-2">
        <summary className="cursor-pointer text-sea">How to measure it properly</summary>
        <p className="mt-2 leading-relaxed">Morning, before coffee and training. Sit for 5 minutes with your back supported, feet flat and arm resting at heart height, cuff on bare skin. Take two readings a minute apart and log the second. Judge the 7-day average, not one number. Ideal is 90/60 to 120/80. Fit young men are often at the low end, which is healthy unless you feel dizzy.</p>
      </details>
    </Card>
  );
}

function Labs() {
  const labs = useStore((x) => x.labs ?? EMPTY_ARR);
  const [key, setKey] = useState(LAB_MARKERS[0].key);
  const [value, setValue] = useState('');
  const [date, setDate] = useState(todayISO());
  const latest = LAB_MARKERS.map((m) => ({ m, r: labs.filter((l) => l.key === m.key).sort((a, b) => a.date.localeCompare(b.date)).at(-1) })).filter((x) => x.r);
  const marker = LAB_MARKERS.find((m) => m.key === key)!;
  return (
    <Card eyebrow="Inside view" title={<span className="flex items-center gap-2"><TestTube size={18} className="text-gold" />Blood tests</span>}>
      <p className="mb-3 text-sm text-ink-2">Your annual coeliac review (NICE recommends one) is the perfect time to get these. After the cut, in January, is ideal: it shows how your body handled it.</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="col-span-2 text-xs text-muted">Marker<select className="field mt-1" value={key} onChange={(e) => setKey(e.target.value)}>{LAB_MARKERS.map((m) => <option key={m.key} value={m.key}>{m.label} ({m.unit})</option>)}</select></label>
        <label className="text-xs text-muted">Result ({marker.unit})<input className="field num mt-1" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} /></label>
        <label className="text-xs text-muted">Test date<input type="date" className="field mt-1" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} /></label>
      </div>
      <p className="mt-2 text-xs text-muted">{marker.why}</p>
      <Button className="mt-2" disabled={value === '' || Number.isNaN(Number(value))} onClick={() => { actions.logLab(date, key, Number(value)); setValue(''); }}>Add result</Button>
      {latest.length > 0 && (
        <ul className="mt-4 space-y-2">
          {latest.map(({ m, r }) => {
            const j = m.judge(r!.value);
            return (
              <li key={m.key} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 p-2.5 text-sm">
                <span>{m.label}<span className="block text-xs text-muted">{prettyDate(r!.date)}</span></span>
                <span className="text-right"><b className="num">{r!.value} {m.unit}</b><span className="block"><Pill tone={j.tone}>{j.label}</Pill></span></span>
                <button aria-label="Remove result" className="text-xs text-muted" onClick={() => actions.removeLab(r!.date, m.key)}>✕</button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-muted">General UK guide ranges only. Labs use different ranges and units, so the range printed on your report always wins, and anything flagged should be discussed with your GP.</p>
    </Card>
  );
}
