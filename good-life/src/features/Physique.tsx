import { useEffect, useRef, useState } from 'react';
import { Camera, Plus, Trash2 } from 'lucide-react';
import { addDays, formatDay, todayISO } from '@/lib/dates';
import { formatWeight, weightValue } from '@/lib/units';
import { uid } from '@/lib/id';
import { deletePhoto, downscale, loadPhoto, savePhoto } from '@/lib/photos';
import { useStore } from '@/store/store';
import type { PhysiquePhase, ProgressPhoto } from '@/store/types';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { kcalOf } from '@/engine/nutrition';
import {
  adaptiveTdee, assessWeightTarget, bmi, bodyComposition, energyAvailability, evaluatePhysiquePhase, PHYSIQUE_PHASE_LABEL, rollingAverage,
  sortedWeights, strengthChange, weeklyAverages, weightTrend,
} from '@/engine/physique';
import { ChartFrame, LinesChart } from '@/components/charts';
import { WeightForm } from '@/components/forms';
import { Badge, Button, Card, Empty, Note, PageHeader, Provenance, Sheet, SourceRefs, Stat } from '@/components/ui';

const PHASES: PhysiquePhase[] = ['assessment', 'initial-target', 'reassessment', 'long-term'];

const REDS_QUESTIONS: { id: string; q: string }[] = [
  { id: 'fatigue', q: 'Persistent tiredness that rest days do not fix' },
  { id: 'libido', q: 'Noticeably lower libido or fewer morning erections than usual' },
  { id: 'illness', q: 'More colds or infections than usual' },
  { id: 'injury', q: 'Bone stress injury or a run of niggles' },
  { id: 'performance', q: 'Training performance falling despite effort' },
  { id: 'mood', q: 'Low mood, irritability or poor concentration' },
  { id: 'cold', q: 'Often feeling cold, or a lower resting heart rate than you would expect' },
  { id: 'food', q: 'Anxiety about eating more, or about missing training' },
];

