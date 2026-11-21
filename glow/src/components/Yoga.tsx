import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipForward } from 'lucide-react';
import { actions } from '@/store';
import { Button, Card, EvidencePill, Segmented } from './ui';

// Short guided routines. Yoga reliably lowers perceived stress and anxiety
// in meta-analyses and helps sleep quality; slow, long-exhale poses in the
// evening shift the nervous system towards rest. Mobility work keeps a
// runner's hips, hamstrings and upper back moving well, which is also
// posture, which is also how your jaw and shoulders read.

interface Pose { name: string; secs: number; cue: string }
const FLOWS: Record<string, { label: string; about: string; evidence: 'moderate' | 'emerging'; poses: Pose[] }> = {
  evening: {
    label: 'Evening wind-down (10 min)', evidence: 'moderate',
    about: 'Slow floor poses with long exhales before bed: lower stress arousal, easier sleep. Do it with dim lights.',
    poses: [
      { name: 'Child’s pose', secs: 90, cue: 'Knees wide, forehead down, arms long. Breathe into your back.' },
      { name: 'Cat–cow', secs: 60, cue: 'On all fours, arch and round slowly with the breath. 5 seconds each way.' },
      { name: 'Supine twist, right', secs: 60, cue: 'On your back, knees to the left, look right. Shoulders heavy.' },
      { name: 'Supine twist, left', secs: 60, cue: 'Knees to the right, look left.' },
      { name: 'Reclined butterfly', secs: 90, cue: 'Soles together, knees open, one hand on belly. Long, slow exhales.' },
      { name: 'Legs up the wall', secs: 180, cue: 'Hips close to the wall, legs resting up it. Breathe in for 4, out for 6.' },
      { name: 'Rest (savasana)', secs: 60, cue: 'Lie flat, palms up. Let the breath go on its own.' },
    ],
  },
  runner: {
    label: 'Runner’s mobility (10 min)', evidence: 'emerging',
    about: 'Hips, hamstrings, calves and upper back: the tight spots from running and desk study. Good after an easy run or a long study block.',
    poses: [
      { name: 'Low lunge, right', secs: 60, cue: 'Back knee down, tuck the pelvis, feel the front of the right hip open.' },
      { name: 'Low lunge, left', secs: 60, cue: 'Switch sides. Squeeze the glute of the back leg.' },
      { name: 'Half splits, right', secs: 45, cue: 'Hips back over the knee, front leg straight, flex the toes up.' },
      { name: 'Half splits, left', secs: 45, cue: 'Switch. Long spine, hinge from the hips.' },
      { name: 'Pigeon, right', secs: 60, cue: 'Right shin forward, left leg back. Fold over if it’s comfortable.' },
      { name: 'Pigeon, left', secs: 60, cue: 'Switch sides.' },
      { name: 'Downward dog, calf pedal', secs: 60, cue: 'Alternate pressing each heel down slowly.' },
      { name: 'Thread the needle, right', secs: 45, cue: 'On all fours, slide the right arm under, shoulder to the floor.' },
      { name: 'Thread the needle, left', secs: 45, cue: 'Switch. Opens the upper back, which helps desk posture.' },
      { name: 'Chin tucks against the floor', secs: 30, cue: 'Lie on your back, gently draw the chin in, making a double chin. Hold 5 s, repeat. Good for neck posture.' },
    ],
  },
  nsdr: {
    label: 'Body-scan rest (10 min)', evidence: 'emerging',
    about: 'Yoga nidra / non-sleep deep rest: lying still and moving attention through the body. Small studies show reduced stress and better sleep. Great after a deep-work block or on a rest day.',
    poses: [
      { name: 'Settle', secs: 60, cue: 'Lie on your back, eyes closed. Notice the floor holding you.' },
      { name: 'Slow breathing', secs: 120, cue: 'In through the nose for 4, out for 6. Let the exhale be soft.' },
      { name: 'Feet and legs', secs: 90, cue: 'Notice your toes, soles, calves, knees, thighs. Let each one go heavy.' },
      { name: 'Hips, belly, back', secs: 90, cue: 'Let your belly rise and fall. Release the lower back into the floor.' },
      { name: 'Hands, arms, shoulders', secs: 90, cue: 'Fingers, palms, forearms, shoulders: soft and heavy.' },
      { name: 'Jaw, eyes, face', secs: 90, cue: 'Unclench the jaw, soften the tongue, relax the space between your eyebrows.' },
      { name: 'Whole body', secs: 60, cue: 'Feel the whole body at once, breathing by itself. Rest here.' },
    ],
  },
};
type FlowKey = keyof typeof FLOWS;

export function YogaCard({ date }: { date: string }) {
  const [flowKey, setFlowKey] = useState<FlowKey>('evening');
  const [step, setStep] = useState(0);
  const [left, setLeft] = useState(FLOWS.evening.poses[0].secs);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const flow = FLOWS[flowKey];
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [running]);

  useEffect(() => {
    if (left > 0 || !running) return;
    if (step + 1 < flow.poses.length) { setStep(step + 1); setLeft(flow.poses[step + 1].secs); }
    else {
      setRunning(false);
      setDone(true);
      actions.setRitual(date, 'yoga', true);
      actions.addBreath(date, Math.round(flow.poses.reduce((a, p) => a + p.secs, 0) / 60));
    }
  }, [left, running, step, flow, date]);

  const choose = (k: FlowKey) => { setFlowKey(k); setStep(0); setLeft(FLOWS[k].poses[0].secs); setRunning(false); setDone(false); };
  const pose = flow.poses[step];
  return (
    <Card eyebrow="Stress relief & mobility" title="Yoga" action={<EvidencePill e={flow.evidence} />}>
      <div className="mb-3 overflow-x-auto"><Segmented value={flowKey} onChange={choose} options={[{ value: 'evening', label: 'Wind-down' }, { value: 'runner', label: 'Mobility' }, { value: 'nsdr', label: 'Body scan' }]} /></div>
      <p className="mb-3 text-sm text-ink-2"><b>{flow.label}.</b> {flow.about}</p>
      {done ? (
        <p className="rounded-xl bg-good-soft p-3 text-sm">✓ Done. Yoga ritual ticked and the minutes added to your calm time.</p>
      ) : (
        <div className="rounded-2xl bg-surface-2 p-4 text-center">
          <div className="text-xs text-muted">Pose {step + 1} of {flow.poses.length}</div>
          <div className="mt-1 font-serif text-2xl">{pose.name}</div>
          <div className="num mt-1 font-serif text-4xl text-gold">{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</div>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-2">{pose.cue}</p>
          <div className="mt-3 flex justify-center gap-2">
            <Button tone="gold" onClick={() => setRunning(!running)}>{running ? <><Pause size={16} />Pause</> : <><Play size={16} />{step || left < pose.secs ? 'Resume' : 'Start'}</>}</Button>
            <Button tone="ghost" onClick={() => { if (step + 1 < flow.poses.length) { setStep(step + 1); setLeft(flow.poses[step + 1].secs); } else setLeft(0); }}><SkipForward size={16} />Next</Button>
          </div>
        </div>
      )}
      <ol className="mt-3 space-y-0.5 text-xs text-muted">{flow.poses.map((p, i) => <li key={p.name} className={i === step && !done ? 'font-medium text-ink' : ''}>{i + 1}. {p.name} · {p.secs >= 60 ? `${p.secs / 60} min` : `${p.secs} s`}</li>)}</ol>
      <p className="mt-3 text-[11px] text-muted">Move gently and never into pain. Stretch after easy runs or in the evening, not right before quality sessions or heavy lifts.</p>
    </Card>
  );
}
