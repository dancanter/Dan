import { useState } from 'react';
import { Thermometer } from 'lucide-react';
import { ILL_KINDS, SEVERITY, episodes, illAdvice, illStats, type IllKind } from '@/engine/illness';
import { prettyDate, todayISO } from '@/engine/body';
import { actions, useStore } from '@/store';
import { Button, Card, Pill } from './ui';

/** Today: quick "I'm ill" log, and what to do about training if you are. */
export function IllToday({ date, startOpen = false }: { date: string; startOpen?: boolean }) {
  const ill = useStore((x) => x.days[date]?.ill);
  const [open, setOpen] = useState(startOpen);
  const [kind, setKind] = useState<IllKind>('cold');
  const [sev, setSev] = useState<1 | 2 | 3>(1);
  if (!ill && !open) {
    return <button className="flex items-center gap-2 px-1 text-sm text-ink-2" onClick={() => setOpen(true)}><Thermometer size={14} />Feeling ill today? Log it</button>;
  }
  if (!ill) {
    return (
      <Card eyebrow="Log a sick day" title="What’s wrong?">
        <div className="flex flex-wrap gap-2">
          {ILL_KINDS.map((k) => <button key={k.id} onClick={() => setKind(k.id)} className={`rounded-full border px-3 py-1.5 text-sm ${kind === k.id ? 'border-gold bg-gold/15' : 'border-line'}`}>{k.label}</button>)}
        </div>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3].map((v) => <button key={v} onClick={() => setSev(v as 1 | 2 | 3)} className={`flex-1 rounded-xl border py-2 text-sm ${sev === v ? 'border-gold bg-gold/15' : 'border-line'}`}>{SEVERITY[v]}</button>)}
        </div>
        <div className="mt-3 flex gap-2">
          <Button tone="gold" onClick={() => { actions.setIll(date, { kind, severity: sev }); setOpen(false); }}>Log sick day</Button>
          <Button tone="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </Card>
    );
  }
  const adv = illAdvice(ill);
  const label = ILL_KINDS.find((k) => k.id === ill.kind)?.label;
  return (
    <div className="card rise p-4 ring-2 ring-bad/40">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase"><Thermometer size={14} />Sick day</div>
      <div className="font-serif text-lg">{label} · {SEVERITY[ill.severity].toLowerCase()}</div>
      <p className="mt-1 text-sm font-medium">{adv.train === 'none' ? 'No training today.' : 'Easy movement only, if you feel up to it.'}</p>
      <ul className="mt-1 space-y-1 text-sm text-ink-2">{adv.text.map((t) => <li key={t}>• {t}</li>)}</ul>
      <button className="mt-2 text-xs text-sea" onClick={() => actions.setIll(date, undefined)}>Not ill after all: remove</button>
    </div>
  );
}

/** Health tab: how often you get ill, by month, year and phase, and what comes before it. */
export function IllnessCard() {
  const s = useStore((x) => x);
  const today = todayISO();
  const st = illStats(s, today);
  const eps = episodes(s).slice(-6).reverse();
  return (
    <Card eyebrow="Illness log" title={<span className="flex items-center gap-2"><Thermometer size={18} className="text-gold" />How often you get ill</span>}>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-surface-2 p-2"><div className="num text-2xl font-semibold">{st.monthDays}</div><div className="text-[11px] text-muted">sick days this month</div></div>
        <div className="rounded-xl bg-surface-2 p-2"><div className="num text-2xl font-semibold">{st.yearDays}</div><div className="text-[11px] text-muted">sick days this year</div></div>
        <div className="rounded-xl bg-surface-2 p-2"><div className="num text-2xl font-semibold">{st.daysSinceLast ?? '–'}</div><div className="text-[11px] text-muted">days since last</div></div>
      </div>
      {st.allDays === 0 ? (
        <p className="mt-3 text-sm text-ink-2">No sick days logged. Tap “Feeling ill today?” on Today whenever you are, and this builds up: counts, episodes, cut vs maintenance, and what tends to come before you get ill.</p>
      ) : (
        <div className="mt-3 space-y-3 text-sm">
          <p className="text-ink-2">{st.yearEpisodes} episode{st.yearEpisodes === 1 ? '' : 's'} this year{st.avgLength ? `, lasting ${st.avgLength} days on average` : ''}. {st.benchmark}</p>
          {st.byPhase.length > 0 && (
            <div><h4 className="mb-1 font-semibold">By phase (sick days per 30 days)</h4>
              {st.byPhase.map((p) => <div key={p.label} className="flex justify-between border-t border-line py-1"><span>{p.label}</span><span className="num">{p.per30} <span className="text-muted">({p.ill} of {p.days} days)</span></span></div>)}
            </div>
          )}
          {st.patterns.length > 0 && (
            <div><h4 className="mb-1 font-semibold">What came before your episodes</h4>
              <ul className="space-y-1">{st.patterns.map((p) => <li key={p.label}>• {p.label}: <b>{p.count} of {p.of}</b></li>)}</ul>
              <p className="mt-1 text-[11px] text-muted">Patterns, not proof: you catch colds from viruses. Short sleep, under-fuelling and heavy training make you more likely to catch one, and to be ill for longer.</p>
            </div>
          )}
          <div><h4 className="mb-1 font-semibold">Recent episodes</h4>
            <ul className="space-y-1">{eps.map((e) => <li key={e.start} className="flex flex-wrap items-center gap-2"><span>{prettyDate(e.start)}{e.days > 1 ? ` – ${prettyDate(e.end)}` : ''}</span><Pill>{e.days} day{e.days > 1 ? 's' : ''}</Pill>{e.kinds.map((k) => <Pill key={k} tone={ILL_KINDS.find((x) => x.id === k)?.belowNeck ? 'warn' : 'neutral'}>{k}</Pill>)}</li>)}</ul>
          </div>
        </div>
      )}
    </Card>
  );
}