export default function Physique() {
  const data = useStore((s) => s.data);
  const setPhase = useStore((s) => s.setPhase);
  const remove = useStore((s) => s.remove);
  const upsert = useStore((s) => s.upsert);
  const [logOpen, setLogOpen] = useState(false);
  const unit = data.profile.weightUnit;
  const chartUnit = unit === 'kg' ? 'kg' : 'lb';
  const kcal = kcalOf(data);
  const trend = weightTrend(data);
  const evaluation = evaluatePhysiquePhase(data, kcal);
  const target = assessWeightTarget(data, kcal);
  const comp = bodyComposition(data);
  const ea = energyAvailability(data, kcal);
  const tdee = adaptiveTdee(data, kcal);
  const strength = strengthChange(data);
  const weeks = weeklyAverages(data).slice(-12);
  const weights = sortedWeights(data);
  const latest = trend.latestAvg ?? weights.at(-1)?.kg;

  const chart = (() => {
    const from = addDays(todayISO(), -60);
    return rollingAverage(weights).filter((w) => w.date >= from).map((w) => ({ date: w.date, daily: Math.round(weightValue(w.kg, chartUnit) * 10) / 10, avg: w.avg != null ? Math.round(weightValue(w.avg, chartUnit) * 10) / 10 : null }));
  })();
  const band = data.profile.targetWeightKg ? ([weightValue(data.profile.targetWeightKg[0], chartUnit), weightValue(data.profile.targetWeightKg[1], chartUnit)] as [number, number]) : undefined;
  const lastCheck = [...data.energyChecks].sort((a, b) => b.date.localeCompare(a.date))[0];
  const [answers, setAnswers] = useState<Record<string, boolean>>(lastCheck?.answers ?? {});
  const yes = Object.values(answers).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Physique" title="Lean, strong, and still fast" subtitle="Weekly averages, not daily noise. The aim is muscle, definition and performance — not the lowest possible number." actions={<Button variant="primary" onClick={() => setLogOpen(true)}><Plus size={16} /> Weigh-in</Button>} />

      <Card eyebrow="Current phase" title={PHYSIQUE_PHASE_LABEL[data.physiquePhase.current]} action={<Badge tone="navy">since {data.physiquePhase.since}</Badge>}>
        <div className="mb-4 grid grid-cols-4 gap-1">
          {PHASES.map((p) => <div key={p} className={`h-1.5 rounded-full ${PHASES.indexOf(p) <= PHASES.indexOf(data.physiquePhase.current) ? 'bg-navy' : 'bg-surface-2'}`} />)}
        </div>
        <p className="text-sm text-ink-2">{evaluation.advice}</p>
        <ul className="mt-3 space-y-1.5">
          {evaluation.checks.map((c) => <li key={c.label} className="flex items-center gap-2 text-sm"><span className={c.met ? 'text-good' : 'text-muted'}>{c.met ? '✓' : '○'}</span>{c.label}{c.detail && <span className="text-xs text-muted">({c.detail})</span>}</li>)}
        </ul>
        {evaluation.ready && evaluation.next && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-good-soft p-3 text-sm">
            <span>The evidence supports moving to <strong>{PHYSIQUE_PHASE_LABEL[evaluation.next]}</strong>.</span>
            <Button size="sm" variant="primary" onClick={() => setPhase('physiquePhase', evaluation.next!, evaluation.advice)}>Move on</Button>
          </div>
        )}
        <p className="mt-3 text-xs text-muted">Phases change on evidence, never by the calendar. You confirm every move.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ChartFrame title={`Weight (${chartUnit})`} subtitle="Dots: daily weigh-ins · line: 7-day average · band: target range" table={{ columns: ['Date', 'Daily', '7-day avg'], rows: chart.map((c) => [c.date, c.daily, c.avg ?? '—']) }}>
          {chart.length >= 3 ? <LinesChart data={chart} x="date" dots="daily" dotsLabel="Daily" series={[{ key: 'avg', label: '7-day average', colour: 's1' }]} band={band} format={(v) => v.toFixed(1)} xFormat={(v) => v.slice(5)} /> : <Empty title="A few weigh-ins needed" body="Weigh in most mornings; the trend appears after three entries." />}
        </ChartFrame>
        <Card eyebrow="Trend" title={latest ? formatWeight(latest, unit) : '—'} action={<Provenance kind="measured" />}>
          <div className="grid grid-cols-2 gap-4">
            <Stat small label="Rate (21-day trend)" value={trend.pctPerWeek != null ? `${trend.pctPerWeek > 0 ? '+' : ''}${trend.pctPerWeek.toFixed(2)}%/wk` : '—'} sub={trend.kgPerWeek != null ? `${formatWeight(Math.abs(trend.kgPerWeek), unit)} per week` : undefined} tone={trend.pctPerWeek != null && trend.pctPerWeek < -0.7 ? 'bad' : undefined} />
            <Stat small label="BMI" value={latest && data.profile.heightCm ? bmi(latest, data.profile.heightCm).toFixed(1) : '—'} sub="crude for muscular people" />
            <Stat small label="Body fat" value={comp.bodyFatPct ? `${comp.bodyFatPct[0].toFixed(0)}–${comp.bodyFatPct[1].toFixed(0)}%` : '—'} sub={comp.basis} />
            <Stat small label="Weigh-ins (21 days)" value={trend.n} sub={trend.reliable ? 'enough for a reliable trend' : 'need 8+ over 12+ days'} />
          </div>
          <p className="mt-4 text-xs text-muted">Daily weight swings of 0.5–1.5 kg are water, glycogen, salt and gut contents. A heavy carbohydrate day before a long run can add a kilo that is not fat. Only weekly averages are interpreted.</p>
        </Card>
      </div>

      <Card eyebrow="Is the target a good idea?" title={target.headline}>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">{target.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
        <SourceRefs ids={['helms2014', 'garthe2011', 'murphy2022', 'mountjoy2023']} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card eyebrow="Energy availability" title={ea.value ? `${Math.round(ea.value[0])}–${Math.round(ea.value[1])} kcal/kg FFM/day` : 'Not enough food logged'} action={<Provenance kind="estimated" />}>
          {ea.band && <Badge tone={ea.band === 'adequate' ? 'good' : ea.band === 'reduced' ? 'warn' : 'bad'}>{ea.band}</Badge>}
          <p className="mt-2 text-sm text-ink-2">{ea.note}</p>
          {ea.avgIntake != null && <p className="mt-2 text-xs text-muted tabular">Average logged intake {Math.round(ea.avgIntake)} kcal; estimated exercise energy {Math.round(ea.avgExercise ?? 0)} kcal/day; fat-free mass from {comp.basis.toLowerCase()}.</p>}
          {tdee.kcal && <p className="mt-2 text-sm">Your own data suggests maintenance ≈ <strong className="tabular">{Math.round(tdee.kcal)} kcal/day</strong>. <span className="text-xs text-muted">{tdee.note}</span></p>}
          <p className="mt-3 text-xs text-muted">Energy availability is what is left for the body after training. ~45 kcal/kg fat-free mass supports normal function; sustained values below ~30 are associated with hormonal, bone and performance problems. Thresholds come mostly from studies in women and are less certain for men.</p>
          <SourceRefs ids={['mountjoy2023']} />
        </Card>
        <Card eyebrow="Self-check" title="Low energy warning signs">
          <p className="mb-3 text-sm text-ink-2">Answer for the last few weeks. This is a prompt to talk to someone, not a diagnosis.</p>
          <ul className="space-y-2">
            {REDS_QUESTIONS.map((q) => (
              <li key={q.id}><label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={!!answers[q.id]} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.checked }))} />{q.q}</label></li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-3">
            <Button size="sm" onClick={() => upsert('energyChecks', { id: uid('ea-'), date: todayISO(), answers })}>Save check</Button>
            {lastCheck && <span className="text-xs text-muted">Last saved {lastCheck.date}</span>}
          </div>
          {yes >= 2 && <Note tone="warn">Two or more signs together, especially while cutting or training hard, are worth discussing with your GP — and the simplest first step is eating more, particularly carbohydrate around training. A sports-medicine or registered sports-dietitian assessment is the gold standard.</Note>}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card eyebrow="Muscle retention" title="Key lifts, last 4 weeks vs previous 4" action={<Provenance kind="measured" />}>
          {strength.length ? (
            <ul className="space-y-1.5 text-sm">
              {strength.map((s) => <li key={s.exerciseId} className="flex justify-between"><span>{EXERCISE_BY_ID[s.exerciseId]?.name}</span><span className={`tabular ${s.changePct < -3 ? 'text-bad' : s.changePct > 1 ? 'text-good' : 'text-muted'}`}>{s.changePct > 0 ? '+' : ''}{s.changePct.toFixed(1)}%</span></li>)}
            </ul>
          ) : <Empty title="Needs 8 weeks of gym logs" body="Strength holding steady during a cut is the best practical sign muscle is being kept." />}
        </Card>
        <Card eyebrow="Weekly averages" title="The numbers that count">
          {weeks.length ? (
            <table className="w-full text-sm tabular">
              <thead className="text-left text-xs text-muted"><tr><th className="font-medium">Week of</th><th className="font-medium">Average</th><th className="font-medium">Change</th><th className="font-medium">Waist</th><th className="font-medium">n</th></tr></thead>
              <tbody>
                {weeks.map((w, i) => {
                  const prev = weeks[i - 1];
                  const diff = prev ? w.avgKg - prev.avgKg : null;
                  return (
                    <tr key={w.weekStart} className="border-t border-line">
                      <td className="py-1">{formatDay(w.weekStart, { weekday: undefined })}</td>
                      <td>{formatWeight(w.avgKg, unit)}</td>
                      <td className="text-muted">{diff != null ? (() => { const v = Number((unit === 'kg' ? diff : diff / 0.4536).toFixed(1)); return v === 0 ? '0.0' : `${v > 0 ? '+' : ''}${v.toFixed(1)}`; })() : '—'}</td>
                      <td className="text-muted">{w.waistCm ? `${w.waistCm.toFixed(1)} cm` : '—'}</td>
                      <td className="text-muted">{w.n}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <Empty title="No weigh-ins yet" />}
        </Card>
      </div>

      <PhotosCard />

      <Card eyebrow="Log" title="Recent measurements">
        <ul className="divide-y divide-line text-sm">
          {[...weights].reverse().slice(0, 14).map((w) => (
            <li key={w.id} className="flex items-center justify-between py-1.5">
              <span className="text-muted">{formatDay(w.date)}</span>
              <span className="tabular">{formatWeight(w.kg, unit)}{w.waistCm ? ` · waist ${w.waistCm} cm` : ''}{w.bodyFatPct ? ` · ${w.bodyFatPct}% (${w.bodyFatMethod})` : ''}{w.demo ? ' · demo' : ''}</span>
              <button type="button" aria-label="Delete" onClick={() => remove('weights', w.id)} className="text-muted hover:text-bad"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      </Card>

      <Note>This section never recommends dehydration, sodium manipulation, extra cardio for appearance, or fasting to look leaner. Definition for photos comes from muscle, sleep, low puffiness and good lighting — not from making yourself smaller.</Note>
      <Sheet open={logOpen} onClose={() => setLogOpen(false)} title="Weigh-in"><WeightForm onDone={() => setLogOpen(false)} /></Sheet>
    </div>
  );
}

function PhotosCard() {
  const photos = useStore((s) => s.data.photos);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const fileRef = useRef<HTMLInputElement>(null);
  const [angle, setAngle] = useState<ProgressPhoto['angle']>('front');
  const sorted = [...photos].sort((a, b) => a.date.localeCompare(b.date));
  const onFile = async (f: File) => {
    const id = uid('photo-');
    await savePhoto(id, await downscale(f));
    upsert('photos', { id, date: todayISO(), angle });
  };
  return (
    <Card eyebrow="Progress photos" title="Same light, same angle, every 2–4 weeks" action={<span className="text-xs text-muted">Stored only on this device</span>}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['front', 'side', 'back'] as const).map((a) => <button key={a} type="button" onClick={() => setAngle(a)} className={`rounded-full border px-3 py-1 text-sm ${angle === a ? 'border-navy bg-navy text-navy-ink' : 'border-line'}`}>{a}</button>)}
        <Button size="sm" onClick={() => fileRef.current?.click()}><Camera size={14} /> Add photo</Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </div>
      {sorted.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sorted.map((p) => <PhotoThumb key={p.id} photo={p} onDelete={() => { deletePhoto(p.id); remove('photos', p.id); }} />)}
        </div>
      ) : <Empty title="No photos" body="Photos are the most honest way to judge definition — the scale cannot. They never leave this browser and are not sent to the coach." />}
    </Card>
  );
}

function PhotoThumb({ photo, onDelete }: { photo: ProgressPhoto; onDelete: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let u: string | null = null;
    loadPhoto(photo.id).then((b) => {
      if (b) {
        u = URL.createObjectURL(b);
        setUrl(u);
      }
    });
    return () => {
      if (u) URL.revokeObjectURL(u);
    };
  }, [photo.id]);
  return (
    <figure className="overflow-hidden rounded-xl border border-line">
      {url ? <img src={url} alt={`${photo.angle} view, ${photo.date}`} className="aspect-[3/4] w-full object-cover" /> : <div className="aspect-[3/4] bg-surface-2" />}
      <figcaption className="flex items-center justify-between px-2 py-1 text-xs text-muted"><span>{photo.date} · {photo.angle}</span><button type="button" aria-label="Delete photo" onClick={onDelete}><Trash2 size={12} /></button></figcaption>
    </figure>
  );
}
