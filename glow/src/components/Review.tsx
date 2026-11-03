import { hosted } from '@/host';
import { useState } from 'react';
import { CalendarCheck, Check, Dna, Shuffle, Sparkles, TrendingUp } from 'lucide-react';
import { ideasFor } from '@/data/ideas';
import { seasonOf } from '@/data/films';
import { phaseCompare, weeklyReview, type Cellular, type PhaseRow, type SinceStart } from '@/engine/review';
import { addDays, prettyDate, todayISO } from '@/engine/body';
import { actions, useStore } from '@/store';
import { Card, Grade, Pill } from './ui';

const AREA_LABEL: Record<string, string> = { health: 'health', looks: 'looks', style: 'style', mind: 'mind', social: 'people', learn: 'learn', career: 'career', fun: 'fun' };

/** Three optional ideas for the day, from different areas. Totally optional. */
export function IdeasCard({ date }: { date: string }) {
  const done = useStore((x) => x.days[date]?.extras) ?? [];
  const [shuffle, setShuffle] = useState(0);
  const ideas = ideasFor(date, seasonOf(date), shuffle);
  return (
    <Card eyebrow="Only if you have time" title={<span className="flex items-center gap-2"><Sparkles size={18} className="text-gold" />Ideas for today</span>}
      action={<button className="flex items-center gap-1 text-sm text-sea" onClick={() => setShuffle(shuffle + 1)}><Shuffle size={14} />Shuffle</button>}>
      <ul className="space-y-2">
        {ideas.map((i) => {
          const on = done.includes(i.id);
          return (
            <li key={i.id}>
              <button onClick={() => actions.toggleExtra(date, i.id)} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition ${on ? 'border-good bg-good/10' : 'border-line'}`}>
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${on ? 'border-good bg-good text-white' : 'border-line'}`}>{on && <Check size={12} />}</span>
                <span className="flex-1 leading-relaxed">{i.text}</span>
                <Pill>{AREA_LABEL[i.area]}</Pill>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] text-muted">No pressure: skipping these costs nothing. Each one you do shows up in your weekly review.</p>
    </Card>
  );
}

/** This week against last week: what improved, what slipped, next week's focus. */
export function WeeklyReviewCard({ end: endProp, browse }: { end?: string; browse?: boolean }) {
  const s = useStore((x) => x);
  const [back, setBack] = useState(0);
  const base = endProp ?? todayISO();
  const end = addDays(base, -7 * back);
  const r = weeklyReview(s, end);
  const shown = r.metrics.filter((m) => m.now !== undefined || m.prev !== undefined);
  return (
    <Card eyebrow={`Weekly review · ${prettyDate(r.start)} – ${prettyDate(r.end)}`} title={<span className="flex items-center gap-2"><CalendarCheck size={18} className="text-gold" />{back === 0 ? 'Your week' : `${back} week${back > 1 ? 's' : ''} ago`}</span>}
      action={r.daysLogged ? <Grade grade={r.grade} score={r.score} /> : undefined}>
      {browse && (
        <div className="mb-3 flex gap-2 text-sm">
          <button className="text-sea" onClick={() => setBack(back + 1)}>← Earlier week</button>
          {back > 0 && <button className="text-sea" onClick={() => setBack(back - 1)}>Later week →</button>}
        </div>
      )}
      {!r.daysLogged ? (
        <p className="text-sm text-ink-2">Nothing logged in this week yet. Log food, sleep, weight and training, and your review builds itself, comparing each week with the one before.</p>
      ) : (
        <div className="space-y-4 text-sm">
          <p className="text-ink-2">{r.daysLogged} of 7 days logged.{r.daysLogged < 5 ? ' Log at least 5 days for a fair comparison.' : ''}</p>
          {r.wins.length > 0 && (
            <div><h4 className="mb-1 font-semibold text-good">Improved</h4><ul className="list-disc space-y-1 pl-5">{r.wins.map((w) => <li key={w}>{w}</li>)}</ul></div>
          )}
          {r.slips.length > 0 && (
            <div><h4 className="mb-1 font-semibold text-warn">Slipped</h4><ul className="list-disc space-y-1 pl-5">{r.slips.map((w) => <li key={w}>{w}</li>)}</ul></div>
          )}
          {!r.wins.length && !r.slips.length && <p className="text-ink-2">Not enough data from last week to compare yet. Next week’s review will show the changes.</p>}
          <CellularSection c={r.cellular} />
          {r.sinceStart && <SinceStartSection x={r.sinceStart} />}
          {r.focus.length > 0 && (
            <div className="rounded-xl bg-gold/10 p-3"><h4 className="mb-1 font-semibold">Focus for next week</h4><ol className="list-decimal space-y-1 pl-5">{r.focus.map((w) => <li key={w}>{w}</li>)}</ol></div>
          )}
          <details>
            <summary className="cursor-pointer text-sea">All the numbers</summary>
            <table className="mt-2 w-full text-left">
              <thead className="text-[11px] text-muted"><tr><th className="py-1">Measure</th><th>Last week</th><th>This week</th><th>Aim</th></tr></thead>
              <tbody>
                {shown.map((m) => (
                  <tr key={m.key} className="border-t border-line">
                    <td className="py-1.5">{m.label}</td>
                    <td className="num">{m.prev !== undefined ? m.fmt!(m.prev) : '–'}</td>
                    <td className="num font-medium">{m.now !== undefined ? m.fmt!(m.now) : '–'}{m.unit && m.now !== undefined ? ` ${m.unit}` : ''}</td>
                    <td className="text-[11px] text-muted">{m.target ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      )}
    </Card>
  );
}

const arrow = (now?: number, prev?: number, up = true) => {
  if (now === undefined || prev === undefined || Math.abs(now - prev) < 1) return <span className="text-muted">·</span>;
  const good = up ? now > prev : now < prev;
  return <span className={good ? 'text-good' : 'text-warn'}>{now > prev ? '▲' : '▼'}</span>;
};

function CellularSection({ c }: { c: Cellular }) {
  if (c.coverage.now === undefined) return null;
  return (
    <div className="rounded-xl border border-line p-3">
      <h4 className="mb-1 flex items-center gap-2 font-semibold"><Dna size={16} className="text-gold" />Cellular health and nutrients</h4>
      <p className="text-ink-2">{c.verdict}</p>
      <ul className="mt-2 space-y-1.5">
        {c.pillars.map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            <span className="w-5">{p.emoji}</span>
            <span className="flex-1">{p.name}</span>
            <span className="num w-8 text-right text-muted">{p.prev !== undefined ? Math.round(p.prev) : '–'}</span>
            <span className="text-muted">→</span>
            <span className="num w-8 text-right font-medium">{p.now !== undefined ? Math.round(p.now) : '–'}</span>
            <span className="w-4 text-center">{arrow(p.now, p.prev)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-ink-2">Micronutrient coverage (absorption-adjusted): <b className="num">{Math.round(c.coverage.now * 100)}%</b>{c.coverage.prev !== undefined ? ` (last week ${Math.round(c.coverage.prev * 100)}%)` : ''}</p>
      {c.strongest.length > 0 && <p className="mt-1"><span className="text-good">Strongest:</span> {c.strongest.map((m) => `${m.label} ${m.pct}%`).join(', ')}</p>}
      {c.weakest.length > 0 && (
        <div className="mt-1"><span className="text-warn">Lowest this week:</span>
          <ul className="mt-1 space-y-1 pl-1">{c.weakest.map((m) => <li key={m.key}>• <b>{m.label}</b> {m.pct}%. Best gluten-free fixes: {m.foods.join(', ')}.</li>)}</ul>
        </div>
      )}
      {(c.helpers.length > 0 || c.stressors.length > 0) && (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {c.helpers.length > 0 && <div><div className="text-[11px] font-semibold tracking-wide text-good uppercase">Protective (servings)</div>{c.helpers.map((h) => <div key={h.label} className="flex justify-between"><span>{h.label}</span><span className="num">{h.prev} → <b>{h.now}</b> {arrow(h.now * 10, h.prev * 10)}</span></div>)}</div>}
          {c.stressors.length > 0 && <div><div className="text-[11px] font-semibold tracking-wide text-warn uppercase">Stressors (servings)</div>{c.stressors.map((h) => <div key={h.label} className="flex justify-between"><span>{h.label}</span><span className="num">{h.prev} → <b>{h.now}</b> {arrow(h.now * 10, h.prev * 10, false)}</span></div>)}</div>}
        </div>
      )}
      {c.topFoods.length > 0 && <p className="mt-2 text-ink-2"><span className="font-medium text-ink">Your week’s staples:</span> {c.topFoods.map((f) => `${f.name} (${f.days}d)`).join(', ')}</p>}
    </div>
  );
}

function SinceStartSection({ x }: { x: SinceStart }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <h4 className="mb-1 flex items-center gap-2 font-semibold"><TrendingUp size={16} className="text-gold" />Since your first week ({prettyDate(x.from)})</h4>
      <ul className="space-y-1">
        {x.rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2">
            <span className="flex-1">{r.label}</span>
            <span className="num text-muted">{r.first}</span><span className="text-muted">→</span><b className="num">{r.now}</b>
            <span className={`w-4 text-center ${r.better === undefined ? 'text-muted' : r.better ? 'text-good' : 'text-warn'}`}>{r.better === undefined ? '·' : r.better ? '✓' : '!'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Cut vs maintenance: how much healthier you get once the deficit ends, while staying lean. */
export function PhaseCompareCard() {
  const s = useStore((x) => x);
  const rows = phaseCompare(s, todayISO());
  const lb = s.profile.unit === 'lb';
  const f = (v: number | undefined, fn: (v: number) => string) => (v === undefined ? '–' : fn(v));
  const cols: { label: string; get: (r: PhaseRow) => string }[] = [
    { label: 'Days', get: (r) => String(r.days) },
    { label: 'Calories eaten', get: (r) => f(r.kcal, (v) => Math.round(v).toLocaleString('en-GB')) },
    { label: 'Weight', get: (r) => f(r.weight, (v) => (lb ? `${(v * 2.20462).toFixed(1)} lb` : `${v.toFixed(1)} kg`)) },
    { label: 'Pillar average', get: (r) => f(r.pillars, (v) => String(Math.round(v))) },
    { label: 'Micronutrient coverage', get: (r) => f(r.coverage, (v) => `${Math.round(v * 100)}%`) },
    { label: 'Energy availability', get: (r) => f(r.ea, (v) => `${Math.round(v)} kcal/kg FFM`) },
    { label: 'Sleep', get: (r) => f(r.sleep, (v) => `${v.toFixed(1)} h`) },
    { label: 'Morning heart rate', get: (r) => f(r.rhr, (v) => `${Math.round(v)} bpm`) },
    { label: 'Glow score', get: (r) => f(r.glow, (v) => String(Math.round(v))) },
  ];
  const rev = s.profile.reverseFrom;
  return (
    <Card eyebrow="Cut vs maintenance" title="How much healthier when you eat more">
      <p className="mb-2 text-sm text-ink-2">Each phase’s averages side by side. Once you hit 122–124 lb and add calories back, watch energy availability, sleep, heart rate and the pillars rise while your weight barely moves. That’s the proof the extra food is building health, not fat.</p>
      {rows.length === 0 ? <p className="text-sm text-muted">Fills in from 2 November as you log.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] text-muted"><tr><th className="py-1" />{rows.map((r) => <th key={r.kind}>{r.label}</th>)}</tr></thead>
            <tbody>{cols.map((c) => <tr key={c.label} className="border-t border-line"><td className="py-1.5 pr-2">{c.label}</td>{rows.map((r) => <td key={r.kind} className="num">{c.get(r)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
      {hosted() ? <p className="mt-2 text-[11px] text-muted">Calories and the reverse are set by the tracker’s Camp and Reverse tabs. Energy availability below 30 kcal/kg fat-free mass is where hormones and bone health start to suffer; 45 is fully fuelled.</p> : <>
      <p className="mt-2 text-[11px] text-muted">{rev ? `Reverse started ${prettyDate(rev)}: +100 kcal a week until maintenance. ` : 'When your 7-day average reaches goal, the coach will offer to start the reverse (+100 kcal a week). '}Energy availability below 30 kcal/kg fat-free mass is where hormones and bone health start to suffer; 45 is fully fuelled.</p>
      {rev && <button className="mt-1 text-xs text-sea" onClick={() => actions.setProfile({ reverseFrom: undefined })}>Undo: go back to cut calories</button>}</>}
    </Card>
  );
}
