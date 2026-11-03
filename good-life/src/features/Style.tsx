import { useState } from 'react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { uid } from '@/lib/id';
import { useWeather } from '@/lib/weather';
import { useStore } from '@/store/store';
import type { GarmentCategory, Season, WardrobeItem } from '@/store/types';
import { CAPSULE, COLOURS, COLOUR_BY_ID, FABRICS, FIT_RULES, GROOMING, LOOKS, PALETTES } from '@/data/style';
import { costPerWear, generateOutfits, OCCASION_LABEL, seasonFor, vintedSearchUrl, wardrobeGaps, type Occasion } from '@/engine/style';
import { Badge, Button, Card, Chip, Empty, Field, Input, Note, PageHeader, Segmented, Select, Sheet, SourceRefs, Tabs } from '@/components/ui';

type Tab = 'outfits' | 'wardrobe' | 'capsule' | 'guide';
const CATEGORIES: GarmentCategory[] = ['shirt', 'polo', 'tshirt', 'knitwear', 'trousers', 'shorts', 'jacket', 'outerwear', 'shoes', 'sunglasses', 'watch', 'belt', 'swim', 'accessory'];
const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

function Swatch({ id, size = 14 }: { id: string; size?: number }) {
  const c = COLOUR_BY_ID[id];
  return <span title={c?.label ?? id} className="inline-block shrink-0 rounded-full border border-line-strong" style={{ width: size, height: size, background: c?.hex ?? '#ccc' }} />;
}

export default function Style() {
  const [tab, setTab] = useState<Tab>('outfits');
  return (
    <div>
      <PageHeader eyebrow="Style" title="Effortless, never overdressed" subtitle="Riviera ease, Delon’s restraint, Bond’s fit. Neutral palettes, natural fabrics, no logos." />
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ value: 'outfits', label: 'Outfits' }, { value: 'wardrobe', label: 'Wardrobe' }, { value: 'capsule', label: 'Capsule' }, { value: 'guide', label: 'Guide & grooming' }]} />
      {tab === 'outfits' && <Outfits />}
      {tab === 'wardrobe' && <Wardrobe />}
      {tab === 'capsule' && <Capsule />}
      {tab === 'guide' && <Guide />}
    </div>
  );
}

