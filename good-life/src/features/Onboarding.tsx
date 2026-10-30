import { useRef, useState } from 'react';
import { useStore } from '@/store/store';
import { FOODS } from '@/data/foods';
import { WEEKDAYS } from '@/lib/dates';
import { heightFromFtIn, lbToKg } from '@/lib/units';
import { parseTime } from '@/lib/time';
import { uid } from '@/lib/id';
import { buildDemo } from '@/lib/demo';
import { mergeStartingProfile, parseImport, restorePhotos } from '@/lib/backup';
import type { Performance, RunEvent } from '@/store/types';
import { Button, Card, Chip, Field, Input, Note, Select } from '@/components/ui';

const PB_EVENTS: { ev: RunEvent; label: string; ph: string }[] = [
  { ev: '5k', label: '5 km', ph: '18:00' },
  { ev: 'mile', label: 'Mile', ph: '5:00' },
  { ev: '1k', label: '1 km', ph: '3:00' },
  { ev: '800m', label: '800 m', ph: '2:15' },
  { ev: '400m', label: '400 m', ph: '58' },
  { ev: '200m', label: '200 m', ph: '26' },
];

const COMMON_FOODS = ['oats-gf', 'eggs', 'greek-yoghurt-full', 'greek-yoghurt-0', 'kefir', 'chicken-breast', 'salmon-wild', 'cod', 'potato', 'parsnip', 'strawberries', 'blueberries', 'grapes', 'walnuts', 'hazelnuts', 'avocado', 'beef-mince-5', 'oysters', 'olive-oil', 'brazil-nuts', 'banana', 'rice-basmati', 'lentils', 'broccoli', 'kale', 'chickpeas-tin', 'garlic'];

