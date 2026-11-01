import { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import { CATEGORY_LABEL, type Food } from '@/data/foods';
import { MICROS, NUTRIENTS, format, type NKey } from '@/data/nutrients';
import { TAG_INFO } from '@/data/science';
import { bioFactors, scaleNutrients, scoreFood, targetsFor, type Meal } from '@/engine/score';
import { actions, useStore } from '@/store';
import { weightOn } from '@/engine/game';
import { todayISO } from '@/engine/body';
import { Bar, Button, Grade, Pill, Segmented } from './ui';
import { cookedToRaw, cookingYield, yieldNote } from '@/engine/cooking';
import { foodPuff } from '@/engine/puff';
import { defaultUnit, describeQty, unitsFor, type Unit } from '@/data/units';
import { EditToMatch } from './EditToMatch';
import { GAIN_LABEL, swapFor } from '@/data/swaps';

const SOURCE_LABEL: Record<string, string> = {
  library: 'Glow library: hand-checked typical values',
  uk: 'Typical UK values (Glow estimate; brands vary)',
  usda: 'USDA national food database (SR28)',
  custom: 'Your own food',
  openfoodfacts: 'Open Food Facts label data',
};

export const MEALS: { value: Meal; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
];

export function defaultMeal(): Meal {
  const h = new Date().getHours();
  return h < 11 ? 'breakfast' : h < 15 ? 'lunch' : h < 21 ? 'dinner' : 'snacks';
}

export type Qty = { count: number; label: string; plural?: string };

export function FoodDetail({ food, onAdd, date }: { food: Food; date?: string; onAdd?: (grams: number, meal: Meal, qty?: Qty) => void }) {
  const s = useStore((x) => x);
  const t = targetsFor(s.profile, weightOn(s, date ?? todayISO()));
  const sc = scoreFood(food, t);
  const [grams, setGrams] = useState(food.portion.g);
  const [meal, setMeal] = useState<Meal>(defaultMeal());
  const [weighed, setWeighed] = useState<'raw' | 'cooked'>('raw');
  const units = unitsFor(food);
  const [mode, setMode] = useState<'count' | 'grams'>(units.length ? 'count' : 'grams');
  const [unit, setUnit] = useState<Unit | undefined>(defaultUnit(food));
  const [count, setCount] = useState(() => { const u = defaultUnit(food); return u ? Math.max(1, Math.round(food.portion.g / u.g)) : 1; });
  const counting = mode === 'count' && !!unit;
  const yld = counting ? undefined : cookingYield(food);
  const rawGrams = counting ? Math.round(unit!.g * count) : weighed === 'cooked' && yld ? cookedToRaw(food, grams) : grams;
  const puff = foodPuff(food, rawGrams);
  const fav = s.favourites.includes(food.id);
  const factors = bioFactors(food);
  const portion = scaleNutrients(food.n, rawGrams);
  const effPortion: Record<string, number> = { ...portion };
  for (const [k, v] of Object.entries(factors)) effPortion[k] = portion[k as NKey] * (v as number);
  const glutenClash = s.profile.glutenFree && food.tags.includes('gluten');

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Grade grade={sc.grade} score={sc.score} big />
        <div className="flex-1">
          <div className="num text-sm text-ink-2"><b className="text-ink">{sc.score}/100</b> optimisation score</div>
          <div className="text-xs text-muted">{CATEGORY_LABEL[food.category]} · NOVA {food.nova} · per 100 g {food.category === 'drinks' ? '(100 ml)' : 'raw'}: {Math.round(food.n.kcal)} kcal</div>
          <div className="mt-1 text-[11px] text-muted">{SOURCE_LABEL[food.source ?? 'library']}</div>
          {food.limitedData && <div className="mt-1"><Pill tone="warn">Limited data: label macros only</Pill></div>}
        </div>
        <button onClick={() => actions.toggleFavourite(food.id)} aria-label={fav ? 'Remove from favourites' : 'Add to favourites'} className="rounded-full p-2 hover:bg-surface-2">
          <Heart size={20} fill={fav ? 'var(--bad)' : 'none'} color={fav ? 'var(--bad)' : 'currentColor'} />
        </button>
      </div>

      {glutenClash && <div className="rounded-xl bg-bad-soft p-3 text-sm text-bad">Contains gluten, and you have gluten-free mode on.</div>}
      {food.note && <p className="text-sm leading-relaxed text-ink-2">{food.note}</p>}

      {(() => {
        const sw = swapFor(food);
        if (!sw) return null;
        return (
          <div className={`rounded-xl p-3 text-sm ${sw.gain === 'big' ? 'bg-gold-soft' : 'bg-surface-2'}`}>
            <div className="mb-1 flex flex-wrap items-center gap-2"><b>Better swap?</b><Pill tone={sw.gain === 'big' ? 'gold' : sw.gain === 'medium' ? 'sea' : 'neutral'}>{GAIN_LABEL[sw.gain]}</Pill></div>
            <div className="mb-1 font-medium">{sw.targets.map((t) => t.name.split(/ \(/)[0].trim()).join(' · ')}</div>
            <p className="leading-relaxed text-ink-2">{sw.why}</p>
            {sw.keep && <p className="mt-1 text-xs text-muted">{sw.keep}</p>}
          </div>
        );
      })()}

      <div className="grid grid-cols-2 gap-2">
        {([['Face puffiness', puff.face, puff.faceWhy], ['Gut bloat', puff.gut, puff.gutWhy]] as const).map(([label, lvl, why]) => (
          <div key={label} className={`rounded-xl p-2.5 text-xs ${lvl === 'high' ? 'bg-bad-soft' : lvl === 'medium' ? 'bg-warn-soft' : 'bg-good-soft'}`}>
            <div className="font-semibold">{label}: <span className={lvl === 'high' ? 'text-bad' : lvl === 'medium' ? 'text-warn' : 'text-good'}>{lvl}</span></div>
            <div className="mt-0.5 leading-snug text-ink-2">{why}</div>
          </div>
        ))}
      </div>

      {sc.stars.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">What a {food.portion.label} portion does for you</h3>
          <ul className="space-y-2">
            {sc.stars.map((st) => (
              <li key={st.key} className="text-sm">
                <div className="flex items-baseline justify-between gap-2"><span className="font-medium">{NUTRIENTS[st.key].label}</span><span className="num text-xs text-muted">{st.pct}% of your target</span></div>
                <div className="text-xs leading-relaxed text-ink-2">{NUTRIENTS[st.key].glow ? `${NUTRIENTS[st.key].glow} ` : ''}{NUTRIENTS[st.key].does}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {food.tags.some((tg) => TAG_INFO[tg]) && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Compounds & bioavailability</h3>
          <ul className="space-y-1.5">
            {food.tags.filter((tg) => TAG_INFO[tg]).map((tg) => (
              <li key={tg} className="flex gap-2 text-xs leading-relaxed">
                <Pill tone={TAG_INFO[tg]!.good ? 'good' : 'warn'}>{TAG_INFO[tg]!.label}</Pill>
                <span className="text-ink-2">{TAG_INFO[tg]!.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onAdd && (
        <div className="rounded-2xl bg-surface-2 p-3">
          {units.length > 0 && (
            <div className="mb-3"><Segmented value={mode} onChange={setMode} options={[{ value: 'count', label: 'How many' }, { value: 'grams', label: 'Grams' }]} /></div>
          )}
          {counting ? (
            <div className="mb-3 space-y-2">
              {units.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {units.map((u) => (
                    <button key={u.label} onClick={() => setUnit(u)} className={`rounded-lg px-2.5 py-1 text-xs ${unit?.label === u.label ? 'bg-navy text-navy-ink' : 'bg-surface'}`}>{u.label.replace(/ egg$/, '')} · {u.g} g</button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button aria-label="One fewer" onClick={() => setCount(Math.max(0.5, count - 1))} className="grid h-10 w-10 place-items-center rounded-full bg-surface text-xl">−</button>
                <input aria-label="How many" className="field num w-16 text-center text-lg" inputMode="decimal" value={count} onChange={(e) => setCount(Number(e.target.value.replace(/[^\d.]/g, '')) || 0)} />
                <button aria-label="One more" onClick={() => setCount(count + 1)} className="grid h-10 w-10 place-items-center rounded-full bg-surface text-xl">+</button>
                <div className="text-sm"><b>{describeQty(count, unit!)}</b><div className="num text-xs text-muted">= {rawGrams} g{unit!.label.includes('egg') ? ' to eat (shell off)' : ''}</div></div>
              </div>
            </div>
          ) : (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {[food.portion.g, 50, 100, 150, 200].filter((v, i, a) => a.indexOf(v) === i).map((g) => (
                <button key={g} onClick={() => setGrams(g)} className={`rounded-lg px-2.5 py-1 text-xs ${grams === g ? 'bg-navy text-navy-ink' : 'bg-surface'}`}>{g === food.portion.g ? food.portion.label : `${g} g`}</button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            {!counting && (
              <label className="flex flex-1 items-center gap-2">
                <span className="sr-only">Grams</span>
                <input className="field num" inputMode="decimal" value={grams} onChange={(e) => setGrams(Number(e.target.value.replace(/[^\d.]/g, '')) || 0)} />
                <span className="text-sm text-muted">g {weighed}</span>
              </label>
            )}
            <select className={`field ${counting ? 'flex-1' : 'w-auto'}`} value={meal} onChange={(e) => setMeal(e.target.value as Meal)} aria-label="Meal">
              {MEALS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <Button onClick={() => rawGrams > 0 && onAdd(rawGrams, meal, counting ? { count, label: unit!.label, plural: unit!.plural } : undefined)} disabled={rawGrams <= 0}><Plus size={16} />Add</Button>
          </div>
          {yld && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              <Segmented value={weighed} onChange={setWeighed} options={[{ value: 'raw', label: 'Weighed raw' }, { value: 'cooked', label: 'Weighed cooked' }]} />
              {weighed === 'cooked' && <span>≈ <b className="num text-ink">{rawGrams} g raw</b>. {yieldNote(food)}</span>}
            </div>
          )}
        </div>
      )}

      <EditToMatch food={food} />

      <div>
        <h3 className="mb-2 text-sm font-semibold">In {rawGrams} g {yld ? (food.category === 'grains' || food.category === 'legumes' ? 'dry' : 'raw') : ''}</h3>
        <div className="mb-3 grid grid-cols-4 gap-2 text-center">
          {(['kcal', 'protein', 'carbs', 'fat'] as NKey[]).map((k) => (
            <div key={k} className="rounded-xl bg-surface-2 p-2">
              <div className="num font-serif text-lg">{Math.round(portion[k])}</div>
              <div className="text-[10px] text-muted uppercase">{({ kcal: 'kcal', protein: 'protein g', carbs: 'carbs g', fat: 'fat g' } as Record<string, string>)[k]}</div>
            </div>
          ))}
        </div>
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
          <span>Fibre {portion.fibre.toFixed(1)} g</span>
          <span>Sugars {portion.sugar.toFixed(1)} g</span>
          <span>Sat fat {portion.satFat.toFixed(1)} g</span>
          <span>Omega-3 {food.unknown?.includes('omega3') ? 'not recorded' : `${portion.omega3.toFixed(2)} g`}</span>
          <span>Sodium {Math.round(portion.sodium)} mg</span>
        </div>
        {!food.limitedData && (
          <ul className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2">
            {MICROS.map((k) => {
              const pct = (effPortion[k] / t[k]) * 100;
              if (food.unknown?.includes(k)) return (
                <li key={k} className="text-xs"><div className="mb-0.5 flex justify-between gap-2"><span>{NUTRIENTS[k].label}</span><span className="text-muted">not recorded</span></div><Bar value={0} height={5} /></li>
              );
              return (
                <li key={k} className="text-xs">
                  <div className="mb-0.5 flex justify-between gap-2">
                    <span>{NUTRIENTS[k].label}{factors[k] !== undefined && factors[k] !== 1 && <span className="text-muted"> · {factors[k]! > 1 ? 'absorbs well' : 'absorbs poorly'}</span>}</span>
                    <span className="num text-muted">{format(k, portion[k])} · {Math.round(pct)}%</span>
                  </div>
                  <Bar value={pct} height={5} />
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-muted">Percentages are of your personal target and adjusted for bioavailability. Values are typical figures (±10–20%).</p>
      </div>
    </div>
  );
}
