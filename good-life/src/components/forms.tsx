import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { todayISO, type ISODate } from '@/lib/dates';
import { uid } from '@/lib/id';
import { formatDuration, parseSplits, parseTime } from '@/lib/time';
import { formatWeight, parseWeight, weightValue } from '@/lib/units';
import { useStore } from '@/store/store';
import type { CheckIn, DayFlag, Illness, LegFeel, MealSlot, RunEvent, RunLog, RunType, StudyActivity } from '@/store/types';
import { analyseRun, currentFitness, EVENT_LABEL, paceZones, RUN_TYPE_LABEL, type RunAnalysis } from '@/engine/running';
import { allFoods, foodById } from '@/engine/nutrition';
import { LIFE_CATEGORY_LABEL } from '@/data/lifestyle';
import type { Prescription } from '@/engine/plan';
import { Badge, Button, Chip, Field, Input, Note, Scale, Segmented, Select, TextArea, cx } from './ui';

export const FLAG_LABEL: Record<DayFlag, string> = {
  exhausted: 'I’m exhausted',
  brilliant: 'I feel brilliant',
  'heavy-legs': 'Heavy legs',
  'short-time': 'Only ~45 min',
  deadline: 'Uni deadline',
  sunshine: 'Want the sunshine',
  social: 'Seeing people',
  travel: 'Travelling',
};

export function FlagChips({ date }: { date: ISODate }) {
  const c = useStore((s) => s.data.checkIns[date]);
  const setCheckIn = useStore((s) => s.setCheckIn);
  const flags = c?.flags ?? [];
  const toggle = (f: DayFlag) => {
    let next = flags.includes(f) ? flags.filter((x) => x !== f) : [...flags, f];
    if (f === 'exhausted' && next.includes('exhausted')) next = next.filter((x) => x !== 'brilliant');
    if (f === 'brilliant' && next.includes('brilliant')) next = next.filter((x) => x !== 'exhausted');
    setCheckIn(date, { flags: next, timeAvailableMin: next.includes('short-time') ? 45 : c?.timeAvailableMin === 45 ? null : c?.timeAvailableMin });
  };
  return (
    <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
      {(Object.keys(FLAG_LABEL) as DayFlag[]).map((f) => (
        <Chip key={f} active={flags.includes(f)} onClick={() => toggle(f)}>
          {flags.includes(f) && <Check size={14} />}
          {FLAG_LABEL[f]}
        </Chip>
      ))}
    </div>
  );
}

