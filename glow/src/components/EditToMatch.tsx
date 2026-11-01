import { useState } from 'react';
import { PencilLine } from 'lucide-react';
import type { Food } from '@/data/foods';
import type { NKey } from '@/data/nutrients';
import { defaultUnit } from '@/data/units';
import { actions, getState, useStore } from '@/store';
import { Button } from './ui';

const FIELDS: [NKey, string][] = [
  ['kcal', 'Energy (kcal)'], ['protein', 'Protein (g)'], ['carbs', 'Carbohydrate (g)'], ['sugar', 'of which sugars (g)'],
  ['fat', 'Fat (g)'], ['satFat', 'of which saturates (g)'], ['fibre', 'Fibre (g)'], ['sodium', 'Sodium (mg)'],
];

/**
 * Copy any food and set it to the numbers on your own pack (per 100 g, as on
 * UK labels), plus the weight of one item. Saved as your own food, which then
 * ranks first in search.
 */
export function EditToMatch({ food }: { food: Food }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState('');
  const existing = useStore((s) => s.customFoods.find((f) => f.id === `custom-${food.id}`));
  const base = existing ?? food;
  const u = defaultUnit(base);
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries(FIELDS.map(([k]) => [k, String(Math.round(base.n[k] * 10) / 10)])));
  const [salt, setSalt] = useState('');
  const [each, setEach] = useState(u ? String(u.g) : '');
  const [unitName, setUnitName] = useState(u?.label ?? '');

  if (food.source === 'custom' && !food.id.startsWith('custom-')) return null;
  if (!open) {
    return (
      <div className="text-sm">
        <button className="inline-flex items-center gap-1.5 text-sea" onClick={() => setOpen(true)}><PencilLine size={15} />Edit to match my pack</button>
        {existing && food.id !== existing.id && <span className="ml-2 text-xs text-muted">You already have “{existing.name}”.</span>}
        {saved && <p className="mt-1 text-xs text-good">{saved}</p>}
      </div>
    );
  }

  const save = () => {
    const n = { ...base.n };
    for (const [k] of FIELDS) n[k] = Number(v[k]) || 0;
    // UK labels give salt, not sodium: salt ÷ 2.5 = sodium.
    if (salt.trim()) n.sodium = Math.round((Number(salt) / 2.5) * 1000);
    const g = Number(each);
    const label = unitName.trim() || 'item';
    const mine: Food = {
      ...food,
      id: `custom-${food.id.replace(/^custom-/, '')}`,
      name: `${food.name.replace(/ \(my pack\)$/, '')} (my pack)`,
      n,
      unknown: food.unknown?.filter((k) => !FIELDS.some(([f]) => f === k)),
      units: g > 0 ? [{ label, plural: label.endsWith('s') ? label : `${label}s`, g, default: true }] : food.units,
      source: 'custom',
      limitedData: false,
      alias: `${food.alias ?? ''} ${food.name} my pack`,
      note: `${food.note ? `${food.note} ` : ''}Values set from your own pack label.`,
    };
    actions.saveCustomFood(mine);
    if (!getState().favourites.includes(mine.id)) actions.toggleFavourite(mine.id);
    setSaved(`Saved as “${mine.name}”. It now comes first in search and is pinned to your favourites.`);
    setOpen(false);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-line p-3">
      <div className="text-sm font-medium">Match your pack (per 100 g, from the label)</div>
      <div className="grid grid-cols-2 gap-2">
        {FIELDS.map(([k, label]) => (
          <label key={k} className="text-xs text-muted">{label}
            <input className="field num mt-1" inputMode="decimal" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
          </label>
        ))}
        <label className="text-xs text-muted">Or salt (g), if that’s what the label shows
          <input className="field num mt-1" inputMode="decimal" value={salt} placeholder="e.g. 0.9" onChange={(e) => setSalt(e.target.value)} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-muted">One item is called
          <input className="field mt-1" value={unitName} placeholder="e.g. cake" onChange={(e) => setUnitName(e.target.value)} />
        </label>
        <label className="text-xs text-muted">One item weighs (g)
          <input className="field num mt-1" inputMode="decimal" value={each} placeholder="pack g ÷ number" onChange={(e) => setEach(e.target.value)} />
        </label>
      </div>
      <p className="text-[11px] text-muted">Tip: weight of one item = pack weight ÷ number in the pack (e.g. a 100 g pack of 11 cakes is about 9 g each). Vitamins and minerals stay at Glow’s values.</p>
      <div className="flex gap-2"><Button onClick={save}>Save my version</Button><Button tone="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
    </div>
  );
}
