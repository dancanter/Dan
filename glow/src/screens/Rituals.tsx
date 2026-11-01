import { useEffect, useRef, useState } from 'react';
import { Check, Pause, Play } from 'lucide-react';
import { FACE_GUIDE, JOY_MENU, RITUALS, SOURCES, STRAIGHT_ANSWERS } from '@/data/science';
import { actions, useStore } from '@/store';
import { Button, Card, EvidencePill, Segmented } from '@/components/ui';
import { BigDaySetup } from '@/components/LookGood';
import { YogaCard } from '@/components/Yoga';

const PATTERNS = {
  resonance: { label: 'Resonance 5.5', steps: [['Breathe in', 5.5], ['Breathe out', 5.5]] as [string, number][], about: 'About 5.5 breaths a minute, close to the rate that maximises heart-rate variability in most adults. Your everyday calm-down.' },
  box: { label: 'Box 4-4-4-4', steps: [['Breathe in', 4], ['Hold', 4], ['Breathe out', 4], ['Hold', 4]] as [string, number][], about: 'Steadying before an exam, race or anything high-stakes.' },
  sleep: { label: 'Sleep 4-7-8', steps: [['Breathe in', 4], ['Hold', 7], ['Breathe out', 8]] as [string, number][], about: 'Long exhales lean the nervous system towards rest. Good in bed with the lights off.' },
};
type PatternKey = keyof typeof PATTERNS;

