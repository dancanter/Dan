import { useMemo } from 'react';
import { addDays, todayISO } from '@/lib/dates';
import { mean, sd } from '@/lib/stats';
import { useStore } from '@/store/store';
import { baseline, loadSummary, readiness, trainingState } from '@/engine/readiness';
import { BarsChart, ChartFrame, LinesChart } from '@/components/charts';
import { Badge, Card, Note, PageHeader, Provenance, SourceRefs, Stat } from '@/components/ui';

function toMinutes(t?: string): number | null {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  let mins = h * 60 + m;
  if (mins < 12 * 60) mins += 24 * 60; // after-midnight bedtimes count as late, not early
  return mins;
}

const SCIENCE: { title: string; body: string; sources: string[] }[] = [
  { title: 'Muscle growth', body: 'A single night without sleep cut muscle protein synthesis by ~18% and raised cortisol in young adults. Growth hormone is released mainly in deep sleep. Short sleep also means lower-quality training the next day.', sources: ['lamon2021'] },
  { title: 'Hormones', body: 'A week of 5-hour nights lowered daytime testosterone by 10–15% in young men in a small lab study. Chronic short sleep raises evening cortisol and appetite-regulating hormones shift towards hunger.', sources: ['leproult2011'] },
  { title: 'Running adaptation', body: 'Sleep loss reduces endurance performance and raises perceived effort at the same pace — so sessions run after a bad night feel harder and adapt less.', sources: ['fullagar2015', 'walsh2021'] },
  { title: 'Immune function', body: 'People sleeping under 6 hours were about four times more likely to catch a cold after a controlled virus exposure than those sleeping over 7.', sources: ['prather2015'] },
  { title: 'Cognition and learning', body: 'Sleep actively consolidates new memories — the night after study is part of studying.', sources: ['diekelmann2010'] },
  { title: 'Cardiovascular health', body: 'Both short and very long sleep are associated with worse cardiovascular outcomes; regularity of sleep timing predicts mortality even more strongly than duration in recent cohort data.', sources: ['cappuccio2011', 'windred2024'] },
];