export function CheckInForm({ date = todayISO(), onDone }: { date?: ISODate; onDone?: () => void }) {
  const existing = useStore((s) => s.data.checkIns[date]);
  const setCheckIn = useStore((s) => s.setCheckIn);
  const [v, setV] = useState<Partial<CheckIn>>(existing ?? { sleepHours: 8, flags: [] });
  const [more, setMore] = useState(!!(existing?.restingHr || existing?.hrv || existing?.bedTime));
  const set = <K extends keyof CheckIn>(k: K, val: CheckIn[K]) => setV((p) => ({ ...p, [k]: val }));
  const save = () => {
    setCheckIn(date, { ...v, flags: existing?.flags ?? v.flags ?? [] });
    onDone?.();
  };
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="font-medium">Sleep</span>
          <span className="text-xs text-muted">hours asleep</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => set('sleepHours', Math.max(0, (v.sleepHours ?? 8) - 0.25))} aria-label="Less sleep">−</Button>
          <div className="w-20 text-center font-serif text-3xl tabular">{(v.sleepHours ?? 8).toFixed(2).replace(/\.?0+$/, '')}</div>
          <Button size="sm" onClick={() => set('sleepHours', Math.min(14, (v.sleepHours ?? 8) + 0.25))} aria-label="More sleep">+</Button>
          <span className="ml-1 text-sm text-muted">h</span>
        </div>
      </div>
      <Scale label="Sleep quality" labels={['poor', 'excellent']} value={v.sleepQuality} onChange={(n) => set('sleepQuality', n)} />
      <Scale label="Energy" labels={['flat', 'brilliant']} value={v.energy} onChange={(n) => set('energy', n)} />
      <div>
        <div className="mb-1.5 text-sm font-medium">Legs</div>
        <Segmented<LegFeel> value={v.legs} onChange={(x) => set('legs', x)} options={[{ value: 'fresh', label: 'Fresh' }, { value: 'normal', label: 'Normal' }, { value: 'heavy', label: 'Heavy' }, { value: 'sore', label: 'Sore' }]} />
      </div>
      <Scale label="Muscle soreness" labels={['none', 'very sore']} invert value={v.soreness} onChange={(n) => set('soreness', n)} />
      <Scale label="Stress" labels={['calm', 'very stressed']} invert value={v.stress} onChange={(n) => set('stress', n)} />
      <Scale label="Motivation" labels={['none', 'very high']} value={v.motivation} onChange={(n) => set('motivation', n)} />
      <Field label="Feeling unwell?">
        <Select value={v.illness ?? 'none'} onChange={(e) => set('illness', e.target.value as Illness)}>
          <option value="none">No</option>
          <option value="above-neck">Head cold only (above the neck)</option>
          <option value="below-neck">Chest, stomach or aches (below the neck)</option>
          <option value="fever">Temperature / fever</option>
        </Select>
      </Field>
      <button type="button" className="text-sm text-muted underline underline-offset-2" onClick={() => setMore((m) => !m)}>
        {more ? 'Fewer details' : 'More: bed/wake time, resting HR, HRV, steps, meditation'}
      </button>
      {more && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bedtime"><Input type="time" value={v.bedTime ?? ''} onChange={(e) => set('bedTime', e.target.value)} /></Field>
          <Field label="Wake time"><Input type="time" value={v.wakeTime ?? ''} onChange={(e) => set('wakeTime', e.target.value)} /></Field>
          <Field label="Resting HR (bpm)"><Input inputMode="numeric" value={v.restingHr ?? ''} onChange={(e) => set('restingHr', e.target.value ? Number(e.target.value) : undefined)} /></Field>
          <Field label="HRV (ms)" hint="Only against your own baseline"><Input inputMode="numeric" value={v.hrv ?? ''} onChange={(e) => set('hrv', e.target.value ? Number(e.target.value) : undefined)} /></Field>
          <Field label="Steps"><Input inputMode="numeric" value={v.steps ?? ''} onChange={(e) => set('steps', e.target.value ? Number(e.target.value) : undefined)} /></Field>
          <Field label="Meditation (min)"><Input inputMode="numeric" value={v.meditationMin ?? ''} onChange={(e) => set('meditationMin', e.target.value ? Number(e.target.value) : undefined)} /></Field>
        </div>
      )}
      <Field label="Notes"><Input value={v.notes ?? ''} onChange={(e) => set('notes', e.target.value)} placeholder="Anything worth remembering" /></Field>
      <Button variant="primary" className="w-full" onClick={save}>Save check-in</Button>
    </div>
  );
}

const RUN_TYPES: RunType[] = ['easy', 'long', 'recovery', 'threshold', 'vo2', 'race-pace', 'speed', 'hills', 'tempo', 'race', 'time-trial'];

