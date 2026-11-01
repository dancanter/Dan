import { useMemo, useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { ageOn, daysBetween, fromDisplay, todayISO, toDisplay } from '@/engine/body';
import { RANKS, badges, rankFor, xpTotal } from '@/engine/game';
import { actions, getState, useStore } from '@/store';
import { Bar, Button, Card } from '@/components/ui';
import { inClaude, saveBackup, useCloudStatus } from '@/cloud';

export function Me() {
  const s = useStore((x) => x);
  const p = s.profile;
  const xp = useMemo(() => xpTotal(s), [s]);
  const { rank, next, progress } = rankFor(xp);
  const bs = useMemo(() => badges(s), [s]);
  const age = ageOn(p.dob, todayISO());
  const [y, m, d] = p.dob.split('-').map(Number);
  const nextBirthday = (() => {
    const t = todayISO();
    let b = `${t.slice(0, 4)}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (b < t) b = `${Number(t.slice(0, 4)) + 1}${b.slice(4)}`;
    return daysBetween(t, b);
  })();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const cloud = useCloudStatus();

  const num = (v: string) => Number(v.replace(/[^\d.]/g, ''));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">{p.name}</h1>
        <p className="text-sm text-ink-2">{age} years old{nextBirthday <= 60 ? `, ${age + 1} in ${nextBirthday} days` : ''} · born {d}/{m}/{y}</p>
      </div>

      <Card eyebrow="Your rank" title={rank.name}>
        <p className="mb-3 text-sm text-ink-2">{rank.line}</p>
        <Bar value={progress * 100} colour="var(--gold)" />
        <div className="num mt-1 flex justify-between text-xs text-muted"><span>{xp.toLocaleString('en-GB')} XP</span><span>{next ? `${next.name} at ${next.xp.toLocaleString('en-GB')}` : 'Top rank'}</span></div>
        <p className="mt-3 text-xs text-muted">Every day earns XP equal to its Glow score. Ranks: {RANKS.map((r) => r.name).join(' → ')}.</p>
      </Card>

      <Card title="Badges" eyebrow={`${bs.filter((b) => b.earned).length} of ${bs.length}`}>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {bs.map((b) => (
            <li key={b.id} className={`rounded-2xl p-3 text-center ${b.earned ? 'pop bg-gold-soft' : 'bg-surface-2 opacity-55'}`} title={b.how}>
              <div className="text-2xl" style={{ filter: b.earned ? 'none' : 'grayscale(1)' }}>{b.emoji}</div>
              <div className="mt-1 text-xs font-medium">{b.title}</div>
              <div className="text-[10px] leading-tight text-muted">{b.how}</div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Your settings" eyebrow="These shape every target">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name"><input className="field" value={p.name} onChange={(e) => actions.setProfile({ name: e.target.value })} /></Field>
          <Field label="Date of birth"><input type="date" className="field" value={p.dob} onChange={(e) => actions.setProfile({ dob: e.target.value })} /></Field>
          <Field label="Height (cm)"><input className="field num" inputMode="decimal" defaultValue={p.heightCm} onBlur={(e) => num(e.target.value) && actions.setProfile({ heightCm: num(e.target.value) })} /></Field>
          <Field label="Weight unit">
            <select className="field" value={p.unit} onChange={(e) => actions.setProfile({ unit: e.target.value as 'lb' | 'kg' })}><option value="lb">Pounds (lb)</option><option value="kg">Kilograms (kg)</option></select>
          </Field>
          <Field label="Calorie target (kcal)"><input className="field num" inputMode="numeric" defaultValue={p.kcalTarget} onBlur={(e) => num(e.target.value) && actions.setProfile({ kcalTarget: num(e.target.value) })} /></Field>
          <Field label="Protein (g per kg)">
            <select className="field" value={p.proteinPerKg} onChange={(e) => actions.setProfile({ proteinPerKg: Number(e.target.value) })}>
              {[1.6, 1.8, 2.0, 2.2, 2.4].map((v) => <option key={v} value={v}>{v.toFixed(1)}</option>)}
            </select>
          </Field>
          <Field label="Training energy (kcal/day avg)"><input className="field num" inputMode="numeric" defaultValue={p.exerciseKcal} onBlur={(e) => actions.setProfile({ exerciseKcal: num(e.target.value) })} /></Field>
          <Field label="Body fat % (estimate)"><input className="field num" inputMode="decimal" defaultValue={p.bodyFatPct} onBlur={(e) => num(e.target.value) && actions.setProfile({ bodyFatPct: num(e.target.value) })} /></Field>
          <Field label={`Goal weight (${p.unit})`}><input className="field num" inputMode="decimal" defaultValue={p.goalWeightKg ? toDisplay(p.goalWeightKg, p.unit).toFixed(1) : ''} placeholder="e.g. 123" onBlur={(e) => actions.setProfile({ goalWeightKg: num(e.target.value) ? fromDisplay(num(e.target.value), p.unit) : undefined })} /></Field>
          <Field label="Gluten"><label className="field flex items-center gap-2"><input type="checkbox" checked={p.glutenFree} onChange={(e) => actions.setProfile({ glutenFree: e.target.checked })} />Gluten-free mode</label></Field>
          <Field label="Sun protection"><label className="field flex items-center gap-2"><input type="checkbox" checked={!!p.dailySpf} onChange={(e) => actions.setProfile({ dailySpf: e.target.checked })} />SPF50 every day</label></Field>
        </div>
        <p className="mt-3 text-xs text-muted">Training energy: four lifts (about 250–350 kcal each) plus 3–4 runs (a 5 km is about 300 kcal at your weight) averages roughly 550–750 kcal a day. Your 13k steps are counted separately in the maintenance estimate. Protein of 2.0 g/kg is the evidence-backed level for keeping muscle on a cut (gains plateau around 1.6 g/kg at maintenance; deficits justify more).</p>
      </Card>

      <Card title="Your data" eyebrow={inClaude() ? 'Saved privately to your Claude account' : 'Stored only in this browser'}>
        <p className="mb-3 text-sm text-ink-2">{inClaude()
          ? 'Inside Claude, your logs save to a private space only you can read, so they follow you to any device where you open this page. Nothing else leaves it.'
          : 'Nothing leaves this device except the food words you search online. Export a backup now and then, and import it to move to another phone or laptop.'}</p>
        {inClaude() && <p className="mb-3 text-xs text-muted">Sync: <b className={cloud === 'error' || cloud === 'offline' ? 'text-bad' : 'text-good'}>{({ local: 'this browser only (sign in to sync)', connecting: 'connecting…', synced: 'all changes saved', saving: 'saving…', offline: 'can’t reach your saved data yet, changes are kept in this browser', error: 'last save failed, changes are kept in this browser' } as const)[cloud]}</b></p>}
        <div className="flex flex-wrap gap-2">
          <Button tone="ghost" onClick={async () => {
            const r = await saveBackup(`glow-backup-${todayISO()}.json`, JSON.stringify(getState(), null, 2));
            setMsg(r === 'saved' ? 'Backup saved.' : 'Backup not saved.');
          }}><Download size={16} />Export backup</Button>
          <Button tone="ghost" onClick={() => file.current?.click()}><Upload size={16} />Import backup</Button>
          <input ref={file} type="file" accept="application/json" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try { actions.importState(await f.text()); setMsg('Backup imported.'); } catch (err) { setMsg((err as Error).message); }
          }} />
          {!confirmReset
            ? <Button tone="danger" onClick={() => setConfirmReset(true)}>Reset everything</Button>
            : <span className="flex flex-wrap items-center gap-2 rounded-xl bg-bad-soft p-2 text-sm text-bad">Delete every log, weigh-in and setting?
                <Button tone="danger" onClick={() => { actions.reset(); setConfirmReset(false); setMsg('Everything deleted.'); }}>Yes, delete</Button>
                <Button tone="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
              </span>}
        </div>
        {msg && <p className="mt-2 text-sm text-sea">{msg}</p>}
      </Card>

      <p className="px-1 text-xs leading-relaxed text-muted">Glow is a personal tool, not medical advice. Values are typical estimates (±10–20%). If you have symptoms of low energy availability, ongoing fatigue, or a diagnosed condition such as coeliac disease, speak to your GP or a registered dietitian.</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs text-muted"><span className="mb-1 block">{label}</span>{children}</label>;
}
