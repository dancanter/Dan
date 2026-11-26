import { useState } from 'react';
import { Waves } from 'lucide-react';
import { BINGE_KINDS, BINGE_SIZE, BINGE_TRIGGERS, afterBinge, bingeStats, type BingeKind, type BingeLog } from '@/engine/binge';
import { todayISO } from '@/engine/body';
import { actions, getState, useStore } from '@/store';
import { Button, Card } from './ui';

const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-sm ${on ? 'border-gold bg-gold/15' : 'border-line'}`;

/** Today: "Had a binge?" — log it in 10 seconds, then get the no-compensating plan. */
export function BingeToday({ date, startOpen = false }: { date: string; startOpen?: boolean }) {
  const binges = useStore((x) => x.days[date]?.binges);
  const [open, setOpen] = useState(startOpen);
  const [kind, setKind] = useState<BingeKind>('yoghurt');
  const [size, setSize] = useState<1 | 2 | 3>(2);
  const [when, setWhen] = useState<NonNullable<BingeLog['when']>>('evening');
  const [trig, setTrig] = useState<string[]>([]);
  if (!binges?.length && !open) return <button className="flex items-center gap-2 px-1 text-sm text-ink-2" onClick={() => setOpen(true)}><Waves size={14} />Had a binge? Log it, no judgement</button>;
  if (open) {
    return (
      <Card eyebrow="No judgement, just data" title="Log a binge">
        <div className="space-y-3 text-sm">
          <div><div className="mb-1 text-muted">What was it?</div><div className="flex flex-wrap gap-2">{BINGE_KINDS.map((k) => <button key={k.id} className={chip(kind === k.id)} onClick={() => setKind(k.id)}>{k.label}</button>)}</div></div>
          <div><div className="mb-1 text-muted">Roughly how much extra?</div><div className="flex flex-wrap gap-2">{[1, 2, 3].map((v) => <button key={v} className={chip(size === v)} onClick={() => setSize(v as 1 | 2 | 3)}>{BINGE_SIZE[v]}</button>)}</div></div>
          <div><div className="mb-1 text-muted">When?</div><div className="flex flex-wrap gap-2">{(['morning', 'afternoon', 'evening', 'night'] as const).map((w) => <button key={w} className={chip(when === w)} onClick={() => setWhen(w)}>{w === 'night' ? 'late night' : w}</button>)}</div></div>
          <div><div className="mb-1 text-muted">What set it off? (tick any)</div><div className="flex flex-wrap gap-2">{BINGE_TRIGGERS.map((t) => <button key={t.id} className={chip(trig.includes(t.id))} onClick={() => setTrig(trig.includes(t.id) ? trig.filter((x) => x !== t.id) : [...trig, t.id])}>{t.label}</button>)}</div></div>
          <p className="text-[11px] text-muted">If you can, add the food in “What you ate” too (rough is fine) so your calories stay honest.</p>
          <div className="flex gap-2"><Button tone="gold" onClick={() => { actions.addBinge(date, { kind, size, when, triggers: trig }); setOpen(false); setTrig([]); }}>Log it</Button><Button tone="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
        </div>
      </Card>
    );
  }
  const last = binges![binges!.length - 1];
  return (
    <div className="card rise p-4 ring-2 ring-sea/40">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase"><Waves size={14} />After a binge</div>
      <div className="font-serif text-lg">Reset, don’t restrict</div>
      <ul className="mt-1 space-y-1 text-sm text-ink-2">{afterBinge(last, getState(), date).map((t) => <li key={t}>• {t}</li>)}</ul>
      <div className="mt-2 flex gap-4 text-xs">
        <button className="text-sea" onClick={() => setOpen(true)}>Log another</button>
        <button className="text-sea" onClick={() => actions.removeBinge(date, binges!.length - 1)}>Remove (logged by mistake)</button>
      </div>
    </div>
  );
}

/** Body tab: binge counts, your triggers, what the data shows came before, and your plan. */
export function BingeCard() {
  const s = useStore((x) => x);
  const st = bingeStats(s, todayISO());
  const total = st.year;
  return (
    <Card eyebrow="Binges" title={<span className="flex items-center gap-2"><Waves size={18} className="text-gold" />Your binge pattern</span>}>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-surface-2 p-2"><div className="num text-2xl font-semibold">{st.month}</div><div className="text-[11px] text-muted">this month</div></div>
        <div className="rounded-xl bg-surface-2 p-2"><div className="num text-2xl font-semibold">{st.year}</div><div className="text-[11px] text-muted">this year</div></div>
        <div className="rounded-xl bg-surface-2 p-2"><div className="num text-2xl font-semibold">{st.daysSince ?? '–'}</div><div className="text-[11px] text-muted">days since last</div></div>
      </div>
      <div className="mt-3 space-y-3 text-sm">
        {!total && <p className="text-ink-2">Nothing logged. If one happens, tap “Had a binge?” on Today. After a few, this shows your triggers, what came before them, and a plan built from your own pattern.</p>}
        {st.triggers.length > 0 && <div><h4 className="mb-1 font-semibold">Your triggers</h4>{st.triggers.map((t) => <div key={t.label} className="flex justify-between border-t border-line py-1"><span>{t.label}</span><b className="num">{t.count}</b></div>)}</div>}
        {st.patterns.length > 0 && <div><h4 className="mb-1 font-semibold">What the data shows came before</h4><ul className="space-y-1">{st.patterns.map((p) => <li key={p.label}>• {p.label}: <b>{p.count} of {p.of}</b></li>)}</ul></div>}
        {st.kinds.length > 0 && <p className="text-ink-2">Usually: {st.kinds.map((k) => `${k.label.toLowerCase()} (${k.count})`).join(', ')}{st.when[0] ? `, mostly in the ${st.when[0].label.toLowerCase()}` : ''}.</p>}
        <div className="rounded-xl bg-gold/10 p-3"><h4 className="mb-1 font-semibold">{total ? 'Your plan' : 'How to prevent them'}</h4><ol className="list-decimal space-y-1 pl-5">{st.plan.map((p) => <li key={p}>{p}</li>)}</ol></div>
        {st.flag && <p className="rounded-xl border border-line p-3 text-ink-2">{st.flag}</p>}
        <p className="text-[11px] text-muted">The day after a binge is marked like a refeed: the next two weigh-ins are left out of your trend because they’re water and food weight.</p>
      </div>
    </Card>
  );
}
