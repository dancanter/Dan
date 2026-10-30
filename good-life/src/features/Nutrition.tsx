import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { addDays, formatLong, todayISO } from '@/lib/dates';
import { uid } from '@/lib/id';
import { useStore } from '@/store/store';
import type { MealSlot } from '@/store/types';
import { CATEGORY_LABEL, GLUTEN_LABEL, RNI, type Food, type FoodCategory, type Nutrients } from '@/data/foods';
import { MEALS } from '@/data/meals';
import {
  allFoods, byMeal, dayEntries, DAY_TYPE_LABEL, foodById, GOALS, mealProteinCheck, micronutrientAdequacy, proteinDensity, rankFoods, scale,
  targets, tolerance, totals, type FoodGoal, type Tolerance,
} from '@/engine/nutrition';
import { FoodAdder, MEAL_LABEL } from '@/components/forms';
import { Badge, Button, Card, Chip, Empty, Input, Meter, Note, PageHeader, Provenance, Segmented, Select, Sheet, SourceRefs, Tabs, cx } from '@/components/ui';

type Tab = 'day' | 'foods' | 'meals' | 'goals' | 'guide';

export default function Nutrition() {
  const [tab, setTab] = useState<Tab>('day');
  const [detail, setDetail] = useState<string | null>(null);
  return (
    <div>
      <PageHeader eyebrow="Nutrition" title="Fuel, recover, stay healthy" subtitle="Strictly gluten-free, built around foods you tolerate, with every number treated as the estimate it is." />
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ value: 'day', label: 'Today’s food' }, { value: 'foods', label: 'Food intelligence' }, { value: 'meals', label: 'Meals' }, { value: 'goals', label: 'By goal' }, { value: 'guide', label: 'Absorption & timing' }]} />
      {tab === 'day' && <DayView onFood={setDetail} />}
      {tab === 'foods' && <FoodsView onFood={setDetail} />}
      {tab === 'meals' && <MealsView />}
      {tab === 'goals' && <GoalsView onFood={setDetail} />}
      {tab === 'guide' && <GuideView />}
      <FoodDetail id={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

const TOL_TONE: Record<Tolerance, 'good' | 'bad' | 'neutral'> = { tolerated: 'good', problematic: 'bad', untested: 'neutral' };
const TOL_LABEL: Record<Tolerance, string> = { tolerated: 'Suits you', problematic: 'Causes you problems', untested: 'Untested' };

function MacroRow({ label, value, lo, hi, unit }: { label: string; value: number; lo: number; hi: number; unit: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="tabular text-ink-2">{Math.round(value)} <span className="text-muted">/ {Math.round(lo)}–{Math.round(hi)} {unit}</span></span></div>
      <Meter value={value} max={hi * 1.3} lo={lo} hi={hi} />
    </div>
  );
}

function DayView({ onFood }: { onFood: (id: string) => void }) {
  const data = useStore((s) => s.data);
  const remove = useStore((s) => s.remove);
  const upsert = useStore((s) => s.upsert);
  const [date, setDate] = useState(todayISO());
  const [adding, setAdding] = useState(false);
  const entries = dayEntries(data, date);
  const n = totals(data, entries);
  const t = targets(data, date);
  const micro = micronutrientAdequacy(n);
  const meals = byMeal(entries);
  const proteinMeals = mealProteinCheck(data, entries, t.bodyweightKg);
  const copyYesterday = () => dayEntries(data, addDays(date, -1)).forEach((e) => upsert('food', { ...e, id: uid('f-'), date, demo: undefined }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => setDate(addDays(date, -1))}>←</Button>
        <div className="font-serif text-2xl">{formatLong(date)}</div>
        <Button size="sm" variant="ghost" onClick={() => setDate(addDays(date, 1))} disabled={date >= todayISO()}>→</Button>
        <div className="ml-auto flex gap-2">
          {entries.length === 0 && <Button size="sm" onClick={copyYesterday}>Copy yesterday</Button>}
          <Button size="sm" variant="primary" onClick={() => setAdding(true)}><Plus size={14} /> Add food</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card eyebrow={`Targets · ${DAY_TYPE_LABEL[t.dayType]}`} title={<span className="tabular">{Math.round(n.kcal)} <span className="text-base text-muted">/ {t.energy.lo}–{t.energy.hi} kcal</span></span>} action={<Provenance kind="estimated" />}>
          <div className="space-y-3">
            <MacroRow label="Protein" value={n.protein} lo={t.protein.lo} hi={t.protein.hi} unit="g" />
            <MacroRow label="Carbohydrate" value={n.carbs} lo={t.carbs.lo} hi={t.carbs.hi} unit="g" />
            <MacroRow label="Fat" value={n.fat} lo={t.fat.lo} hi={t.fat.hi} unit="g" />
            <MacroRow label="Fibre" value={n.fibre} lo={t.fibre} hi={45} unit="g" />
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted">{t.rationale.map((r, i) => <li key={i}>{r}</li>)}</ul>
          <p className="mt-2 text-xs text-muted">Totals are built from typical food values (±10–20%) and the weights you enter. Weigh meat, fish and potatoes raw; grains dry.</p>
        </Card>
        <Card eyebrow="Micronutrients" title="Against UK reference intakes" action={<span className="text-xs text-muted">men 19–50</span>}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {micro.map((m) => (
              <div key={m.key}>
                <div className="flex justify-between text-xs"><span>{m.label}</span><span className="tabular text-muted">{m.value < 10 ? m.value.toFixed(1) : Math.round(m.value)} {m.unit}</span></div>
                <Meter value={Math.min(m.pct, 150)} max={150} tone={m.pct >= 100 ? 'good' : m.pct >= 66 ? 'navy' : 'warn'} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Reference intakes cover the needs of most people; athletes may need more iron. Vitamin D from food is rarely enough in UK winters — see Cellular Health → Supplements. EPA+DHA today: {n.epaDha.toFixed(2)} g.</p>
        </Card>
      </div>

      <Card eyebrow="Meals" title="What you ate">
        {entries.length === 0 ? <Empty title="Nothing logged for this day" body="Add foods, or add a whole meal from the Meals tab." action={<Button onClick={() => setAdding(true)}>Add food</Button>} /> : (
          <div className="space-y-4">
            {(Object.keys(MEAL_LABEL) as MealSlot[]).filter((m) => meals[m]).map((m) => {
              const list = meals[m]!;
              const mt = totals(data, list);
              const pm = proteinMeals.find((p) => p.slot === m);
              return (
                <div key={m}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <div className="font-medium">{MEAL_LABEL[m]}</div>
                    <div className="text-xs tabular text-muted">{Math.round(mt.kcal)} kcal · {Math.round(mt.protein)} g P · {Math.round(mt.carbs)} g C {pm && !pm.enough && <Badge tone="warn">protein low</Badge>}</div>
                  </div>
                  <ul className="divide-y divide-line rounded-xl border border-line">
                    {list.map((e) => {
                      const f = foodById(data, e.foodId);
                      return (
                        <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                          <button type="button" className="flex-1 text-left hover:underline" onClick={() => onFood(e.foodId)}>{f?.name ?? e.foodId}</button>
                          <span className="tabular text-muted">{e.grams} g</span>
                          <span className="w-16 text-right tabular text-muted">{f ? Math.round((f.n.kcal * e.grams) / 100) : 0} kcal</span>
                          <button type="button" aria-label="Remove" className="text-muted hover:text-bad" onClick={() => remove('food', e.id)}><Trash2 size={14} /></button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      <Sheet open={adding} onClose={() => setAdding(false)} title="Add food"><FoodAdder date={date} onDone={() => setAdding(false)} /></Sheet>
    </div>
  );
}

type SortKey = 'name' | 'protein-density' | 'leucine' | 'iron' | 'calcium' | 'epaDha' | 'fibre' | 'magnesium' | 'potassium' | 'vitC';
const SORT_LABEL: Record<SortKey, string> = { name: 'Name', 'protein-density': 'Protein per 100 kcal', leucine: 'Leucine', iron: 'Iron', calcium: 'Calcium', epaDha: 'Omega-3 EPA+DHA', fibre: 'Fibre', magnesium: 'Magnesium', potassium: 'Potassium', vitC: 'Vitamin C' };

function FoodsView({ onFood }: { onFood: (id: string) => void }) {
  const data = useStore((s) => s.data);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<FoodCategory | 'all'>('all');
  const [tol, setTol] = useState<Tolerance | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('protein-density');
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const metric = (f: Food) => (sort === 'protein-density' ? proteinDensity(f) : sort === 'name' ? 0 : (f.n[sort as keyof Nutrients] ?? 0));
    return allFoods(data)
      .filter((f) => (!s || f.name.toLowerCase().includes(s) || f.notes.join(' ').toLowerCase().includes(s)) && (cat === 'all' || f.category === cat) && (tol === 'all' || tolerance(data, f.id) === tol))
      .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : metric(b) - metric(a)));
  }, [data, q, cat, tol, sort]);
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods and notes — ‘iron’, ‘phytate’, ‘salmon’…" />
        <Select value={cat} onChange={(e) => setCat(e.target.value as FoodCategory | 'all')}><option value="all">All categories</option>{Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>{Object.entries(SORT_LABEL).map(([k, v]) => <option key={k} value={k}>Sort: {v}</option>)}</Select>
      </div>
      <Segmented<Tolerance | 'all'> size="sm" value={tol} onChange={setTol} options={[{ value: 'all', label: 'All' }, { value: 'tolerated', label: 'Suits you' }, { value: 'untested', label: 'Untested' }, { value: 'problematic', label: 'Problems' }]} />
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[40rem] text-sm tabular">
          <thead className="text-left text-xs text-muted"><tr className="border-b border-line"><th className="px-3 py-2 font-medium">Food (per 100 g)</th><th className="font-medium">kcal</th><th className="font-medium">Protein</th><th className="font-medium">P/100 kcal</th><th className="font-medium">{sort !== 'name' && sort !== 'protein-density' ? SORT_LABEL[sort] : 'Carbs'}</th><th className="pr-3 font-medium">For you</th></tr></thead>
          <tbody>
            {list.map((f) => {
              const tl = tolerance(data, f.id);
              const col = sort !== 'name' && sort !== 'protein-density' ? f.n[sort as keyof Nutrients] ?? 0 : f.n.carbs;
              return (
                <tr key={f.id} className="cursor-pointer border-t border-line hover:bg-surface-2" onClick={() => onFood(f.id)}>
                  <td className="px-3 py-2"><div className="font-medium">{f.name}</div><div className="text-[11px] text-muted">{f.basis}{f.gluten !== 'naturally-gf' ? ` · ${GLUTEN_LABEL[f.gluten]}` : ''}</div></td>
                  <td>{f.n.kcal}</td>
                  <td>{f.n.protein.toFixed(1)} g</td>
                  <td>{proteinDensity(f).toFixed(1)} g</td>
                  <td>{col < 10 ? col.toFixed(2) : Math.round(col)}</td>
                  <td className="pr-3"><Badge tone={TOL_TONE[tl]}>{TOL_LABEL[tl]}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">{list.length} foods. Values compiled from USDA FoodData Central with UK labelling conventions (carbohydrate excludes fibre). Leucine is estimated from protein type. Tap a food for bioavailability notes and to set whether it suits you.</p>
    </div>
  );
}

function FoodDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const data = useStore((s) => s.data);
  const setTolerance = useStore((s) => s.setTolerance);
  const [adding, setAdding] = useState(false);
  const f = id ? foodById(data, id) : undefined;
  if (!f) return null;
  const portion = scale(f.n, f.portion.g);
  const tl = tolerance(data, f.id);
  const rows: [string, keyof Nutrients, string][] = [
    ['Energy', 'kcal', 'kcal'], ['Protein', 'protein', 'g'], ['Leucine (est.)', 'leucine', 'g'], ['Carbohydrate', 'carbs', 'g'], ['Fibre', 'fibre', 'g'], ['Fat', 'fat', 'g'], ['Saturated fat', 'satFat', 'g'],
    ['Omega-3 EPA+DHA', 'epaDha', 'g'], ['Omega-3 ALA', 'ala', 'g'], ['Iron', 'iron', 'mg'], ['Zinc', 'zinc', 'mg'], ['Calcium', 'calcium', 'mg'], ['Magnesium', 'magnesium', 'mg'], ['Potassium', 'potassium', 'mg'],
    ['Selenium', 'selenium', 'µg'], ['Vitamin D', 'vitD', 'µg'], ['Vitamin B12', 'b12', 'µg'], ['Folate', 'folate', 'µg'], ['Vitamin C', 'vitC', 'mg'], ['Vitamin A', 'vitA', 'µg'], ['Vitamin E', 'vitE', 'mg'], ['Vitamin K', 'vitK', 'µg'],
  ];
  return (
    <Sheet open={!!id} onClose={onClose} title={f.name} wide>
      {adding ? <FoodAdder initialFoodId={f.id} onDone={() => { setAdding(false); onClose(); }} /> : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone={f.gluten === 'naturally-gf' ? 'good' : 'warn'}>{GLUTEN_LABEL[f.gluten]}</Badge>
            {f.proteinQuality && <Badge>Protein quality: {f.proteinQuality}{f.limitingAminoAcid ? ` (limiting: ${f.limitingAminoAcid})` : ''}</Badge>}
            {f.ironType && <Badge>Iron: {f.ironType}</Badge>}
            {f.gi && <Badge>GI: {f.gi}</Badge>}
            {f.polyphenols && <Badge tone="good">Polyphenols: {f.polyphenols}</Badge>}
          </div>
          <div>
            <div className="mb-1.5 text-sm font-medium">Does it suit you?</div>
            <Segmented<Tolerance> value={tl} onChange={(v) => setTolerance(f.id, v)} options={[{ value: 'tolerated', label: 'Suits me' }, { value: 'untested', label: 'Not sure' }, { value: 'problematic', label: 'Causes problems' }]} />
          </div>
          {f.caution && <Note tone="warn">{f.caution}</Note>}
          {f.gut && <Note>{f.gut}</Note>}
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">{f.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
          <table className="w-full text-sm tabular">
            <thead className="text-left text-xs text-muted"><tr><th className="font-medium">Nutrient</th><th className="font-medium">per 100 g {f.basis}</th><th className="font-medium">per {f.portion.label}</th><th className="font-medium">% UK RNI (portion)</th></tr></thead>
            <tbody>
              {rows.filter(([, k]) => (f.n[k] ?? 0) > 0).map(([label, k, u]) => {
                const rni = RNI[k];
                return (
                  <tr key={k} className="border-t border-line">
                    <td className="py-1">{label}</td>
                    <td>{(f.n[k] ?? 0) < 10 ? (f.n[k] ?? 0).toFixed(2) : Math.round(f.n[k] ?? 0)} {u}</td>
                    <td>{(portion[k] ?? 0) < 10 ? (portion[k] ?? 0).toFixed(2) : Math.round(portion[k] ?? 0)} {u}</td>
                    <td className="text-muted">{rni ? `${Math.round(((portion[k] ?? 0) / rni.value) * 100)}%` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-muted">Typical values; individual foods vary 10–20% or more (feed, season, variety, brand). Zero means not significant or not recorded.</p>
          <Button variant="primary" onClick={() => setAdding(true)}><Plus size={14} /> Add to today</Button>
        </div>
      )}
    </Sheet>
  );
}

function MealsView() {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const [added, setAdded] = useState<string | null>(null);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {MEALS.map((m) => {
        const n = totals(data, m.items);
        const issues = m.items.filter((it) => tolerance(data, it.foodId) === 'problematic');
        return (
          <Card key={m.id} eyebrow={`${MEAL_LABEL[m.slot]} · ${m.when}`} title={<span className="text-xl">{m.name}</span>}>
            <div className="mb-2 flex flex-wrap gap-3 text-sm tabular"><span>{Math.round(n.kcal)} kcal</span><span>{Math.round(n.protein)} g protein</span><span>{Math.round(n.carbs)} g carbs</span><span>{Math.round(n.fat)} g fat</span><span>{Math.round(n.fibre)} g fibre</span></div>
            <ul className="mb-3 text-sm text-ink-2">{m.items.map((it) => <li key={it.foodId}>{foodById(data, it.foodId)?.name} — {it.grams} g</li>)}</ul>
            <p className="text-sm">{m.why}</p>
            {issues.length > 0 && <Note tone="warn">Contains something you marked as a problem: {issues.map((i) => foodById(data, i.foodId)?.name).join(', ')}.</Note>}
            <Button size="sm" className="mt-3" onClick={() => { m.items.forEach((it) => upsert('food', { id: uid('f-'), date: todayISO(), meal: m.slot, foodId: it.foodId, grams: it.grams })); setAdded(m.id); }}>{added === m.id ? 'Added ✓' : 'Add to today'}</Button>
          </Card>
        );
      })}
    </div>
  );
}

function GoalsView({ onFood }: { onFood: (id: string) => void }) {
  const data = useStore((s) => s.data);
  const [goal, setGoal] = useState<FoodGoal>('muscle');
  const def = GOALS.find((g) => g.id === goal)!;
  const ranked = rankFoods(data, goal, 12);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{GOALS.map((g) => <Chip key={g.id} active={goal === g.id} onClick={() => setGoal(g.id)}>{g.label}</Chip>)}</div>
      <Card eyebrow="Evidence-led, not miracle foods" title={def.label}>
        <p className="text-ink-2">{def.summary}</p>
        <Note>{def.evidence}</Note>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {ranked.map((r, i) => (
            <li key={r.food.id}>
              <button type="button" onClick={() => onFood(r.food.id)} className="flex w-full items-center justify-between rounded-xl border border-line px-3 py-2 text-left text-sm hover:bg-surface-2">
                <span><span className="mr-2 text-muted tabular">{i + 1}</span>{r.food.name}</span>
                <Badge tone={TOL_TONE[r.tolerance]}>{TOL_LABEL[r.tolerance]}</Badge>
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted">Ranked per typical portion against reference intakes, weighted for this goal; foods you marked as causing problems are excluded. A ranking of nutrient content, not a verdict on any single food — the evidence is for patterns.</p>
      </Card>
    </div>
  );
}

const INTERACTIONS: { title: string; body: string; sources?: string[] }[] = [
  { title: 'Vitamin C + plant (non-haem) iron', body: 'Vitamin C in the same meal can multiply non-haem iron absorption several-fold and counteract phytate. Berries with oats; peppers with quinoa or spinach.', sources: ['hallberg1989', 'hurrell2010'] },
  { title: 'Phytate and polyphenols reduce iron and zinc', body: 'Phytate (oats, grains, nuts, legumes) and the polyphenols in tea and coffee bind minerals. Soaking, fermenting (e.g. oats in kefir) and sprouting reduce phytate. Keep coffee and tea an hour away from iron-rich meals.', sources: ['hallberg1989'] },
  { title: 'Haem iron and the “meat factor”', body: 'Haem iron from meat and fish is absorbed far better than plant iron, and meat in a meal increases absorption of plant iron eaten with it.', sources: ['hurrell2010'] },
  { title: 'Calcium and iron compete', body: 'Large calcium doses in the same meal can reduce iron absorption. Over a whole diet the effect is modest; only worth separating if iron status is low.' },
  { title: 'Fat-soluble vitamins need fat', body: 'Vitamins A, D, E and K and carotenoids are absorbed with fat. Olive oil on vegetables, avocado in a salad, eggs with spinach.', sources: ['unlu2005'] },
  { title: 'Cooked can beat raw', body: 'Lycopene is more available from cooked tomato with oil; carrot beta-carotene from cooked carrots; egg protein is about twice as digestible cooked as raw.', sources: ['gartner1997', 'evenepoel1998'] },
  { title: 'Water-soluble vitamins leach', body: 'Boiling loses vitamin C and folate into the water. Steam, microwave, or roast; or use the cooking water.' },
  { title: 'Vitamin D and calcium work together', body: 'Vitamin D is needed for active calcium absorption in the gut. In UK winter, food alone rarely supplies enough vitamin D.', sources: ['sacn2016'] },
  { title: 'Protein quality and leucine', body: 'Animal and dairy proteins are rich in leucine and highly digestible. Plant proteins work, but need larger portions or combinations. ~0.3–0.4 g/kg of quality protein per meal is a practical target.', sources: ['moore2009', 'morton2018', 'trommelen2023'] },
  { title: 'Selenium has a narrow window', body: 'One or two Brazil nuts meet daily needs; regularly eating many can exceed safe upper limits.' },
];

function GuideView() {
  return (
    <div className="space-y-6">
      <Card eyebrow="Around training" title="Meal timing">
        <div className="grid gap-4 text-sm md:grid-cols-3">
          <div><div className="mb-1 font-medium">Before quality sessions</div><p className="text-ink-2">A carbohydrate-led meal 2–4 h before (≈1–2 g/kg carbs), low in fat and fibre so it sits easily. Optional top-up of 20–40 g fast carbohydrate 30–60 min before.</p></div>
          <div><div className="mb-1 font-medium">After hard sessions</div><p className="text-ink-2">Protein (~0.3–0.4 g/kg) plus carbohydrate within about 2 hours, especially when the next hard session is within 24 h. A normal meal does this.</p></div>
          <div><div className="mb-1 font-medium">Before sleep</div><p className="text-ink-2">30–40 g casein-rich protein (cottage cheese, Greek yoghurt) supported strength and muscle gains in trained young men.</p></div>
        </div>
        <SourceRefs ids={['kerksick2017', 'burke2011', 'thomas2016', 'snijders2015', 'areta2013']} />
      </Card>

      <Card eyebrow="Coeliac disease" title="Gluten-free is not automatically equivalent">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">
          <li>Gluten-free in UK law means under 20 ppm gluten. “May contain” warnings indicate cross-contact risk.</li>
          <li>UK wheat flour is fortified with calcium, iron, thiamin and niacin by law; most gluten-free breads and flours are not. Gluten-free products are also often lower in fibre and protein and higher in fat and sugar.</li>
          <li>Coeliac disease is associated with lower bone density, and with iron, folate and B12 shortfalls — the reason NICE recommends an annual review with blood tests.</li>
          <li>Most people with coeliac disease tolerate certified gluten-free oats; a minority react to avenin.</li>
          <li>Your best sources of fibre on a gluten-free diet: certified GF oats, potatoes with skins, parsnips, berries, nuts and seeds, buckwheat and quinoa (if tolerated).</li>
        </ul>
        <SourceRefs ids={['nice-ng20', 'nhs-coeliac', 'coeliac-uk']} />
      </Card>

      <Card eyebrow="Gut comfort" title="Why lentils and broccoli may be a problem">
        <p className="text-sm text-ink-2">Lentils, beans and chickpeas are rich in galacto-oligosaccharides (GOS); broccoli and other brassicas contain fermentable carbohydrates and sulphur compounds. Gut bacteria ferment these into gas, which some people feel strongly. It is a tolerance issue, not a nutritional one — and there are good swaps: courgette, green beans, carrots, peppers, pak choi; firm tofu, eggs and fish for protein. If symptoms are frequent despite a strict gluten-free diet, that is worth raising with your GP or a dietitian, since ongoing symptoms in coeliac disease are sometimes due to hidden gluten.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {INTERACTIONS.map((x) => (
          <Card key={x.title} title={<span className="text-xl">{x.title}</span>}>
            <p className="text-sm text-ink-2">{x.body}</p>
            <SourceRefs ids={x.sources} />
          </Card>
        ))}
      </div>
      <p className={cx('text-xs text-muted')}>For medical concerns — persistent gut symptoms, suspected deficiency, unintended weight loss — see your GP or a registered dietitian.</p>
    </div>
  );
}
