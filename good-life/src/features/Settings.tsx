import { useEffect, useRef, useState } from 'react';
import { Download, Plus, Trash2, Upload } from 'lucide-react';
import { WEEKDAYS } from '@/lib/dates';
import { formatHeight, heightFromFtIn, kgToLb, lbToKg, type WeightUnit } from '@/lib/units';
import { formatDuration, parseTime } from '@/lib/time';
import { exportData, mergeStartingProfile, parseImport, restorePhotos } from '@/lib/backup';
import { InstallCard, MoveData } from '@/components/Install';
import { buildDemo } from '@/lib/demo';
import { aiStatus, type AiStatus } from '@/lib/ai';
import { geocode } from '@/lib/weather';
import { hasDemoData, useStore } from '@/store/store';
import type { RunEvent } from '@/store/types';
import { FOODS } from '@/data/foods';
import { EVENT_LABEL } from '@/engine/running';
import { Badge, Button, Card, Chip, Field, Input, Note, PageHeader, Segmented, Select, TextArea } from '@/components/ui';

export default function Settings() {
  const data = useStore((s) => s.data);
  const patch = useStore((s) => s.patch);
  const replaceAll = useStore((s) => s.replaceAll);
  const mergeDemo = useStore((s) => s.mergeDemo);
  const clearDemo = useStore((s) => s.clearDemo);
  const resetAll = useStore((s) => s.resetAll);
  const p = data.profile;
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [confirmReset, setConfirmReset] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const totalIn = p.heightCm ? p.heightCm / 2.54 : 68;
  const [ft, setFt] = useState(String(Math.floor(totalIn / 12)));
  const [inch, setInch] = useState(String(Math.round(totalIn % 12)));
  useEffect(() => { aiStatus().then(setStatus); }, []);

  const setProfile = (v: Partial<typeof p>) => patch('profile', v);
  const toLbStr = (kg: number | null | undefined) => (kg == null ? '' : kgToLb(kg).toFixed(1));

  const onImport = async (f: File) => {
    setMsg(null);
    try {
      const parsed = await parseImport(f);
      if (parsed.kind === 'backup') {
        if (!confirm('Replace everything in this browser with the backup? Export first if unsure.')) return;
        replaceAll(parsed.data);
        await restorePhotos(parsed.photos);
        setMsg('Backup restored.');
      } else {
        replaceAll(mergeStartingProfile(data, parsed.data));
        setMsg('Starting profile merged into your data.');
      }
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="You, your goals, your data" />

      <Card eyebrow="Profile" title="About you">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name"><Input value={p.name} onChange={(e) => setProfile({ name: e.target.value })} /></Field>
          <Field label="Date of birth"><Input type="date" value={p.dob ?? ''} onChange={(e) => setProfile({ dob: e.target.value || null })} /></Field>
          <Field label="Sex" hint="Used in energy equations"><Select value={p.sex} onChange={(e) => setProfile({ sex: e.target.value as 'male' | 'female' })}><option value="male">Male</option><option value="female">Female</option></Select></Field>
          <Field label="Height" hint={formatHeight(p.heightCm)}>
            <div className="flex gap-2">
              <Input inputMode="numeric" value={ft} onChange={(e) => { setFt(e.target.value); setProfile({ heightCm: heightFromFtIn(Number(e.target.value) || 0, Number(inch) || 0) }); }} aria-label="Feet" /><span className="self-center text-sm text-muted">ft</span>
              <Input inputMode="numeric" value={inch} onChange={(e) => { setInch(e.target.value); setProfile({ heightCm: heightFromFtIn(Number(ft) || 0, Number(e.target.value) || 0) }); }} aria-label="Inches" /><span className="self-center text-sm text-muted">in</span>
            </div>
          </Field>
          <Field label="Weight unit"><Segmented<WeightUnit> value={p.weightUnit} onChange={(v) => setProfile({ weightUnit: v })} options={[{ value: 'lb', label: 'lb' }, { value: 'st', label: 'st & lb' }, { value: 'kg', label: 'kg' }]} /></Field>
          <Field label="Distance unit"><Segmented value={p.distanceUnit} onChange={(v) => setProfile({ distanceUnit: v })} options={[{ value: 'km', label: 'km' }, { value: 'mi', label: 'miles' }]} /></Field>
          <Field label="Target weight range (lb)" hint="Assessed in Physique before it is encouraged">
            <div className="flex gap-2">
              <Input inputMode="decimal" defaultValue={toLbStr(p.targetWeightKg?.[0])} onBlur={(e) => { const lo = Number(e.target.value); const hi = p.targetWeightKg?.[1] ?? (lo ? lbToKg(lo + 1) : 0); setProfile({ targetWeightKg: lo ? [lbToKg(lo), hi] : null }); }} aria-label="From" />
              <Input inputMode="decimal" defaultValue={toLbStr(p.targetWeightKg?.[1])} onBlur={(e) => { const hi = Number(e.target.value); const lo = p.targetWeightKg?.[0] ?? (hi ? lbToKg(hi - 1) : 0); setProfile({ targetWeightKg: hi ? [lo, lbToKg(hi)] : null }); }} aria-label="To" />
            </div>
          </Field>
          <Field label="Your body-fat estimate (%)" hint="Only used until a measurement exists"><Input inputMode="decimal" value={p.estimatedBodyFatPct ?? ''} onChange={(e) => setProfile({ estimatedBodyFatPct: e.target.value ? Number(e.target.value) : null })} /></Field>
          <Field label="Full rest day"><Select value={p.restDay} onChange={(e) => setProfile({ restDay: Number(e.target.value) })}>{WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</Select></Field>
          <Field label="Sleep target (hours)"><div className="flex gap-2"><Input inputMode="decimal" value={p.sleepTargetHours[0]} onChange={(e) => setProfile({ sleepTargetHours: [Number(e.target.value) || 7, p.sleepTargetHours[1]] })} aria-label="From" /><Input inputMode="decimal" value={p.sleepTargetHours[1]} onChange={(e) => setProfile({ sleepTargetHours: [p.sleepTargetHours[0], Number(e.target.value) || 9] })} aria-label="To" /></div></Field>
          <Field label="Daily steps target"><Input inputMode="numeric" value={p.stepsTarget} onChange={(e) => setProfile({ stepsTarget: Number(e.target.value) || 0 })} /></Field>
          <LocationField />
        </div>
      </Card>

      <Card eyebrow="Diet" title="What suits you">
        <label className="mb-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={p.diet.coeliac} onChange={(e) => setProfile({ diet: { ...p.diet, coeliac: e.target.checked } })} /> Coeliac disease — strictly gluten-free</label>
        <div className="mb-2 text-sm font-medium">Tolerated well</div>
        <div className="mb-4 flex flex-wrap gap-2">{FOODS.map((f) => <Chip key={f.id} active={p.diet.tolerated.includes(f.id)} onClick={() => setProfile({ diet: { ...p.diet, tolerated: p.diet.tolerated.includes(f.id) ? p.diet.tolerated.filter((x) => x !== f.id) : [...p.diet.tolerated, f.id], problematic: p.diet.problematic.filter((x) => x !== f.id) } })}>{f.name.split(',')[0]}</Chip>)}</div>
        <div className="mb-2 text-sm font-medium">Cause problems</div>
        <div className="mb-4 flex flex-wrap gap-2">{FOODS.map((f) => <Chip key={f.id} active={p.diet.problematic.includes(f.id)} onClick={() => setProfile({ diet: { ...p.diet, problematic: p.diet.problematic.includes(f.id) ? p.diet.problematic.filter((x) => x !== f.id) : [...p.diet.problematic, f.id], tolerated: p.diet.tolerated.filter((x) => x !== f.id) } })}>{f.name.split(',')[0]}</Chip>)}</div>
        <Field label="Notes for the coach"><TextArea rows={2} value={p.diet.notes} onChange={(e) => setProfile({ diet: { ...p.diet, notes: e.target.value } })} placeholder="e.g. prefer whole eggs, not egg whites" /></Field>
      </Card>

      <GoalsCard />

      <Card eyebrow="Coach" title="AI connection">
        <div className="flex flex-wrap items-center gap-3">
          {status == null ? <Badge>checking…</Badge> : status.available ? <Badge tone="good">Connected · {status.model}</Badge> : <Badge tone="warn">Not available</Badge>}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.settings.aiEnabled} onChange={(e) => patch('settings', { aiEnabled: e.target.checked })} /> Use the AI coach when available</label>
          <Button size="sm" onClick={() => aiStatus().then(setStatus)}>Test</Button>
        </div>
        {status && !status.available && <p className="mt-2 text-sm text-ink-2">{status.reason}</p>}
        <p className="mt-3 text-xs text-muted">The Anthropic API key lives in a <code>.env</code> file read by the app’s own server; it never reaches the browser. Without it, the rules-based offline coach answers instead. See the README for setup.</p>
      </Card>

      <Card eyebrow="Appearance" title="Theme">
        <Segmented value={data.settings.theme} onChange={(v) => patch('settings', { theme: v })} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
      </Card>

      <InstallCard />

      <Card eyebrow="Move your data" title="To the phone app or another device">
        <p className="mb-3 text-sm text-ink-2">Copy the link here, open or paste it in the other copy of the app, and everything arrives.</p>
        <MoveData />
      </Card>

      <Card id="data" eyebrow="Data" title="Local-first, and yours">
        <Note>Everything is stored in this browser (IndexedDB). Nothing is synced to a server. If you clear site data, change browser or lose the device, only a backup file brings it back — so export one regularly.</Note>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={async () => { await exportData(data, includePhotos); patch('settings', { lastBackupAt: new Date().toISOString() }); }}><Download size={14} /> Export backup</Button>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includePhotos} onChange={(e) => setIncludePhotos(e.target.checked)} /> include photos</label>
          <Button onClick={() => fileRef.current?.click()}><Upload size={14} /> Import backup or starting profile</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
        </div>
        {data.settings.lastBackupAt && <p className="mt-2 text-xs text-muted">Last backup: {data.settings.lastBackupAt.slice(0, 16).replace('T', ' ')}</p>}
        {msg && <p className="mt-2 text-sm">{msg}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          {hasDemoData(data) ? <Button onClick={clearDemo}>Remove demonstration data</Button> : <Button onClick={() => mergeDemo(buildDemo(data))}>Load demonstration data</Button>}
        </div>
        <div className="mt-6 rounded-xl border border-bad/30 p-4">
          <div className="text-sm font-medium text-bad">Erase everything</div>
          <p className="mt-1 text-xs text-muted">Type ERASE to delete all data in this browser. Export first.</p>
          <div className="mt-2 flex gap-2"><Input className="max-w-[10rem]" value={confirmReset} onChange={(e) => setConfirmReset(e.target.value)} /><Button variant="danger" disabled={confirmReset !== 'ERASE'} onClick={() => { resetAll(); setConfirmReset(''); }}><Trash2 size={14} /> Erase</Button></div>
        </div>
      </Card>

      <Card eyebrow="Integrations" title="What is and is not connected">
        <ul className="space-y-2 text-sm">
          <li><Badge tone="good">Working</Badge> Weather — Open-Meteo (no account or key), once a location is set.</li>
          <li><Badge tone={status?.available ? 'good' : 'warn'}>{status?.available ? 'Working' : 'Needs key'}</Badge> AI coach — Anthropic API via the app’s server.</li>
          <li><Badge>Not built</Badge> Strava / watch import — log runs manually for now (rep times can be pasted in one go).</li>
          <li><Badge>Not built</Badge> Cloud sync (e.g. Supabase) — data is local; use backups to move between devices.</li>
          <li><Badge>Not possible</Badge> Live Vinted listings — Vinted has no public API; the app builds searches that open on Vinted.</li>
        </ul>
      </Card>
    </div>
  );
}

function LocationField() {
  const loc = useStore((s) => s.data.profile.location);
  const patch = useStore((s) => s.patch);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ name: string; lat: number; lon: number; admin?: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);
  return (
    <Field label="Location (for weather)" hint={loc ? `Set: ${loc.name}` : 'Town or city'}>
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={loc?.name ?? 'e.g. York'} />
        <Button onClick={async () => { setErr(null); try { setResults(await geocode(q)); } catch (e) { setErr((e as Error).message); } }}>Find</Button>
      </div>
      {err && <span className="text-xs text-bad">{err}</span>}
      {results.length > 0 && (
        <ul className="mt-2 rounded-xl border border-line text-sm">
          {results.map((r) => <li key={`${r.lat},${r.lon}`}><button type="button" className="w-full px-3 py-1.5 text-left hover:bg-surface-2" onClick={() => { patch('profile', { location: { name: r.name, lat: r.lat, lon: r.lon } }); setResults([]); setQ(''); }}>{r.name}<span className="text-xs text-muted"> · {r.admin}</span></button></li>)}
        </ul>
      )}
    </Field>
  );
}

