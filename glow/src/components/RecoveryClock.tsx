import { Timer } from 'lucide-react';
import { SYSTEM_LABEL, readyLabel, recoveryStatus } from '@/engine/recovery';
import { useStore } from '@/store';
import { Card, Pill } from './ui';

export function RecoveryClock({ date }: { date: string }) {
  const s = useStore((x) => x);
  if (!Object.keys(s.training ?? {}).length) return null;
  const r = recoveryStatus(s, date);
  const allReady = r.systems.every((x) => x.readyInDays === 0);
  return (
    <Card eyebrow="Recovery clock" title={<span className="flex items-center gap-2"><Timer size={18} className="text-sea" />{allReady ? 'Fully recovered: green light' : 'Still recovering'}</span>}>
      <ul className="space-y-2.5">
        {r.systems.map((x) => (
          <li key={x.system} className="flex items-start justify-between gap-3 text-sm">
            <span>{SYSTEM_LABEL[x.system]}{x.from && x.readyInDays > 0 && <span className="block text-xs text-muted">after {x.from}</span>}</span>
            <span className="shrink-0 whitespace-nowrap"><Pill tone={x.readyInDays === 0 ? 'good' : x.readyInDays === 1 ? 'gold' : 'warn'}>{readyLabel(x.readyInDays)}</Pill></span>
          </li>
        ))}
      </ul>
      {r.reasons.length > 0 && <p className="mt-3 text-xs text-muted">Slowing your recovery right now: {r.reasons.join(', ')}.</p>}
      <details className="mt-2 text-xs text-ink-2">
        <summary className="cursor-pointer text-sea">How Glow works this out</summary>
        <p className="mt-2 leading-relaxed">Typical recovery before the next hard effort: about 48 h after intervals or tempo, 72–96 h after a race or all-out time trial, 72 h after a heavy leg session, and 48 h after an upper-body lift (60 h for a very high-volume one). Easy runs need little or none, and easy running is fine on “not ready” days. Then it adds time for what slows repair: a calorie deficit, short sleep, a raised morning heart rate, low energy availability, or feeling sore or tired. It’s an estimate. Your morning heart rate and how your legs feel on a warm-up have the final say.</p>
      </details>
    </Card>
  );
}
