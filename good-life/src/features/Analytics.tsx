import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addDays, startOfWeek, todayISO } from '@/lib/dates';
import { weightValue } from '@/lib/units';
import { uid } from '@/lib/id';
import { useStore } from '@/store/store';
import type { RoadmapPhase } from '@/store/types';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { buildReview, evaluateRoadmap, reviewToText, ROADMAP, type Review } from '@/engine/review';
import { insights } from '@/engine/insights';
import { dailyLoad, readiness } from '@/engine/readiness';
import { rollingAverage, sortedWeights } from '@/engine/physique';
import { e1rmSeries } from '@/engine/gym';
import { kcalOf, targets } from '@/engine/nutrition';
import { distanceByIntensity } from '@/engine/running';
import { BarsChart, ChartFrame, LinesChart } from '@/components/charts';
import { Badge, Button, Card, Empty, Note, PageHeader, Segmented, Tabs, TextArea } from '@/components/ui';

type Tab = 'trends' | 'reviews' | 'roadmap' | 'insights';
const PHASE_ORDER: RoadmapPhase[] = ['baseline', 'consistency', 'development', 'consolidation', 'progression'];

export default function Analytics() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) ?? 'trends';
  return (
    <div>
      <PageHeader eyebrow="Analytics" title="What the data says" subtitle="Trends from your own logs, honest reviews, and phases that move on evidence rather than the calendar." />
      <Tabs<Tab> value={tab} onChange={(t) => setParams({ tab: t })} tabs={[{ value: 'trends', label: 'Trends' }, { value: 'reviews', label: 'Reviews' }, { value: 'roadmap', label: 'Roadmap' }, { value: 'insights', label: 'Insights' }]} />
      {tab === 'trends' && <Trends />}
      {tab === 'reviews' && <Reviews />}
      {tab === 'roadmap' && <Roadmap />}
      {tab === 'insights' && <InsightsView />}
    </div>
  );
}