function Outfits() {
  const data = useStore((s) => s.data);
  const { weather } = useWeather(data.profile.location);
  const [occasion, setOccasion] = useState<Occasion>('everyday');
  const [temp, setTemp] = useState<number>(Math.round(weather?.tempMax ?? 14));
  const [rain, setRain] = useState<boolean>((weather?.precipProb ?? 0) >= 50);
  const outfits = generateOutfits(data, occasion, temp, rain);
  const owned = data.wardrobe.filter((w) => w.status === 'owned').length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">{(Object.keys(OCCASION_LABEL) as Occasion[]).map((o) => <Chip key={o} active={occasion === o} onClick={() => setOccasion(o)}>{OCCASION_LABEL[o]}</Chip>)}</div>
        <label className="flex items-center gap-2 text-sm">Max temp <Input className="h-8 min-h-0 w-16 py-1" inputMode="numeric" value={temp} onChange={(e) => setTemp(Number(e.target.value) || 0)} />°C</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rain} onChange={(e) => setRain(e.target.checked)} /> Rain</label>
        {weather && <span className="text-xs text-muted">Forecast {Math.round(weather.tempMax)}°C, {weather.precipProb}% rain</span>}
      </div>
      {owned < 4 && <Note>Add a few pieces you own in the Wardrobe tab (or tick them in Capsule) and outfits are built from your actual clothes. Until then, the gaps are filled with suggestions.</Note>}
      <div className="grid gap-4 md:grid-cols-3">
        {outfits.map((o, i) => (
          <Card key={i} eyebrow={`Option ${i + 1}`} title={<span className="text-xl">{OCCASION_LABEL[occasion]}, {seasonFor()}</span>}>
            <ul className="space-y-2 text-sm">
              {o.pieces.map((p) => (
                <li key={p.slot} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 text-xs text-muted">{p.slot}</span>
                  {p.item ? <><Swatch id={p.item.colour} /><span>{p.item.name}{p.item.brand ? <span className="text-muted"> · {p.item.brand}</span> : null}</span></> : (
                    <span className="text-ink-2">{p.suggestion} <a className="ml-1 inline-flex items-center gap-0.5 text-xs underline" target="_blank" rel="noreferrer" href={vintedSearchUrl({ item: p.suggestion ?? '' })}>Vinted <ExternalLink size={10} /></a></span>
                  )}
                </li>
              ))}
            </ul>
            {o.notes.length > 0 && <p className="mt-3 text-xs text-ink-2">{o.notes.join(' ')}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ItemForm({ item, onDone }: { item: WardrobeItem; onDone: (w: WardrobeItem) => void }) {
  const [v, setV] = useState(item);
  return (
    <div className="space-y-3">
      <Field label="Name"><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="Navy linen shirt" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category"><Select value={v.category} onChange={(e) => setV({ ...v, category: e.target.value as GarmentCategory })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Brand"><Input value={v.brand ?? ''} onChange={(e) => setV({ ...v, brand: e.target.value })} /></Field>
        <Field label="Fabric"><Input value={v.fabric ?? ''} onChange={(e) => setV({ ...v, fabric: e.target.value })} placeholder="linen, merino, suede…" /></Field>
        <Field label="Status"><Select value={v.status} onChange={(e) => setV({ ...v, status: e.target.value as WardrobeItem['status'] })}><option value="owned">Owned</option><option value="wishlist">Wishlist</option></Select></Field>
        <Field label="Cost (£)"><Input inputMode="decimal" value={v.costGBP ?? ''} onChange={(e) => setV({ ...v, costGBP: Number(e.target.value) || undefined })} /></Field>
        <Field label="Formality (1–5)"><Input inputMode="numeric" value={v.formality} onChange={(e) => setV({ ...v, formality: Math.min(5, Math.max(1, Number(e.target.value) || 3)) })} /></Field>
      </div>
      <div>
        <div className="mb-1.5 text-sm font-medium">Colour</div>
        <div className="flex flex-wrap gap-2">{COLOURS.map((c) => <button key={c.id} type="button" title={c.label} aria-label={c.label} aria-pressed={v.colour === c.id} onClick={() => setV({ ...v, colour: c.id })} className={`h-8 w-8 rounded-full border-2 ${v.colour === c.id ? 'border-navy' : 'border-line'}`} style={{ background: c.hex }} />)}</div>
      </div>
      <div className="flex flex-wrap gap-2">{SEASONS.map((s) => <Chip key={s} active={v.seasons.includes(s)} onClick={() => setV({ ...v, seasons: v.seasons.includes(s) ? v.seasons.filter((x) => x !== s) : [...v.seasons, s] })}>{s}</Chip>)}</div>
      <Button variant="primary" className="w-full" disabled={!v.name} onClick={() => onDone(v)}>Save</Button>
    </div>
  );
}

function Wardrobe() {
  const wardrobe = useStore((s) => s.data.wardrobe);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const [edit, setEdit] = useState<WardrobeItem | null>(null);
  const [view, setView] = useState<'owned' | 'wishlist'>('owned');
  const list = wardrobe.filter((w) => w.status === view);
  const blank: WardrobeItem = { id: uid('wd-'), name: '', category: 'shirt', colour: 'navy', seasons: ['spring', 'summer', 'autumn', 'winter'], formality: 3, status: view };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><Segmented value={view} onChange={setView} options={[{ value: 'owned', label: `Owned (${wardrobe.filter((w) => w.status === 'owned').length})` }, { value: 'wishlist', label: `Wishlist (${wardrobe.filter((w) => w.status === 'wishlist').length})` }]} /><Button variant="primary" onClick={() => setEdit(blank)}><Plus size={14} /> Add</Button></div>
      {list.length === 0 ? <Empty title={view === 'owned' ? 'Your wardrobe is empty here' : 'No wishlist yet'} body="Add pieces you own — the outfit builder and Vinted deal checker use them to spot gaps and duplicates." /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((w) => {
            const cpw = costPerWear(w);
            return (
              <Card key={w.id} className="p-4 sm:p-4">
                <div className="flex items-start gap-3">
                  <Swatch id={w.colour} size={28} />
                  <div className="min-w-0 flex-1">
                    <button type="button" className="text-left font-medium hover:underline" onClick={() => setEdit(w)}>{w.name}</button>
                    <div className="text-xs text-muted">{[w.brand, w.fabric, w.category].filter(Boolean).join(' · ')}{w.demo ? ' · demo' : ''}</div>
                    {w.status === 'owned' && <div className="mt-2 flex items-center gap-2 text-xs"><Button size="sm" onClick={() => upsert('wardrobe', { ...w, wears: (w.wears ?? 0) + 1 })}>Wore it</Button><span className="text-muted">{w.wears ?? 0} wears{cpw ? ` · £${cpw.toFixed(2)}/wear` : ''}</span></div>}
                  </div>
                  <button type="button" aria-label="Delete" onClick={() => remove('wardrobe', w.id)} className="text-muted hover:text-bad"><Trash2 size={14} /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.name || 'New piece'}>{edit && <ItemForm item={edit} onDone={(w) => { upsert('wardrobe', w); setEdit(null); }} />}</Sheet>
    </div>
  );
}

function Capsule() {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const gaps = new Set(wardrobeGaps(data).map((g) => g.id));
  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-ink-2">Twenty-one pieces that combine with each other — the backbone of the look. Tick the ones you own; the rest become your shopping list, in order of how much they would add.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {CAPSULE.map((c) => (
          <Card key={c.id} className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Swatch id={c.colour} size={28} />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2"><div className="font-medium">{c.name}</div>{gaps.has(c.id) ? <Badge>gap</Badge> : <Badge tone="good">owned</Badge>}</div>
                <p className="mt-1 text-sm text-ink-2">{c.why}</p>
                <p className="mt-1 text-xs text-muted"><strong className="font-medium">Look for:</strong> {c.lookFor}</p>
                <p className="mt-1 text-xs text-muted"><strong className="font-medium">Brands:</strong> {c.brands.join(', ')}</p>
                <div className="mt-2 flex gap-2">
                  {gaps.has(c.id) && <Button size="sm" onClick={() => upsert('wardrobe', { id: uid('wd-'), name: c.name, category: c.category, colour: c.colour, fabric: c.fabric, seasons: c.seasons, formality: c.formality, status: 'owned' })}>I own this</Button>}
                  <a href={vintedSearchUrl({ item: c.name })} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-full border border-line-strong px-3 text-sm hover:bg-surface-2">Search Vinted <ExternalLink size={12} /></a>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Guide() {
  return (
    <div className="space-y-6">
      <Card eyebrow="Colour" title="Palettes that always work">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PALETTES.map((p) => (
            <div key={p.name}>
              <div className="flex gap-1">{p.colours.map((c) => <span key={c} className="h-10 flex-1 rounded-lg border border-line" style={{ background: COLOUR_BY_ID[c]?.hex }} title={COLOUR_BY_ID[c]?.label} />)}</div>
              <div className="mt-2 font-medium">{p.name}</div>
              <p className="text-xs text-ink-2">{p.note}</p>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card eyebrow="Fit" title="Proportion for your frame"><ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">{FIT_RULES.map((r, i) => <li key={i}>{r}</li>)}</ul></Card>
        <Card eyebrow="Fabric" title="What to wear when">
          <ul className="space-y-2 text-sm">{FABRICS.map((f) => <li key={f.name}><span className="font-medium">{f.name}</span> <span className="text-muted">· {f.when}</span><div className="text-ink-2">{f.note}</div></li>)}</ul>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LOOKS.map((l) => (
          <Card key={l.name} eyebrow={l.occasion} title={<span className="text-xl">{l.name}</span>}>
            <ul className="list-disc space-y-1 pl-5 text-sm">{l.pieces.map((p) => <li key={p}>{p}</li>)}</ul>
            <p className="mt-2 text-xs text-muted">{l.note}</p>
          </Card>
        ))}
      </div>
      <section>
        <h2 className="mb-3 font-serif text-3xl">Grooming</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {GROOMING.map((g) => (
            <Card key={g.title} title={<span className="text-xl">{g.title}</span>}>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">{g.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
              {g.evidence && <SourceRefs ids={[g.evidence, 'mukherjee2006']} />}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