export function RunForm({ prescription, initial, onDone }: { prescription?: Prescription | null; initial?: RunLog; onDone?: () => void }) {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const t = prescription?.template;
  const presetType: RunType = initial?.type ?? (t ? (t.kind === 'threshold' ? 'threshold' : t.kind === 'vo2' ? 'vo2' : t.kind === 'race-pace' ? 'race-pace' : 'speed') : 'easy');
  const [type, setType] = useState<RunType>(presetType);
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [km, setKm] = useState(initial ? String(initial.distanceKm) : prescription?.kind === 'easy' ? (prescription.title.includes('5 miles') ? '8' : '5') : '');
  const [time, setTime] = useState(initial ? formatDuration(initial.durationSec) : '');
  const [repDist, setRepDist] = useState(String(initial?.reps?.[0]?.distanceM ?? t?.distanceM ?? ''));
  const [splits, setSplits] = useState(initial?.reps?.map((r) => formatDuration(r.timeSec, { tenths: r.timeSec < 120 })).join(' ') ?? '');
  const [recovery, setRecovery] = useState(initial?.recoverySec ? String(initial.recoverySec) : '');
  const [rpe, setRpe] = useState<number | undefined>(initial?.rpe);
  const [legs, setLegs] = useState<LegFeel | undefined>(initial?.legs);
  const [hr, setHr] = useState(initial?.avgHr ? String(initial.avgHr) : '');
  const [event, setEvent] = useState<RunEvent | ''>(initial?.event ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [result, setResult] = useState<RunAnalysis | null>(null);
  const structured = ['threshold', 'vo2', 'race-pace', 'speed', 'hills', 'tempo'].includes(type);
  const splitSecs = parseSplits(splits);
  const reps = repDist && splitSecs.length ? splitSecs.map((s) => ({ distanceM: Number(repDist), timeSec: s })) : undefined;
  const durationSec = parseTime(time) ?? (reps ? reps.reduce((a, r) => a + r.timeSec, 0) : 0);
  const distanceKm = Number(km) || (reps ? reps.reduce((a, r) => a + r.distanceM, 0) / 1000 : 0);
  const valid = distanceKm > 0 && durationSec > 0;

  const save = () => {
    const run: RunLog = {
      id: initial?.id ?? uid('run-'),
      date,
      type,
      title: initial?.title,
      distanceKm,
      durationSec,
      reps,
      recoverySec: recovery ? parseTime(recovery) ?? undefined : undefined,
      rpe,
      legs,
      avgHr: hr ? Number(hr) : undefined,
      notes: notes || undefined,
      sessionId: initial?.sessionId ?? t?.id,
      event: event || undefined,
    };
    upsert('runs', run);
    const fit = currentFitness({ ...data, runs: [...data.runs.filter((r) => r.id !== run.id), run] });
    setResult(analyseRun(run, fit.vdot ? paceZones(fit.vdot) : null));
  };

  if (result) {
    return (
      <div className="space-y-3">
        <Badge tone={result.verdict === 'progress' || result.verdict === 'easy-ok' ? 'good' : result.verdict === 'regress' || result.verdict === 'too-fast' || result.verdict === 'easy-too-fast' ? 'warn' : 'neutral'}>Coach’s read</Badge>
        <div className="font-serif text-2xl leading-snug">{result.headline}</div>
        {result.points.map((p, i) => <p key={i} className="text-sm text-ink-2">{p}</p>)}
        {result.next && <Note>{result.next}</Note>}
        <Button variant="primary" className="w-full" onClick={onDone}>Done</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prescription && (
        <Note>
          <strong>Prescribed:</strong> {prescription.title}
          {prescription.targetRep ? ` · ${prescription.targetRep}` : prescription.targetPace ? ` · ${prescription.targetPace}` : ''}
        </Note>
      )}
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
        {RUN_TYPES.map((x) => <Chip key={x} active={type === x} onClick={() => setType(x)}>{RUN_TYPE_LABEL[x]}</Chip>)}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Distance (km)" hint={structured ? 'Total incl. warm-up' : undefined}><Input inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value)} placeholder={reps ? (distanceKm).toFixed(1) : '5'} /></Field>
        <Field label="Time" hint="mm:ss or h:mm:ss"><Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="25:30" /></Field>
      </div>
      {(type === 'race' || type === 'time-trial') && (
        <Field label="Event" hint="A mile-to-10 km result recalibrates your training paces">
          <Select value={event} onChange={(e) => setEvent(e.target.value as RunEvent)}>
            <option value="">Choose…</option>
            {(Object.keys(EVENT_LABEL) as RunEvent[]).map((ev) => <option key={ev} value={ev}>{EVENT_LABEL[ev]}</option>)}
          </Select>
        </Field>
      )}
      {structured && (
        <div className="grid grid-cols-3 gap-3">
          <Field label="Rep distance (m)"><Input inputMode="numeric" value={repDist} onChange={(e) => setRepDist(e.target.value)} placeholder="1000" /></Field>
          <Field label="Rep times" className="col-span-2" hint={splitSecs.length ? `${splitSecs.length} reps read` : 'e.g. 3:24 3:25 3:23 or 68 69 70'}><Input value={splits} onChange={(e) => setSplits(e.target.value)} placeholder="3:24 3:25 3:23 3:22 3:20" /></Field>
          <Field label="Recovery" hint="e.g. 60 or 2:30"><Input value={recovery} onChange={(e) => setRecovery(e.target.value)} placeholder="60" /></Field>
        </div>
      )}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-sm"><span className="font-medium">Effort (RPE)</span><span className="text-xs text-muted">1 very easy → 10 maximal</span></div>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" aria-pressed={rpe === n} onClick={() => setRpe(n)} className={cx('h-9 rounded-lg border text-sm tabular', rpe === n ? 'border-navy bg-navy text-navy-ink' : 'border-line bg-surface hover:bg-surface-2')}>{n}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-sm font-medium">Legs</div>
        <Segmented<LegFeel> value={legs} onChange={setLegs} options={[{ value: 'fresh', label: 'Fresh' }, { value: 'normal', label: 'Normal' }, { value: 'heavy', label: 'Heavy' }, { value: 'sore', label: 'Sore' }]} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Avg HR"><Input inputMode="numeric" value={hr} onChange={(e) => setHr(e.target.value)} placeholder="—" /></Field>
        <Field label="Notes" className="col-span-2"><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Wind, heat, fuelling, how it felt" /></Field>
      </div>
      <Button variant="primary" className="w-full" disabled={!valid} onClick={save}>Save run</Button>
    </div>
  );
}

export function WeightForm({ onDone }: { onDone?: () => void }) {
  const unit = useStore((s) => s.data.profile.weightUnit);
  const last = useStore((s) => [...s.data.weights].sort((a, b) => a.date.localeCompare(b.date)).at(-1));
  const upsert = useStore((s) => s.upsert);
  const [date, setDate] = useState(todayISO());
  const [w, setW] = useState(last ? weightValue(last.kg, unit === 'st' ? 'lb' : unit).toFixed(1) : '');
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [bf, setBf] = useState('');
  const [method, setMethod] = useState<'bia-scale' | 'dexa' | 'calipers' | 'visual'>('bia-scale');
  const [fasted, setFasted] = useState(true);
  const inputUnit = unit === 'st' ? 'lb' : unit;
  const save = () => {
    upsert('weights', {
      id: uid('w-'),
      date,
      kg: parseWeight(Number(w), inputUnit),
      waistCm: waist ? Number(waist) : undefined,
      neckCm: neck ? Number(neck) : undefined,
      bodyFatPct: bf ? Number(bf) : undefined,
      bodyFatMethod: bf ? method : undefined,
      conditions: fasted ? 'morning-fasted' : 'other',
    });
    onDone?.();
  };
  return (
    <div className="space-y-4">
      <Note>Weigh on waking, after the toilet, before food or drink. Single days swing by 0.5–1.5 kg with water and glycogen — only the 7-day average is interpreted.</Note>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label={`Weight (${inputUnit})`}><Input inputMode="decimal" value={w} onChange={(e) => setW(e.target.value)} /></Field>
        <Field label="Waist (cm)" hint="At the navel, relaxed"><Input inputMode="decimal" value={waist} onChange={(e) => setWaist(e.target.value)} /></Field>
        <Field label="Neck (cm)" hint="For the tape estimate"><Input inputMode="decimal" value={neck} onChange={(e) => setNeck(e.target.value)} /></Field>
        <Field label="Body fat % (optional)"><Input inputMode="decimal" value={bf} onChange={(e) => setBf(e.target.value)} /></Field>
        <Field label="Method">
          <Select value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
            <option value="bia-scale">Bioimpedance scale (±4%)</option>
            <option value="dexa">DEXA scan (±1–2%)</option>
            <option value="calipers">Calipers (±3%)</option>
            <option value="visual">Visual estimate (±4%)</option>
          </Select>
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={fasted} onChange={(e) => setFasted(e.target.checked)} /> Morning, fasted</label>
      <Button variant="primary" className="w-full" disabled={!Number(w)} onClick={save}>Save{w && Number(w) ? ` ${formatWeight(parseWeight(Number(w), inputUnit), unit)}` : ''}</Button>
    </div>
  );
}

const ACTIVITY_LABEL: Record<StudyActivity, string> = { reading: 'Reading', notes: 'Detailed notes', recall: 'Active recall', flashcards: 'Flashcards', assignment: 'Assignment', revision: 'Revision', tutorial: 'Tutorial', daily: 'Daily total' };

export function StudyForm({ onDone, preset }: { onDone?: () => void; preset?: { moduleCode?: string; activity?: string } }) {
  const modules = useStore((s) => s.data.modules);
  const upsert = useStore((s) => s.upsert);
  const [moduleCode, setModule] = useState(preset?.moduleCode ?? modules[0]?.code ?? '');
  const [minutes, setMinutes] = useState(50);
  const [activity, setActivity] = useState<StudyActivity>(preset?.activity?.toLowerCase().includes('flashcard') ? 'flashcards' : preset?.activity?.toLowerCase().includes('recall') ? 'recall' : 'reading');
  const [topic, setTopic] = useState(preset?.activity ?? '');
  const [focus, setFocus] = useState<number | undefined>();
  const [date, setDate] = useState(todayISO());
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{modules.map((m) => <Chip key={m.code} active={moduleCode === m.code} onClick={() => setModule(m.code)}>{m.code}</Chip>)}</div>
      <div>
        <div className="mb-1.5 text-sm font-medium">Minutes</div>
        <div className="flex flex-wrap items-center gap-2">
          {[25, 50, 90].map((m) => <Chip key={m} active={minutes === m} onClick={() => setMinutes(m)}>{m}</Chip>)}
          <Input className="w-24" inputMode="numeric" value={minutes} onChange={(e) => setMinutes(Number(e.target.value) || 0)} />
        </div>
      </div>
      <Field label="Activity">
        <Select value={activity} onChange={(e) => setActivity(e.target.value as StudyActivity)}>
          {(Object.keys(ACTIVITY_LABEL) as StudyActivity[]).map((a) => <option key={a} value={a}>{ACTIVITY_LABEL[a]}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Topic"><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Unit / topic" /></Field>
        <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      </div>
      <Scale label="Focus" labels={['scattered', 'deep']} value={focus} onChange={setFocus} />
      <Button variant="primary" className="w-full" disabled={!moduleCode || !minutes} onClick={() => { upsert('study', { id: uid('st-'), date, moduleCode, minutes, activity, topic: topic || undefined, focus }); onDone?.(); }}>Log {minutes} min</Button>
    </div>
  );
}

export function LifeForm({ onDone, preset }: { onDone?: () => void; preset?: { title?: string; category?: string; ideaId?: string } }) {
  const upsert = useStore((s) => s.upsert);
  const [title, setTitle] = useState(preset?.title ?? '');
  const [category, setCategory] = useState(preset?.category ?? 'walk');
  const [date, setDate] = useState(todayISO());
  const [enjoyment, setEnjoyment] = useState<number | undefined>();
  const [social, setSocial] = useState(false);
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  return (
    <div className="space-y-4">
      <Field label="What did you do?"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Coastal walk, film night, lunch with friends…" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Kind">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.entries(LIFE_CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Cost (£)"><Input inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} /></Field>
        <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={social} onChange={(e) => setSocial(e.target.checked)} /> With other people</label>
      </div>
      <Scale label="How much did you enjoy it?" labels={['meh', 'loved it']} value={enjoyment} onChange={setEnjoyment} />
      <Field label="Notes"><TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <Button variant="primary" className="w-full" disabled={!title} onClick={() => { upsert('life', { id: uid('life-'), date, title, category, ideaId: preset?.ideaId, enjoyment, social, costGBP: cost ? Number(cost) : undefined, notes: notes || undefined }); onDone?.(); }}>Save</Button>
    </div>
  );
}

export const MEAL_LABEL: Record<MealSlot, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack', 'pre-run': 'Pre-run', 'post-run': 'Post-run', 'pre-sleep': 'Pre-sleep' };

export function FoodAdder({ date = todayISO(), onDone, initialFoodId }: { date?: ISODate; onDone?: () => void; initialFoodId?: string }) {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const [q, setQ] = useState('');
  const [foodId, setFoodId] = useState<string | undefined>(initialFoodId);
  const food = foodId ? foodById(data, foodId) : undefined;
  const [grams, setGrams] = useState(food ? String(food.portion.g) : '');
  const [meal, setMeal] = useState<MealSlot>(() => {
    const h = new Date().getHours();
    return h < 11 ? 'breakfast' : h < 15 ? 'lunch' : h < 18 ? 'snack' : 'dinner';
  });
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return allFoods(data).filter((f) => !s || f.name.toLowerCase().includes(s)).slice(0, 8);
  }, [q, data]);
  return (
    <div className="space-y-4">
      {!food ? (
        <>
          <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods — eggs, salmon, oats…" />
          <ul className="divide-y divide-line rounded-xl border border-line">
            {results.map((f) => (
              <li key={f.id}>
                <button type="button" className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-surface-2" onClick={() => { setFoodId(f.id); setGrams(String(f.portion.g)); }}>
                  <span>{f.name}</span>
                  <span className="text-xs text-muted">{f.n.kcal} kcal · {f.n.protein} g P /100 g {f.basis === 'raw' ? 'raw' : f.basis === 'dry' ? 'dry' : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{food.name}</div>
              <div className="text-xs text-muted">Values per 100 g {food.basis === 'raw' ? 'raw weight — weigh before cooking' : food.basis === 'dry' ? 'dry weight' : 'as sold'}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setFoodId(undefined)}>Change</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Grams" hint={`Typical portion: ${food.portion.label} (${food.portion.g} g)`}><Input inputMode="decimal" value={grams} onChange={(e) => setGrams(e.target.value)} /></Field>
            <Field label="Meal">
              <Select value={meal} onChange={(e) => setMeal(e.target.value as MealSlot)}>
                {(Object.keys(MEAL_LABEL) as MealSlot[]).map((m) => <option key={m} value={m}>{MEAL_LABEL[m]}</option>)}
              </Select>
            </Field>
          </div>
          <div className="text-sm text-ink-2 tabular">≈ {Math.round((food.n.kcal * Number(grams || 0)) / 100)} kcal · {((food.n.protein * Number(grams || 0)) / 100).toFixed(1)} g protein · {((food.n.carbs * Number(grams || 0)) / 100).toFixed(0)} g carbs</div>
          <Button variant="primary" className="w-full" disabled={!Number(grams)} onClick={() => { upsert('food', { id: uid('f-'), date, meal, foodId: food.id, grams: Number(grams) }); onDone?.(); }}>Add to {MEAL_LABEL[meal].toLowerCase()}</Button>
        </>
      )}
    </div>
  );
}