function GoalsCard() {
  const goals = useStore((s) => s.data.runGoals);
  const replaceAll = useStore((s) => s.replaceAll);
  const data = useStore((s) => s.data);
  const [event, setEvent] = useState<RunEvent>('5k');
  const [time, setTime] = useState('');
  const set = (g: typeof goals) => replaceAll({ ...data, runGoals: g });
  return (
    <Card eyebrow="Running goals" title="What you are aiming at">
      <ul className="divide-y divide-line text-sm">
        {goals.map((g, i) => (
          <li key={i} className="flex items-center justify-between py-2"><span>{EVENT_LABEL[g.event]} — {formatDuration(g.targetSec, { tenths: g.targetSec < 120 })}</span><button type="button" aria-label="Remove goal" className="text-muted hover:text-bad" onClick={() => set(goals.filter((_, j) => j !== i))}><Trash2 size={14} /></button></li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <Select className="w-auto" value={event} onChange={(e) => setEvent(e.target.value as RunEvent)}>{(Object.keys(EVENT_LABEL) as RunEvent[]).map((ev) => <option key={ev} value={ev}>{EVENT_LABEL[ev]}</option>)}</Select>
        <Input className="w-32" value={time} onChange={(e) => setTime(e.target.value)} placeholder="16:59" />
        <Button disabled={!parseTime(time)} onClick={() => { set([...goals, { event, targetSec: parseTime(time)! }]); setTime(''); }}><Plus size={14} /> Add goal</Button>
      </div>
      <p className="mt-3 text-xs text-muted">Stretch goals (a 15-minute 5 km, a 4:30 mile) are worth writing down; Performance shows honestly how far each is from your current level.</p>
    </Card>
  );
}
