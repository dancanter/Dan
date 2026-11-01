import { useMemo, useRef, useState } from 'react';
import { Globe, PencilLine, Search, Sparkles, Trash2 } from 'lucide-react';
import { FOODS, type Food } from '@/data/foods';
import { NUTRIENT_KEYS, type Nutrients } from '@/data/nutrients';
import { parseEntry, searchFoods, type ParsedItem } from '@/engine/parse';
import { searchOpenFoodFacts } from '@/engine/off';
import { scoreFood, type Meal } from '@/engine/score';
import { actions, useStore } from '@/store';
import { Button, Grade, Segmented, Sheet } from './ui';
import { FoodDetail, MEALS, defaultMeal } from './FoodDetail';

export function AddFood({ open, onClose, date }: { open: boolean; onClose: () => void; date: string }) {
  const [mode, setMode] = useState<'type' | 'search' | 'online' | 'custom'>('type');
  const [picked, setPicked] = useState<Food | null>(null);

  const add = (food: Food, grams: number, meal: Meal) => {
    actions.addItem(date, food, grams, meal);
    setPicked(null);
  };

  return (
    <Sheet open={open} onClose={() => { setPicked(null); onClose(); }} title={picked ? picked.name : 'What did you have?'}>
      {picked ? (
        <>
          <button className="mb-3 text-sm text-sea" onClick={() => setPicked(null)}>← Back</button>
          <FoodDetail food={picked} date={date} onAdd={(g, m) => add(picked, g, m)} />
        </>
      ) : (
        <>
          <div className="mb-4 overflow-x-auto">
            <Segmented value={mode} onChange={setMode} options={[
              { value: 'type', label: 'Type it' },
              { value: 'search', label: 'Library' },
              { value: 'online', label: 'Online' },
              { value: 'custom', label: 'Custom' },
            ]} />
          </div>
          {mode === 'type' && <TypeIt date={date} onDone={onClose} />}
          {mode === 'search' && <LibrarySearch onPick={setPicked} />}
          {mode === 'online' && <OnlineSearch onPick={setPicked} />}
          {mode === 'custom' && <CustomFood onSaved={setPicked} />}
        </>
      )}
    </Sheet>
  );
}

function TypeIt({ date, onDone }: { date: string; onDone: () => void }) {
  const custom = useStore((s) => s.customFoods);
  const all = useMemo(() => [...FOODS, ...custom], [custom]);
  const [text, setText] = useState('');
  const [meal, setMeal] = useState<Meal>(defaultMeal());
  const [items, setItems] = useState<ParsedItem[]>([]);

  const parse = (v: string) => {
    setText(v);
    setItems(parseEntry(v, all));
  };
  const ready = items.filter((i) => i.food && i.grams);
  return (
    <div className="space-y-3">
      <label className="block text-sm text-ink-2" htmlFor="type-it">Write it how you’d say it, using raw weights where you know them.</label>
      <textarea id="type-it" className="field min-h-24" placeholder="3 eggs, 150g wild salmon, handful blueberries, 1 brazil nut, 200ml kefir" value={text} onChange={(e) => parse(e.target.value)} />
      {items.length > 0 && (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2 p-2.5 text-sm">
              {it.food ? (
                <>
                  <Grade grade={scoreFood(it.food).grade} score={scoreFood(it.food).score} />
                  <select className="min-w-0 flex-1 truncate bg-transparent" value={it.food.id} aria-label="Food" onChange={(e) => {
                    const f = all.find((x) => x.id === e.target.value)!;
                    setItems(items.map((x, j) => (j === i ? { ...x, food: f } : x)));
                  }}>
                    {[it.food, ...searchFoods(it.text.replace(/[\d.]+\s*(g|ml)?/g, ''), all, 8).filter((f) => f.id !== it.food!.id)].map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <input className="field num w-20 py-1" aria-label="Grams" inputMode="decimal" value={it.grams ?? ''} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, grams: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 } : x)))} />
                  <span className="text-xs text-muted">g</span>
                </>
              ) : (
                <span className="text-muted">“{it.text}”: no match yet. Try the Online or Custom tab.</span>
              )}
              <button aria-label="Remove" className="p-1 text-muted" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 size={15} /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <select className="field w-auto" value={meal} onChange={(e) => setMeal(e.target.value as Meal)} aria-label="Meal">
          {MEALS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <Button className="flex-1" disabled={!ready.length} onClick={() => {
          ready.forEach((i) => actions.addItem(date, i.food!, i.grams!, meal));
          setText('');
          setItems([]);
          onDone();
        }}><Sparkles size={16} />Add {ready.length || ''} {ready.length === 1 ? 'food' : 'foods'}</Button>
      </div>
    </div>
  );
}

