import type { Meal } from '@/engine/score';

/** Dan, 12 Nov: "the diet that got me shredded", as one-tap meals. Each adds every item at once;
 *  grams can be changed afterwards on the day's list. Built from what he actually logs. */
export interface MealPreset {
  id: string;
  name: string;
  emoji: string;
  /** the slot it usually goes in; today it follows the time of day instead */
  meal: Meal;
  items: { foodId: string; grams: number; qty?: { count: number; label: string; plural?: string } }[];
}

export const MEAL_PRESETS: MealPreset[] = [
  {
    id: 'smoothie', name: 'Collagen smoothie', emoji: '🥤', meal: 'breakfast',
    items: [
      { foodId: 'uk-tpw-collagen-whey', grams: 18 }, { foodId: 'uk-almond-milk', grams: 150 }, { foodId: 'milk-semi', grams: 60 },
      { foodId: 'strawberries', grams: 170 }, { foodId: 'avocado', grams: 60 }, { foodId: 'raisins', grams: 15 },
      { foodId: 'hazelnuts', grams: 8 }, { foodId: 'cocoa', grams: 8 },
    ],
  },
  {
    id: 'eggs', name: '4 eggs + 4 Kallo cakes', emoji: '🍳', meal: 'breakfast',
    items: [
      { foodId: 'uk-clarence-eggs', grams: 208, qty: { count: 4, label: 'medium egg', plural: 'medium eggs' } },
      { foodId: 'uk-kallo-lentil', grams: 21 },
    ],
  },
  {
    id: 'chicken', name: 'Chicken, potatoes & veg', emoji: '🍗', meal: 'lunch',
    items: [
      { foodId: 'chicken-breast', grams: 175 }, { foodId: 'potato', grams: 270 },
      { foodId: 'carrots', grams: 40 }, { foodId: 'broccoli', grams: 40 }, { foodId: 'cauliflower', grams: 40 },
      { foodId: 'uk-milk-unhomog-semi', grams: 60 },
    ],
  },
  {
    id: 'porridge', name: 'Cacao porridge', emoji: '🥣', meal: 'dinner',
    items: [{ foodId: 'oats', grams: 75 }, { foodId: 'cocoa', grams: 7 }, { foodId: 'walnuts', grams: 10 }, { foodId: 'honey', grams: 12 }],
  },
  {
    id: 'yog', name: 'Yoghurt bowl', emoji: '🫐', meal: 'snacks',
    items: [
      { foodId: 'uk-fage-0', grams: 110 }, { foodId: 'uk-fage-2', grams: 110 }, { foodId: 'kefir', grams: 80 },
      { foodId: 'uk-milk-unhomog-semi', grams: 120 }, { foodId: 'blueberries', grams: 110 }, { foodId: 'grapes', grams: 70 },
      { foodId: 'honey', grams: 18 }, { foodId: 'dark-choc-85', grams: 25 },
    ],
  },
];

/** The meals he repeats: any meal slot of 2+ foods logged the same way on 2+ days in the last 6 weeks
 *  (grams averaged). Shown as suggestions he can save with one tap. */
export function usualMeals(days: Record<string, { items: { foodId: string; grams: number; meal: Meal; qty?: MealPreset['items'][number]['qty'] }[] }>, today: string, name: (id: string) => string): (MealPreset & { times: number })[] {
  const from = new Date(new Date(`${today}T12:00:00`).getTime() - 42 * 864e5).toISOString().slice(0, 10);
  const seen = new Map<string, { meal: Meal; days: Set<string>; grams: Record<string, number[]>; qty: Record<string, MealPreset['items'][number]['qty']> }>();
  for (const [d, log] of Object.entries(days)) {
    if (d < from || d > today) continue;
    const bySlot = new Map<Meal, typeof log.items>();
    for (const i of log.items ?? []) { if (i.foodId.startsWith('supp')) continue; bySlot.set(i.meal, [...(bySlot.get(i.meal) ?? []), i]); }
    for (const [meal, its] of bySlot) {
      const ids = [...new Set(its.map((i) => i.foodId))].sort();
      if (ids.length < 2) continue;
      const key = ids.join('|');
      const e = seen.get(key) ?? { meal, days: new Set<string>(), grams: {}, qty: {} };
      e.days.add(d);
      for (const i of its) { (e.grams[i.foodId] ??= []).push(i.grams); if (i.qty) e.qty[i.foodId] = i.qty; }
      seen.set(key, e);
    }
  }
  return [...seen.entries()].filter(([, e]) => e.days.size >= 2).map(([key, e]) => {
    const ids = key.split('|');
    const items = ids.map((id) => ({ foodId: id, grams: Math.round(e.grams[id].reduce((a, b) => a + b, 0) / e.grams[id].length), ...(e.qty[id] ? { qty: e.qty[id] } : {}) }));
    const top = [...items].sort((a, b) => b.grams - a.grams).slice(0, 2).map((i) => name(i.foodId).split(/[,(]/)[0].trim().split(' ').slice(0, 2).join(' '));
    return { id: `usual-${key}`, name: top.join(' + ') + (ids.length > 2 ? ` +${ids.length - 2}` : ''), emoji: '🔁', meal: e.meal, items, times: e.days.size };
  }).sort((a, b) => b.times - a.times);
}
