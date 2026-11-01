import { useMemo } from 'react';
import { addDays, sleepHours, sortByDate, weeklyRate } from '@/engine/body';
import { cleanWeights } from '@/engine/calls';
import { dayResult } from '@/engine/game';
import { dayPuff } from '@/engine/puff';
import { seasonProgress } from '@/engine/season';
import { assessLoad } from '@/engine/training';
import { resolveItems, useStore } from '@/store';
import { Bar, Card, scoreColour } from './ui';

// Everything that shows on your face, in one score: sleep, water
// (de-puff), leanness on plan (not too slow, not gaunt), skin care and
// carotenoids, protein, alcohol and recovery.

interface Factor { label: string; score: number; tip: string }

export function LookSharp({ date }: { date: string }) {
  const s = useStore((x) => x);
  const factors = useMemo<Factor[]>(() => {
    const out: Factor[] = [];
    const yesterday = addDays(date, -1);
    const sleeps = sortByDate(s.sleeps).filter((e) => e.date > addDays(date, -3) && e.date <= date).map(sleepHours);
    if (sleeps.length) {
      const avg = sleeps.reduce((a, b) => a + b, 0) / sleeps.length;
      out.push({ label: `Sleep ${avg.toFixed(1)} h`, score: Math.round(Math.max(0, Math.min(100, ((avg - 5.5) / 2.5) * 100))), tip: 'Sleep 8–9 h tonight: the fastest route to a defined, de-puffed face.' });
    }
    const items = resolveItems(s.days[yesterday], s);
    if (items.length >= 3) {
      const hist = Array.from({ length: 7 }, (_, i) => resolveItems(s.days[addDays(yesterday, -(i + 1))], s));
      const p = dayPuff(items, hist, sleeps.at(-1));
      out.push({ label: 'Water balance', score: p.score, tip: p.tips[0] ?? 'Keep salt steady and potassium high.' });
      const r = dayResult(s, yesterday);
      const protein = Math.min(100, Math.round((r.analysis.totals.protein / Math.max(1, (r.weightKg ?? 57) * s.profile.proteinPerKg)) * 100));
      out.push({ label: 'Protein (muscle and collagen)', score: protein, tip: 'Hit your protein target: 4 feedings of 25–35 g.' });
      const alc = Array.from({ length: 3 }, (_, i) => resolveItems(s.days[addDays(date, -i - 1)], s).some((x) => x.food.tags.includes('alc'))).some(Boolean);
      out.push({ label: 'Alcohol-free', score: alc ? 30 : 100, tip: 'No alcohol for 3 days before you want to look your sharpest.' });
      const carot = Array.from({ length: 3 }, (_, i) => dayResult(s, addDays(date, -i - 1)).analysis.tagServings.carot ?? 0).reduce((a, b) => a + b, 0);
      out.push({ label: 'Skin: SPF and carotenoids', score: Math.round((s.profile.dailySpf ? 50 : 0) + Math.min(50, (carot / 3) * 50)), tip: 'Something orange or red daily (sweet potato, red pepper, carrots, salmon) for a warm skin tone.' });
    }
    const w = cleanWeights(s);
    const prog = s.profile.season && w.length >= 4 ? seasonProgress(s.profile.season, w[0].kg, date, w.at(-1)?.kg, weeklyRate(w)) : undefined;
    if (prog) out.push({ label: 'Leanness on plan', score: prog.verdict === 'on-track' || prog.verdict === 'ahead' ? 100 : prog.verdict === 'behind' ? 70 : 55, tip: prog.advice });
    if (Object.keys(s.training ?? {}).length) {
      const load = assessLoad(date, s.training, { kg: w.at(-1)?.kg ?? 57, vitals: s.vitals ?? {}, sleepHours: sleeps, inDeficit: true });
      out.push({ label: 'Recovery', score: load.level === 'too-much' ? 35 : load.level === 'pushing' ? 70 : 100, tip: load.actions[0] ?? 'Keep hard days hard and easy days easy.' });
    }
    return out;
  }, [s, date]);

  if (factors.length < 2) return null;
  const score = Math.round(factors.reduce((a, f) => a + f.score, 0) / factors.length);
  const weakest = [...factors].sort((a, b) => a.score - b.score)[0];
  return (
    <Card eyebrow="Chiselled look" title="Look-sharp score" action={<span className="num font-serif text-3xl" style={{ color: scoreColour(score) }}>{score}</span>}>
      <ul className="space-y-2">
        {factors.map((f) => (
          <li key={f.label} className="text-xs">
            <div className="mb-0.5 flex justify-between"><span>{f.label}</span><span className="num text-muted">{f.score}</span></div>
            <Bar value={f.score} height={5} />
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-xl bg-gold-soft p-3 text-sm"><b>Sharpest win right now:</b> {weakest.tip}</p>
    </Card>
  );
}
