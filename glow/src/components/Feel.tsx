import { useState } from 'react';
import { HeartHandshake } from 'lucide-react';
import { FEELINGS, adviceFor } from '@/engine/feelings';
import { actions, useStore } from '@/store';
import { Card } from './ui';

export function FeelCard({ date }: { date: string }) {
  const s = useStore((x) => x);
  const [picked, setPicked] = useState<string | null>(null);
  const logged = s.days[date]?.feelings ?? [];
  const advice = picked ? adviceFor(picked, s, date) : undefined;
  return (
    <Card eyebrow="Check in with yourself" title={<span className="flex items-center gap-2"><HeartHandshake size={18} className="text-gold" />How do you feel right now?</span>}>
      <div className="flex flex-wrap gap-1.5">
        {FEELINGS.map((f) => (
          <button key={f.id} onClick={() => { setPicked(f.id); actions.logFeeling(date, f.id); }}
            className={`rounded-full px-3 py-1.5 text-sm ${picked === f.id ? 'bg-navy text-navy-ink' : logged.includes(f.id) ? 'bg-gold-soft' : 'bg-surface-2'}`}>
            {f.emoji} {f.label}
          </button>
        ))}
      </div>
      {advice && (
        <div className="rise mt-4 rounded-2xl bg-surface-2 p-4">
          <div className="font-serif text-lg">{advice.headline}</div>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">{advice.steps.map((x) => <li key={x}>{x}</li>)}</ol>
          {advice.note && <p className="mt-3 rounded-xl bg-warn-soft p-3 text-sm">{advice.note}</p>}
        </div>
      )}
    </Card>
  );
}
