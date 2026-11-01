import { useState } from 'react';
import { CalendarHeart, Droplets } from 'lucide-react';
import { addDays, daysBetween, prettyDate, todayISO } from '@/engine/body';
import { dayPuff } from '@/engine/puff';
import { actions, resolveItems, useStore } from '@/store';
import { Bar, Button, Card, EvidencePill, Pill, scoreColour } from './ui';
import type { Evidence } from '@/data/science';

export function PuffCard({ date, sleepHours }: { date: string; sleepHours?: number }) {
  const s = useStore((x) => x);
  const items = resolveItems(s.days[date], s);
  if (items.length < 2) return null;
  const history = Array.from({ length: 7 }, (_, k) => resolveItems(s.days[addDays(date, -(k + 1))], s));
  const p = dayPuff(items, history, sleepHours);
  return (
    <Card eyebrow="Tomorrow’s face" title={<span className="flex items-center gap-2"><Droplets size={18} className="text-sea" />De-puff check</span>} action={<span className="num font-serif text-2xl" style={{ color: scoreColour(p.score) }}>{p.score}</span>}>
      <Bar value={p.score} />
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-surface-2 p-2"><div className="num font-serif text-base">{(p.sodium / 1000).toFixed(1)} g</div><div className="text-muted">sodium{p.usualSodium ? ` (usual ${(p.usualSodium / 1000).toFixed(1)})` : ''}</div></div>
        <div className="rounded-xl bg-surface-2 p-2"><div className="num font-serif text-base">{(p.potassium / 1000).toFixed(1)} g</div><div className="text-muted">potassium</div></div>
        <div className="rounded-xl bg-surface-2 p-2"><div className="num font-serif text-base" style={{ color: p.ratio <= 1 ? 'var(--good)' : 'var(--warn)' }}>{p.ratio.toFixed(1)}</div><div className="text-muted">Na:K (aim &lt; 1)</div></div>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">{p.tips.map((t) => <li key={t} className="leading-relaxed">• {t}</li>)}</ul>
      {p.fodmapFoods.length > 0 && (
        <p className="mt-3 text-xs leading-relaxed text-ink-2"><b>Gut-bloat watch:</b> {p.fodmapFoods.join(', ')} are high in FODMAPs. They’re healthy fibre, so only cut them if they bloat <i>you</i>, or the day before a big event.</p>
      )}
      <p className="mt-2 text-[11px] text-muted">Facial puffiness is water, not fat, and it’s gone within a day or two. The biggest levers are sleep, alcohol, and keeping sodium steady (a sudden rise, not salt itself) with plenty of potassium.</p>
    </Card>
  );
}

interface Step { when: string; items: [string, Evidence][] }

const PLAN: Step[] = [
  { when: '7 to 4 days out', items: [
    ['Sleep 8–9 hours every night, same wake time', 'strong'],
    ['Keep eating and training normally. No crash diet: under-fuelling flattens muscles and hollows the face', 'moderate'],
    ['Daily SPF and your usual skincare. Don’t try any new actives now (retinol flare-ups take days to settle)', 'moderate'],
  ] },
  { when: '3 days out', items: [
    ['Last alcohol, now. It takes 2–3 days for sleep, skin redness and water balance to recover', 'moderate'],
    ['Keep salt steady. Don’t cut it: a sudden cut followed by a salty meal on the day is worse than steady intake', 'emerging'],
    ['Potassium at every meal: potatoes, leafy greens, avocado, yoghurt, kiwi, salmon', 'moderate'],
  ] },
  { when: '2 days out', items: [
    ['Last hard leg or interval session. Hard work causes temporary fluid shifts and inflammation', 'emerging'],
    ['No new foods. Go easy on onions, garlic, beans and fizzy drinks if they bloat you', 'moderate'],
  ] },
  { when: 'The day before', items: [
    ['Normal carbs (rice, potatoes): muscles hold glycogen and look fuller. No extreme "carb loading"', 'emerging'],
    ['No salty takeaway. Dinner 3 hours before bed, 2–2.5 litres of water across the day', 'emerging'],
    ['Screens down, lights low, 8.5+ hours in bed. One extra pillow can reduce morning eye puffiness', 'speculative'],
  ] },
  { when: 'On the day', items: [
    ['Water on waking, then coffee: caffeine briefly tightens blood vessels', 'emerging'],
    ['Cold splash or chilled gua sha for 2–3 minutes: a temporary de-puff that lasts a few hours', 'emerging'],
    ['A light, lower-salt breakfast: eggs, fruit, yoghurt. SPF on', 'moderate'],
  ] },
];

