import { useEffect, useState } from 'react';
import { BookOpen, Compass, UtensilsCrossed, BedDouble } from 'lucide-react';
import { addDays, sortByDate } from '@/engine/body';
import { nextMoves, refeedCall, restCall, studyLoad, studyVerdict } from '@/engine/calls';
import { actions, useStore } from '@/store';
import { Button, Card, Pill } from './ui';

export function CoachCalls({ date }: { date: string }) {
  const s = useStore((x) => x);
  const kg = sortByDate(s.weights).at(-1)?.kg ?? 57;
  const calls = [restCall(s, date, kg), refeedCall(s, date)].filter((c) => c.kind !== 'none');
  const isRefeed = !!s.days[date]?.refeed;
  return (
    <>
      {calls.map((c) => (
        <div key={c.kind} className={`card rise p-4 ${c.kind === 'rest' ? 'ring-2 ring-bad/40' : 'ring-2 ring-gold/50'}`}>
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">{c.kind === 'rest' ? <BedDouble size={14} /> : <UtensilsCrossed size={14} />}Coach’s call</div>
          <div className="font-serif text-lg">{c.title}</div>
          <ul className="mt-1 space-y-1 text-sm text-ink-2">{c.why.map((w) => <li key={w}>• {w}</li>)}</ul>
          <div className="mt-2 rounded-xl bg-surface-2 p-3 text-sm"><ul className="space-y-1">{c.how.map((h) => <li key={h}>✦ {h}</li>)}</ul></div>
          {c.kind === 'refeed' && !isRefeed && <Button tone="gold" className="mt-3" onClick={() => actions.setRefeed(date, true)}>Make today a refeed day</Button>}
        </div>
      ))}
      <label className="flex items-center gap-2 px-1 text-sm text-ink-2">
        <input type="checkbox" checked={isRefeed} onChange={(e) => actions.setRefeed(date, e.target.checked)} />
        Refeed day today {isRefeed && <span className="text-xs text-muted">(the next two weigh-ins will be marked as water weight and left out of your trend)</span>}
      </label>
    </>
  );
}

export function NextMoves({ date }: { date: string }) {
  const s = useStore((x) => x);
  const moves = nextMoves(s, date);
  if (!moves.length) return null;
  return (
    <Card eyebrow="What to improve" title={<span className="flex items-center gap-2"><Compass size={18} className="text-gold" />Your next best moves</span>}>
      <ol className="space-y-2.5">
        {moves.map((m, i) => (
          <li key={m.text} className="flex gap-3 text-sm">
            <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy text-xs text-navy-ink">{i + 1}</span>
            <span className="leading-relaxed">{m.text} <Pill tone={m.impact === 'high' ? 'gold' : m.impact === 'medium' ? 'sea' : 'neutral'}>{m.impact} impact</Pill></span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function StudyCard({ date }: { date: string }) {
  const s = useStore((x) => x);
  const v = s.vitals?.[date] ?? {};
  const [study, setStudy] = useState(v.studyHours?.toString() ?? '');
  const [deep, setDeep] = useState(v.deepHours?.toString() ?? '');
  useEffect(() => { setStudy(v.studyHours?.toString() ?? ''); setDeep(v.deepHours?.toString() ?? ''); }, [date, v.studyHours, v.deepHours]);
  const week = Array.from({ length: 7 }, (_, i) => s.vitals?.[addDays(date, -i)] ?? {});
  const weekTotal = Math.round(week.reduce((a, x) => a + (x.studyHours ?? 0), 0) * 10) / 10;
  const weekDeep = Math.round(week.reduce((a, x) => a + (x.deepHours ?? x.studyHours ?? 0), 0) * 10) / 10;
  const verdict = studyVerdict(v.deepHours ?? v.studyHours, weekDeep, weekTotal);
  const save = (field: 'studyHours' | 'deepHours', raw: string) => actions.setVitals(date, { [field]: raw.trim() === '' ? undefined : Number(raw) });
  return (
    <Card eyebrow="SK297 · SK298" title={<span className="flex items-center gap-2"><BookOpen size={18} className="text-sea" />Study & deep work</span>} action={<span className="num text-sm text-muted">{weekTotal} h this week</span>}>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-muted">Total study (h)<input className="field num mt-1" inputMode="decimal" value={study} onChange={(e) => setStudy(e.target.value)} onBlur={() => save('studyHours', study)} /></label>
        <label className="text-xs text-muted">Of which deep work (h)<input className="field num mt-1" inputMode="decimal" value={deep} onChange={(e) => setDeep(e.target.value)} onBlur={() => save('deepHours', deep)} /></label>
      </div>
      <div className="mt-3 text-sm"><Pill tone={verdict.tone}>{verdict.headline}</Pill><p className="mt-1.5 leading-relaxed text-ink-2">{verdict.text}</p></div>
      {(() => {
        const load = studyLoad(s, date);
        if (load.level === 'ok') return null;
        return (
          <div className={`mt-3 rounded-xl p-3 text-sm ${load.level === 'too-much' ? 'bg-bad-soft' : 'bg-warn-soft'}`}>
            <b>{load.level === 'too-much' ? 'You’re doing too much deep work' : 'Heavy study week'}</b>
            <ul className="mt-1 space-y-1 text-ink-2">{load.reasons.map((r) => <li key={r}>• {r}</li>)}</ul>
            <p className="mt-1.5">Cap deep work at 3–4 h a day in 60–90-minute blocks, take real breaks (walk, daylight), and stop 1–2 h before bed.</p>
          </div>
        );
      })()}
      <details className="mt-2 text-xs text-ink-2">
        <summary className="cursor-pointer text-sea">How much deep work is optimal?</summary>
        <p className="mt-2 leading-relaxed">Focus is the limit, not time. In the classic studies of expert musicians, even the best practised in focused blocks totalling about 4 hours a day, and rested a lot. Most people do their best thinking in 60–90-minute blocks with real breaks. For you: <b>2–4 hours of deep work a day</b>, about 16–18 hours a week in total for your two 30-credit modules (the OU’s own guide). More than about 5–6 deep hours a day, or studying into the time you should be sleeping, gives worse retention, not better. Sleep is when the day’s learning gets stored. The best methods by far are retrieval practice (testing yourself) and spacing reviews over days, both better than re-reading or highlighting.</p>
      </details>
    </Card>
  );
}
