import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Copy, Flame, Moon, Plus, Scale, Sparkles, Trash2, Trophy } from 'lucide-react';
import { MICROS, NUTRIENTS, format, type NKey } from '@/data/nutrients';
import { addDays, fromDisplay, prettyDate, todayISO, toDisplay } from '@/engine/body';
import { dayResult, questFor, rankFor, streak, xpTotal } from '@/engine/game';
import { scoreFood, targetsFor } from '@/engine/score';
import { actions, getState, resolveItems, useStore } from '@/store';
import { AddFood } from '@/components/AddFood';
import { FoodDetail, MEALS } from '@/components/FoodDetail';
import { Bar, Button, Card, Grade, Pill, Ring, Sheet, scoreColour } from '@/components/ui';
import type { Food } from '@/data/foods';
import { VitalsCard } from '@/components/Vitals';
import { Confetti } from '@/components/Confetti';
import { coachLines, factFor } from '@/engine/coach';

export function Today({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  const s = useStore((x) => x);
  const r = useMemo(() => dayResult(s, date), [s, date]);
  const items = resolveItems(s.days[date], s);
  const t = targetsFor(s.profile, r.weightKg);
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Food | null>(null);
  const quest = questFor(date);
  const questDone = quest.done(r, s);
  const xp = useMemo(() => xpTotal(s), [s]);
  const { rank } = rankFor(xp);
  const st = useMemo(() => streak(s), [s]);
  const isToday = date === todayISO();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const coach = coachLines(r, s.vitals ?? {}, { isToday, hour });
  const celebrate = questDone ? `quest-${date}` : r.glow >= 80 ? `glow-${date}` : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs tracking-wide text-muted">{isToday ? `${greet}, ${s.profile.name}` : 'Looking back'}</div>
          <h1 className="font-serif text-2xl">{isToday ? 'Today' : prettyDate(date)}</h1>
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="Previous day" className="rounded-full p-2 hover:bg-surface-2" onClick={() => setDate(addDays(date, -1))}><ChevronLeft size={20} /></button>
          {!isToday && <button className="rounded-lg px-2 py-1 text-xs text-sea" onClick={() => setDate(todayISO())}>Today</button>}
          <button aria-label="Next day" disabled={isToday} className="rounded-full p-2 hover:bg-surface-2 disabled:opacity-30" onClick={() => setDate(addDays(date, 1))}><ChevronRight size={20} /></button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-4">
          <Ring value={r.glow} label="Glow" />
          <div className="flex-1 space-y-2.5">
            <MiniScore label="Nutrition" value={items.length ? r.analysis.nutritionScore : undefined} />
            <MiniScore label="Sleep" value={r.sleep?.score} />
            <MiniScore label="Rituals" value={r.ritualScore} />
            <MiniScore label="Vitality" value={r.vitality} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill tone="gold"><Trophy size={12} />{rank.name} · {xp.toLocaleString('en-GB')} XP</Pill>
          <Pill tone={st ? 'bad' : 'neutral'}><Flame size={12} />{st}-day streak</Pill>
          {r.analysis.wins.slice(0, 3).map((w) => <Pill key={w} tone="good">✓ {w}</Pill>)}
        </div>
      </Card>

      <div className={`card rise flex items-start gap-3 p-4 ${questDone ? 'ring-2 ring-good' : ''}`}>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${questDone ? 'pop bg-good text-white' : 'bg-gold-soft text-gold'}`}>{questDone ? '✓' : <Sparkles size={18} />}</div>
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">Today’s quest</div>
          <div className="font-medium">{quest.title}</div>
          <div className="text-sm text-ink-2">{questDone ? 'Done. Your cells thank you.' : quest.hint}</div>
        </div>
      </div>

      {coach.length > 0 && (
        <Card eyebrow="Glow coach" title="Here’s your day">
          <ul className="space-y-2.5">
            {coach.map((c) => (
              <li key={c.text} className={`rise flex gap-3 rounded-2xl p-3 text-sm leading-relaxed ${c.tone === 'good' ? 'bg-good-soft' : c.tone === 'alert' ? 'bg-bad-soft' : 'bg-gold-soft'}`}>
                <span className="text-xl leading-none">{c.emoji}</span><span>{c.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <CheckIn date={date} />
      <VitalsCard date={date} kg={r.weightKg} />

      {r.analysis.warnings.length > 0 && (
        <div className="space-y-2">
          {r.analysis.warnings.map((w) => (
            <div key={w.text} className={`rise flex gap-2 rounded-2xl p-3 text-sm ${w.level === 'danger' ? 'bg-bad-soft text-bad' : w.level === 'caution' ? 'bg-warn-soft text-warn' : 'bg-surface-2 text-ink-2'}`}>
              <AlertTriangle size={16} className="mt-0.5 shrink-0" /><span>{w.text}</span>
            </div>
          ))}
        </div>
      )}

      <Card title="What you ate" action={
        <div className="flex gap-2">
          <Button tone="ghost" onClick={() => actions.copyDay(addDays(date, -1), date)} className="px-2.5" ><Copy size={15} /><span className="hidden sm:inline">Copy yesterday</span></Button>
          <Button onClick={() => setAdding(true)}><Plus size={16} />Add</Button>
        </div>
      }>
        {!items.length && (
          <button onClick={() => setAdding(true)} className="w-full rounded-2xl border-2 border-dashed border-line p-6 text-center text-sm text-muted hover:border-sea">
            Type what you had, e.g. <i>“3 eggs, 150g wild salmon, handful blueberries”</i>
          </button>
        )}
        {MEALS.map((m) => {
          const its = items.filter((i) => i.meal === m.value);
          if (!its.length) return null;
          const kcal = its.reduce((a, i) => a + (i.food.n.kcal * i.grams) / 100, 0);
          return (
            <div key={m.value} className="mb-3">
              <div className="mb-1 flex justify-between text-xs font-semibold tracking-wide text-muted uppercase"><span>{m.label}</span><span className="num">{Math.round(kcal)} kcal</span></div>
              <ul className="divide-y divide-line">
                {its.map((i) => {
                  const sc = scoreFood(i.food, t);
                  return (
                    <li key={i.uid} className="flex items-center gap-2.5 py-2">
                      <button onClick={() => setDetail(i.food)} aria-label={`About ${i.food.name}`}><Grade grade={sc.grade} score={sc.score} /></button>
                      <button onClick={() => setDetail(i.food)} className="min-w-0 flex-1 text-left">
                        <div className="truncate text-sm">{i.food.name}</div>
                        <div className="num text-xs text-muted">{Math.round((i.food.n.kcal * i.grams) / 100)} kcal · {((i.food.n.protein * i.grams) / 100).toFixed(1)} g protein</div>
                      </button>
                      <input aria-label="Grams" className="field num w-16 px-2 py-1 text-right text-sm" inputMode="decimal" defaultValue={i.grams} onBlur={(e) => { const g = Number(e.target.value); if (g > 0 && g !== i.grams) actions.updateItem(date, i.uid, g); }} />
                      <span className="text-xs text-muted">g</span>
                      <button aria-label="Remove" className="p-1 text-muted hover:text-bad" onClick={() => actions.removeItem(date, i.uid)}><Trash2 size={15} /></button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </Card>

      {items.length > 0 && (
        <>
          <Card title="Fuel" eyebrow="Macros against your targets">
            <div className="space-y-3">
              {(['kcal', 'protein', 'carbs', 'fat', 'fibre', 'omega3'] as NKey[]).map((k) => (
                <MacroRow key={k} k={k} v={r.analysis.totals[k]} target={t[k]} />
              ))}
              <MacroRow k="sugar" v={r.analysis.freeSugar} target={30} limit />
              <MacroRow k="satFat" v={r.analysis.totals.satFat} target={t.satFat} limit />
            </div>
            {r.ea !== undefined && <p className="mt-3 text-xs text-muted">Energy availability so far: <b className="num" style={{ color: r.ea < 30 ? 'var(--bad)' : r.ea < 45 ? 'var(--warn)' : 'var(--good)' }}>{Math.round(r.ea)}</b> kcal per kg fat-free mass (healthy ≥ 45, low &lt; 30). Set your training estimate in Me.</p>}
          </Card>

          <Card title="Your 8 cellular pillars" eyebrow="Today">
            <ul className="space-y-2.5">
              {r.analysis.pillars.map(({ pillar, score }) => (
                <li key={pillar.id}>
                  <div className="mb-1 flex justify-between text-sm"><span>{pillar.emoji} {pillar.name}</span><span className="num font-medium" style={{ color: scoreColour(score) }}>{score}</span></div>
                  <Bar value={score} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Open the Cellular tab to see what each pillar means and which foods move it.</p>
          </Card>

          <Card title="Micronutrients" eyebrow={`${Math.round(r.analysis.coverage * 100)}% average coverage, bioavailability-adjusted`}>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {MICROS.map((k) => {
                const v = r.analysis.effective[k];
                const pct = (v / t[k]) * 100;
                const up = NUTRIENTS[k].upper;
                const over = up !== undefined && (k === 'vitA' ? r.analysis.retinol : r.analysis.totals[k]) > up;
                return (
                  <li key={k} className="text-xs">
                    <div className="mb-0.5 flex justify-between"><span>{NUTRIENTS[k].label}</span><span className="num" style={{ color: over ? 'var(--bad)' : 'var(--muted)' }}>{format(k, r.analysis.totals[k])} · {Math.round(pct)}%{over ? ' ⚠' : ''}</span></div>
                    <Bar value={pct} height={6} colour={over ? 'var(--bad)' : undefined} />
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-muted">Sodium {(r.analysis.totals.sodium / 1000).toFixed(1)} g · Plants today: {r.analysis.plants}</p>
          </Card>
        </>
      )}

      <div className="card rise flex gap-3 p-4">
        <span className="text-2xl">🧠</span>
        <div><div className="text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">Did you know?</div><p className="text-sm leading-relaxed">{factFor(date)}</p></div>
      </div>

      <Confetti fireKey={celebrate} />
      <AddFood open={adding} onClose={() => setAdding(false)} date={date} />
      <Sheet open={!!detail} onClose={() => setDetail(null)} title={detail?.name}>
        {detail && <FoodDetail food={detail} date={date} />}
      </Sheet>
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs"><span className="text-ink-2">{label}</span><span className="num font-medium">{value === undefined ? '–' : value}</span></div>
      <Bar value={value ?? 0} height={6} />
    </div>
  );
}

function MacroRow({ k, v, target, limit }: { k: NKey; v: number; target: number; limit?: boolean }) {
  const pct = (v / target) * 100;
  const colour = limit ? (pct > 100 ? 'var(--bad)' : 'var(--good)') : pct > 115 && k === 'kcal' ? 'var(--warn)' : undefined;
  const label = k === 'sugar' ? 'Free sugar' : NUTRIENTS[k].label;
  const unit = NUTRIENTS[k].unit;
  const fmt = (x: number) => (k === 'omega3' ? x.toFixed(2) : Math.round(x).toLocaleString('en-GB'));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm"><span>{label}{limit && <span className="text-xs text-muted"> (limit)</span>}</span><span className="num text-ink-2">{fmt(v)} / {fmt(target)} {unit}</span></div>
      <Bar value={pct} colour={colour} />
    </div>
  );
}

function CheckIn({ date }: { date: string }) {
  const s = useStore((x) => x);
  const weight = s.weights.find((w) => w.date === date);
  const sleep = s.sleeps.find((e) => e.date === date);
  const [w, setW] = useState('');
  const last = s.sleeps.length ? s.sleeps[s.sleeps.length - 1] : undefined;
  const [bed, setBed] = useState(last?.bed ?? '23:00');
  const [wake, setWake] = useState(last?.wake ?? '07:30');
  const [quality, setQuality] = useState(4);
  if (weight && sleep) return null;
  return (
    <Card title="Morning check-in" eyebrow="Weight & sleep">
      <div className="space-y-4">
        {!weight && (
          <form className="flex items-end gap-2" onSubmit={(e) => {
            e.preventDefault();
            const v = Number(w);
            if (v > 0) { actions.logWeight(date, fromDisplay(v, getState().profile.unit)); setW(''); }
          }}>
            <label className="flex-1 text-xs text-muted"><span className="flex items-center gap-1"><Scale size={13} />Weight ({s.profile.unit}), first thing after the loo</span>
              <input className="field num mt-1" inputMode="decimal" placeholder={s.weights.length ? toDisplay(s.weights[s.weights.length - 1].kg, s.profile.unit).toFixed(1) : s.profile.unit === 'lb' ? '126.6' : '57.4'} value={w} onChange={(e) => setW(e.target.value)} />
            </label>
            <Button type="submit" disabled={!Number(w)}>Save</Button>
          </form>
        )}
        {!sleep && (
          <form onSubmit={(e) => { e.preventDefault(); actions.logSleep({ date, bed, wake, quality }); }}>
            <div className="mb-1 flex items-center gap-1 text-xs text-muted"><Moon size={13} />Last night’s sleep</div>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-muted">Lights out<input type="time" className="field mt-1" value={bed} onChange={(e) => setBed(e.target.value)} /></label>
              <label className="text-xs text-muted">Woke<input type="time" className="field mt-1" value={wake} onChange={(e) => setWake(e.target.value)} /></label>
              <label className="text-xs text-muted">Quality
                <select className="field mt-1" value={quality} onChange={(e) => setQuality(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((q) => <option key={q} value={q}>{'★'.repeat(q)}</option>)}
                </select>
              </label>
            </div>
            <Button type="submit" className="mt-2 w-full" tone="ghost">Save sleep</Button>
          </form>
        )}
      </div>
    </Card>
  );
}