export function Rituals({ date }: { date: string }) {
  const s = useStore((x) => x);
  const done = s.days[date]?.rituals ?? [];
  const pts = RITUALS.filter((r) => done.includes(r.id)).reduce((a, r) => a + r.points, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Rituals</h1>
        <p className="text-sm text-ink-2">The non-training habits that shape your sleep, stress hormones and skin. Ten points makes a perfect day.</p>
      </div>

      <Card title="Today’s rituals" action={<span className="num font-serif text-2xl text-gold">{Math.min(pts, 10)}<span className="text-sm text-muted">/10</span></span>}>
        <ul className="space-y-2">
          {RITUALS.map((r) => {
            const on = done.includes(r.id);
            return (
              <li key={r.id}>
                <details className="group rounded-xl bg-surface-2">
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
                    <button aria-pressed={on} aria-label={on ? `Untick ${r.title}` : `Tick ${r.title}`} onClick={(e) => { e.preventDefault(); actions.toggleRitual(date, r.id); }} className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${on ? 'pop border-good bg-good text-white' : 'border-line bg-surface'}`}>
                      {on && <Check size={15} />}
                    </button>
                    <span className={`flex-1 text-sm ${on ? 'text-muted line-through' : ''}`}>{r.title}</span>
                    <span className="text-xs text-gold">+{r.points}</span>
                  </summary>
                  <div className="px-3 pb-3 pl-13 text-xs leading-relaxed text-ink-2">
                    {r.why}
                    <div className="mt-1.5 flex items-center gap-2"><EvidencePill e={r.evidence} />{r.sources?.map((id) => { const src = SOURCES.find((x) => x.id === id); return src && <a key={id} href={src.url} target="_blank" rel="noreferrer" className="text-sea underline">source</a>; })}</div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card eyebrow="Lasting happiness" title="Joy menu">
        <p className="mb-3 text-sm text-ink-2">Things that build real, lasting good mood, unlike the quick spike and crash of scrolling. Pick one a day and tick the joy ritual above.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {JOY_MENU.map((j) => <li key={j.title} className="rounded-xl bg-surface-2 p-3 text-sm"><div className="font-medium">{j.title}</div><div className="mt-0.5 text-xs leading-relaxed text-ink-2">{j.why}</div></li>)}
        </ul>
      </Card>

      <Card eyebrow="Model look" title="The chiselled-face guide">
        <ul className="space-y-3">
          {FACE_GUIDE.map((g) => <li key={g.title} className="text-sm"><div className="flex flex-wrap items-center gap-2 font-medium">{g.title}<EvidencePill e={g.evidence} /></div><p className="mt-0.5 leading-relaxed text-ink-2">{g.text}</p></li>)}
        </ul>
      </Card>

      <BigDaySetup />

      <Breathing date={date} minutesToday={s.breathMinutes[date] ?? 0} />

      <YogaCard date={date} />

      <Card eyebrow="Asked and answered" title="Straight answers">
        {STRAIGHT_ANSWERS.map((x) => (
          <details key={x.q} className="mb-2 rounded-xl bg-surface-2 p-3 text-sm">
            <summary className="cursor-pointer font-medium">{x.q}</summary>
            <p className="mt-2 leading-relaxed text-ink-2">{x.a}</p>
          </details>
        ))}
      </Card>
    </div>
  );
}

function Breathing({ date, minutesToday }: { date: string; minutesToday: number }) {
  const [pattern, setPattern] = useState<PatternKey>('resonance');
  const [mins, setMins] = useState(10);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(0);
  const total = mins * 60;
  const p = PATTERNS[pattern];
  const cycle = p.steps.reduce((a, s) => a + s[1], 0);

  useEffect(() => {
    if (!running) return;
    start.current = performance.now() - elapsed * 1000;
    let raf = 0;
    const tick = () => {
      const e = (performance.now() - start.current) / 1000;
      if (e >= total) {
        setRunning(false);
        setElapsed(0);
        actions.addBreath(date, mins);
        if (mins >= 10) actions.setRitual(date, 'breathe', true);
        return;
      }
      setElapsed(e);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  let into = elapsed % cycle;
  let step = 0;
  while (step < p.steps.length - 1 && into >= p.steps[step][1]) {
    into -= p.steps[step][1];
    step++;
  }
  const [phase, len] = p.steps[step];
  const frac = into / len;
  const scale = phase === 'Breathe in' ? 0.55 + 0.45 * frac : phase === 'Breathe out' ? 1 - 0.45 * frac : step === 1 ? 1 : 0.55;
  const left = total - elapsed;

  return (
    <Card title="Breathe" eyebrow={`${minutesToday} min today`}>
      <div className="mb-3 overflow-x-auto"><Segmented value={pattern} onChange={(v) => { setPattern(v); setRunning(false); setElapsed(0); }} options={(Object.keys(PATTERNS) as PatternKey[]).map((k) => ({ value: k, label: PATTERNS[k].label }))} /></div>
      <p className="mb-4 text-sm text-ink-2">{p.about}</p>
      <div className="grid place-items-center py-4">
        <div className="relative grid h-56 w-56 place-items-center">
          <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 50% 45%, var(--gold-soft), transparent 70%)' }} />
          <div className="absolute rounded-full" style={{ width: '100%', height: '100%', transform: `scale(${running ? scale : 0.6})`, transition: running ? 'none' : 'transform 0.6s ease', background: 'radial-gradient(circle at 45% 40%, var(--gold), var(--sea))', opacity: 0.85 }} />
          <div className="relative text-center text-white drop-shadow">
            <div className="font-serif text-xl">{running ? phase : 'Ready'}</div>
            {running && <div className="num text-sm">{Math.ceil(len - into)}</div>}
          </div>
        </div>
        <div className="num mt-3 text-sm text-muted">{running || elapsed ? `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')} left` : `${mins} minutes`}</div>
      </div>
      <div className="flex items-center justify-center gap-2">
        {!running && !elapsed && (
          <select className="field w-auto" value={mins} onChange={(e) => setMins(Number(e.target.value))} aria-label="Minutes">
            {[3, 5, 10, 15, 20].map((m) => <option key={m} value={m}>{m} min</option>)}
          </select>
        )}
        <Button tone="gold" onClick={() => setRunning(!running)}>{running ? <><Pause size={16} />Pause</> : <><Play size={16} />{elapsed ? 'Resume' : 'Start'}</>}</Button>
        {!running && elapsed > 0 && <Button tone="ghost" onClick={() => setElapsed(0)}>Reset</Button>}
      </div>
      <p className="mt-4 text-xs text-muted">Breathe through your nose, low into your belly, and let the exhale be soft. Finishing a session adds the minutes and ticks today’s breathing ritual.</p>
    </Card>
  );
}
