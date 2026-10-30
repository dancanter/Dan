import { useMemo, useState } from 'react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { todayISO } from '@/lib/dates';
import { uid } from '@/lib/id';
import { useStore } from '@/store/store';
import type { GarmentCategory } from '@/store/types';
import { BRANDS, CONDITIONS, QUALITY_SIGNALS, type Condition } from '@/data/brands';
import { COLOURS } from '@/data/style';
import { evaluateDeal, vintedSearchUrl, wardrobeGaps, type DealInput, type DealVerdict } from '@/engine/style';
import { Badge, Button, Card, Empty, Field, Input, Note, PageHeader, Select, Tabs } from '@/components/ui';

type Tab = 'search' | 'deal' | 'prices' | 'brands';
const CATS: GarmentCategory[] = ['shirt', 'polo', 'tshirt', 'knitwear', 'trousers', 'shorts', 'jacket', 'outerwear', 'shoes', 'sunglasses', 'watch', 'belt', 'swim', 'accessory'];
const VERDICT_TONE: Record<DealVerdict['verdict'], 'good' | 'navy' | 'warn' | 'bad' | 'neutral'> = { 'genuine-bargain': 'good', fair: 'navy', overpriced: 'warn', pass: 'bad', 'unknown-price': 'neutral' };

export default function Vinted() {
  const [tab, setTab] = useState<Tab>('search');
  return (
    <div>
      <PageHeader eyebrow="Vinted" title="Second-hand, first-rate" subtitle="Find the pieces worth having, judge the price honestly, and skip the ones that only look like bargains." />
      <Note>This app cannot see Vinted listings and never pretends to. It builds searches that open on Vinted itself, helps you judge a listing you have found, and keeps your own record of real prices.</Note>
      <div className="mt-5"><Tabs<Tab> value={tab} onChange={setTab} tabs={[{ value: 'search', label: 'Search builder' }, { value: 'deal', label: 'Is it a bargain?' }, { value: 'prices', label: 'Price notebook' }, { value: 'brands', label: 'Brands & quality' }]} /></div>
      {tab === 'search' && <SearchBuilder />}
      {tab === 'deal' && <DealChecker />}
      {tab === 'prices' && <Prices />}
      {tab === 'brands' && <Brands />}
    </div>
  );
}

