import { useEffect, useState } from 'react';
import { Footprints, HeartPulse, Sparkles, TreePine } from 'lucide-react';
import { outdoorVerdict, parseVitals, rhrAnalysis, stepsVerdict, type Tone, type Verdict } from '@/engine/vitals';
import { actions, useStore, EMPTY_OBJ } from '@/store';
import { Bar, Button, Card } from './ui';
import { hosted } from '@/host';

const TONE: Record<Tone, string> = { good: 'var(--good)', ok: 'var(--sea)', warn: 'var(--warn)', bad: 'var(--bad)' };

export function VitalsCard({ date, kg }: { date: string; kg?: number }) {
  const all = useStore((s) => s.vitals ?? EMPTY_OBJ);
  const v = all[date] ?? {};
  const [text, setText] = useState('');
  const [steps, setSteps] = useState(v.steps?.toString() ?? '');
  const [out, setOut] = useState(v.outdoorMin?.toString() ?? '');
  const [rhr, setRhr] = useState(v.rhr?.toString() ?? '');
  useEffect(() => {
    setSteps(v.steps?.toString() ?? '');
    setOut(v.outdoorMin?.toString() ?? '');
    setRhr(v.rhr?.toString() ?? '');
  }, [date, v.steps, v.outdoorMin, v.rhr]);

  const parsed = parseVitals(text);
  const save = (field: 'steps' | 'outdoorMin' | 'rhr', raw: string) => {
    const n = raw.trim() === '' ? undefined : Number(raw.replace(/[^\d.]/g, ''));
    actions.setVitals(date, { [field]: n });
  };
  const h = rhrAnalysis(date, all);

  return (
    <Card title="Vitals" eyebrow="Steps · outdoors · morning heart rate">
      {hosted() && <p className="mb-3 text-xs text-muted">Steps and morning heart rate come from your Today log, so you only type them once.</p>}
      {!hosted() && <form className="mb-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (Object.keys(parsed).length) { actions.setVitals(date, parsed); setText(''); } }}>
        <input className="field" placeholder="e.g. 12k steps, 40 min outside, HR 48" value={text} onChange={(e) => setText(e.target.value)} aria-label="Tell Glow about your day" />
        <Button type="submit" disabled={!Object.keys(parsed).length}><Sparkles size={16} />Log</Button>
      </form>}
      {text && Object.keys(parsed).length > 0 && (
        <p className="-mt-2 mb-3 text-xs text-sea">Got it: {[parsed.steps && `${parsed.steps.toLocaleString('en-GB')} steps`, parsed.outdoorMin !== undefined && `${parsed.outdoorMin} min outside`, parsed.rhr && `resting HR ${parsed.rhr}`].filter(Boolean).join(' · ')}</p>
      )}
      <div className={hosted() ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-3 gap-2'}>
        {!hosted() && <Num icon={<Footprints size={13} />} label="Steps" value={steps} set={setSteps} onSave={() => save('steps', steps)} />}
        <Num icon={<TreePine size={13} />} label="Mins outside" value={out} set={setOut} onSave={() => save('outdoorMin', out)} />
        {!hosted() && <Num icon={<HeartPulse size={13} />} label="Morning HR" value={rhr} set={setRhr} onSave={() => save('rhr', rhr)} />}
      </div>
      <div className="mt-4 space-y-3">
        {v.steps !== undefined && <VerdictRow icon="👟" verdict={stepsVerdict(v.steps, kg, date)} />}
        {v.outdoorMin !== undefined && <VerdictRow icon="🌤️" verdict={outdoorVerdict(v.outdoorMin, Number(date.slice(5, 7)))} />}
        {v.rhr !== undefined && <VerdictRow icon="🫀" verdict={h.verdict} extra={h.baseline ? `Baseline ${h.baseline} bpm from ${h.n} mornings` : undefined} />}
      </div>
      <details className="mt-3 text-xs text-ink-2">
        <summary className="cursor-pointer text-sea">How much is enough, and how much is too much?</summary>
        <div className="mt-2 space-y-2 leading-relaxed">
          <p><b>Steps.</b> In a 2022 meta-analysis of 47,000 people, the drop in mortality risk levelled off at about 8,000–10,000 steps a day for under-60s. For you, the target is <b>13k on weekdays and 12k on Sunday</b>, and Saturday is whatever comes naturally (about 10,500 at most). Past about 15–18k, stacked on 4 lifts, 3–4 runs and a calorie deficit, extra steps add no health benefit. They add fatigue, lower-leg bone load and 300–400+ kcal of energy cost, which pushes you towards under-fuelling. Walking after meals is the most valuable walking you can do.</p>
          <p><b>Outdoors.</b> 10+ minutes of daylight before 10am sets your body clock: sleepier at night, more alert in the morning, a healthier cortisol curve. Aim for 120+ minutes a week in green space or by water. From April to September, short midday sun on your arms makes vitamin D; keep SPF on your face.</p>
          <p><b>Morning heart rate.</b> Measure it on waking, lying still, before you get up, the same way every day (watch, or count 30 seconds × 2). Your own baseline matters more than the number: <b>+5 bpm</b> means take it easier, and <b>+8</b> is often illness incoming. Alcohol, late meals, heat, stress and short sleep all push it up. A heart rate that keeps falling while you feel flat and keep losing weight can signal under-fuelling rather than fitness.</p>
        </div>
      </details>
    </Card>
  );
}

function Num({ icon, label, value, set, onSave }: { icon: React.ReactNode; label: string; value: string; set: (v: string) => void; onSave: () => void }) {
  return (
    <label className="text-xs text-muted">
      <span className="flex items-center gap-1">{icon}{label}</span>
      <input className="field num mt-1" inputMode="numeric" value={value} onChange={(e) => set(e.target.value)} onBlur={onSave} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />
    </label>
  );
}

function VerdictRow({ icon, verdict, extra }: { icon: string; verdict: Verdict; extra?: string }) {
  return (
    <div className="rise">
      <div className="mb-1 flex items-center justify-between text-sm"><span>{icon} <b style={{ color: TONE[verdict.tone] }}>{verdict.headline}</b></span><span className="num text-xs text-muted">{verdict.score}</span></div>
      <Bar value={verdict.score} height={5} colour={TONE[verdict.tone]} />
      <p className="mt-1 text-xs leading-relaxed text-ink-2">{verdict.detail}{extra ? ` (${extra})` : ''}</p>
    </div>
  );
}
