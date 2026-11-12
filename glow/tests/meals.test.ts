import { describe, expect, it } from 'vitest';
import { MEAL_PRESETS } from '@/data/meals';
import { FOOD_BY_ID } from '@/data/foods';

describe('one-tap meals', () => {
  it('every item is a real food', () => {
    for (const p of MEAL_PRESETS) for (const i of p.items) expect(FOOD_BY_ID.has(i.foodId), `${p.id}: ${i.foodId}`).toBe(true);
  });
});