export default function Recovery() {
  const data = useStore((s) => s.data);
  const today = todayISO();
  const [lo, hi] = data.profile.sleepTargetHours;
  const days = useMemo(() => Array.from({ length: 28 }, (_, i) => addDays(today, -27 + i)), [today]);
  const rows = days.map((d) => {
    const c = data.checkIns[d];
    const r = readiness(data, d);
    return { date: d, sleep: c?.sleepHours ?? null, readiness: r.score, rhr: c?.restingHr ?? null, hrv: c?.hrv ?? null };
  });
  const sleeps = rows.map((r) => r.sleep).filter((x): x is number => x != null);
  const last7 = rows.slice(-7).map((r) => r.sleep).filter((x): x is number => x != null);
  const beds = days.map((d) => toMinutes(data.checkIns[d]?.bedTime)).filter((x): x is number => x != null);
  const wakes = days.map((d) => toMinutes(data.checkIns[d]?.wakeTime)).filter((x): x is number => x != null);
  const state = trainingState(data, today);
  const load = loadSummary(data, today);
  const rhrBase = baseline(data, 'restingHr', today);
  const meditation = days.slice(-14).filter((d) => (data.checkIns[d]?.meditationMin ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Recovery" title="Sleep, readiness, adaptation" subtitle={`Target ${lo}–${hi} hours, at consistent times. Recovery is where training turns into fitness.`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><Stat label="Sleep, last 7 nights" value={mean(last7) != null ? `${mean(last7)!.toFixed(1)} h` : '—'} sub={`${last7.filter((h) => h < lo).length} nights under ${lo} h`} tone={mean(last7) != null && mean(last7)! < lo - 0.5 ? 'warn' : undefined} /></Card>
        <Card><Stat label="Sleep consistency (SD)" value={sd(sleeps) != null ? `±${sd(sleeps)!.toFixed(1)} h` : '—'} sub={beds.length >= 5 ? `bedtime ±${Math.round(sd(beds)!)} min · wake ±${wakes.length >= 5 ? Math.round(sd(wakes)!) : '—'} min` : 'add bed/wake times for timing consistency'} /></Card>
        <Card><Stat label="Meditation" value={`${meditation}/14 days`} sub="consistency over streaks" /></Card>
        <Card><Stat label="Resting HR baseline" value={rhrBase ? `${Math.round(rhrBase)} bpm` : '—'} sub={rhrBase ? 'median of days 3–30 ago' : 'needs 7+ readings'} /></Card>
      </div>

      <Card eyebrow="Training state" title={state.label} action={<Provenance kind="estimated" />}>
        <p className="text-ink-2">{state.summary}</p>
        {state.evidence.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">{state.evidence.map((e, i) => <li key={i}>{e}</li>)}</ul>}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Stat small label="Load, last 7 days" value={Math.round(load.acute)} sub="session RPE × minutes" />
          <Stat small label="4-week weekly average" value={load.chronic ? Math.round(load.chronic) : '—'} sub={load.chronic ? '' : 'needs 3 weeks of logs'} />
          <Stat small label="Acute : chronic" value={load.ratio ? load.ratio.toFixed(2) : '—'} sub="a flag, not a rule" tone={load.ratio && load.ratio > 1.5 ? 'warn' : undefined} />
        </div>
        <p className="mt-3 text-xs text-muted">The app distinguishes a normal dip after a hard session (productive stress), fatigue that stacks up over days (accumulated fatigue), recovery that is not keeping up (usually sleep or fuel), and genuine improvement (faster at the same effort, repeatedly). Load ratios are shown because they are informative, but their use to predict injury is contested.</p>
        <SourceRefs ids={['foster2001', 'impellizzeri2020', 'saw2016', 'halson2014']} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame title="Sleep" subtitle={`Hours asleep, last 28 days · band = ${lo}–${hi} h target`} table={{ columns: ['Date', 'Hours'], rows: rows.map((r) => [r.date, r.sleep ?? '—']) }}>
          <BarsChart data={rows.map((r) => ({ ...r, date: r.date.slice(5) }))} x="date" series={[{ key: 'sleep', label: 'Sleep', colour: 's1' }]} band={[lo, hi]} format={(v) => `${v}`} />
        </ChartFrame>
        <ChartFrame title="Readiness" subtitle="0–100 heuristic from your check-ins" table={{ columns: ['Date', 'Readiness'], rows: rows.map((r) => [r.date, r.readiness ?? '—']) }}>
          <LinesChart data={rows.map((r) => ({ ...r, date: r.date.slice(5) }))} x="date" series={[{ key: 'readiness', label: 'Readiness', colour: 's1' }]} yDomain={[0, 100]} />
        </ChartFrame>
      </div>

      {rows.some((r) => r.rhr || r.hrv) && (
        <ChartFrame title="Resting heart rate" subtitle="From your device — compared only with your own baseline" table={{ columns: ['Date', 'RHR', 'HRV'], rows: rows.map((r) => [r.date, r.rhr ?? '—', r.hrv ?? '—']) }}>
          <LinesChart data={rows.map((r) => ({ ...r, date: r.date.slice(5) }))} x="date" series={[{ key: 'rhr', label: 'Resting HR (bpm)', colour: 's2' }]} />
        </ChartFrame>
      )}

      <Note>
        <strong>On wearable scores.</strong> “Readiness” and “recovery” scores from watches combine HRV, heart rate and sleep estimates through undisclosed formulas. They are useful as trends against your own baseline, unreliable as a single morning verdict, and wrist-based sleep staging is especially imprecise. How you feel, how the last sessions went and how you slept are given at least as much weight here.
      </Note>

      <section>
        <h2 className="mb-3 font-serif text-3xl">Why sleep matters this much</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SCIENCE.map((s) => (
            <Card key={s.title} title={<span className="text-xl">{s.title}</span>}>
              <p className="text-sm text-ink-2">{s.body}</p>
              <SourceRefs ids={s.sources} />
            </Card>
          ))}
        </div>
      </section>

      <Card tone="quiet" eyebrow="Practical" title="What moves the needle">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">
          <li>Same wake time seven days a week; bedtime follows. <Badge>regularity</Badge></li>
          <li>Daylight outside within an hour of waking; dim light in the last hour before bed.</li>
          <li>Caffeine before midday — even 6 hours before bed it measurably reduces sleep.</li>
          <li>Hard evening sessions: finish 2+ hours before bed and eat a proper meal afterwards.</li>
          <li>Short nights happen: a 20-minute nap before mid-afternoon helps; extending sleep is a legitimate performance strategy.</li>
          <li>Ten minutes of meditation reduces stress and anxiety modestly in trials — useful, not magic.</li>
        </ul>
        <SourceRefs ids={['drake2013', 'mah2011', 'goyal2014', 'watson2015', 'hirshkowitz2015']} />
      </Card>
    </div>
  );
}
