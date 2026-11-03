import { useMemo } from 'react';
import { MICROS, NUTRIENTS, type NKey } from '@/data/nutrients';
import { targetsFor } from '@/engine/score';
import { addDays } from '@/engine/body';
import { dayResult, weightOn } from '@/engine/game';
import { useStore } from '@/store';
import { Bar } from './ui';

// Dan, 3 Nov: "a round-up of everything, like the micros so far… I'm not bothered
// if it's long, it's important data that I love to see." Every micronutrient, what
// the body actually absorbed (bioavailability-adjusted), today and as a daily
// average for this week (Monday to today, logged days only), lowest first.
const KEYS: NKey[] = ['protein', 'omega3', ...MICROS];

export function MicrosRoundup({ date }: { date: string }) {
  const s = useStore((x) => x);
  const data = useMemo(() => {
    const t = targetsFor(s.profile, weightOn(s, date));
    const dow = (new Date(`${date}T12:00:00`).getDay() + 6) % 7;
    const week = Array.from({ length: dow + 1 }, (_, i) => addDays(date, -i)).filter((d) => (s.days[d]?.items ?? []).length >= 2);
    const tgt = (k: NKey) => (k === 'protein' ? 140 : (t[k] ?? NUTRIENTS[k].target));
    const eff = (d: string, k: NKey) => { const a = dayResult(s, d).analysis; return k === 'protein' ? a.totals.protein : (a.effective[k] ?? 0); };
    const todayOn = (s.days[date]?.items ?? []).length > 0;
    const rows = KEYS.map((k) => ({
      k,
      today: todayOn ? (eff(date, k) / tgt(k)) * 100 : null,
      week: week.length ? (week.reduce((a, d) => a + eff(d, k), 0) / week.length / tgt(k)) * 100 : null,
    }));
    const cov = week.length ? Math.round(week.reduce((a, d) => a + dayResult(s, d).analysis.coverage, 0) / week.length * 100) : null;
    return { rows: rows.sort((a, b) => (a.week ?? a.today ?? 0) - (b.week ?? b.today ?? 0)), days: week.length, cov, todayOn };
  }, [s, date]);
  if (!data.days && !data.todayOn) return <p className="text-sm text-ink-2">No food logged this week yet. Send a screenshot or add food and every nutrient shows here.</p>;
  const low = data.rows.filter((r) => (r.week ?? r.today ?? 100) < 70).map((r) => NUTRIENTS[r.k].label.replace(/ \(.*\)/, ''));
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-2">
        {data.cov !== null && <>This week <b className="text-ink">{data.cov}%</b> average coverage over {data.days} logged day{data.days === 1 ? '' : 's'}. </>}
        {low.length ? <>Furthest behind: <b className="text-ink">{low.slice(0, 3).join(', ')}</b>. Food options for them are on the Nutrition page.</> : 'Everything at 70% or more of what you need.'}
      </p>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {data.rows.map((r) => {
          const v = r.week ?? r.today ?? 0;
          return (
            <li key={r.k} className="text-xs">
              <div className="mb-0.5 flex justify-between gap-2"><span>{NUTRIENTS[r.k].label}</span>
                <span className="num text-muted">{r.week !== null && <>week <b className="text-ink">{Math.round(r.week)}%</b></>}{r.week !== null && r.today !== null && ' · '}{r.today !== null && <>today {Math.round(r.today)}%</>}</span></div>
              <Bar value={Math.min(v, 100)} height={6} colour={v < 50 ? 'var(--bad)' : v < 80 ? 'var(--gold)' : undefined} />
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-muted">What your body actually absorbs, as a share of the day’s need (protein against 140 g). Typical food values, not a blood test; foods with incomplete records (iodine especially) can read low.</p>
    </div>
  );
}