export function Onboarding() {
  const data = useStore((s) => s.data);
  const replaceAll = useStore((s) => s.replaceAll);
  const mergeDemo = useStore((s) => s.mergeDemo);
  const patch = useStore((s) => s.patch);
  const [mode, setMode] = useState<'choose' | 'profile'>('choose');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [ft, setFt] = useState('5');
  const [inch, setInch] = useState('8');
  const [weight, setWeight] = useState('');
  const [tLo, setTLo] = useState('');
  const [tHi, setTHi] = useState('');
  const [coeliac, setCoeliac] = useState(false);
  const [tolerated, setTolerated] = useState<string[]>([]);
  const [problematic, setProblematic] = useState<string[]>([]);
  const [restDay, setRestDay] = useState(6);
  const [pbs, setPbs] = useState<Record<string, { time: string; date: string }>>({});

  const onFile = async (f: File) => {
    setError(null);
    try {
      const parsed = await parseImport(f);
      if (parsed.kind === 'backup') {
        replaceAll(parsed.data);
        await restorePhotos(parsed.photos);
        patch('settings', { onboarded: true });
      } else {
        replaceAll({ ...mergeStartingProfile(data, parsed.data), settings: { ...data.settings, ...(parsed.data.settings ?? {}), onboarded: true } });
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const finish = () => {
    const performances: Performance[] = PB_EVENTS.flatMap(({ ev }) => {
      const t = parseTime(pbs[ev]?.time ?? '');
      return t ? [{ id: uid('pb-'), event: ev, timeSec: t, date: pbs[ev]?.date || null, kind: 'reported-pb' as const }] : [];
    });
    const kg = weight ? lbToKg(Number(weight)) : null;
    replaceAll({
      ...data,
      profile: {
        ...data.profile,
        name,
        dob: dob || null,
        heightCm: heightFromFtIn(Number(ft) || 0, Number(inch) || 0) || null,
        startWeightKg: kg,
        targetWeightKg: tLo && tHi ? [lbToKg(Number(tLo)), lbToKg(Number(tHi))] : null,
        restDay,
        diet: { ...data.profile.diet, coeliac, tolerated, problematic },
      },
      performances: [...data.performances, ...performances],
      weights: kg ? [...data.weights, { id: uid('w-'), date: new Date().toISOString().slice(0, 10), kg, conditions: 'other' as const, notes: 'Starting weight (reported)' }] : data.weights,
      settings: { ...data.settings, onboarded: true },
    });
  };

  const toggle = (list: string[], set: (x: string[]) => void, id: string, other: string[], setOther: (x: string[]) => void) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    if (other.includes(id)) setOther(other.filter((x) => x !== id));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <div className="mb-10">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted">A personal operating system</div>
        <h1 className="mt-2 font-serif text-6xl italic leading-none sm:text-7xl">The Good Life</h1>
        <p className="mt-4 max-w-xl text-lg text-ink-2">Training, health, study, style and enjoyment — treated as one connected system, built on evidence, and honest about what it does not know.</p>
      </div>

      {mode === 'choose' ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card title="Set up my profile" className="flex flex-col">
            <p className="mb-4 flex-1 text-sm text-ink-2">About two minutes. Everything stays in this browser.</p>
            <Button variant="primary" onClick={() => setMode('profile')}>Start</Button>
          </Card>
          <Card title="Import a file" className="flex flex-col">
            <p className="mb-4 flex-1 text-sm text-ink-2">A backup from this app, or a starting-profile file.</p>
            <Button onClick={() => fileRef.current?.click()}>Choose file…</Button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </Card>
          <Card title="Look around first" className="flex flex-col">
            <p className="mb-4 flex-1 text-sm text-ink-2">Loads made-up demonstration data, clearly labelled, removable in one tap.</p>
            <Button onClick={() => { mergeDemo(buildDemo(data)); patch('settings', { onboarded: true }); }}>Explore with demo data</Button>
          </Card>
          {error && <div className="sm:col-span-3"><Note tone="bad">{error}</Note></div>}
        </div>
      ) : (
        <div className="space-y-6">
          <Card title="You">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Date of birth"><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></Field>
              <Field label="Height">
                <div className="flex gap-2"><Input inputMode="numeric" value={ft} onChange={(e) => setFt(e.target.value)} aria-label="Feet" /><span className="self-center text-sm text-muted">ft</span><Input inputMode="numeric" value={inch} onChange={(e) => setInch(e.target.value)} aria-label="Inches" /><span className="self-center text-sm text-muted">in</span></div>
              </Field>
              <Field label="Current weight (lb)"><Input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
              <Field label="Initial target range (lb)" hint="The app will assess whether this is a good idea before encouraging it.">
                <div className="flex gap-2"><Input inputMode="decimal" value={tLo} onChange={(e) => setTLo(e.target.value)} placeholder="from" /><Input inputMode="decimal" value={tHi} onChange={(e) => setTHi(e.target.value)} placeholder="to" /></div>
              </Field>
              <Field label="Full rest day">
                <Select value={restDay} onChange={(e) => setRestDay(Number(e.target.value))}>{WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</Select>
              </Field>
            </div>
          </Card>
          <Card title="Food">
            <label className="mb-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={coeliac} onChange={(e) => setCoeliac(e.target.checked)} /> I have coeliac disease (strictly gluten-free)</label>
            <div className="mb-2 text-sm font-medium">Foods I tolerate well</div>
            <div className="mb-4 flex flex-wrap gap-2">{COMMON_FOODS.map((id) => <Chip key={id} active={tolerated.includes(id)} onClick={() => toggle(tolerated, setTolerated, id, problematic, setProblematic)}>{FOODS.find((f) => f.id === id)?.name.split(',')[0]}</Chip>)}</div>
            <div className="mb-2 text-sm font-medium">Foods that cause me problems</div>
            <div className="flex flex-wrap gap-2">{COMMON_FOODS.map((id) => <Chip key={id} active={problematic.includes(id)} onClick={() => toggle(problematic, setProblematic, id, tolerated, setTolerated)}>{FOODS.find((f) => f.id === id)?.name.split(',')[0]}</Chip>)}</div>
          </Card>
          <Card title="Running bests" eyebrow="Approximate is fine">
            <div className="grid gap-3 sm:grid-cols-2">
              {PB_EVENTS.map(({ ev, label, ph }) => (
                <div key={ev} className="grid grid-cols-[4rem_1fr_1fr] items-center gap-2">
                  <span className="text-sm font-medium">{label}</span>
                  <Input value={pbs[ev]?.time ?? ''} placeholder={ph} onChange={(e) => setPbs((p) => ({ ...p, [ev]: { ...p[ev], time: e.target.value } }))} aria-label={`${label} time`} />
                  <Input type="date" value={pbs[ev]?.date ?? ''} onChange={(e) => setPbs((p) => ({ ...p, [ev]: { ...p[ev], date: e.target.value } }))} aria-label={`${label} date`} />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Dates matter: training paces are set from recent results, not lifetime bests.</p>
          </Card>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setMode('choose')}>Back</Button>
            <Button variant="primary" onClick={finish}>Begin Phase 1</Button>
          </div>
        </div>
      )}
    </div>
  );
}
