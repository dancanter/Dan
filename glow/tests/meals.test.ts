import { describe, expect, it } from 'vitest';
import { MEAL_PRESETS } from '@/data/meals';
import { FOOD_BY_ID } from '@/data/foods';

describe('one-tap meals', () => {
  it('every item is a real food', () => {
    for (const p of MEAL_PRESETS) for (const i of p.items) expect(FOOD_BY_ID.has(i.foodId), `${p.id}: ${i.foodId}`).toBe(true);
  });
});

import { usualMeals } from '@/data/meals';
describe('meals he repeats', () => {
  it('finds a slot logged the same way on two days, with average grams', () => {
    const days = {
      '2026-11-10': { items: [{ foodId: 'oats', grams: 70, meal: 'breakfast' as const }, { foodId: 'honey', grams: 10, meal: 'breakfast' as const }] },
      '2026-11-11': { items: [{ foodId: 'oats', grams: 80, meal: 'breakfast' as const }, { foodId: 'honey', grams: 14, meal: 'breakfast' as const }, { foodId: 'kefir', grams: 80, meal: 'snacks' as const }] },
    };
    const u = usualMeals(days, '2026-11-12', (id) => id);
    expect(u).toHaveLength(1);
    expect(u[0].times).toBe(2);
    expect(u[0].items.find((i) => i.foodId === 'oats')!.grams).toBe(75);
  });
});
