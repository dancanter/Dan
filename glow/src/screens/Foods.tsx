import { isAvoided } from '@/data/avoid';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ALL_FOODS, CATEGORY_LABEL, FOODS, type Category, type Food } from '@/data/foods';
import { NUTRIENTS, type NKey } from '@/data/nutrients';
import { searchFoods } from '@/engine/parse';
import { scoreFood } from '@/engine/score';
import { actions, useStore } from '@/store';
import { FoodDetail } from '@/components/FoodDetail';
import { AddFood } from '@/components/AddFood';
import { Card, Grade, Pill, Sheet } from '@/components/ui';
import { inClaude } from '@/cloud';

type Sort = 'score' | NKey;
const SORTS: { value: Sort; label: string }[] = [
  { value: 'score', label: 'Optimisation score' },
  { value: 'protein', label: 'Protein per 100 kcal' },
  { value: 'omega3', label: 'Omega-3' },
  { value: 'fibre', label: 'Fibre' },
  { value: 'zinc', label: 'Zinc' },
  { value: 'iron', label: 'Iron' },
  { value: 'selenium', label: 'Selenium' },
  { value: 'vitC', label: 'Vitamin C' },
  { value: 'vitA', label: 'Vitamin A' },
  { value: 'vitD', label: 'Vitamin D' },
  { value: 'b12', label: 'B12' },
  { value: 'folate', label: 'Folate' },
  { value: 'magnesium', label: 'Magnesium' },
  { value: 'choline', label: 'Choline' },
  { value: 'iodine', label: 'Iodine' },
];

export function Foods({ date }: { date: string }) {
  const s = useStore((x) => x);
  const all = useMemo(() => [...s.customFoods, ...ALL_FOODS], [s.customFoods]);
  const [source, setSource] = useState<'all' | 'glow'>('glow');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category | 'all' | 'fav'>('all');
  const [sort, setSort] = useState<Sort>('score');
  const [gf, setGf] = useState(s.profile.glutenFree);
  const [picked, setPicked] = useState<Food | null>(null);
  const [online, setOnline] = useState(false);

  const scored = useMemo(() => new Map(all.map((f) => [f.id, scoreFood(f)])), [all]);
  let list = q ? searchFoods(q, all, 400) : source === 'glow' ? all.filter((f) => f.source !== 'usda') : all;
  if (cat === 'fav') list = list.filter((f) => s.favourites.includes(f.id));
  else if (cat !== 'all') list = list.filter((f) => f.category === cat);
  if (gf) list = list.filter((f) => !f.tags.includes('gluten'));
  const metric = (f: Food) =>
    sort === 'score' ? scored.get(f.id)!.score : sort === 'protein' ? (f.n.protein / Math.max(f.n.kcal, 1)) * 100 : (f.n[sort] / Math.max(f.n.kcal, 20)) * 100;
  if (!q || sort !== 'score') list = [...list].sort((a, b) => metric(b) - metric(a));
  // Foods on Dan's avoid list sink to the bottom of every ranking (searching still finds them).
  if (!q) list = [...list.filter((f) => !isAvoided(f)), ...list.filter((f) => isAvoided(f))];
  const total = list.length;
  list = list.slice(0, 200);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Food library</h1>
        <p className="text-sm text-ink-2">{ALL_FOODS.length.toLocaleString('en-GB')} foods, every one scored for how hard its calories work: {FOODS.length} hand-checked Glow foods, UK staples, and the full USDA national food database.</p>
      </div>

      <Card>
        <div className="relative mb-3">
          <Search size={16} className="absolute top-3 left-3 text-muted" />
          <input className="field pl-9" placeholder="Search: oysters, kefir, beef heart…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {(['all', 'fav', ...Object.keys(CATEGORY_LABEL)] as (Category | 'all' | 'fav')[]).map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3 py-1 text-xs ${cat === c ? 'bg-navy text-navy-ink' : 'bg-surface-2 text-ink-2'}`}>
              {c === 'all' ? 'All' : c === 'fav' ? '♥ Favourites' : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">Rank by
            <select className="field w-auto py-1.5" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={gf} onChange={(e) => setGf(e.target.checked)} />Gluten-free only</label>
          {!q && <label className="flex items-center gap-1.5"><input type="checkbox" checked={source === 'all'} onChange={(e) => setSource(e.target.checked ? 'all' : 'glow')} />Include USDA database when browsing</label>}
          {!inClaude() && <button className="text-sea" onClick={() => setOnline(true)}>Search online →</button>}
        </div>
      </Card>

      <ul className="card divide-y divide-line">
        {list.map((f) => {
          const sc = scored.get(f.id)!;
          return (
            <li key={f.id}>
              <button onClick={() => setPicked(f)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-surface-2">
                <Grade grade={sc.grade} score={sc.score} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{f.name}{isAvoided(f) && <span className="ml-1 text-xs text-bad">· avoid</span>}</span>
                  <span className="block truncate text-xs text-muted">
                    {sc.stars.slice(0, 3).map((x) => `${NUTRIENTS[x.key].label} ${x.pct}%`).join(' · ') || `${Math.round(f.n.kcal)} kcal per 100 g`}
                  </span>
                </span>
                {f.tags.includes('gluten') && <Pill tone="warn">gluten</Pill>}
                {s.favourites.includes(f.id) && <span className="text-bad">♥</span>}
              </button>
            </li>
          );
        })}
        {!list.length && <li className="p-4 text-sm text-muted">No foods match. Try fewer words, or add it as a Custom food.</li>}
        {total > list.length && <li className="p-3 text-center text-xs text-muted">Showing the top {list.length} of {total.toLocaleString('en-GB')}. Search or pick a category to narrow it down.</li>}
      </ul>
      <p className="text-xs text-muted">Grades: A+ ≥ 90 · A ≥ 80 · B+ ≥ 70 · B ≥ 60 · C ≥ 50 · D ≥ 35 · F below. The score rewards micronutrients, protein, fibre and omega-3 per calorie (after bioavailability), plus protective compounds, and penalises ultra-processing, free sugar, alcohol, frying and processed meat. Fats and oils score low on density by design, because they’re nearly pure energy. Judge them by type: extra virgin olive oil is the best-evidenced.</p>

      <Sheet open={!!picked} onClose={() => setPicked(null)} title={picked?.name}>
        {picked && <FoodDetail food={picked} date={date} onAdd={(g, m, q) => { actions.addItem(date, picked, g, m, q); setPicked(null); }} />}
      </Sheet>
      <AddFood open={online} onClose={() => setOnline(false)} date={date} />
    </div>
  );
}