export function BigDayCountdown() {
  const big = useStore((s) => s.profile.bigDay);
  if (!big) return null;
  const left = daysBetween(todayISO(), big.date);
  if (left < 0 || left > 7) return null;
  const stage = left >= 4 ? 0 : left === 3 ? 1 : left === 2 ? 2 : left === 1 ? 3 : 4;
  return (
    <div className="card rise overflow-hidden p-4" style={{ background: 'linear-gradient(135deg, var(--navy), var(--sea))', color: 'var(--navy-ink)' }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-80">Big day mode</div>
          <div className="font-serif text-xl">{big.label}</div>
        </div>
        <div className="text-right"><div className="num font-serif text-4xl leading-none">{left}</div><div className="text-[11px] opacity-80">{left === 1 ? 'day to go' : left === 0 ? 'it’s today' : 'days to go'}</div></div>
      </div>
      <div className="mt-3 text-xs font-semibold uppercase opacity-80">{PLAN[stage].when}</div>
      <ul className="mt-1 space-y-1 text-sm">{PLAN[stage].items.map(([t]) => <li key={t}>✦ {t}</li>)}</ul>
    </div>
  );
}

export function BigDaySetup() {
  const big = useStore((s) => s.profile.bigDay);
  const [label, setLabel] = useState(big?.label ?? '');
  const [date, setDate] = useState(big?.date ?? addDays(todayISO(), 7));
  return (
    <Card eyebrow="Look your sharpest" title={<span className="flex items-center gap-2"><CalendarHeart size={18} className="text-gold" />Big day mode</span>}>
      <p className="mb-3 text-sm text-ink-2">A date, a photo, an event, an interview. Set it and Glow runs a 7-day countdown on Today, telling you exactly what to do each day so you wake up de-puffed, rested and glowing.</p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex-1 text-xs text-muted">What’s happening<input className="field mt-1" value={label} placeholder="e.g. Monaco weekend" onChange={(e) => setLabel(e.target.value)} /></label>
        <label className="text-xs text-muted">Date<input type="date" className="field mt-1" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} /></label>
        <Button tone="gold" disabled={!label.trim()} onClick={() => actions.setProfile({ bigDay: { label: label.trim(), date } })}>Set</Button>
        {big && <Button tone="ghost" onClick={() => actions.setProfile({ bigDay: undefined })}>Clear</Button>}
      </div>
      {big && <p className="mt-2 text-sm"><Pill tone="gold">{big.label} · {prettyDate(big.date)}</Pill></p>}
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-sea">See the full 7-day plan</summary>
        <div className="mt-2 space-y-3">
          {PLAN.map((st) => (
            <div key={st.when}>
              <div className="text-xs font-semibold tracking-wide text-gold uppercase">{st.when}</div>
              <ul className="mt-1 space-y-1.5">{st.items.map(([t, e]) => <li key={t} className="flex flex-wrap items-baseline gap-2 text-ink-2"><span>{t}</span><EvidencePill e={e} /></li>)}</ul>
            </div>
          ))}
          <p className="text-xs text-muted">What actually makes people look better long term: 8–9 hours of sleep, daily SPF, enough protein, not cutting so hard your face goes gaunt, colourful food (carotenoids warm skin tone in about 6 weeks), low alcohol and a regular routine. The 7-day plan is the finishing polish on top of that.</p>
        </div>
      </details>
    </Card>
  );
}
