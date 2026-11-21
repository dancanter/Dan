import { useState } from 'react';
import { ListChecks } from 'lucide-react';
import { dayPlan, type PlanItem } from '@/engine/dayplan';
import { SEASON_LABEL } from '@/data/films';
import { useStore } from '@/store';
import { Card, Pill } from './ui';

const TAG_TONE: Record<PlanItem['tag'], 'gold' | 'sea' | 'good' | 'neutral' | 'warn'> = { body: 'sea', food: 'good', train: 'gold', mind: 'neutral', study: 'neutral', sleep: 'neutral' };
const TAG_LABEL: Record<PlanItem['tag'], string> = { body: 'body', food: 'food', train: 'train', mind: 'mind', study: 'study', sleep: 'sleep' };

export function DayPlanCard({ date }: { date: string }) {
  const s = useStore((x) => x);
  const [all, setAll] = useState(false);
  const plan = dayPlan(s, date);
  const shown = all ? plan.items : plan.items.slice(0, 5);
  return (
    <Card eyebrow={`Today’s plan · ${SEASON_LABEL[plan.season].toLowerCase()}`} title={<span className="flex items-center gap-2"><ListChecks size={18} className="text-gold" />{plan.headline}</span>}>
      <ol className="relative space-y-3 border-l border-line pl-4">
        {shown.map((it) => (
          <li key={it.time + it.title} className="text-sm">
            <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-gold" />
            <div className="flex flex-wrap items-baseline gap-2"><b className="num">{it.time}</b><span className="font-medium">{it.title}</span><Pill tone={TAG_TONE[it.tag]}>{TAG_LABEL[it.tag]}</Pill></div>
            <p className="mt-0.5 leading-relaxed text-ink-2">{it.detail}</p>
          </li>
        ))}
      </ol>
      <button className="mt-3 text-sm text-sea" onClick={() => setAll(!all)}>{all ? 'Show less' : `Show the full day (${plan.items.length} steps)`}</button>
      <p className="mt-2 text-[11px] text-muted">Built from your wake time, today’s daylight, your plan phase, the recovery clock and the coach’s calls. It updates as you log.</p>
    </Card>
  );
}