function Trends() {
  const data = useStore((s) => s.data);
  const [range, setRange] = useState<'28' | '90'>('90');
  const today = todayISO();
  const days = Number(range);
  const from = addDays(today, -days + 1);
  const unit = data.profile.weightUnit === 'kg' ? 'kg' : 'lb';
  const kcal = kcalOf(data);

  const weight = useMemo(() => rollingAverage(sortedWeights(data)).filter((w) => w.date >= from).map((w) => ({ date: w.date, daily: Math.round(weightValue(w.kg, unit) * 10) / 10, avg: w.avg ? Math.round(weightValue(w.avg, unit) * 10) / 10 : null })), [data, from, unit]);
  const weeks = useMemo(() => {
    const n = Math.ceil(days / 7);
    return Array.from({ length: n }, (_, i) => {
      const ws = startOfWeek(addDays(today, -7 * (n - 1 - i)));
      const we = addDays(ws, 6);
      const runs = data.runs.filter((r) => r.date >= ws && r.date <= we);
      const loads = Array.from({ length: 7 }, (_, k) => dailyLoad(data, addDays(ws, k)));
      const sleep = Array.from({ length: 7 }, (_, k) => data.checkIns[addDays(ws, k)]?.sleepHours).filter((x): x is number => x != null);
      const study = data.study.filter((s) => s.date >= ws && s.date <= we).reduce((a, s) => a + s.minutes, 0);
      return {
        week: ws.slice(5),
        easy: Math.round(runs.reduce((a, r) => a + distanceByIntensity(r).easy, 0) * 10) / 10,
        quality: Math.round(runs.reduce((a, r) => { const x = distanceByIntensity(r); return a + x.moderate + x.hard; }, 0) * 10) / 10,
        load: Math.round(loads.reduce((a, b) => a + b, 0)),
        sleep: sleep.length ? Math.round((sleep.reduce((a, b) => a + b, 0) / sleep.length) * 10) / 10 : null,
        study: Math.round((study / 60) * 10) / 10,
      };
    });
  }, [data, days, today]);
  const daily = useMemo(() => Array.from({ length: days }, (_, i) => {
    const d = addDays(from, i);
    const entries = data.food.filter((f) => f.date === d);
    const intake = entries.length ? Math.round(entries.reduce((a, f) => a + kcal(f.foodId, f.grams), 0)) : null;
    return { date: d.slice(5), readiness: readiness(data, d).score, intake, target: entries.length ? Math.round((targets(data, d).energy.lo + targets(data, d).energy.hi) / 2) : null };
  }), [data, days, from, kcal]);
  const keyLift = ['incline-db-press', 'pull-up', 'seated-db-press', 'lat-pulldown'].find((id) => e1rmSeries(data, id).length >= 2);
  const lift = keyLift ? e1rmSeries(data, keyLift).filter((s) => s.date >= from).map((s) => ({ ...s, date: s.date.slice(5) })) : [];

  return (
    <div className="space-y-4">
      <Segmented value={range} onChange={setRange} options={[{ value: '28', label: '4 weeks' }, { value: '90', label: '3 months' }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame title={`Weight (${unit})`} subtitle="Daily dots, 7-day average line" table={{ columns: ['Date', 'Daily', 'Average'], rows: weight.map((w) => [w.date, w.daily, w.avg ?? '—']) }}>
          {weight.length >= 3 ? <LinesChart data={weight} x="date" dots="daily" dotsLabel="Daily" series={[{ key: 'avg', label: '7-day average', colour: 's1' }]} format={(v) => v.toFixed(1)} xFormat={(v) => v.slice(5)} /> : <Empty title="Not enough weigh-ins" />}
        </ChartFrame>
        <ChartFrame title="Running volume" subtitle="km per week" table={{ columns: ['Week', 'Easy', 'Quality'], rows: weeks.map((w) => [w.week, w.easy, w.quality]) }}>
          <BarsChart data={weeks} x="week" stacked series={[{ key: 'easy', label: 'Easy', colour: 's1' }, { key: 'quality', label: 'Quality & speed', colour: 's2' }]} />
        </ChartFrame>
        <ChartFrame title="Training load" subtitle="Weekly session-RPE × minutes (running + gym)" table={{ columns: ['Week', 'Load'], rows: weeks.map((w) => [w.week, w.load]) }}>
          <BarsChart data={weeks} x="week" series={[{ key: 'load', label: 'Load', colour: 's1' }]} />
        </ChartFrame>
        <ChartFrame title="Sleep" subtitle="Average hours per week" table={{ columns: ['Week', 'Hours'], rows: weeks.map((w) => [w.week, w.sleep ?? '—']) }}>
          <LinesChart data={weeks} x="week" series={[{ key: 'sleep', label: 'Sleep', colour: 's1' }]} band={data.profile.sleepTargetHours} />
        </ChartFrame>
        <ChartFrame title="Readiness" subtitle="Daily, from check-ins" table={{ columns: ['Date', 'Readiness'], rows: daily.map((d) => [d.date, d.readiness ?? '—']) }}>
          <LinesChart data={daily} x="date" series={[{ key: 'readiness', label: 'Readiness', colour: 's1' }]} yDomain={[0, 100]} />
        </ChartFrame>
        <ChartFrame title="Energy intake vs target" subtitle="Logged days only (kcal)" table={{ columns: ['Date', 'Intake', 'Target midpoint'], rows: daily.filter((d) => d.intake).map((d) => [d.date, d.intake!, d.target!]) }}>
          {daily.some((d) => d.intake) ? <LinesChart data={daily} x="date" series={[{ key: 'intake', label: 'Intake', colour: 's1' }, { key: 'target', label: 'Target midpoint', colour: 's3' }]} /> : <Empty title="No food logged in this period" />}
        </ChartFrame>
        <ChartFrame title="Study" subtitle="Hours per week" table={{ columns: ['Week', 'Hours'], rows: weeks.map((w) => [w.week, w.study]) }}>
          <BarsChart data={weeks} x="week" series={[{ key: 'study', label: 'Study hours', colour: 's1' }]} />
        </ChartFrame>
        <ChartFrame title={keyLift ? `${EXERCISE_BY_ID[keyLift].name} — e1RM` : 'Strength'} subtitle="Estimated 1-rep max (kg)" table={{ columns: ['Date', 'e1RM'], rows: lift.map((l) => [l.date, l.e1rm]) }}>
          {lift.length >= 2 ? <LinesChart data={lift} x="date" series={[{ key: 'e1rm', label: 'e1RM', colour: 's1' }]} /> : <Empty title="Log a key lift twice to see progress" />}
        </ChartFrame>
      </div>
    </div>
  );
}

function ReviewView({ r }: { r: Review }) {
  const sec = (title: string, xs: string[], tone?: 'good' | 'bad' | 'warn') => (
    <div>
      <div className="mb-1 text-sm font-medium">{title}</div>
      {xs.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">{xs.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="text-sm text-muted">{tone === 'good' ? 'Nothing measurable this period.' : 'Nothing flagged.'}</p>}
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {sec('What improved', r.improved, 'good')}
        {sec('What deteriorated', r.deteriorated, 'bad')}
        {sec('What is holding you back', r.holdingBack, 'warn')}
        {sec('What should change', r.change)}
        {sec('What should stay the same', r.keep)}
      </div>
      <div className="rounded-xl bg-good-soft p-4"><div className="text-xs uppercase tracking-[0.14em] text-muted">Highest-value action</div><div className="mt-1 font-serif text-2xl">{r.highestValue}</div></div>
      <p className="text-xs text-muted">{r.dataNote}</p>
    </div>
  );
}

function Reviews() {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const [kind, setKind] = useState<'weekly' | 'monthly'>('weekly');
  const [reflection, setReflection] = useState('');
  const end = addDays(startOfWeek(todayISO()), -1);
  const review = useMemo(() => buildReview(data, kind, end), [data, kind, end]);
  return (
    <div className="space-y-4">
      <Segmented value={kind} onChange={setKind} options={[{ value: 'weekly', label: 'Weekly review' }, { value: 'monthly', label: 'Monthly strategic review' }]} />
      <Card eyebrow={`${review.from} → ${review.to}`} title={kind === 'weekly' ? 'Last week, honestly' : 'The last four weeks'}>
        <ReviewView r={review} />
        <div className="mt-5">
          <div className="mb-1 text-sm font-medium">Your reflection</div>
          <p className="mb-2 text-xs text-muted">{kind === 'weekly' ? 'What do the numbers miss? What will you do differently — and what is the one thing you are committing to?' : 'Are your priorities right? Is any goal costing more than it is worth? What would you stop doing?'}</p>
          <TextArea rows={4} value={reflection} onChange={(e) => setReflection(e.target.value)} />
          <Button className="mt-2" variant="primary" onClick={() => { upsert('reviews', { id: uid('rv-'), kind, periodStart: review.from, periodEnd: review.to, summary: reviewToText(review), reflection, created: new Date().toISOString() }); setReflection(''); }}>Save review</Button>
        </div>
      </Card>
      {data.reviews.length > 0 && (
        <Card eyebrow="Archive" title="Past reviews">
          <ul className="space-y-3">{[...data.reviews].reverse().map((r) => <li key={r.id}><details className="rounded-xl border border-line p-3 text-sm"><summary className="font-medium">{r.kind === 'weekly' ? 'Week' : 'Month'} ending {r.periodEnd}</summary><pre className="mt-2 whitespace-pre-wrap font-sans text-ink-2">{r.summary}</pre>{r.reflection && <p className="mt-2 italic">“{r.reflection}”</p>}</details></li>)}</ul>
        </Card>
      )}
    </div>
  );
}

function Roadmap() {
  const data = useStore((s) => s.data);
  const setPhase = useStore((s) => s.setPhase);
  const ev = evaluateRoadmap(data);
  const idx = PHASE_ORDER.indexOf(data.roadmap.current);
  return (
    <div className="space-y-4">
      <ol className="grid gap-3 md:grid-cols-5">
        {PHASE_ORDER.map((p, i) => (
          <li key={p} className={`rounded-2xl border p-4 ${i === idx ? 'border-navy bg-surface shadow-card' : i < idx ? 'border-line bg-surface-2/60' : 'border-line'}`}>
            <div className="text-xs text-muted">{ROADMAP[p].label.split('·')[0]}</div>
            <div className="font-medium">{ROADMAP[p].label.split('·')[1]?.trim()}</div>
            <p className="mt-1 text-xs text-ink-2">{ROADMAP[p].aim}</p>
            {i === idx && <Badge tone="navy">current · since {data.roadmap.since}</Badge>}
          </li>
        ))}
      </ol>
      <Card eyebrow="Readiness to progress" title={ev.ready ? 'The evidence says: ready to move on' : 'Not yet — and that is fine'}>
        <p className="mb-3 text-sm text-ink-2">{ev.summary}</p>
        <ul className="space-y-1.5">{ev.checks.map((c) => <li key={c.label} className="flex gap-2 text-sm"><span className={c.met ? 'text-good' : 'text-muted'}>{c.met ? '✓' : '○'}</span>{c.label}</li>)}</ul>
        {ev.ready && ev.next && <Button className="mt-4" variant="primary" onClick={() => setPhase('roadmap', ev.next!, `Criteria met: ${ev.checks.filter((c) => c.met).map((c) => c.label).join('; ')}`)}>Move to {ROADMAP[ev.next].label}</Button>}
        <Note>Phases are not calendar periods. The app proposes a move when the criteria are met; you decide. You can also step back if life gets in the way.</Note>
      </Card>
      {data.roadmap.history.length > 0 && (
        <Card eyebrow="History" title="How you got here">
          <ul className="space-y-2 text-sm">{data.roadmap.history.map((h, i) => <li key={i}><span className="font-medium">{ROADMAP[h.phase as RoadmapPhase]?.label}</span> <span className="text-muted">{h.from} → {h.to}</span><div className="text-xs text-ink-2">{h.reason}</div></li>)}</ul>
        </Card>
      )}
    </div>
  );
}

function InsightsView() {
  const data = useStore((s) => s.data);
  const list = insights(data);
  return (
    <div className="space-y-4">
      <Note>These are patterns in your own logs — small samples from one person. Useful for noticing; never proof of cause. Each says how many days it rests on.</Note>
      {list.length === 0 ? <Empty title="Not enough data yet" body="Insights appear after a few weeks of check-ins, runs and study logs." /> : (
        <div className="grid gap-4 md:grid-cols-2">{list.map((i) => <Card key={i.id} eyebrow={`${i.kind} · n = ${i.n}`} title={<span className="text-xl">{i.title}</span>}><p className="text-sm text-ink-2">{i.body}</p></Card>)}</div>
      )}
    </div>
  );
}
