import { useMemo } from 'react';
import { MICROS, NUTRIENTS, type NKey } from '@/data/nutrients';
import type { Tag } from '@/data/foods';
import { bioFactors, targetsFor } from '@/engine/score';
import { weightOn } from '@/engine/game';
import { resolveItems, useStore } from '@/store';
import { plan } from '@/plan';

// What your food did for you today (Dan, 3 Nov): each food, the nutrients the
// body actually absorbs from it (bioavailability-adjusted, as a share of the day's
// target) and what those nutrients do at the level of the cell. Animal foods come
// first; plants are shown as what they are for him: filling and fibre, plus a
// little vitamin C. Typical food values, not a blood test.
const CELL: Partial<Record<NKey, string>> = {
  protein: 'rebuilds muscle, skin, hair and enzymes',
  omega3: 'built into cell membranes; switches inflammation off',
  vitA: 'skin-cell renewal, vision, immunity',
  vitC: 'collagen building, water-soluble antioxidant',
  vitD: 'muscle, bone and immune signalling',
  vitE: 'shields cell membranes from oxidation',
  vitK: 'clotting, and calcium into bone',
  b2: 'helps mitochondria turn food into energy',
  folate: 'copies and repairs DNA in new cells',
  b12: 'red blood cells, nerves, DNA',
  choline: 'cell membranes and brain signalling',
  iron: 'carries oxygen to your muscles',
  zinc: 'testosterone, immunity, skin healing',
  copper: 'energy enzymes and collagen cross-links',
  selenium: 'antioxidant enzymes and thyroid hormone',
  magnesium: 'powers 300+ enzymes, sleep, muscle',
  potassium: 'muscle contraction, steadier blood pressure',
  calcium: 'bone and muscle contraction',
  iodine: 'makes thyroid hormone (metabolism)',
};
const TAG_NOTE: Partial<Record<Tag, string>> = {
  astax: 'astaxanthin, a strong antioxidant (salmon, prawns)',
  poly2: 'polyphenols that protect blood vessels',
  poly: 'polyphenols (antioxidant)',
  carot: 'carotenoids for skin colour',
  ferm: 'live bacteria for the gut',
  creat: 'natural creatine for strength',
  coq: 'CoQ10 for the mitochondria',
  coll: 'collagen building blocks',
  haem: 'haem iron, the best-absorbed kind',
};
const ANIMAL = ['meat', 'offal', 'fish', 'shellfish', 'eggs', 'dairy'];
const KEYS: NKey[] = ['protein', 'omega3', ...MICROS];

export function FoodPower({ date }: { date: string }) {
  const s = useStore((x) => x);
  const rows = useMemo(() => {
    const t = targetsFor(s.profile, weightOn(s, date));
    const by = new Map<string, { name: string; animal: boolean; pct: Record<string, number>; tags: Tag[] }>();
    for (const it of resolveItems(s.days[date], s)) {
      const f = it.food, bio = bioFactors(f);
      const row = by.get(f.id) ?? { name: f.name.replace(/\s*\([^)]*\)/g, ''), animal: ANIMAL.includes(f.category), pct: {}, tags: f.tags };
      for (const k of KEYS) {
        const tgt = k === 'protein' ? plan().protein : (t[k] ?? NUTRIENTS[k].target);
        row.pct[k] = (row.pct[k] ?? 0) + ((f.n[k] ?? 0) * (bio[k] ?? 1) * it.grams) / 100 / Math.max(tgt, 1e-9);
      }
      by.set(f.id, row);
    }
    return [...by.values()].map((r) => ({ ...r, top: (Object.entries(r.pct) as [NKey, number][]).filter(([, v]) => v >= 0.1).sort((a, b) => b[1] - a[1]).slice(0, 3), total: Object.values(r.pct).reduce((a, b) => a + Math.min(1, b), 0) }))
      .sort((a, b) => Number(b.animal) - Number(a.animal) || b.total - a.total);
  }, [s, date]);
  if (!rows.length) return null;
  const animal = rows.filter((r) => r.animal && r.top.length).slice(0, 5);
  const supps = rows.filter((r) => /supplement/i.test(r.name));
  const plants = rows.filter((r) => !r.animal && !/supplement/i.test(r.name));
  return (
    <details className="rounded-xl border border-line p-3">
      <summary className="cursor-pointer text-sm font-semibold">🔬 What your food did for you today</summary>
      <p className="mt-2 text-xs text-ink-2">What your body absorbs from each food, as a share of the day’s need, and what it does in your cells. Typical food values, not a blood test.</p>
      <ul className="mt-2 space-y-2.5 text-sm">
        {animal.map((r) => (
          <li key={r.name}>
            <b>{r.name}</b>{r.tags.filter((tg) => TAG_NOTE[tg]).slice(0, 1).map((tg) => <span key={tg} className="text-xs text-gold"> · {TAG_NOTE[tg]}</span>)}
            <ul className="mt-0.5 space-y-0.5 pl-3 text-xs text-ink-2">
              {r.top.map(([k, v]) => <li key={k}><b className="text-ink">{NUTRIENTS[k].label.replace(/ \(.*\)/, '')} {Math.round(v * 100)}%</b>: {CELL[k] ?? ''}</li>)}
            </ul>
          </li>
        ))}
      </ul>
      {supps.length > 0 && <p className="mt-3 text-xs text-ink-2"><b className="text-ink">Supplements</b>: {supps.map((p) => p.name).join(', ')}. Astaxanthin protects cell membranes from oxidation and supports skin; counted in your skin and antioxidant pillars.</p>}
      {plants.length > 0 && <p className="mt-3 text-xs text-ink-2"><b className="text-ink">Plants today</b> ({plants.map((p) => p.name).slice(0, 5).join(', ')}): mostly filling and fibre, plus some vitamin C and potassium. Your best-absorbed nutrients came from the animal foods above.</p>}
      <p className="mt-2 text-[11px] text-muted">Enzymes: most food enzymes are broken down in digestion. Kefir’s live bacteria and the enzymes in raw honey are the exceptions that do something; the real value of food is the nutrients.</p>
    </details>
  );
}
