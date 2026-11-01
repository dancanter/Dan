import { useState } from 'react';
import { CalendarCheck, Check, Shuffle, Sparkles } from 'lucide-react';
import { ideasFor } from '@/data/ideas';
import { seasonOf } from '@/data/films';
import { weeklyReview } from '@/engine/review';
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
