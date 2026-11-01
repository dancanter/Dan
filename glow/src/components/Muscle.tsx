import { useState } from 'react';
import { MUSCLES, MUSCLE_LABEL, SET_TARGETS, setsVerdict, weeklySets, type Muscle, type Session } from '@/engine/training';
import { actions, useStore } from '@/store';
import { Bar, Button, Card, EvidencePill, Pill } from './ui';
import type { Evidence } from '@/data/science';

const TONE = { good: 'var(--good)', sea: 'var(--sea)', warn: 'var(--warn)', bad: 'var(--bad)' } as const;

/** Tap +/− per muscle for one weights session. */
export function SetsEditor({ date, session }: { date: string; session: Session }) {
  const [open, setOpen] = useState(false);
  const [sets, setSets] = useState<Partial<Record<Muscle, number>>>(session.sets ?? {});
  const total = Object.values(session.sets ?? {}).reduce((a, b) => a + (b ?? 0), 0);
  if (!open) return <button className="text-xs text-sea" onClick={() => { setSets(session.sets ?? {}); setOpen(true); }}>{total ? `${total} sets logged · edit` : '+ Log sets per muscle'}</button>;
  const bump = (m: Muscle, d: number) => setSets({ ...sets, [m]: Math.max(0, (sets[m] ?? 0) + d) });
  return (
    <div className="mt-2 w-full rounded-xl bg-surface p-2.5">
      <p className="mb-2 text-xs text-muted">Hard working sets only (taken to within about 1–3 reps of failure). Count a compound lift for each muscle it trains hard, e.g. a bench press set = 1 chest + 1 triceps.</p>
      <div className="grid grid-cols-2 gap-1.5">
        {MUSCLES.map((m) => (
          <div key={m} className="flex items-center justify-between rounded-lg bg-surface-2 px-2 py-1 text-xs">
            <span>{MUSCLE_LABEL[m]}</span>
            <span className="flex items-center gap-1.5">
              <button aria-label={`One fewer ${m} set`} className="h-6 w-6 rounded-full bg-surface" onClick={() => bump(m, -1)}>−</button>
              <b className="num w-4 text-center">{sets[m] ?? 0}</b>
              <button aria-label={`One more ${m} set`} className="h-6 w-6 rounded-full bg-surface" onClick={() => bump(m, 1)}>+</button>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2"><Button onClick={() => { actions.setSessionSets(date, session.id, sets); setOpen(false); }}>Save sets</Button><Button tone="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
    </div>
  );
}

export function WeeklySetsCard({ date }: { date: string }) {
  const training = useStore((s) => s.training ?? {});
  const sets = weeklySets(training, date);
  const any = Object.values(sets).some((n) => n > 0);
  return (
    <Card eyebrow="Muscle" title="Weekly hard sets per muscle">
      {!any && <p className="mb-3 text-sm text-muted">Log sets on your weights sessions below (Strava-synced or added by hand) to see this fill up.</p>}
      <ul className="space-y-2">
        {MUSCLES.map((m) => {
          const t = SET_TARGETS[m];
          const v = setsVerdict(m, sets[m]);
          return (
            <li key={m} className="text-xs">
              <div className="mb-0.5 flex items-center justify-between gap-2">
                <span>{MUSCLE_LABEL[m]} <span className="text-muted">({t.min}–{t.max})</span></span>
                <span className="num"><b>{sets[m]}</b> {any && <span style={{ color: TONE[v.tone] }}>· {v.label}</span>}</span>
              </div>
              <Bar value={sets[m]} max={t.max + 6} marker={t.min} colour={any ? TONE[v.tone] : undefined} height={6} />
              {t.note && <div className="mt-0.5 text-[10px] text-muted">{t.note}</div>}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-muted">Ranges are for a cut: the low end keeps muscle, the high end can still build some. The marker shows the minimum. Last 7 days.</p>
    </Card>
  );
}

const CUT_RULES: { title: string; text: string; evidence: Evidence }[] = [
  { title: 'Lift heavy. The signal to keep muscle is tension.', evidence: 'strong', text: 'Keep the same loads and rep ranges you used before the cut, taking most sets to 1–3 reps short of failure. Dropping the weight is what tells your body it can let muscle go. On a cut, holding strength counts as winning.' },
  { title: 'Volume: enough, not more', evidence: 'strong', text: 'About 8–16 hard sets per muscle a week keeps or builds muscle. More than you can recover from in a deficit just adds fatigue, which shows up as flat muscles, worse runs and a tired face. Quality sets beat extra sets.' },
  { title: 'Protein 2.0–2.4 g/kg, in 4 feedings', evidence: 'strong', text: 'Higher protein protects lean mass in a deficit. Put 25–40 g in the meal after lifting and have casein (Fage or skyr) before bed. Your protein rhythm card tracks it.' },
  { title: 'Lose slowly: 0.5% a week', evidence: 'strong', text: 'Faster cuts take more muscle with the fat. Your season plan is set to exactly this.' },
  { title: 'Carbs around the lift', evidence: 'moderate', text: 'A carb-based meal 1–3 hours before lifting (rice, potatoes, oats, Kallo cakes) keeps sets strong. Fat and snacks are what to cut, not training fuel.' },
  { title: 'Sleep 8+ hours', evidence: 'strong', text: 'In a well-known trial, dieters sleeping 5.5 hours lost far more muscle and less fat than those sleeping 8.5, on the same diet. Sleep is a muscle-keeping tool.' },
  { title: 'Creatine 3–5 g a day (optional)', evidence: 'strong', text: 'The best-evidenced supplement for strength and lean mass, with emerging evidence for brain function. Take it daily, any time. The first week adds about 1 kg of water inside muscle, which is not fat.' },
  { title: 'Space lifting and hard running', evidence: 'moderate', text: 'Leave about 6+ hours (ideally a day) between leg sessions and quality runs, or lift after the run if they share a day. No cold plunge within 4 hours of lifting: it blunts muscle growth.' },
  { title: 'For the model look: priorities', evidence: 'emerging', text: 'Side delts and upper back for width, upper chest, arms, and a little neck work. These frame a lean face and narrow waist. Keep legs strong but let running carry much of their volume.' },
];

export function KeepMuscleGuide() {
  return (
    <Card eyebrow="Cutting without losing muscle" title="How to keep (and even build) muscle in this deficit">
      <ul className="space-y-3">
        {CUT_RULES.map((r) => <li key={r.title} className="text-sm"><div className="flex flex-wrap items-center gap-2 font-medium">{r.title}<EvidencePill e={r.evidence} /></div><p className="mt-0.5 leading-relaxed text-ink-2">{r.text}</p></li>)}
      </ul>
      <p className="mt-3 text-xs text-muted"><Pill tone="gold">Cellular link</Pill> Muscle is your biggest store of mitochondria and your best glucose sink: keeping it protects metabolic health and slows ageing at the cellular level, beyond the looks.</p>
    </Card>
  );
}
