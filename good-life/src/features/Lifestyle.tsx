import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { addDays, diffDays, formatDay, todayISO } from '@/lib/dates';
import { mean } from '@/lib/stats';
import { uid } from '@/lib/id';
import { useWeather } from '@/lib/weather';
import { useStore } from '@/store/store';
import type { Place } from '@/store/types';
import { LIFE_CATEGORY_LABEL, LIFE_IDEAS, type LifeCategory, type LifeIdea } from '@/data/lifestyle';
import { LifeForm } from '@/components/forms';
import { Badge, Button, Card, Chip, Empty, Input, Note, PageHeader, Select, Sheet, Stat } from '@/components/ui';

const COST = ['Free', '£', '££', '£££'];

export default function Lifestyle() {
  const data = useStore((s) => s.data);
  const remove = useStore((s) => s.remove);
  const { weather } = useWeather(data.profile.location);
  const [cat, setCat] = useState<LifeCategory | null>(null);
  const [maxCost, setMaxCost] = useState(3);
  const [log, setLog] = useState<{ title?: string; category?: string; ideaId?: string } | null>(null);
  const today = todayISO();
  const recent = data.life.filter((l) => l.date >= addDays(today, -30));
  const last = [...data.life].sort((a, b) => b.date.localeCompare(a.date))[0];
  const avgJoy = mean(recent.map((l) => l.enjoyment).filter((x): x is number => x != null));
  const sunny = weather?.sunny || data.checkIns[today]?.flags.includes('sunshine');
  const isRest = new Date().getDay() === data.profile.restDay;

  const ideas = useMemo(() => {
    const catScore = new Map<string, number>();
    for (const l of data.life) if (l.enjoyment) catScore.set(l.category, (catScore.get(l.category) ?? 0) + l.enjoyment - 3);
    const score = (i: LifeIdea) => (catScore.get(i.category) ?? 0) + (sunny && (i.weather === 'sunny' || i.weather === 'dry') ? 2 : 0) + (!sunny && weather && i.weather === 'indoor' ? 1 : 0) + (isRest && i.restDayFriendly ? 1 : 0);
    return LIFE_IDEAS.filter((i) => (!cat || i.category === cat) && i.cost <= maxCost && (!weather || weather.precipProb < 60 || i.weather === 'any' || i.weather === 'indoor')).sort((a, b) => score(b) - score(a));
  }, [data.life, cat, maxCost, sunny, weather, isRest]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Lifestyle" title="Enjoy being alive" subtitle="Not every day should be an optimisation exercise. Adherence over years depends on a life you actually want to live." actions={<Button variant="primary" onClick={() => setLog({})}><Plus size={16} /> Log something good</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><Stat label="Last 30 days" value={`${recent.length} things`} sub={`${recent.filter((l) => l.social).length} with other people`} /></Card>
        <Card><Stat label="Since the last one" value={last ? `${diffDays(last.date, today)} days` : '—'} tone={last && diffDays(last.date, today) > 7 ? 'warn' : undefined} sub={last?.title} /></Card>
        <Card><Stat label="Average enjoyment" value={avgJoy ? `${avgJoy.toFixed(1)}/5` : '—'} sub="used to rank ideas for you" /></Card>
      </div>
      {sunny && <Note tone="good">It’s a sunny day{weather ? ` (${Math.round(weather.tempMax)}°C)` : ''}. Outdoor ideas are ranked first — SPF on.</Note>}

      <Card eyebrow="Ideas" title="Something for this week">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Chip active={!cat} onClick={() => setCat(null)}>All</Chip>
          {(Object.keys(LIFE_CATEGORY_LABEL) as LifeCategory[]).map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>{LIFE_CATEGORY_LABEL[c]}</Chip>)}
          <Select className="ml-auto w-auto" value={maxCost} onChange={(e) => setMaxCost(Number(e.target.value))} aria-label="Budget">{COST.map((c, i) => <option key={c} value={i}>Up to {c}</option>)}</Select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {ideas.map((i) => (
            <div key={i.id} className="rounded-xl border border-line p-4">
              <div className="flex items-start justify-between gap-2"><div className="font-medium">{i.title}</div><div className="flex shrink-0 gap-1"><Badge>{COST[i.cost]}</Badge>{i.social && <Badge tone="navy">social</Badge>}</div></div>
              <p className="mt-1 text-sm text-ink-2">{i.detail}</p>
              <Button size="sm" className="mt-2" onClick={() => setLog({ title: i.title, category: i.category, ideaId: i.id })}>Did this</Button>
            </div>
          ))}
        </div>
      </Card>

      <Places />

      <Card eyebrow="Log" title="Good things, recently">
        {data.life.length === 0 ? <Empty title="Nothing logged yet" body="Log the walks, films, meals and days out that made a week good. Rating them lets the app learn what you genuinely enjoy." /> : (
          <ul className="divide-y divide-line text-sm">
            {[...data.life].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 25).map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2">
                <span className="w-20 text-muted">{formatDay(l.date)}</span>
                <span className="flex-1">{l.title} <span className="text-xs text-muted">· {LIFE_CATEGORY_LABEL[l.category as LifeCategory] ?? l.category}{l.demo ? ' · demo' : ''}</span></span>
                {l.enjoyment && <span className="text-bronze">{'★'.repeat(l.enjoyment)}</span>}
                <button type="button" aria-label="Delete" onClick={() => remove('life', l.id)} className="text-muted hover:text-bad"><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Sheet open={!!log} onClose={() => setLog(null)} title="Log something good"><LifeForm preset={log ?? undefined} onDone={() => setLog(null)} /></Sheet>
    </div>
  );
}

function Places() {
  const places = useStore((s) => s.data.places);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<Place['kind']>('cafe');
  const [gf, setGf] = useState<Place['glutenFreeConfidence']>('unsure');
  return (
    <Card eyebrow="Your places" title="Cafés, walks, restaurants you rate">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name and area" aria-label="Place name" />
        <Select value={kind} onChange={(e) => setKind(e.target.value as Place['kind'])} aria-label="Kind">{['cafe', 'restaurant', 'walk', 'cinema', 'culture', 'day-trip', 'other'].map((k) => <option key={k} value={k}>{k}</option>)}</Select>
        <Select value={gf} onChange={(e) => setGf(e.target.value as Place['glutenFreeConfidence'])} aria-label="Gluten-free confidence"><option value="accredited">GF accredited</option><option value="good">GF good</option><option value="unsure">GF unsure</option></Select>
        <Button onClick={() => { if (name) { upsert('places', { id: uid('pl-'), name, kind, glutenFreeConfidence: gf, visited: false }); setName(''); } }}>Add</Button>
      </div>
      {places.length > 0 && (
        <ul className="mt-4 divide-y divide-line text-sm">
          {places.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2">
              <label className="flex flex-1 items-center gap-2"><input type="checkbox" checked={p.visited} onChange={(e) => upsert('places', { ...p, visited: e.target.checked })} />{p.name} <span className="text-xs text-muted">· {p.kind}</span></label>
              {(p.kind === 'cafe' || p.kind === 'restaurant') && <Badge tone={p.glutenFreeConfidence === 'accredited' ? 'good' : p.glutenFreeConfidence === 'good' ? 'navy' : 'warn'}>GF {p.glutenFreeConfidence}</Badge>}
              <button type="button" aria-label="Delete" onClick={() => remove('places', p.id)} className="text-muted hover:text-bad"><Trash2 size={13} /></button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">The app doesn’t pretend to know your area. Coeliac UK’s venue guide lists places accredited for gluten-free safety.</p>
    </Card>
  );
}
