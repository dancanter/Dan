import { NUTRIENT_KEYS, type Nutrients } from '@/data/nutrients';
import type { Category, Food, Tag } from '@/data/foods';

// Open Food Facts is a free, open database of over three million packaged
// products. Its records reliably carry macros, salt and the NOVA processing
// group. Most do not carry micronutrients, so imported foods are flagged
// "limited data" and scored on what is known, rather than pretending missing
// values are zero.

interface OffProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  nova_group?: number;
  nutriments?: Record<string, number | string | undefined>;
  categories_tags?: string[];
  allergens_tags?: string[];
}

const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0);

export function fromOff(p: OffProduct): Food | undefined {
  const m = p.nutriments ?? {};
  const kcal = num(m['energy-kcal_100g']) || num(m['energy_100g']) / 4.184;
  if (!p.product_name || !kcal) return undefined;
  const n = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0])) as Nutrients;
  n.kcal = kcal;
  n.protein = num(m.proteins_100g);
  n.carbs = num(m.carbohydrates_100g);
  n.fibre = num(m.fiber_100g);
  n.sugar = num(m.sugars_100g);
  n.fat = num(m.fat_100g);
  n.satFat = num(m['saturated-fat_100g']);
  n.sodium = num(m.sodium_100g) * 1000;
  // A few products do list micronutrients (in grams); take them when present.
  const micro: [keyof Nutrients, string, number][] = [
    ['vitC', 'vitamin-c_100g', 1000], ['vitD', 'vitamin-d_100g', 1e6], ['calcium', 'calcium_100g', 1000],
    ['iron', 'iron_100g', 1000], ['potassium', 'potassium_100g', 1000], ['magnesium', 'magnesium_100g', 1000],
    ['zinc', 'zinc_100g', 1000], ['b12', 'vitamin-b12_100g', 1e6], ['folate', 'vitamin-b9_100g', 1e6],
  ];
  for (const [k, key, factor] of micro) if (m[key] !== undefined) n[k] = num(m[key]) * factor;

  const nova = (p.nova_group && p.nova_group >= 1 && p.nova_group <= 4 ? p.nova_group : 3) as Food['nova'];
  const tags: Tag[] = [];
  if (nova === 4) tags.push('upf');
  if (n.sugar > 15 && nova >= 3) tags.push('addsug');
  if ((p.allergens_tags ?? []).some((a) => a.includes('gluten'))) tags.push('gluten');
  const cats = (p.categories_tags ?? []).join(' ');
  if (/alcoholic/.test(cats)) tags.push('alc');
  const category: Category = /beverage|drink/.test(cats) ? 'drinks' : nova === 4 ? 'treats' : 'grains';

  return {
    id: `off-${p.code ?? Math.random().toString(36).slice(2)}`,
    name: [p.product_name, p.brands?.split(',')[0]].filter(Boolean).join(' · '),
    category,
    nova,
    portion: { g: 100, label: '100 g' },
    n,
    tags,
    source: 'openfoodfacts',
    limitedData: true,
    note: 'Imported from Open Food Facts. Macros come from the label; most micronutrients aren’t listed, so the score leans on processing level, protein, fibre and sugar.',
  };
}

export async function searchOpenFoodFacts(q: string, signal?: AbortSignal): Promise<Food[]> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=code,product_name,brands,nova_group,nutriments,categories_tags,allergens_tags`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Open Food Facts returned ${res.status}`);
  const data = (await res.json()) as { products?: OffProduct[] };
  return (data.products ?? []).map(fromOff).filter((f): f is Food => !!f);
}