function FoodRow({ f, onPick }: { f: Food; onPick: (f: Food) => void }) {
  const sc = scoreFood(f);
  return (
    <li>
      <button onClick={() => onPick(f)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-surface-2">
        <Grade grade={sc.grade} score={sc.score} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{f.name}</span>
          <span className="block text-xs text-muted">{Math.round(f.n.kcal)} kcal · {f.n.protein.toFixed(1)} g protein per 100 g</span>
        </span>
      </button>
    </li>
  );
}

function LibrarySearch({ onPick }: { onPick: (f: Food) => void }) {
  const s = useStore((x) => x);
  const all = useMemo(() => [...FOODS, ...s.customFoods], [s.customFoods]);
  const [q, setQ] = useState('');
  const results = q ? searchFoods(q, all) : all.filter((f) => s.favourites.includes(f.id)).concat(s.customFoods.filter((f) => !s.favourites.includes(f.id))).slice(0, 30);
  return (
    <div>
      <div className="relative mb-3">
        <Search size={16} className="absolute top-3 left-3 text-muted" />
        <input autoFocus className="field pl-9" placeholder={`Search ${all.length} foods`} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {!q && <p className="mb-2 text-xs text-muted">{results.length ? 'Your favourites and custom foods' : 'Start typing, or tap the heart on any food to pin it here.'}</p>}
      <ul>{results.map((f) => <FoodRow key={f.id} f={f} onPick={onPick} />)}</ul>
      {q && !results.length && <p className="text-sm text-muted">Nothing in the library. Try the Online tab (3 million+ products) or make a Custom food.</p>}
    </div>
  );
}

function OnlineSearch({ onPick }: { onPick: (f: Food) => void }) {
  const [q, setQ] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [results, setResults] = useState<Food[]>([]);
  const ctrl = useRef<AbortController | null>(null);
  const run = async () => {
    if (!q.trim()) return;
    ctrl.current?.abort();
    ctrl.current = new AbortController();
    setState('loading');
    try {
      setResults(await searchOpenFoodFacts(q, ctrl.current.signal));
      setState('idle');
    } catch {
      setState('error');
    }
  };
  return (
    <div>
      <form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); void run(); }}>
        <input className="field" placeholder="e.g. Fage Total, Graze, M&S houmous" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button type="submit"><Globe size={16} />Search</Button>
      </form>
      <p className="mb-2 text-xs text-muted">Searches Open Food Facts, a free open database of packaged foods. Only your search words are sent. Packaged foods usually list macros but not vitamins and minerals, so they’re scored on processing, protein, fibre and sugar.</p>
      {state === 'loading' && <p className="text-sm text-muted">Searching…</p>}
      {state === 'error' && <p className="text-sm text-bad">Couldn’t reach Open Food Facts. Check your connection, or add it as a Custom food.</p>}
      <ul>{results.map((f) => <FoodRow key={f.id} f={f} onPick={onPick} />)}</ul>
    </div>
  );
}

function CustomFood({ onSaved }: { onSaved: (f: Food) => void }) {
  const [name, setName] = useState('');
  const [nova, setNova] = useState<Food['nova']>(1);
  const [v, setV] = useState<Record<string, string>>({});
  const fields: [keyof Nutrients, string][] = [['kcal', 'kcal'], ['protein', 'Protein g'], ['carbs', 'Carbs g'], ['fibre', 'Fibre g'], ['sugar', 'Sugars g'], ['fat', 'Fat g'], ['satFat', 'Sat fat g'], ['sodium', 'Sodium mg']];
  const save = () => {
    const n = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, Number(v[k]) || 0])) as Nutrients;
    const food: Food = {
      id: `custom-${Date.now().toString(36)}`, name: name.trim(), category: nova === 4 ? 'treats' : 'grains', nova,
      portion: { g: 100, label: '100 g' }, n, tags: nova === 4 ? ['upf'] : [], source: 'custom', limitedData: true,
      note: 'Your own food. Only the values you entered are known.',
    };
    actions.saveCustomFood(food);
    onSaved(food);
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-2">Copy the per-100 g values from the label.</p>
      <input className="field" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        {fields.map(([k, label]) => (
          <label key={k} className="text-xs text-muted">{label}
            <input className="field num mt-1" inputMode="decimal" value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
          </label>
        ))}
      </div>
      <label className="block text-xs text-muted">How processed is it?
        <select className="field mt-1" value={nova} onChange={(e) => setNova(Number(e.target.value) as Food['nova'])}>
          <option value={1}>Whole or minimally processed (NOVA 1)</option>
          <option value={2}>Culinary ingredient: oil, butter, sugar (NOVA 2)</option>
          <option value={3}>Processed: cheese, tinned fish, fresh bread (NOVA 3)</option>
          <option value={4}>Ultra-processed: industrial ingredients you wouldn’t cook with (NOVA 4)</option>
        </select>
      </label>
      <Button className="w-full" disabled={!name.trim() || !v.kcal} onClick={save}><PencilLine size={16} />Save food</Button>
    </div>
  );
}