function SearchBuilder() {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const [item, setItem] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [max, setMax] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const url = vintedSearchUrl({ item: [item, category && !item.toLowerCase().includes(category) ? category : ''].filter(Boolean).join(' '), brand, size, maxPrice: Number(max) || undefined });
  const gaps = wardrobeGaps(data).slice(0, 6);
  return (
    <div className="space-y-6">
      <Card eyebrow="Build a search" title="What are you hunting for?">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Item"><Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="linen shirt, suede loafers…" /></Field>
          <Field label="Brand"><Input list="brands" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Any" /><datalist id="brands">{BRANDS.map((b) => <option key={b.name} value={b.name} />)}</datalist></Field>
          <Field label="Size"><Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="M, 32R, UK 8…" /></Field>
          <Field label="Max price (£)"><Input inputMode="decimal" value={max} onChange={(e) => setMax(e.target.value)} /></Field>
          <Field label="Preferred condition"><Select value={condition} onChange={(e) => setCondition(e.target.value)}><option value="">Any</option>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Category"><Select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Any</option>{CATS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-navy px-4 text-sm font-medium text-navy-ink hover:opacity-90">Open on Vinted <ExternalLink size={14} /></a>
          <Button disabled={!item && !brand} onClick={() => upsert('vintedSearches', { id: uid('vs-'), item, brand: brand || undefined, size: size || undefined, maxPrice: Number(max) || undefined, condition: condition || undefined, category: category || undefined, created: new Date().toISOString() })}>Save search</Button>
        </div>
        <p className="mt-3 text-xs text-muted">The link carries the search words and maximum price, sorted newest first. Vinted’s own size and condition filters use internal codes, so set those on Vinted once it opens{condition ? ` (you wanted: ${condition})` : ''}.</p>
      </Card>
      {data.vintedSearches.length > 0 && (
        <Card eyebrow="Saved" title="Your searches">
          <ul className="divide-y divide-line">
            {data.vintedSearches.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                <span className="flex-1">{[s.brand, s.item, s.size].filter(Boolean).join(' · ')}{s.maxPrice ? ` · ≤ £${s.maxPrice}` : ''}{s.condition ? ` · ${s.condition}` : ''}</span>
                <a href={vintedSearchUrl(s)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">Open <ExternalLink size={12} /></a>
                <button type="button" aria-label="Delete search" onClick={() => remove('vintedSearches', s.id)} className="text-muted hover:text-bad"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Card eyebrow="From your capsule" title="Gaps worth hunting">
        <div className="flex flex-wrap gap-2">{gaps.map((g) => <a key={g.id} href={vintedSearchUrl({ item: g.name })} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-full border border-line-strong px-3 text-sm hover:bg-surface-2">{g.name} <ExternalLink size={11} /></a>)}</div>
      </Card>
    </div>
  );
}

function DealChecker() {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const [x, setX] = useState<DealInput>({ brand: '', item: '', category: 'shirt', price: 0, postage: 3, condition: 'Very good', fits: 'unsure', authenticityChecked: false, expectedWearsPerYear: 20 });
  const result = useMemo(() => (x.price > 0 ? evaluateDeal(data, x) : null), [data, x]);
  const set = <K extends keyof DealInput>(k: K, v: DealInput[K]) => setX((p) => ({ ...p, [k]: v }));
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Card eyebrow="A listing you found" title="The details">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Brand"><Input list="brands2" value={x.brand} onChange={(e) => set('brand', e.target.value)} /><datalist id="brands2">{BRANDS.map((b) => <option key={b.name} value={b.name} />)}</datalist></Field>
          <Field label="Item"><Input value={x.item} onChange={(e) => set('item', e.target.value)} placeholder="cashmere crewneck" /></Field>
          <Field label="Category"><Select value={x.category} onChange={(e) => set('category', e.target.value as GarmentCategory)}>{CATS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Colour"><Select value={x.colour ?? ''} onChange={(e) => set('colour', e.target.value || undefined)}><option value="">—</option>{COLOURS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</Select></Field>
          <Field label="Price (£)"><Input inputMode="decimal" value={x.price || ''} onChange={(e) => set('price', Number(e.target.value) || 0)} /></Field>
          <Field label="Postage (£)"><Input inputMode="decimal" value={x.postage} onChange={(e) => set('postage', Number(e.target.value) || 0)} /></Field>
          <Field label="Condition"><Select value={x.condition} onChange={(e) => set('condition', e.target.value as Condition)}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Original RRP (£)" hint="From the brand’s site or an old listing"><Input inputMode="decimal" value={x.rrp ?? ''} onChange={(e) => set('rrp', Number(e.target.value) || undefined)} /></Field>
          <Field label="Composition label" className="sm:col-span-2"><Input value={x.composition ?? ''} onChange={(e) => set('composition', e.target.value)} placeholder="100% linen · 70% wool 30% polyester" /></Field>
          <Field label="Will it fit?"><Select value={x.fits} onChange={(e) => set('fits', e.target.value as DealInput['fits'])}><option value="yes">Yes — measurements checked</option><option value="unsure">Not sure</option><option value="no">No</option></Select></Field>
          <Field label="Wears per year (honestly)"><Input inputMode="numeric" value={x.expectedWearsPerYear ?? ''} onChange={(e) => set('expectedWearsPerYear', Number(e.target.value) || undefined)} /></Field>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={x.authenticityChecked} onChange={(e) => set('authenticityChecked', e.target.checked)} /> I’ve seen clear photos of the labels and checked them</label>
      </Card>
      <Card eyebrow="Verdict" title={result ? result.headline : 'Enter a price to see a verdict'}>
        {result && (
          <>
            <Badge tone={VERDICT_TONE[result.verdict]}>{result.verdict.replace(/-/g, ' ')}</Badge>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm tabular">
              <div><div className="text-xs text-muted">Item</div>£{x.price.toFixed(2)}</div>
              <div><div className="text-xs text-muted">Buyer fee</div>£{result.fee.toFixed(2)}</div>
              <div><div className="text-xs text-muted">All-in</div><strong>£{result.total.toFixed(2)}</strong></div>
            </div>
            {result.basis && <p className="mt-2 text-xs text-muted">Fair range basis: {result.basis}</p>}
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-2">{result.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
            {result.costPerWear != null && <p className="mt-3 text-sm">Cost per wear over three years: <strong className="tabular">£{result.costPerWear.toFixed(2)}</strong></p>}
            <Button size="sm" className="mt-4" onClick={() => upsert('priceObservations', { id: uid('po-'), date: todayISO(), brand: x.brand, item: x.item, price: x.price, condition: x.condition, sold: false })}>Record this price in the notebook</Button>
            <p className="mt-3 text-xs text-muted">The buyer-protection fee uses {data.settings.vintedFeePct}% + £{data.settings.vintedFeeFixed.toFixed(2)} (change in Settings) — check the exact figure at checkout.</p>
          </>
        )}
      </Card>
    </div>
  );
}

function Prices() {
  const obs = useStore((s) => s.data.priceObservations);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const [brand, setBrand] = useState('');
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<string>('Very good');
  const [sold, setSold] = useState(true);
  return (
    <div className="space-y-4">
      <Card eyebrow="Real market data" title="Record prices you see">
        <p className="mb-3 text-sm text-ink-2">Sold prices are the truth; asking prices are hopes. Three or more observations for a brand and item and the deal checker uses your data instead of the rule of thumb.</p>
        <div className="grid gap-3 sm:grid-cols-5">
          <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" aria-label="Brand" />
          <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Item" aria-label="Item" />
          <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="£" aria-label="Price" />
          <Select value={condition} onChange={(e) => setCondition(e.target.value)} aria-label="Condition">{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</Select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sold} onChange={(e) => setSold(e.target.checked)} /> Sold</label>
        </div>
        <Button className="mt-3" disabled={!brand || !item || !Number(price)} onClick={() => { upsert('priceObservations', { id: uid('po-'), date: todayISO(), brand, item, price: Number(price), condition, sold }); setPrice(''); }}><Plus size={14} /> Add</Button>
      </Card>
      {obs.length === 0 ? <Empty title="No prices recorded yet" /> : (
        <table className="w-full rounded-2xl border border-line bg-surface text-sm tabular">
          <thead className="text-left text-xs text-muted"><tr><th className="px-3 py-2 font-medium">Date</th><th className="font-medium">Brand</th><th className="font-medium">Item</th><th className="font-medium">Price</th><th className="font-medium">Condition</th><th /></tr></thead>
          <tbody>{[...obs].reverse().map((o) => <tr key={o.id} className="border-t border-line"><td className="px-3 py-1.5 text-muted">{o.date}</td><td>{o.brand}</td><td>{o.item}</td><td>£{o.price}{o.sold ? '' : ' (asking)'}</td><td className="text-muted">{o.condition}</td><td className="pr-3 text-right"><button type="button" aria-label="Delete" onClick={() => remove('priceObservations', o.id)} className="text-muted hover:text-bad"><Trash2 size={13} /></button></td></tr>)}</tbody>
        </table>
      )}
    </div>
  );
}

function Brands() {
  const [q, setQ] = useState('');
  const list = BRANDS.filter((b) => !q || (b.name + b.knownFor).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands" />
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((b) => (
          <Card key={b.name} title={<span className="text-xl">{b.name}</span>} action={<div className="flex gap-1"><Badge tone={b.tier === 'investment' ? 'bronze' : b.tier === 'quality' ? 'navy' : 'neutral'}>{b.tier}</Badge>{b.fakeRisk === 'high' && <Badge tone="warn">often faked</Badge>}</div>}>
            <p className="text-sm">{b.knownFor}</p>
            <p className="mt-2 text-sm text-ink-2"><strong className="font-medium text-ink">Check:</strong> {b.lookFor}</p>
            <p className="mt-2 text-xs text-muted">Resale demand: {b.demand === 'plentiful' ? 'plentiful supply — never pay much' : b.demand}</p>
          </Card>
        ))}
      </div>
      <Card eyebrow="Quality signals" title="How to tell good construction from a good label">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">{QUALITY_SIGNALS.map((q2, i) => <li key={i}>{q2}</li>)}</ul>
      </Card>
    </div>
  );
}
