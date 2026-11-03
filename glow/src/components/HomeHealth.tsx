import { useMemo, useState } from 'react';
import { HeartPulse, Plus, Search } from 'lucide-react';
import { prettyDate, todayISO } from '@/engine/body';
import { bpCategory, LAB_MARKERS } from '@/engine/health';
import { dayResult } from '@/engine/game';
import { useStore } from '@/store';
import { healthSnapshot } from './HealthPanel';
import { eatNext } from '@/engine/eatnext';
import { AddFood } from './AddFood';
import { Pill, Ring } from './ui';

// The health half of the tracker's Home page: one glance at health age,
// today's Glow score, blood pressure and blood tests, and the food search
// (the full UK + USDA library) one tap away.
export function HomeHealth({ date = todayISO() }: { date?: string }) {
  const s = useStore((x) => x);
  const [adding, setAdding] = useState(false);
  const h = useMemo(() => healthSnapshot(s, date), [s, date]);
  const day = useMemo(() => dayResult(s, date), [s, date]);
  const next = useMemo(() => eatNext(s, date), [s, date]);
  const logged = (s.days[date]?.items ?? []).length;
  const bp = h.lastBp ? bpCategory(h.lastBp.sys, h.lastBp.dia) : undefined;
  const labs = LAB_MARKERS.map((m) => {
    const last = (s.labs ?? []).filter((l) => l.key === m.key).sort((a, b) => a.date.localeCompare(b.date)).at(-1);
    return last ? { m, last, j: m.judge(last.value) } : null;
  }).filter((x): x is NonNullable<typeof x> => !!x);
  const ga = Math.round(h.ga.age), younger = h.age - ga;
  const pillars = [...day.analysis.pillars].sort((a, b) => a.score - b.score);
  return (
    <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-4">
        <Ring value={logged ? day.glow : 0} size={92} stroke={9} label={logged ? String(day.glow) : '–'} sub="Glow today" />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] tracking-wide text-muted uppercase">Health age</div>
          <div className="font-serif text-3xl text-gold">{ga}</div>
          <div className="text-xs text-ink-2">You’re {h.age}. {younger > 0 ? `Running ${younger} year${younger === 1 ? '' : 's'} younger.` : younger < 0 ? 'Sleep, steps and food bring it down.' : 'Right on your age.'}</div>
          {h.rank.rarest !== undefined && <div className="mt-0.5 text-xs text-ink-2">Roughly the top <b>{h.rank.rarest < 1 ? h.rank.rarest.toFixed(1) : Math.round(h.rank.rarest)}%</b> of men your age</div>}
        </div>
      </div>
      <button type="button" onClick={() => setAdding(true)} className="flex w-full items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-left text-sm text-ink-2">
        <Search size={16} className="text-gold" /> <span className="flex-1">Add food: search 4,000+ foods</span><Plus size={16} />
      </button>
      {next.length > 0 && (
        <div className="rounded-xl bg-gold/10 p-3">
          <div className="mb-1 text-[11px] font-semibold tracking-wide text-gold uppercase">What to eat next</div>
          <ul className="space-y-2 text-sm">
            {next.map((x) => (
              <li key={x.title}><b>{x.emoji} {x.title}</b><div className="text-ink">{x.foods.join(' · ')}</div><div className="text-xs text-ink-2">{x.why}</div></li>
            ))}
          </ul>
        </div>
      )}
      {logged > 0 && (
        <div className="text-sm text-ink-2">
          Today: <b className="text-ink">{Math.round(day.analysis.totals.kcal)}</b> kcal · <b className="text-ink">{Math.round(day.analysis.totals.protein)} g</b> protein · nutrition <b className="text-ink">{Math.round(day.analysis.nutritionScore)}</b> · {day.analysis.plants} plants
          {pillars[0] && <div className="mt-1 text-xs">Lowest pillar today: <b>{pillars[0].pillar.emoji} {pillars[0].pillar.name}</b> ({Math.round(pillars[0].score)}).</div>}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <HeartPulse size={14} className="text-gold" />
        {h.lastBp && bp ? <Pill tone={bp.tone}>BP {h.lastBp.sys}/{h.lastBp.dia} · {bp.label}</Pill> : <Pill>BP: add a reading</Pill>}
        {h.rhr !== undefined && <Pill tone={h.rhr <= 55 ? 'good' : 'neutral'}>RHR {h.rhr}</Pill>}
        {h.vo2 !== undefined && <Pill tone="sea">VO₂ {Math.round(h.vo2)}</Pill>}
        {labs.map((l) => <Pill key={l.m.key} tone={l.j.tone} title={`${prettyDate(l.last.date)}: ${l.last.value} ${l.m.unit}`}>{l.m.label}: {l.j.label}</Pill>)}
        {!labs.length && <span className="text-muted">Blood tests: add them in Body → Health age</span>}
      </div>
      <AddFood open={adding} onClose={() => setAdding(false)} date={date} />
    </div>
  );
}
