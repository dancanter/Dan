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
        <p className={`mt-3 text-xs leading-relaxed ${s.profile.bloatProne ? 'rounded-xl bg-warn-soft p-2.5 text-ink' : 'text-ink-2'}`}><b>Gut-bloat watch:</b> {p.fodmapFoods.join(', ')} {p.fodmapFoods.length === 1 ? 'is' : 'are'} high in FODMAPs{s.profile.bloatProne ? ', the most likely cause of your bloating. Each one’s food page has a low-FODMAP swap.' : '. They’re healthy fibre, so only cut them if they bloat you, or the day before a big event.'}</p>
      )}
      <p className="mt-2 text-[11px] text-muted">Facial puffiness is water, not fat, and it’s gone within a day or two. The biggest levers are sleep, alcohol, and keeping sodium steady (a sudden rise, not salt itself) with plenty of potassium.</p>
    </Card>
  );
}

interface Step { when: string; items: [string, Evidence][] }

const PLAN: Step[] = [
  { when: '14 to 8 days out: dial in', items: [
    ['Lock the routine: same wake time, same meals you know, same training. Consistency is what makes you look sharp', 'moderate'],
    ['Book the haircut for 5–7 days before, so it looks fresh but settled, not just-cut', 'speculative'],
    ['Plan the outfits now and try them on, including shoes. Fit beats brand: one well-cut knit and a good coat beat a suitcase of options', 'speculative'],
    ['Daylight walk every morning. You sleep better, and the skin and eyes show it', 'moderate'],
    ['Find 2–3 safe gluten-free restaurants for the trip and save them', 'strong'],
  ] },
  { when: '7 to 4 days out', items: [
    ['Sleep 8–9 hours every night, same wake time', 'strong'],
    ['Keep eating and training normally. No crash diet: under-fuelling flattens muscles and hollows the face', 'moderate'],
    ['Daily SPF and your usual gentle skincare. Don’t try any new products now (flare-ups take days to settle)', 'moderate'],
  ] },
  { when: '3 days out', items: [
    ['Last alcohol, now. It takes 2–3 days for sleep, skin redness and water balance to recover', 'moderate'],
    ['Keep salt steady. Don’t cut it: a sudden cut followed by a salty meal on the day is worse than steady intake', 'emerging'],
    ['Potassium at every meal: potatoes, leafy greens, avocado, yoghurt, kiwi, salmon', 'moderate'],
  ] },
  { when: '2 days out', items: [
    ['Last hard leg or interval session. Hard work causes temporary fluid shifts and inflammation', 'emerging'],
    ['No new foods. Go easy on beans and fizzy drinks if they bloat you, and keep salt and water exactly as usual', 'moderate'],
  ] },
  { when: 'The day before', items: [
    ['Normal carbs (rice, potatoes): muscles hold glycogen and look fuller. No extreme "carb loading"', 'emerging'],
    ['No salty takeaway. Dinner 3 hours before bed, 2–2.5 litres of water across the day', 'emerging'],
    ['Screens down, lights low, 8.5+ hours in bed. One extra pillow can reduce morning eye puffiness', 'speculative'],
  ] },
  { when: 'On the day', items: [
    ['Water on waking, then coffee: caffeine briefly tightens blood vessels', 'emerging'],
    ['Cold splash or chilled gua sha for 2–3 minutes: a temporary de-puff that lasts a few hours', 'emerging'],
    ['A light breakfast: eggs, fruit, yoghurt, salt as usual. SPF on', 'moderate'],
  ] },
];

export function BigDayCountdown({ date = todayISO() }: { date?: string }) {
  const p = useStore((s) => s.profile);
  // The next event: a Big Day you set, or the start of a travel/peak phase in your season plan.
  const events = [
    ...(p.bigDay ? [{ label: p.bigDay.label, date: p.bigDay.date }] : []),
    ...(p.season ?? []).filter((ph) => ph.kind === 'travel' || ph.kind === 'peak').map((ph) => ({ label: ph.name, date: ph.start })),
  ].filter((e) => e.date >= date).sort((a, b) => a.date.localeCompare(b.date));
  const big = events[0];
  if (!big) return null;
  const left = daysBetween(date, big.date);
  if (left < 0 || left > 14) return null;
  const stage = left >= 8 ? 0 : left >= 4 ? 1 : left === 3 ? 2 : left === 2 ? 3 : left === 1 ? 4 : 5;
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
      <p className="mb-3 text-sm text-ink-2">A date, a photo, an event, an interview. Set it and Glow runs a 14-day countdown on Today, telling you exactly what to do each day so you wake up de-puffed, rested and glowing.</p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex-1 text-xs text-muted">What’s happening<input className="field mt-1" value={label} placeholder="e.g. Monaco weekend" onChange={(e) => setLabel(e.target.value)} /></label>
        <label className="text-xs text-muted">Date<input type="date" className="field mt-1" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} /></label>
        <Button tone="gold" disabled={!label.trim()} onClick={() => actions.setProfile({ bigDay: { label: label.trim(), date } })}>Set</Button>
        {big && <Button tone="ghost" onClick={() => actions.setProfile({ bigDay: undefined })}>Clear</Button>}
      </div>
      {big && <p className="mt-2 text-sm"><Pill tone="gold">{big.label} · {prettyDate(big.date)}</Pill></p>}
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-sea">See the full 14-day plan</summary>
        <div className="mt-2 space-y-3">
          {PLAN.map((st) => (
            <div key={st.when}>
              <div className="text-xs font-semibold tracking-wide text-gold uppercase">{st.when}</div>
              <ul className="mt-1 space-y-1.5">{st.items.map(([t, e]) => <li key={t} className="flex flex-wrap items-baseline gap-2 text-ink-2"><span>{t}</span><EvidencePill e={e} /></li>)}</ul>
            </div>
          ))}
          <p className="text-xs text-muted">What actually makes people look better long term: 8–9 hours of sleep, daily SPF, enough protein, not cutting so hard your face goes gaunt, colourful food (carotenoids warm skin tone in about 6 weeks), low alcohol and a regular routine. The 14-day plan is the finishing polish on top of that. Travel phases in your season plan get the same countdown automatically.</p>
        </div>
      </details>
    </Card>
  );
}
