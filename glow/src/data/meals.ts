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
