import { useMemo } from 'react';
import { todayISO } from '@/engine/body';
import { dayResult } from '@/engine/game';
import { useStore } from '@/store';
import { Breathing } from '@/screens/Rituals';

// The calm half of the tracker's Home page: the 8 pillars for today at a glance
// (the lowest one first, with what moves it) and the breathing timer.
export function CalmHome({ date = todayISO() }: { date?: string }) {
  const s = useStore((x) => x);
  const day = useMemo(() => dayResult(s, date), [s, date]);
  const logged = (s.days[date]?.items ?? []).length > 0;
  const pillars = [...day.analysis.pillars].sort((a, b) => a.score - b.score);
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-2 text-[11px] font-semibold tracking-wide text-gold uppercase">Your 8 pillars today</div>
        {!logged ? <p className="text-sm text-ink-2">Log some food and the pillars fill in.</p> : (
          <ul className="space-y-1.5 text-sm">
            {pillars.map((p) => (
              <li key={p.pillar.id} className="flex items-center gap-2">
                <span className="w-5">{p.pillar.emoji}</span>
                <span className="min-w-0 flex-1 truncate">{p.pillar.name}</span>
                <span className="h-1.5 w-20 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-gold" style={{ width: `${Math.max(3, Math.min(100, p.score))}%` }} /></span>
                <span className="num w-7 text-right text-xs text-muted">{Math.round(p.score)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Breathing date={date} minutesToday={s.breathMinutes[date] ?? 0} />
    </div>
  );
}
